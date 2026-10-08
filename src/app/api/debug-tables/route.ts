import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function GET() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    return NextResponse.json({ tables: tables.map(t => t.table_name) });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error occurred" }, { status: 500 });
  }
}

