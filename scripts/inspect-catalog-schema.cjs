require('dotenv').config({ path: '.env.local', quiet: true });
require('dotenv').config({ quiet: true });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
async function main() {
  console.log(JSON.stringify(await sql.query(`
    SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name IN ('Product', 'Accessory', 'Service')
    ORDER BY table_name, ordinal_position
  `), null, 2));
  console.log(JSON.stringify(await sql.query(`
    SELECT conrelid::regclass::text AS source, confrelid::regclass::text AS target,
      pg_get_constraintdef(oid) AS definition
    FROM pg_constraint WHERE contype IN ('f', 'u')
      AND (conrelid IN ('"Product"'::regclass, '"Accessory"'::regclass, '"Service"'::regclass)
        OR confrelid IN ('"Product"'::regclass, '"Accessory"'::regclass, '"Service"'::regclass))
  `), null, 2));
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
