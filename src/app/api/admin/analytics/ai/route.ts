import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

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
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get all confirmed orders
    const allOrders = await sql`
      SELECT 
        total,
        "userId",
        "createdAt"
      FROM "Order"
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `;

    // Filter by date
    const periodOrders = allOrders.filter(o => new Date(o.createdAt) >= startDate);
    const totalRevenue = periodOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = periodOrders.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Calculate daily average
    const uniqueDays = new Set(periodOrders.map(o => new Date(o.createdAt).toDateString())).size;
    const avgDailyRevenue = uniqueDays > 0 ? totalRevenue / uniqueDays : 50000;

    // Calculate growth from previous period
    const previousOrders = allOrders.filter(o => new Date(o.createdAt) < startDate);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Forecast with growth factor
    const growthRate = Math.max(0.02, Math.min(0.15, revenueGrowth / 100));
    const forecast = {
      daily: avgDailyRevenue,
      weekly: avgDailyRevenue * 7 * (1 + growthRate),
      monthly: avgDailyRevenue * 30 * (1 + growthRate),
      quarterly: avgDailyRevenue * 90 * (1 + growthRate * 2),
      yearly: avgDailyRevenue * 365 * (1 + growthRate * 4),
      growthRate: revenueGrowth
    };

    // Customer churn
    const customers = [...new Set(allOrders.map(o => o.userId).filter(id => id && id !== 'null'))];
    const recentCustomers = [...new Set(periodOrders.map(o => o.userId).filter(id => id && id !== 'null'))];
    const churnRiskCustomers = customers.length - recentCustomers.length;
    const churnRate = customers.length > 0 ? (churnRiskCustomers / customers.length) * 100 : 0;

    // Customer LTV
    const customerSpending: Record<string, number> = {};
    allOrders.forEach(o => {
      if (o.userId && o.userId !== 'null') {
        customerSpending[o.userId] = (customerSpending[o.userId] || 0) + Number(o.total);
      }
    });
    const avgCustomerLTV = Object.values(customerSpending).length > 0 
      ? Object.values(customerSpending).reduce((a, b) => a + b, 0) / Object.values(customerSpending).length 
      : 0;

    // Inventory
    const products = await sql`SELECT id, title, inventory FROM "Product"`;
    const lowStockCount = products.filter(p => p.inventory > 0 && p.inventory < 10).length;
    const outOfStockCount = products.filter(p => p.inventory === 0).length;
    const inventoryRisk = products.length > 0 ? ((lowStockCount + outOfStockCount) / products.length) * 100 : 0;

    // Anomaly detection
    const dailyRevenue: Record<string, number> = {};
    periodOrders.forEach(o => {
      const date = new Date(o.createdAt).toDateString();
      dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(o.total);
    });
    const dailyValues = Object.values(dailyRevenue);
    const avgDaily = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
    const stdDev = Math.sqrt(dailyValues.map(v => Math.pow(v - avgDaily, 2)).reduce((a, b) => a + b, 0) / dailyValues.length);
    const anomalyCount = dailyValues.filter(v => Math.abs(v - avgDaily) > 2 * stdDev).length;

    // Build insights
    const insights = [];
    if (churnRate > 30) {
      insights.push({
        type: 'warning',
        title: 'High Customer Churn Risk',
        message: `${churnRate.toFixed(1)}% of customers haven't purchased in ${days} days.`,
        action: 'Launch retention campaign'
      });
    }
    if (inventoryRisk > 20) {
      insights.push({
        type: 'critical',
        title: 'Inventory Risk Alert',
        message: `${lowStockCount} products low stock, ${outOfStockCount} out of stock.`,
        action: 'Review inventory and reorder'
      });
    }
    if (anomalyCount > 0) {
      insights.push({
        type: 'info',
        title: 'Revenue Anomaly Detected',
        message: `${anomalyCount} unusual revenue days detected.`,
        action: 'Investigate cause'
      });
    }

    return NextResponse.json({
      success: true,
      forecast,
      churnRate,
      churnRisk: churnRiskCustomers,
      inventoryRisk,
      lowStockCount,
      outOfStockCount,
      anomalyCount,
      avgCustomerLTV,
      insights
    });

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}


