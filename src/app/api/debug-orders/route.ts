import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Get all columns from Order table
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Order'
      ORDER BY ordinal_position;
    `;

    // Get one record to see actual data structure
    const sample = await sql`SELECT * FROM "Order" LIMIT 1;`;

    return NextResponse.json({
      columns: columns.map(c => c.column_name),
      sampleData: sample[0] || null
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
