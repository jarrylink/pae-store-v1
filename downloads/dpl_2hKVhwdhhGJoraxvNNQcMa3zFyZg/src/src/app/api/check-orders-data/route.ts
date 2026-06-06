import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Get total count
    const countResult = await sql`SELECT COUNT(*) FROM "Order"`;

    // Get sample orders
    const sampleOrders = await sql`
      SELECT id, "orderNumber", "customerName", total, status, "createdAt"
      FROM "Order"
      ORDER BY id DESC
      LIMIT 5;
    `;

    return NextResponse.json({
      success: true,
      totalOrders: parseInt(countResult[0].count),
      recentOrders: sampleOrders,
      message: `Found ${countResult[0].count} orders in database`
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
