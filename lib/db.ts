import { neon } from '@neondatabase/serverless';

// Singleton database connection
let dbInstance: any = null;

export function getDb() {
    if (!dbInstance) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined');
        }
        dbInstance = neon(process.env.DATABASE_URL, {
            fetchOptions: { 
                timeout: 30000,
                connectTimeout: 30000
            }
        });
    }
    return dbInstance;
}

// Default export for convenience
const db = getDb();
export default db;

// Re-export for named imports
export const sql = getDb();
