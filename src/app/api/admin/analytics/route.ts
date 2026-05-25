import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface TopProduct {
  title: string;
  sold: number;
  revenue: number;
}

interface RevenueTrend {
  month: string;
  revenue: number;
  orders: number;
}

interface CategoryDist {
  category: string;
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Analytics API called');
    
    // 1. Orders summary
    const ordersResult = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as avg_order_value,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders
      FROM "Order"
    `;
    
    const orders = ordersResult[0];
    
    // 2. Products summary
    const productsResult = await sql`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN inventory <= 5 AND inventory > 0 THEN 1 END) as low_stock_count
      FROM "Product"
    `;
    
    const products = productsResult[0];
    
    // 3. Revenue trend by month
    const revenueTrendResult = await sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") DESC
    `;
    
    const revenueTrend: RevenueTrend[] = revenueTrendResult.map(r => ({ 
      month: r.month, 
      revenue: Number(r.revenue), 
      orders: Number(r.orders) 
    }));
    
    // 4. Category distribution
    const categoryDistResult = await sql`
      SELECT category, COUNT(*) as count
      FROM "Product"
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `;
    
    const categoryDistribution: CategoryDist[] = categoryDistResult.map(c => ({ 
      category: c.category, 
      count: Number(c.count) 
    }));
    
    // 5. Total customers
    const customersResult = await sql`
      SELECT COUNT(*) as total FROM "User" WHERE role = 'customer'
    `;
    
    // 6. Top products - empty array for now
    const topProducts: TopProduct[] = [];
    
    const response = {
      totalRevenue: Number(orders.total_revenue),
      totalOrders: Number(orders.total_orders),
      totalCustomers: Number(customersResult[0].total),
      avgOrderValue: Number(orders.avg_order_value),
      pendingOrders: Number(orders.pending_orders),
      confirmedOrders: Number(orders.confirmed_orders),
      deliveredOrders: Number(orders.delivered_orders),
      totalProducts: Number(products.total_products),
      lowStockCount: Number(products.low_stock_count),
      outOfStockCount: 0,
      revenueTrend,
      categoryDistribution,
      topProducts
    };
    
    console.log('Analytics data fetched successfully');
    return NextResponse.json(response);
    
  } catch (err) {
    const error = err as Error;
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error.message },
      { status: 500 }
    );
  }
}
