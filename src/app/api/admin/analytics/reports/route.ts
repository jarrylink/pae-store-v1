import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'weekly';
    const format = searchParams.get('format') || 'json';

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let endDate = now;
    let periodLabel = '';

    switch(reportType) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodLabel = `Week of ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        periodLabel = `Month: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        break;
      case 'quarterly':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        periodLabel = `Quarter: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        break;
      case 'yearly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        periodLabel = `Year: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periodLabel = `Last 30 Days`;
    }

    // Get revenue data
    const revenueData = await sql`
      SELECT 
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders,
        COALESCE(AVG(total), 0) as avg_order_value
      FROM "Order"
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND "createdAt" >= ${startDate.toISOString()}
        AND "createdAt" <= ${endDate.toISOString()}
    `;

    const previousRevenue = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND "createdAt" < ${startDate.toISOString()}
        AND "createdAt" >= ${new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())).toISOString()}
    `;

    // Get customer data
    const customerData = await sql`
      SELECT COUNT(DISTINCT "userId") as customers,
             COUNT(DISTINCT CASE WHEN "createdAt" >= ${startDate.toISOString()} THEN "userId" END) as new_customers
      FROM "Order"
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `;

    // Get product data
    const topProducts = await sql`
      SELECT 
        items->>'name' as product_name,
        COUNT(*) as quantity_sold,
        SUM(CAST(items->>'price' AS DECIMAL)) as revenue
      FROM "Order" o,
      jsonb_array_elements(o.items) as items
      WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND o."createdAt" >= ${startDate.toISOString()}
        AND items->>'type' = 'product'
      GROUP BY items->>'name'
      ORDER BY revenue DESC
      LIMIT 10
    `;

    // Get category data
    const categoryData = await sql`
      SELECT 
        items->>'type' as category,
        COUNT(*) as count,
        SUM(CAST(items->>'price' AS DECIMAL)) as revenue
      FROM "Order" o,
      jsonb_array_elements(o.items) as items
      WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND o."createdAt" >= ${startDate.toISOString()}
      GROUP BY items->>'type'
      ORDER BY revenue DESC
    `;

    // Get order status breakdown
    const statusData = await sql`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= ${startDate.toISOString()}
      GROUP BY status
    `;

    // Get daily trend
    const dailyTrend = await sql`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND "createdAt" >= ${startDate.toISOString()}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Calculate growth
    const revenueGrowth = previousRevenue[0].revenue > 0 
      ? ((revenueData[0].revenue - previousRevenue[0].revenue) / previousRevenue[0].revenue) * 100 
      : 0;

    const reportData = {
      generatedAt: new Date().toISOString(),
      period: periodLabel,
      reportType,
      summary: {
        totalRevenue: Number(revenueData[0].revenue),
        totalOrders: Number(revenueData[0].orders),
        avgOrderValue: Number(revenueData[0].avg_order_value),
        revenueGrowth,
        totalCustomers: Number(customerData[0].customers),
        newCustomers: Number(customerData[0].new_customers)
      },
      topProducts: topProducts.map(p => ({
        name: p.product_name,
        quantity: Number(p.quantity_sold),
        revenue: Number(p.revenue)
      })),
      categories: categoryData.map(c => ({
        name: c.category,
        count: Number(c.count),
        revenue: Number(c.revenue)
      })),
      statusBreakdown: statusData.map(s => ({
        status: s.status,
        count: Number(s.count),
        revenue: Number(s.revenue)
      })),
      dailyTrend: dailyTrend.map(d => ({
        date: d.date,
        orders: Number(d.orders),
        revenue: Number(d.revenue)
      }))
    };

    return NextResponse.json({
      success: true,
      report: reportData
    });

  } catch (error) {
    console.error('Reports API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}

