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
      case 'ytd': days = 365; break;
      default: days = 30;
    }
    
    const now = new Date();
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);
    const previousEnd = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // ============================================================
    // REVENUE
    // ============================================================
    const currentRevenueData = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= ${currentStart.toISOString()}
    `;
    
    const previousRevenueData = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= ${previousStart.toISOString()}
        AND "createdAt" < ${previousEnd.toISOString()}
    `;
    
    const currentRevenue = Number(currentRevenueData[0].revenue);
    const previousRevenue = Number(previousRevenueData[0].revenue);
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    // ============================================================
    // EXPENSES (Estimated - would need actual expense tracking)
    // ============================================================
    // Calculate estimated expenses based on revenue
    const estimatedCOGS = currentRevenue * 0.6;  // Cost of goods sold
    const operatingExpenses = currentRevenue * 0.15; // Operating costs
    const marketingExpenses = currentRevenue * 0.05; // Marketing spend
    const shippingExpenses = currentRevenue * 0.02; // Shipping costs
    const totalExpenses = estimatedCOGS + operatingExpenses + marketingExpenses + shippingExpenses;
    
    // ============================================================
    // PROFITABILITY
    // ============================================================
    const grossProfit = currentRevenue - estimatedCOGS;
    const grossMargin = currentRevenue > 0 ? (grossProfit / currentRevenue) * 100 : 0;
    
    const netProfit = currentRevenue - totalExpenses;
    const netMargin = currentRevenue > 0 ? (netProfit / currentRevenue) * 100 : 0;
    
    // ============================================================
    // CASH FLOW (Simplified)
    // ============================================================
    const cashInflow = currentRevenue;
    const cashOutflow = totalExpenses;
    const netCashFlow = cashInflow - cashOutflow;
    
    // Cash reserves from delivered orders
    const cashReserves = await sql`
      SELECT COALESCE(SUM(total), 0) as reserves
      FROM "Order"
      WHERE status = 'delivered' AND "createdAt" >= NOW() - INTERVAL '90 days'
    `;
    
    // ============================================================
    // BRAND PROFITABILITY
    // ============================================================
    const brandProfitability = await sql`
      SELECT 
        brand,
        COUNT(*) as product_count,
        COALESCE(SUM(price * inventory), 0) as inventory_value
      FROM "Product"
      WHERE brand IS NOT NULL AND brand != ''
      GROUP BY brand
      ORDER BY inventory_value DESC
      LIMIT 10
    `;
    
    // ============================================================
    // VENDOR PROFITABILITY (from Vendor table)
    // ============================================================
    let vendorProfitability: any[] = [];
    try {
      vendorProfitability = await sql`
        SELECT 
          name,
          total_orders,
          total_revenue,
          rating
        FROM "Vendor"
        WHERE is_active = true
        ORDER BY total_revenue DESC
        LIMIT 10
      `;
    } catch (e) {
      vendorProfitability = [];
    }
    
    // ============================================================
    // FINANCIAL FORECASTS
    // ============================================================
    const last3Months = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '3 months'
    `;
    const monthlyAvg = Number(last3Months[0].revenue) / 3;
    
    const forecast = {
      next30: monthlyAvg,
      next90: monthlyAvg * 3,
      next365: monthlyAvg * 12,
      growthRate: revenueGrowth
    };
    
    // ============================================================
    // FINANCIAL RISK CENTER
    // ============================================================
    const risks = [];
    
    // Revenue decline risk
    if (revenueGrowth < -10) {
      risks.push({
        type: 'HIGH',
        title: 'Revenue Decline',
        description: `Revenue decreased by ${Math.abs(revenueGrowth).toFixed(0)}%. Immediate action required.`,
        action: 'Review pricing and marketing strategy'
      });
    } else if (revenueGrowth < 0) {
      risks.push({
        type: 'MEDIUM',
        title: 'Revenue Decline',
        description: `Revenue decreased by ${Math.abs(revenueGrowth).toFixed(0)}%. Monitor closely.`,
        action: 'Analyze sales trends'
      });
    }
    
    // Low margin risk
    if (netMargin < 10) {
      risks.push({
        type: 'HIGH',
        title: 'Low Profit Margin',
        description: `Net margin at ${netMargin.toFixed(0)}%. Below healthy threshold.`,
        action: 'Review costs and pricing'
      });
    } else if (netMargin < 20) {
      risks.push({
        type: 'MEDIUM',
        title: 'Margin Pressure',
        description: `Net margin at ${netMargin.toFixed(0)}%. Room for improvement.`,
        action: 'Optimize operational costs'
      });
    }
    
    // Cash flow risk
    if (netCashFlow < 0) {
      risks.push({
        type: 'HIGH',
        title: 'Negative Cash Flow',
        description: 'Cash outflow exceeds inflow. Liquidity risk detected.',
        action: 'Review expenses and payment terms'
      });
    }
    
    // Low cash reserves risk
    const cashReserveAmount = Number(cashReserves[0].reserves);
    if (cashReserveAmount < 1000000) {
      risks.push({
        type: 'MEDIUM',
        title: 'Low Cash Reserves',
        description: `Cash reserves at ?${(cashReserveAmount / 1000000).toFixed(1)}M. Below recommended level.`,
        action: 'Build cash buffer'
      });
    }
    
    return NextResponse.json({
      success: true,
      metrics: {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: revenueGrowth,
          orders: Number(currentRevenueData[0].orders)
        },
        expenses: {
          cogs: estimatedCOGS,
          operating: operatingExpenses,
          marketing: marketingExpenses,
          shipping: shippingExpenses,
          total: totalExpenses
        },
        profitability: {
          grossProfit: grossProfit,
          grossMargin: grossMargin,
          netProfit: netProfit,
          netMargin: netMargin
        },
        cashFlow: {
          inflow: cashInflow,
          outflow: cashOutflow,
          net: netCashFlow,
          reserves: cashReserveAmount
        }
      },
      brandProfitability: brandProfitability.map(b => ({
        name: b.brand,
        productCount: Number(b.product_count),
        inventoryValue: Number(b.inventory_value)
      })),
      vendorProfitability: vendorProfitability.map(v => ({
        name: v.name,
        orders: Number(v.total_orders),
        revenue: Number(v.total_revenue),
        rating: Number(v.rating)
      })),
      forecast: forecast,
      risks: risks
    });
    
  } catch (error) {
    console.error('Financial API Error:', error);
    return NextResponse.json({ 
      success: false, 
      metrics: {
        revenue: { current: 0, previous: 0, growth: 0, orders: 0 },
        expenses: { cogs: 0, operating: 0, marketing: 0, shipping: 0, total: 0 },
        profitability: { grossProfit: 0, grossMargin: 0, netProfit: 0, netMargin: 0 },
        cashFlow: { inflow: 0, outflow: 0, net: 0, reserves: 0 }
      },
      brandProfitability: [],
      vendorProfitability: [],
      forecast: { next30: 0, next90: 0, next365: 0, growthRate: 0 },
      risks: []
    });
  }
}

