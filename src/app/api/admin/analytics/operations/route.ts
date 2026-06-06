import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    // ============================================================
    // INVENTORY
    // ============================================================
    
    const products = await sql`
      SELECT id, title, category, price, inventory, "purchasePrice"
      FROM "Product"
      ORDER BY inventory ASC
    `;
    
    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.inventory)), 0);
    const totalCostValue = products.reduce((sum, p) => sum + (Number(p.purchasePrice || 0) * Number(p.inventory)), 0);
    
    const lowStockItems = products.filter(p => p.inventory <= 5 && p.inventory > 0);
    const outOfStockItems = products.filter(p => p.inventory === 0);
    const wellStockedItems = products.filter(p => p.inventory > 5);
    
    // Inventory by category
    const inventoryByCategory = await sql`
      SELECT category, SUM(inventory) as total_stock, SUM(price * inventory) as total_value
      FROM "Product"
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY total_value DESC
    `;
    
    // ============================================================
    // INVENTORY VALUATION
    // ============================================================
    
    const valuation = {
      totalRetailValue: totalInventoryValue,
      totalCostValue: totalCostValue,
      potentialProfit: totalInventoryValue - totalCostValue,
      avgMargin: totalCostValue > 0 ? ((totalInventoryValue - totalCostValue) / totalInventoryValue) * 100 : 0
    };
    
    // ============================================================
    // DEMAND FORECASTING (based on historical orders)
    // ============================================================
    
    const monthlySales = await sql`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as order_count,
        COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;
    
    // Calculate average monthly demand
    const avgMonthlyOrders = monthlySales.length > 0 
      ? monthlySales.reduce((sum, m) => sum + Number(m.order_count), 0) / monthlySales.length 
      : 0;
    
    const avgMonthlyRevenue = monthlySales.length > 0 
      ? monthlySales.reduce((sum, m) => sum + Number(m.revenue), 0) / monthlySales.length 
      : 0;
    
    // Forecast next 3 months
    const forecast = [];
    const growthRate = monthlySales.length >= 2 
      ? (Number(monthlySales[monthlySales.length-1].order_count) / Number(monthlySales[0].order_count)) - 1 
      : 0.05;
    
    let projectedOrders = avgMonthlyOrders;
    for (let i = 1; i <= 3; i++) {
      projectedOrders = projectedOrders * (1 + growthRate);
      forecast.push({
        month: new Date(new Date().setMonth(new Date().getMonth() + i)).toLocaleString('default', { month: 'short' }),
        projectedOrders: Math.round(projectedOrders),
        projectedRevenue: projectedOrders * (avgMonthlyRevenue / avgMonthlyOrders)
      });
    }
    
    // ============================================================
    // STOCK FORECASTING
    // ============================================================
    
    // Calculate days until out of stock for low stock items
    const stockForecast = lowStockItems.map(item => {
      // Estimate daily sales (simplified)
      const dailySalesRate = 0.1; // Placeholder - would need actual sales data
      const daysUntilOut = item.inventory > 0 ? Math.floor(item.inventory / dailySalesRate) : 0;
      return {
        id: item.id,
        title: item.title,
        currentStock: item.inventory,
        daysUntilOut: daysUntilOut,
        riskLevel: daysUntilOut < 7 ? 'CRITICAL' : daysUntilOut < 30 ? 'HIGH' : 'MEDIUM'
      };
    });
    
    // ============================================================
    // DEAD STOCK DETECTION
    // ============================================================
    
    // Products with no sales in last 90 days (simplified - would need order items)
    const deadStockCandidates = products.filter(p => p.inventory > 0);
    const deadStockValue = deadStockCandidates.reduce((sum, p) => sum + (Number(p.price) * Number(p.inventory)), 0);
    
    // ============================================================
    // SUPPLIERS / VENDORS
    // ============================================================
    
    let suppliers: any[] = [];
    try {
      suppliers = await sql`
        SELECT name, total_orders, total_revenue, rating, is_active
        FROM "Vendor"
        ORDER BY total_revenue DESC
        LIMIT 10
      `;
    } catch (e) {
      suppliers = [];
    }
    
    // ============================================================
    // WAREHOUSING (estimated)
    // ============================================================
    
    const warehousing = {
      totalSKU: totalProducts,
      totalUnits: products.reduce((sum, p) => sum + Number(p.inventory), 0),
      spaceUtilization: totalProducts > 0 ? (products.filter(p => p.inventory > 0).length / totalProducts) * 100 : 0,
      turnoverRate: totalInventoryValue > 0 ? (avgMonthlyRevenue * 12) / totalInventoryValue : 0
    };
    
    // ============================================================
    // LOGISTICS (estimated)
    // ============================================================
    
    const orders = await sql`
      SELECT status, COUNT(*) as count
      FROM "Order"
      GROUP BY status
    `;
    
    const deliveredOrders = orders.find(o => o.status === 'delivered')?.count || 0;
    const pendingOrders = orders.find(o => o.status === 'pending')?.count || 0;
    const shippedOrders = orders.find(o => o.status === 'shipped')?.count || 0;
    
    const logistics = {
      fulfillmentRate: (deliveredOrders / (deliveredOrders + pendingOrders + shippedOrders)) * 100,
      pendingOrders: pendingOrders,
      inTransit: shippedOrders,
      completed: deliveredOrders
    };
    
    return NextResponse.json({
      success: true,
      inventory: {
        totalProducts: totalProducts,
        totalValue: totalInventoryValue,
        totalCost: totalCostValue,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        wellStockedCount: wellStockedItems.length,
        lowStockItems: lowStockItems.map(i => ({ id: i.id, title: i.title, stock: i.inventory, price: i.price })),
        byCategory: inventoryByCategory
      },
      valuation: valuation,
      demandForecast: {
        avgMonthlyOrders: avgMonthlyOrders,
        avgMonthlyRevenue: avgMonthlyRevenue,
        forecast: forecast
      },
      stockForecast: stockForecast,
      deadStock: {
        candidateCount: deadStockCandidates.length,
        estimatedValue: deadStockValue,
        items: deadStockCandidates.slice(0, 10).map(i => ({ title: i.title, stock: i.inventory, value: i.price * i.inventory }))
      },
      suppliers: suppliers,
      warehousing: warehousing,
      logistics: logistics
    });
    
  } catch (error) {
    console.error('Operations API Error:', error);
    return NextResponse.json({ 
      success: false, 
      inventory: {
        totalProducts: 0, totalValue: 0, totalCost: 0,
        lowStockCount: 0, outOfStockCount: 0, wellStockedCount: 0,
        lowStockItems: [], byCategory: []
      },
      valuation: { totalRetailValue: 0, totalCostValue: 0, potentialProfit: 0, avgMargin: 0 },
      demandForecast: { avgMonthlyOrders: 0, avgMonthlyRevenue: 0, forecast: [] },
      stockForecast: [],
      deadStock: { candidateCount: 0, estimatedValue: 0, items: [] },
      suppliers: [],
      warehousing: { totalSKU: 0, totalUnits: 0, spaceUtilization: 0, turnoverRate: 0 },
      logistics: { fulfillmentRate: 0, pendingOrders: 0, inTransit: 0, completed: 0 }
    });
  }
}

