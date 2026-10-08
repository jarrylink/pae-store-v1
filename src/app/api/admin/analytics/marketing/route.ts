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
      case 'year': days = 365; break;
      default: days = 30;
    }
    
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    // REVENUE METRICS
    const revenueResult = await sql`
      SELECT 
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND "createdAt" >= ${startDate.toISOString()}
    `;

    const previousRevenue = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND "createdAt" >= ${previousStartDate.toISOString()}
        AND "createdAt" <= ${startDate.toISOString()}
    `;

    // CUSTOMER METRICS
    const totalCustomers = await sql`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Order"
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `;

    const newCustomers = await sql`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Order"
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND "createdAt" >= ${startDate.toISOString()}
    `;

    // VENDOR METRICS
    const vendors = await sql`
      SELECT COUNT(*) as count
      FROM "Vendor"
      WHERE status = 'active'
    `;

    // ESG METRICS - Solar installations
    const solarInstallations = await sql`
      SELECT COUNT(*) as count
      FROM "Order" o,
      jsonb_array_elements(o.items) as items
      WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND (items->>'name' ILIKE '%solar%' 
          OR items->>'name' ILIKE '%panel%' 
          OR items->>'name' ILIKE '%inverter%'
          OR items->>'name' ILIKE '%kit%')
    `;

    const installationsCount = Number(solarInstallations[0]?.count || 0);
    const co2Reduction = installationsCount * 2;
    const dieselOffset = installationsCount * 500;
    const homesElectrified = installationsCount;
    const renewableCapacity = installationsCount * 5;

    // Calculate growth
    const currentRevenue = Number(revenueResult[0].revenue);
    const prevRevenue = Number(previousRevenue[0].revenue);
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    
    const totalCustomersCount = Number(totalCustomers[0].count);
    const newCustomersCount = Number(newCustomers[0].count);
    const retentionRate = totalCustomersCount > 0 ? ((totalCustomersCount - newCustomersCount) / totalCustomersCount) * 100 : 0;

    // Campaign metrics (estimated)
    const estimatedSpend = currentRevenue * 0.15;
    const estimatedLeads = Number(revenueResult[0].orders) * 4;
    const estimatedAcquisitions = Number(revenueResult[0].orders);
    const roi = estimatedSpend > 0 ? ((currentRevenue - estimatedSpend) / estimatedSpend) * 100 : 0;

    // Traffic metrics (estimated)
    const estimatedVisits = Number(revenueResult[0].orders) * 50;
    const estimatedUniqueVisitors = Number(revenueResult[0].orders) * 35;

    return NextResponse.json({
      success: true,
      period: { range, days },
      revenueMetrics: {
        current: currentRevenue,
        previous: prevRevenue,
        growth: revenueGrowth,
        orders: Number(revenueResult[0].orders)
      },
      customerMetrics: {
        total: totalCustomersCount,
        new: newCustomersCount,
        retention: retentionRate
      },
      vendorMetrics: {
        total: Number(vendors[0]?.count || 0)
      },
      esgMetrics: {
        homesElectrified,
        co2Reduction,
        dieselOffset,
        renewableCapacity,
        fuelSavings: dieselOffset * 650
      },
      campaignMetrics: {
        totalSpend: Math.round(estimatedSpend),
        leads: estimatedLeads,
        acquisitions: estimatedAcquisitions,
        roi: roi,
        cpa: estimatedAcquisitions > 0 ? Math.round(estimatedSpend / estimatedAcquisitions) : 0
      },
      trafficMetrics: {
        websiteVisits: estimatedVisits,
        uniqueVisitors: estimatedUniqueVisitors,
        bounceRate: 45.2,
        avgSessionDuration: 185,
        sources: [
          { source: 'Direct', percentage: 35 },
          { source: 'Organic Search', percentage: 28 },
          { source: 'Social Media', percentage: 22 },
          { source: 'Referral', percentage: 15 }
        ]
      },
      socialMetrics: {
        facebook: { followers: Math.round(estimatedUniqueVisitors * 1.5), engagement: 3.2 },
        instagram: { followers: Math.round(estimatedUniqueVisitors * 2.5), engagement: 4.5 },
        whatsapp: { subscribers: Math.round(estimatedUniqueVisitors * 0.8), messages: Math.round(estimatedUniqueVisitors * 15) }
      }
    });

  } catch (error) {
    console.error('Marketing API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}

