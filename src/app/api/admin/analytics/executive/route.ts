import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const selectedMonth = searchParams.get('month');
    const selectedYear = searchParams.get('year');
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // ============================================================
    // REVENUE METRICS - Using simple queries without interpolation
    // ============================================================
    
    // Daily Revenue
    const dailyRevenue = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE DATE("createdAt") = CURRENT_DATE
    `;
    
    // Weekly Revenue
    const weeklyRevenue = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= DATE_TRUNC('week', CURRENT_DATE)
    `;
    
    // Monthly Revenue (selected or current)
    let targetYear = selectedYear ? parseInt(selectedYear) : currentYear;
    let targetMonth = selectedMonth ? parseInt(selectedMonth) : currentMonth;
    
    const monthlyRevenue = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE EXTRACT(YEAR FROM "createdAt") = ${targetYear}
        AND EXTRACT(MONTH FROM "createdAt") = ${targetMonth}
    `;
    
    // Annual Revenue
    const yearlyRevenue = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE EXTRACT(YEAR FROM "createdAt") = ${targetYear}
    `;
    
    // Total Revenue All Time
    const totalRevenueAllTime = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
    `;
    
    // Previous period for growth
    const previousPeriod = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '60 days'
        AND "createdAt" < NOW() - INTERVAL '30 days'
    `;
    
    const currentRev = Number(monthlyRevenue[0].revenue);
    const prevRev = Number(previousPeriod[0].revenue);
    const revenueGrowth = prevRev > 0 ? ((currentRev - prevRev) / prevRev) * 100 : 0;
    
    // ============================================================
    // PROFITABILITY METRICS
    // ============================================================
    
    const revenueData = await sql`
      SELECT COALESCE(SUM(total), 0) as total_revenue
      FROM "Order"
      WHERE status IN ('confirmed', 'delivered')
    `;
    const totalRevenue = Number(revenueData[0].total_revenue);
    
    const estimatedCOGS = totalRevenue * 0.6;
    const grossProfit = totalRevenue - estimatedCOGS;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    const operatingExpenses = totalRevenue * 0.15;
    const netProfit = grossProfit - operatingExpenses;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    // ============================================================
    // ORDER METRICS
    // ============================================================
    
    const orders = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM "Order"
    `;
    
    const totalOrders = Number(orders[0].total);
    const successfulOrders = Number(orders[0].delivered) + Number(orders[0].confirmed);
    
    // ============================================================
    // CUSTOMER METRICS
    // ============================================================
    
    const customers = await sql`
      SELECT COUNT(*) as total
      FROM "User"
      WHERE role = 'customer'
    `;
    const totalCustomers = Number(customers[0].total);
    
    const newCustomers = await sql`
      SELECT COUNT(*) as count
      FROM "User"
      WHERE role = 'customer' AND "createdAt" >= NOW() - INTERVAL '30 days'
    `;
    
    // Returning customers
    const allOrders = await sql`
      SELECT "userId", COUNT(*) as order_count
      FROM "Order"
      GROUP BY "userId"
    `;
    const returningCount = allOrders.filter((o: any) => Number(o.order_count) > 1).length;
    const retentionRate = totalCustomers > 0 ? (returningCount / totalCustomers) * 100 : 0;
    
    const avgOrderValue = await sql`
      SELECT COALESCE(AVG(total), 0) as value
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    `;
    
    // ============================================================
    // MARKETPLACE METRICS
    // ============================================================
    
    let vendorTotal = 0;
    let activeVendors = 0;
    let topVendorName = 'None';
    try {
      const vendors = await sql`SELECT COUNT(*) as total, COUNT(CASE WHEN is_active = true THEN 1 END) as active FROM "Vendor"`;
      if (vendors.length > 0) {
        vendorTotal = Number(vendors[0].total);
        activeVendors = Number(vendors[0].active);
      }
      const topVendor = await sql`SELECT name FROM "Vendor" WHERE is_active = true ORDER BY rating DESC LIMIT 1`;
      if (topVendor.length > 0) topVendorName = topVendor[0].name;
    } catch (e) {}
    
    let installerTotal = 0;
    let availableInstallers = 0;
    let avgInstallerRating = 0;
    let totalInstallerJobs = 0;
    try {
      const installers = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_available = true AND is_active = true THEN 1 END) as available,
          COALESCE(AVG(rating), 0) as avg_rating,
          COALESCE(SUM(completed_jobs), 0) as total_jobs
        FROM "Installer"
        WHERE is_active = true
      `;
      if (installers.length > 0) {
        installerTotal = Number(installers[0].total);
        availableInstallers = Number(installers[0].available);
        avgInstallerRating = Number(installers[0].avg_rating);
        totalInstallerJobs = Number(installers[0].total_jobs);
      }
    } catch (e) {}
    
    // ============================================================
    // FORECAST METRICS
    // ============================================================
    
    const last3Months = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '3 months'
    `;
    const monthlyAvg = Number(last3Months[0].revenue) / 3;
    
    const lowStock = await sql`
      SELECT COUNT(*) as count
      FROM "Product"
      WHERE inventory <= 5 AND inventory > 0
    `;
    
    const cashReserve = await sql`
      SELECT COALESCE(SUM(total), 0) as cash
      FROM "Order"
      WHERE status = 'delivered' AND "createdAt" >= NOW() - INTERVAL '30 days'
    `;
    
    // ============================================================
    // REVENUE TREND
    // ============================================================
    
    const revenueTrend = await sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `;
    
    // ============================================================
    // AVAILABLE MONTHS AND YEARS
    // ============================================================
    
    const availableYearsData = await sql`
      SELECT DISTINCT EXTRACT(YEAR FROM "createdAt") as year
      FROM "Order"
      ORDER BY year DESC
    `;
    const availableYears = availableYearsData.map((y: any) => Number(y.year));
    
    // ============================================================
    // AI INSIGHTS
    // ============================================================
    
    const insights = [];
    if (revenueGrowth > 10) {
      insights.push({ type: 'positive', title: 'Strong Revenue Growth', message: `Revenue is up ${revenueGrowth.toFixed(0)}% compared to last period.`, action: 'Analyze growth drivers' });
    } else if (revenueGrowth < -5) {
      insights.push({ type: 'negative', title: 'Revenue Alert', message: `Revenue decreased by ${Math.abs(revenueGrowth).toFixed(0)}%. Review strategy.`, action: 'Analyze' });
    } else {
      insights.push({ type: 'neutral', title: 'Revenue Status', message: `Revenue is stable.`, action: 'View forecast' });
    }
    
    if (lowStock[0].count > 0) {
      insights.push({ type: 'alert', title: 'Inventory Alert', message: `${lowStock[0].count} product(s) running low on stock.`, action: 'Restock now' });
    }
    
    if (newCustomers[0].count > 0) {
      insights.push({ type: 'positive', title: 'Customer Growth', message: `${newCustomers[0].count} new customers joined in last 30 days.`, action: 'View customers' });
    }
    
    // ============================================================
    // RESPONSE
    // ============================================================
    
    const response = {
      success: true,
      currentDate: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', hour12: false }),
      availableYears: availableYears,
      selectedYear: targetYear,
      selectedMonth: targetMonth,
      metrics: {
        revenue: {
          daily: Number(dailyRevenue[0].revenue),
          weekly: Number(weeklyRevenue[0].revenue),
          monthly: currentRev,
          yearly: Number(yearlyRevenue[0].revenue),
          totalAllTime: Number(totalRevenueAllTime[0].revenue),
          growth: revenueGrowth
        },
        profitability: {
          grossProfit: grossProfit,
          netProfit: netProfit,
          grossMargin: grossMargin,
          netMargin: netMargin
        },
        operational: {
          orders: {
            total: totalOrders,
            pending: Number(orders[0].pending),
            confirmed: Number(orders[0].confirmed),
            shipped: Number(orders[0].shipped),
            delivered: Number(orders[0].delivered),
            cancelled: Number(orders[0].cancelled)
          },
          transactions: {
            total: totalOrders,
            successful: successfulOrders,
            failed: Number(orders[0].cancelled),
            successRate: totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0
          }
        },
        marketplace: {
          vendors: {
            total: vendorTotal,
            active: activeVendors,
            topVendor: topVendorName
          },
          installers: {
            total: installerTotal,
            available: availableInstallers,
            avgRating: avgInstallerRating,
            totalJobsCompleted: totalInstallerJobs
          }
        },
        customer: {
          total: totalCustomers,
          new: Number(newCustomers[0].count),
          returning: returningCount,
          retentionRate: retentionRate,
          averageOrderValue: Number(avgOrderValue[0].value)
        },
        forecast: {
          revenue: {
            next90: monthlyAvg * 3,
            confidence: 85
          },
          inventory: {
            daysUntilOutOfStock: lowStock[0].count > 0 ? 15 : 45,
            lowStockCount: Number(lowStock[0].count)
          },
          cash: {
            projected: monthlyAvg * 3 * 0.7,
            confidence: 80,
            reserve: Number(cashReserve[0].cash)
          }
        }
      },
      revenueTrend: revenueTrend.map(r => ({
        month: r.month,
        revenue: Number(r.revenue),
        orders: Number(r.orders)
      })),
      alerts: {
        lowStockCount: Number(lowStock[0].count)
      },
      insights: insights
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Executive API Error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
