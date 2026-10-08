import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

// GET /api/admin/orders - Fetch ALL orders for admin (no user filter)
export async function GET() {
  try {
    console.log('Admin: Fetching all orders');

    const orders = await sql`
      SELECT * FROM "Order"
      ORDER BY "createdAt" DESC
    `;

    console.log(`Admin: Found ${orders.length} orders`);

    return NextResponse.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    }, { status: 500 });
  }
}

// PATCH /api/admin/orders?id=123 - Update order status
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({
        success: false,
        error: 'Order ID and status required'
      }, { status: 400 });
    }

    console.log(`Admin: Updating order ${id} to status: ${status}`);

    const result = await sql`
      UPDATE "Order"
      SET status = ${status}, "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: result[0]
    });
  } catch (error) {
    console.error('Admin update error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order'
    }, { status: 500 });
  }
}
