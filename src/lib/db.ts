import { neon } from '@neondatabase/serverless';

let sql: any = null;

export function getDb() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    sql = neon(databaseUrl);
  }
  return sql;
}

// For simple queries without parameters
export async function query<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  const db = getDb();
  return db(strings, ...values) as Promise<T[]>;
}

// For parameterized queries with $1, $2 placeholders
export async function queryWithParams<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const db = getDb();
  return db.query(text, params) as Promise<T[]>;
}

// For simple queries with no parameters (backward compatibility)
export async function simpleQuery<T = any>(text: string): Promise<T[]> {
  const db = getDb();
  return db(text) as Promise<T[]>;
}
