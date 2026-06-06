import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    let days = 30;
    switch(range) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 30;
    }
    
    const now = new Date();
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);
    const previousEnd = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Current period metrics
    const current = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= ${currentStart.toISOString()}
    `;
    
    // Previous period metrics
    const previous = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= ${previousStart.toISOString()}
        AND "createdAt" < ${previousEnd.toISOString()}
    `;
    
    const currentRevenue = Number(current[0].revenue);
    const currentOrders = Number(current[0].orders);
    const previousRevenue = Number(previous[0].revenue);
    const previousOrders = Number(previous[0].orders);
    
    // Calculate growth
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const orderGrowth = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;
    
    // Categories
    const categories = await sql`
      SELECT category, COUNT(*) as count
      FROM "Product"
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `;
    
    // Products
    const products = await sql`
      SELECT id, title, category, price, inventory
      FROM "Product"
      ORDER BY id
      LIMIT 10
    `;
    
    // Brands
    const brands = await sql`
      SELECT brand, COUNT(*) as count
      FROM "Product"
      WHERE brand IS NOT NULL AND brand != ''
      GROUP BY brand
      ORDER BY count DESC
      LIMIT 10
    `;
    
    // Geographic sales
    const geographic = await sql`
      SELECT 
        COALESCE("shippingAddress"->>'state', 'Unknown') as location,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "shippingAddress" IS NOT NULL
      GROUP BY "shippingAddress"->>'state'
      ORDER BY revenue DESC
      LIMIT 10
    `;
    
    // Sales channels (by payment method)
    const channels = await sql`
      SELECT 
        COALESCE("paymentMethod", 'Unknown') as name,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      GROUP BY "paymentMethod"
      ORDER BY revenue DESC
    `;
    
    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue: currentRevenue,
        previousRevenue: previousRevenue,
        totalOrders: currentOrders,
        previousOrders: previousOrders,
        revenueGrowth: revenueGrowth,
        orderGrowth: orderGrowth,
        avgOrderValue: currentOrders > 0 ? currentRevenue / currentOrders : 0,
        previousAOV: previousOrders > 0 ? previousRevenue / previousOrders : 0
      },
      categories: categories,
      products: products,
      brands: brands,
      geographic: geographic,
      channels: channels.map(c => ({
        name: c.name,
        orders: Number(c.orders),
        revenue: Number(c.revenue),
        percentage: currentRevenue > 0 ? (Number(c.revenue) / currentRevenue) * 100 : 0
      }))
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      metrics: {
        totalRevenue: 0, previousRevenue: 0, totalOrders: 0, previousOrders: 0,
        revenueGrowth: 0, orderGrowth: 0, avgOrderValue: 0, previousAOV: 0
      },
      categories: [],
      products: [],
      brands: [],
      geographic: [],
      channels: []
    });
  }
}
