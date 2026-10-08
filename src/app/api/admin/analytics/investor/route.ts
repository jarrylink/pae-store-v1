import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'quarter';

    let days = 90;
    switch(range) {
      case 'month': days = 30; break;
      case 'quarter': days = 90; break;
      case 'year': days = 365; break;
      case 'all': days = 9999; break;
      default: days = 90;
    }
    
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get all confirmed orders (using correct column names from your schema)
    const allOrders = await sql`
      SELECT 
        id,
        total,
        "userId",
        "createdAt",
        "shippingAddress",
        status,
        items
      FROM "Order"
    `;

    // Filter for revenue orders
    const revenueOrders = allOrders.filter(o => 
      ['confirmed', 'processing', 'shipped', 'delivered'].includes(o.status)
    );

    // Current period orders
    const currentOrders = revenueOrders.filter(o => new Date(o.createdAt) >= startDate);
    const previousOrders = revenueOrders.filter(o => new Date(o.createdAt) < startDate);

    // Revenue metrics
    const currentRevenue = currentOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const avgOrderValue = currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0;

    // Customer metrics - using userId field
    const currentCustomers = new Set(currentOrders.map(o => o.userId).filter(id => id && id !== 'null')).size;
    const previousCustomers = new Set(previousOrders.map(o => o.userId).filter(id => id && id !== 'null')).size;
    const newCustomers = Math.max(0, currentCustomers - previousCustomers);
    const customerGrowth = previousCustomers > 0 ? (newCustomers / previousCustomers) * 100 : 0;

    // Market metrics - extract states from shippingAddress JSONB
    const states = new Set();
    currentOrders.forEach(o => {
      if (o.shippingAddress) {
        let addr = o.shippingAddress;
        if (typeof addr === 'string') {
          try { addr = JSON.parse(addr); } catch(e) { addr = {}; }
        }
        const state = addr?.state;
        if (state && state !== '' && state !== 'Unknown' && state !== 'null') {
          states.add(state);
        }
      }
    });
    const statesCovered = states.size;
    const marketPenetration = (statesCovered / 37) * 100;

    // ESG metrics - count orders with solar products in items JSONB
    let solarCount = 0;
    for (const order of revenueOrders) {
      if (order.items) {
        let items = order.items;
        if (typeof items === 'string') {
          try { items = JSON.parse(items); } catch(e) { items = []; }
        }
        if (Array.isArray(items)) {
          const hasSolar = items.some((item: any) => {
            const name = (item.name || item.title || '').toLowerCase();
            return name.includes('solar') || name.includes('panel') || name.includes('inverter') || name.includes('kit');
          });
          if (hasSolar) solarCount++;
        }
      }
    }

    const installations = solarCount;
    const co2Reduction = installations * 2.5;
    const renewableCapacity = installations * 5;
    const homesElectrified = installations;
    const jobsCreated = Math.round(installations * 0.5);

    // Vendor count - using is_active column from Vendor table
    let vendorCount = 0;
    try {
      const vendors = await sql`SELECT COUNT(*) as count FROM "Vendor" WHERE is_active = true`;
      vendorCount = Number(vendors[0]?.count || 0);
    } catch (e) {
      // Fallback to all vendors
      const vendors = await sql`SELECT COUNT(*) as count FROM "Vendor"`;
      vendorCount = Number(vendors[0]?.count || 0);
    }

    // Get all-time totals
    const allTimeRevenue = revenueOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const allTimeCustomers = new Set(revenueOrders.map(o => o.userId).filter(id => id)).size;

    return NextResponse.json({
      success: true,
      financialMetrics: {
        revenue: currentRevenue,
        previousRevenue: previousRevenue,
        revenueGrowth: revenueGrowth,
        orders: currentOrders.length,
        avgOrderValue: avgOrderValue,
        allTimeRevenue: allTimeRevenue
      },
      growthMetrics: {
        customerCount: currentCustomers,
        newCustomers: newCustomers,
        customerGrowth: customerGrowth,
        vendorCount: vendorCount,
        allTimeCustomers: allTimeCustomers
      },
      marketMetrics: {
        statesCovered: statesCovered,
        totalStates: 37,
        marketPenetration: marketPenetration
      },
      esgMetrics: {
        installations: installations,
        co2Reduction: co2Reduction,
        renewableCapacity: renewableCapacity,
        homesElectrified: homesElectrified,
        jobsCreated: jobsCreated,
        treesEquivalent: Math.round(co2Reduction * 45)
      }
    });

  } catch (error) {
    console.error('Investor API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}

