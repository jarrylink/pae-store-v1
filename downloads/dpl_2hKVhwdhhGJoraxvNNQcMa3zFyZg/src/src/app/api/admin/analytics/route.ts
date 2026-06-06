import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('Analytics API called');
    
    // Orders summary
    const ordersResult = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as avg_order_value,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM "Order"
    `;
    
    const orders = ordersResult[0];
    
    // Products summary
    const productsResult = await sql`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN inventory <= 5 AND inventory > 0 THEN 1 END) as low_stock_count
      FROM "Product"
    `;
    
    const products = productsResult[0];
    
    // Revenue trend
    const revenueTrend = await sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") DESC
    `;
    
    // Category distribution
    const categoryDist = await sql`
      SELECT category, COUNT(*) as count
      FROM "Product"
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `;
    
    // Total customers
    const customersResult = await sql`
      SELECT COUNT(*) as total FROM "User" WHERE role = 'customer'
    `;
    
    // ============================================================
    // FIX 1: PAYMENT METHODS - Get from actual orders
    // ============================================================
    const paymentMethods = await sql`
      SELECT 
        COALESCE("paymentMethod", 'Unknown') as method,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as amount
      FROM "Order"
      WHERE "paymentMethod" IS NOT NULL
      GROUP BY "paymentMethod"
      ORDER BY count DESC
    `;
    
    // ============================================================
    // FIX 2: TOP LOCATIONS - Extract city from shippingAddress JSON
    // ============================================================
    const locations = await sql`
      SELECT 
        COALESCE("shippingAddress"->>'city', 'Unknown') as city,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "shippingAddress" IS NOT NULL
      GROUP BY "shippingAddress"->>'city'
      ORDER BY revenue DESC
      LIMIT 5
    `;
    
    // Top products
    const topProducts = await sql`
      SELECT id, title, price, inventory
      FROM "Product"
      ORDER BY id
      LIMIT 5
    `;
    
    return NextResponse.json({
      totalRevenue: Number(orders.total_revenue),
      totalOrders: Number(orders.total_orders),
      totalCustomers: Number(customersResult[0].total),
      avgOrderValue: Number(orders.avg_order_value),
      pendingOrders: Number(orders.pending_orders),
      confirmedOrders: Number(orders.confirmed_orders),
      deliveredOrders: Number(orders.delivered_orders),
      totalProducts: Number(products.total_products),
      lowStockCount: Number(products.low_stock_count),
      revenueTrend: revenueTrend.map(r => ({ 
        month: r.month, 
        revenue: Number(r.revenue), 
        orders: Number(r.orders) 
      })),
      categoryDistribution: categoryDist.map(c => ({ 
        category: c.category, 
        count: Number(c.count) 
      })),
      paymentMethods: paymentMethods.map(p => ({
        method: p.method,
        count: Number(p.count),
        amount: Number(p.amount)
      })),
      topLocations: locations.map(l => ({
        city: l.city,
        orders: Number(l.orders),
        revenue: Number(l.revenue)
      })),
      topProducts: topProducts.map(p => ({ 
        id: p.id, 
        title: p.title, 
        price: Number(p.price),
        inventory: p.inventory
      }))
    });
    
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
