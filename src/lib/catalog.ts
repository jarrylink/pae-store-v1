import { queryWithParams } from '@/lib/db';

export type CatalogKind = 'Product' | 'Accessory' | 'Service';
type Field = { type: 'text' | 'number' | 'boolean' | 'array'; required?: boolean; integer?: boolean; default?: unknown };
const text = (value = ''): Field => ({ type: 'text', default: value });
const number = (integer = false): Field => ({ type: 'number', integer, default: 0 });
const fields: Record<CatalogKind, Record<string, Field>> = {
  Product: {
    title: { type: 'text', required: true }, brand: { type: 'text', required: true },
    spec: { type: 'text', required: true }, category: { type: 'text', required: true },
    image: { type: 'text', required: true }, price: { type: 'number', integer: true, required: true },
    purchasePrice: number(true), vendorPrice: number(true), inventory: number(true),
    warranty: text('1 Year Warranty'), installationTime: text('1-2 days'),
    capacity: text('N/A'), systemType: text('basic'),
    compatibleWith: { type: 'array', default: [] }, features: { type: 'array', default: [] },
    inStock: { type: 'boolean', default: false }, isActive: { type: 'boolean', default: true },
  },
  Accessory: {
    name: { type: 'text', required: true }, price: { type: 'number', required: true },
    costPrice: number(), description: text(), category: text(), image: text(), sku: text(),
    unit: text('piece'), stock: number(true), isActive: { type: 'boolean', default: true },
  },
  Service: {
    name: { type: 'text', required: true }, price: { type: 'number', required: true },
    costPrice: number(), description: text(), category: text(), duration: text(), image: text(),
    features: { type: 'array', default: [] }, isActive: { type: 'boolean', default: true },
  },
};

export class CatalogError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function catalogId(value: unknown): number {
  if ((typeof value !== 'string' && typeof value !== 'number') || !/^[1-9]\d*$/.test(String(value))) {
    throw new CatalogError('Invalid item ID');
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > 2147483647) throw new CatalogError('Invalid item ID');
  return id;
}

export function catalogInput(kind: CatalogKind, body: unknown, partial = false): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new CatalogError('Expected a JSON object');
  const input = body as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(fields[kind])) {
    if (!(key in input) && partial) continue;
    const value = key in input ? input[key] : field.default;
    if (field.type === 'text') {
      if (typeof value !== 'string' || (field.required && !value.trim())) throw new CatalogError(`${key} is required and must be text`);
      result[key] = value.trim();
    } else if (field.type === 'number') {
      if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') throw new CatalogError(`${key} must be a non-negative number`);
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0 || (field.integer && (!Number.isInteger(parsed) || parsed > 2147483647))) {
        throw new CatalogError(`${key} must be a non-negative ${field.integer ? 'whole number (maximum 2147483647)' : 'number'}`);
      }
      result[key] = parsed;
    } else if (field.type === 'boolean') {
      if (typeof value !== 'boolean') throw new CatalogError(`${key} must be true or false`);
      result[key] = value;
    } else {
      if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) throw new CatalogError(`${key} must be an array of strings`);
      result[key] = value.map(item => item.trim()).filter(Boolean);
    }
  }
  if (kind === 'Product' && 'inventory' in result && !('inStock' in input)) result.inStock = Number(result.inventory) > 0;
  if (!Object.keys(result).length) throw new CatalogError('No editable fields supplied');
  return result;
}

function valuesFor(kind: CatalogKind, data: Record<string, unknown>) {
  return Object.entries(data).map(([key, value]) => fields[kind][key].type === 'array' ? JSON.stringify(value) : value);
}

// Identifiers come exclusively from the field allowlist above; values are parameterized.
export function catalogWriteQuery(kind: CatalogKind, body: unknown, id?: number) {
  const data = catalogInput(kind, body, id !== undefined);
  const keys = Object.keys(data);
  const values = valuesFor(kind, data);
  if (id !== undefined) {
    values.push(catalogId(id));
    return {
      text: `UPDATE "${kind}" SET ${keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ')}, "updatedAt" = NOW() WHERE id = $${values.length} RETURNING *`,
      values,
    };
  }
  return {
    text: `INSERT INTO "${kind}" (${keys.map(key => `"${key}"`).join(', ')}, "createdAt", "updatedAt") VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}, NOW(), NOW()) RETURNING *`,
    values,
  };
}

export function normalizeCatalog(kind: CatalogKind, row: Record<string, any>) {
  const result = { ...row };
  for (const [key, field] of Object.entries(fields[kind])) {
    if (field.type === 'number') result[key] = Number(row[key] ?? 0);
    if (field.type === 'array') {
      let value = row[key];
      if (typeof value === 'string') { try { value = JSON.parse(value); } catch { value = []; } }
      result[key] = Array.isArray(value) ? value : [];
    }
  }
  return result;
}

export async function listCatalog(kind: CatalogKind, url: string) {
  const params = new URL(url).searchParams;
  const values: unknown[] = [];
  const where: string[] = [];
  if (params.get('category')) { values.push(params.get('category')); where.push(`category = $${values.length}`); }
  if (params.get('active') !== 'false') where.push('"isActive" = true');
  let query = `SELECT * FROM "${kind}"${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY "createdAt" DESC, id DESC`;
  if (params.has('limit')) { values.push(catalogId(params.get('limit'))); query += ` LIMIT $${values.length}`; }
  const rows = await queryWithParams(query, values);
  return rows.map(row => normalizeCatalog(kind, row));
}

export async function verifyAdminRequest(request?: Request): Promise<boolean> {
  if (!request) return true; // Internal server calls
  
  const cookieHeader = request.headers.get('cookie') || '';
  let userData: any = null;
  const match = cookieHeader.match(/user_data=([^;]+)/);
  if (match) {
    try {
      userData = JSON.parse(decodeURIComponent(match[1]));
    } catch {}
  }

  const roleHeader = request.headers.get('x-user-role');
  const userId = userData?.id || request.headers.get('x-user-id');
  const role = userData?.role || roleHeader;

  if (userId) {
    try {
      const userRows = await queryWithParams('SELECT id, role FROM "User" WHERE id = $1', [userId]);
      if (userRows.length > 0) {
        const dbRole = userRows[0].role;
        if (dbRole === 'superadmin' || dbRole === 'staff' || dbRole === 'admin') {
          return true;
        }
      }
    } catch (err) {
      console.error('Error verifying admin in DB:', err);
    }
  }

  if (role === 'superadmin' || role === 'staff' || role === 'admin') {
    return true;
  }

  throw new CatalogError('Unauthorized: Administrator access required to modify catalogue', 403);
}

export async function getCatalog(kind: CatalogKind, id: unknown, request?: Request) {
  const rows = await queryWithParams(`SELECT * FROM "${kind}" WHERE id = $1`, [catalogId(id)]);
  if (!rows.length) throw new CatalogError(`${kind} not found`, 404);
  const item = normalizeCatalog(kind, rows[0]);

  if (item.isActive === false) {
    let isAdmin = false;
    if (request) {
      try {
        await verifyAdminRequest(request);
        isAdmin = true;
      } catch {}
    }
    if (!isAdmin) {
      throw new CatalogError(`${kind} is currently unavailable`, 404);
    }
  }

  return item;
}

export async function saveCatalog(kind: CatalogKind, body: unknown, id?: unknown, request?: Request) {
  if (request) {
    await verifyAdminRequest(request);
  }
  const query = catalogWriteQuery(kind, body, id === undefined ? undefined : catalogId(id));
  const rows = await queryWithParams(query.text, query.values);
  if (!rows.length) throw new CatalogError(`${kind} not found`, 404);
  return normalizeCatalog(kind, rows[0]);
}

export async function deleteCatalog(kind: CatalogKind, id: unknown, request?: Request) {
  if (request) {
    await verifyAdminRequest(request);
  }
  const rows = await queryWithParams(`DELETE FROM "${kind}" WHERE id = $1 RETURNING id`, [catalogId(id)]);
  if (!rows.length) throw new CatalogError(`${kind} not found`, 404);
  return { success: true };
}
