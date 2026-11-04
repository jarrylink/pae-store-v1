import { neon } from '@neondatabase/serverless';

function cleanDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('channel_binding');
    return parsed.toString();
  } catch (e) {
    return url.replace(/([?&])channel_binding=[^&]*(&|$)/, '$1').replace(/[?&]$/, '');
  }
}

let sql: any = null;

export function getDb() {
  if (!sql) {
    const rawUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
    const databaseUrl = cleanDatabaseUrl(rawUrl);
    sql = neon(databaseUrl);
  }
  return sql;
}

export async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelayMs = 400): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isTransient = errMsg.includes('fetch failed') ||
                          errMsg.includes('ECONNRESET') ||
                          errMsg.includes('ETIMEDOUT') ||
                          errMsg.includes('timeout') ||
                          errMsg.includes('connect');
      if (!isTransient || attempt === maxRetries) {
        throw err;
      }
      await new Promise(res => setTimeout(res, baseDelayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw lastError;
}

// For simple queries without parameters
export async function query<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  return executeWithRetry(() => {
    const db = getDb();
    return db(strings, ...values) as Promise<T[]>;
  });
}

// For parameterized queries with $1, $2 placeholders
export async function queryWithParams<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  return executeWithRetry(() => {
    const db = getDb();
    return db.query(text, params) as Promise<T[]>;
  });
}

// For simple queries with no parameters (backward compatibility)
export async function simpleQuery<T = any>(text: string): Promise<T[]> {
  return executeWithRetry(() => {
    const db = getDb();
    return db(text) as Promise<T[]>;
  });
}
