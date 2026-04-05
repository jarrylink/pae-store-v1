import { neon } from '@neondatabase/serverless';

// Create a SQL client using your DATABASE_URL from .env
const sql = neon(process.env.DATABASE_URL!);

export default sql;
