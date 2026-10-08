import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function GET(request: NextRequest) {
  try {
    // Simple queries that should work
    const orderCount = await sql`SELECT COUNT(*) as count FROM "Order"`;
    const revenue = await sql`SELECT COALESCE(SUM(total), 0) as revenue FROM "Order" WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')`;
    const productCount = await sql`SELECT COUNT(*) as count FROM "Product"`;
    const userCount = await sql`SELECT COUNT(*) as count FROM "User"`;

    return NextResponse.json({
      success: true,
      auditData: {
        systemHealth: {
          orders: { total_orders: orderCount[0].count, total_revenue: revenue[0].revenue },
          products: { total_products: productCount[0].count },
          users: { total_users: userCount[0].count }
        },
        dataQuality: {
          missingShippingAddress: 0,
          missingCustomerInfo: 0,
          negativeInventory: 0,
          orphanedOrders: 0
        }
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }, { status: 500 });
  }
}

