const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Load the actual route code without a Next server, replacing only the database boundary.
let database = async () => [];
const modules = new Map();
function load(file) {
  file = path.resolve(file);
  if (modules.has(file)) return modules.get(file).exports;
  const module = { exports: {} };
  modules.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const resolve = name => {
    if (name === '@/lib/db') return { queryWithParams: (...args) => database(...args) };
    if (name.startsWith('@/')) return load(path.join('src', name.slice(2)) + '.ts');
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name) + '.ts');
    return require(name);
  };
  new Function('require', 'module', 'exports', code)(resolve, module, module.exports);
  return module.exports;
}

const catalog = load('src/lib/catalog.ts');
const fixtures = {
  Product: { title: 'CRUD test', brand: 'Test', spec: '100W', category: 'Solar', image: '/test.png', price: 100, purchasePrice: 60, vendorPrice: 80, inventory: 3, features: ['Original'], compatibleWith: ['Battery'] },
  Accessory: { name: 'CRUD test', price: 100.25, costPrice: 60.25, stock: 3, isActive: false },
  Service: { name: 'CRUD test', price: 100.25, costPrice: 60.25, features: ['Original'], isActive: false },
};
const endpoint = { Product: 'products', Accessory: 'accessories', Service: 'services' };
const request = (url, method = 'GET', body) => new Request('http://localhost/api/' + url, {
  method, ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
});

async function routeTests() {
  for (const kind of Object.keys(fixtures)) {
    const plural = endpoint[kind];
    const collection = load(`src/app/api/${plural}/route.ts`);
    const item = load(`src/app/api/${plural}/[id]/route.ts`);
    const context = { params: Promise.resolve({ id: '1' }) };
    const queries = [];
    database = async (text, values) => { queries.push({ text, values }); return [{ id: 1, ...fixtures[kind] }]; };
    assert.equal((await collection.POST(request(plural, 'POST', fixtures[kind]))).status, 201);
    assert.equal((await item.GET(request(plural + '/1'), context)).status, 200);
    assert.equal((await item.PUT(request(plural + '/1', 'PUT', { price: 50 }), context)).status, 200);
    const update = queries.at(-1);
    assert.match(update.text, /"price" = \$1/);
    assert.doesNotMatch(update.text, /"features" =|"purchasePrice" =|"costPrice" =/);
    if (kind !== 'Product') {
      assert.equal((await item.PATCH(request(plural + '/1', 'PATCH', { isActive: false }), context)).status, 200);
      assert.equal(queries.at(-1).values[0], false);
      assert.equal((await collection.PATCH(request(plural, 'PATCH', { id: 1, costPrice: 0 }))).status, 200);
      assert.equal(queries.at(-1).values[0], 0);
      assert.equal((await collection.PATCH(request(plural, 'PATCH', { costPrice: 0 }))).status, 400);
      await collection.GET(request(plural));
      assert.match(queries.at(-1).text, /"isActive" = true/);
    }
    await collection.GET(request(plural + '?active=false'));
    assert.doesNotMatch(queries.at(-1).text, /"isActive" = true|LIMIT/);
    assert.equal((await collection.GET(request(plural + '?limit=invalid'))).status, 400);
    for (const body of [null, [], {}, { ...fixtures[kind], price: -1 }, { ...fixtures[kind], price: null }, { ...fixtures[kind], price: 'NaN' }]) {
      assert.equal((await collection.POST(request(plural, 'POST', body))).status, 400);
    }
    assert.equal((await collection.POST(new Request('http://localhost/api/' + plural, { method: 'POST', body: '{' }))).status, 400);
    assert.equal((await item.DELETE(request(plural + '/1', 'DELETE'), context)).status, 200);
    assert.equal((await item.DELETE(request(plural + '/1junk', 'DELETE'), { params: Promise.resolve({ id: '1junk' }) })).status, 400);
    database = async () => [];
    for (const method of ['GET', 'PUT', 'PATCH', 'DELETE']) {
      assert.equal((await item[method](request(plural + '/1', method, ['PUT', 'PATCH'].includes(method) ? { price: 50 } : undefined), context)).status, 404);
    }
    database = async () => { throw Object.assign(new Error('foreign key'), { code: '23503' }); };
    assert.equal((await item.DELETE(request(plural + '/1', 'DELETE'), context)).status, 409);
    console.log(`PASS ${kind}: route methods, validation, partial updates, filtering, missing IDs, delete conflicts`);
  }
  assert.throws(() => catalog.catalogInput('Product', { ...fixtures.Product, inventory: 1.5 }));
  assert.throws(() => catalog.catalogInput('Product', { ...fixtures.Product, price: 1.5 }));
  assert.throws(() => catalog.catalogInput('Service', { ...fixtures.Service, features: 'bad' }));
  assert.equal(catalog.normalizeCatalog('Accessory', { price: '1.25', costPrice: '0.50' }).price, 1.25);
  const service = load('src/lib/data/productsService.ts').productsService;
  const originalFetch = global.fetch;
  let calls = 0;
  try {
    global.fetch = async () => { calls++; return Response.json({ error: 'Save rejected' }, { status: 400 }); };
    await assert.rejects(() => service.createProduct(fixtures.Product), /Save rejected/);
    await assert.rejects(() => service.updateProduct(1, {}), /Save rejected/);
    await assert.rejects(() => service.deleteProduct(1), /Save rejected/);
    await assert.rejects(() => service.getAllProducts(), /Save rejected/);
    assert.equal(calls, 4);
    global.fetch = async () => { calls++; throw new Error('Network interrupted'); };
    await assert.rejects(() => service.createProduct(fixtures.Product), /Network interrupted/);
    assert.equal(calls, 5, 'POST must not be retried');
  } finally { global.fetch = originalFetch; }
  console.log('PASS client: failed operations throw; mutations are never retried');
}

async function databaseTests() {
  require('dotenv').config({ path: '.env.local', quiet: true });
  require('dotenv').config({ quiet: true });
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  for (const kind of Object.keys(fixtures)) {
    const create = catalog.catalogWriteQuery(kind, fixtures[kind]);
    const changes = kind === 'Product' ? { price: 200, purchasePrice: 0, vendorPrice: 90, inventory: 0 } : { price: 200.5, costPrice: 0, isActive: true };
    const update = catalog.catalogWriteQuery(kind, changes, 1);
    // Temporary tables shadow the catalog tables for this transaction only. Their IDs
    // use their own temporary identity sequence, never the live catalog sequences.
    const results = await sql.transaction([
      sql.query(`CREATE TEMP TABLE "${kind}" (LIKE public."${kind}" INCLUDING DEFAULTS) ON COMMIT DROP`),
      sql.query(`ALTER TABLE pg_temp."${kind}" ALTER COLUMN id DROP DEFAULT`),
      sql.query(`ALTER TABLE pg_temp."${kind}" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`),
      sql.query(create.text, create.values),
      sql.query(update.text, update.values),
      sql.query(`SELECT * FROM pg_temp."${kind}" WHERE id = 1`),
      sql.query(`DELETE FROM pg_temp."${kind}" WHERE id = 1 RETURNING id`),
      sql.query(`SELECT count(*)::int AS count FROM pg_temp."${kind}"`),
    ]);
    const created = catalog.normalizeCatalog(kind, results[3][0]);
    const updated = catalog.normalizeCatalog(kind, results[5][0]);
    for (const [key, value] of Object.entries(fixtures[kind])) assert.deepEqual(created[key], value);
    for (const [key, value] of Object.entries(changes)) assert.deepEqual(updated[key], value);
    if (kind === 'Product') { assert.deepEqual(updated.features, ['Original']); assert.deepEqual(updated.compatibleWith, ['Battery']); assert.equal(updated.inStock, false); }
    if (kind === 'Service') assert.deepEqual(updated.features, ['Original']);
    assert.equal(results[6][0].id, 1);
    assert.equal(results[7][0].count, 0);
    console.log(`PASS ${kind}: real Postgres create/read/update/delete on isolated temporary table`);
  }
}

routeTests().then(() => process.argv.includes('--database') ? databaseTests() : undefined)
  .catch(error => { console.error(error); process.exitCode = 1; });
