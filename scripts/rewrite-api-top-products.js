const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'analytics', 'revenue-sales', 'route.ts');

const fixedApi = `import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    let days = 30;
    const now = new Date();

    switch(range) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case 'year': days = 365; break;
      default: days = 30;
    }

    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // ============================================================
    // GET ALL ORDERS
    // ============================================================
    const orders = await sql\`
      SELECT 
        id, 
        status, 
        total, 
        items, 
        "paymentMethod", 
        "createdAt",
        "customerName"
      FROM "Order" 
      WHERE "createdAt" >= \${startDate.toISOString()}
      ORDER BY "createdAt" DESC
    \`;

    // ============================================================
    // GET ALL PRODUCTS WITH COST PRICES
    // ============================================================
    const products = await sql\`
      SELECT id, title, price, "purchasePrice" as costPrice 
      FROM "Product"
    \`;

    // ============================================================
    // GET ALL SERVICES WITH COST PRICES
    // ============================================================
    const services = await sql\`
      SELECT id, name, price, "costPrice" 
      FROM "Service"
    \`;

    // ============================================================
    // GET ALL ACCESSORIES WITH COST PRICES
    // ============================================================
    const accessories = await sql\`
      SELECT id, name, price, "costPrice" 
      FROM "Accessory"
    \`;

    // ============================================================
    // BUILD COST LOOKUP MAPS
    // ============================================================
    const costMap: Record<number, number> = {};
    products.forEach((p: any) => {
      costMap[p.id] = Number(p.costPrice) || 0;
    });
    services.forEach((s: any) => {
      costMap[s.id] = Number(s.costPrice) || 0;
    });
    accessories.forEach((a: any) => {
      costMap[a.id] = Number(a.costPrice) || 0;
    });

    // Build product name map
    const nameMap: Record<number, string> = {};
    products.forEach((p: any) => { nameMap[p.id] = p.title; });
    services.forEach((s: any) => { nameMap[s.id] = s.name; });
    accessories.forEach((a: any) => { nameMap[a.id] = a.name; });

    // ============================================================
    // INITIALIZE TOTALS
    // ============================================================
    const revenueStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    const pipelineStatuses = ['pending'];

    let pipelineRevenue = 0;
    let pipelineOrders = 0;
    let pipelineCost = 0;
    let pipelineItems: any[] = [];

    let revenueRevenue = 0;
    let revenueOrders = 0;
    let revenueCost = 0;
    let revenueItems: any[] = [];

    const statusMap: Record<string, { orders: number; revenue: number; cost: number; profit: number; margin: number }> = {};
    
    // Separate product tracking for revenue and pipeline
    const revenueProductSales: Record<string, { title: string; quantity: number; revenue: number; cost: number; profit: number }> = {};
    const pipelineProductSales: Record<string, { title: string; quantity: number; revenue: number; cost: number; profit: number }> = {};
    
    const categorySales: Record<string, { quantity: number; revenue: number; cost: number; profit: number }> = {};

    // ============================================================
    // PROCESS EACH ORDER
    // ============================================================
    orders.forEach((order: any) => {
      const status = order.status;
      const total = Number(order.total) || 0;
      const isRevenue = revenueStatuses.includes(status);
      const isPipeline = pipelineStatuses.includes(status);

      // Status map
      if (!statusMap[status]) {
        statusMap[status] = { orders: 0, revenue: 0, cost: 0, profit: 0, margin: 0 };
      }
      statusMap[status].orders++;
      statusMap[status].revenue += total;

      // Parse items
      let items = order.items;
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch(e) { items = []; }
      }
      if (!Array.isArray(items)) { items = [items]; }

      let orderCost = 0;

      items.forEach((item: any) => {
        const quantity = Number(item.quantity) || 1;
        const price = Number(item.price) || Number(item.amount) || 0;
        const productId = Number(item.productId) || Number(item.id) || 0;
        
        // Get cost from map
        const costPrice = costMap[productId] || 0;
        const itemCost = costPrice * quantity;
        const itemRevenue = price * quantity;
        const itemProfit = itemRevenue - itemCost;

        orderCost += itemCost;

        // Get product name
        const productName = item.title || item.name || nameMap[productId] || 'Unknown Product';
        const category = item.type || 'product';

        // Track product sales separately for revenue and pipeline
        const productSales = isRevenue ? revenueProductSales : pipelineProductSales;
        if (!productSales[productName]) {
          productSales[productName] = { 
            title: productName, 
            quantity: 0, 
            revenue: 0, 
            cost: 0, 
            profit: 0 
          };
        }
        productSales[productName].quantity += quantity;
        productSales[productName].revenue += itemRevenue;
        productSales[productName].cost += itemCost;
        productSales[productName].profit += itemProfit;

        // Track category
        let catKey = 'products';
        if (category === 'service' || category === 'services') catKey = 'services';
        else if (category === 'accessory' || category === 'accessories') catKey = 'accessories';
        
        if (!categorySales[catKey]) {
          categorySales[catKey] = { quantity: 0, revenue: 0, cost: 0, profit: 0 };
        }
        categorySales[catKey].quantity += quantity;
        categorySales[catKey].revenue += itemRevenue;
        categorySales[catKey].cost += itemCost;
        categorySales[catKey].profit += itemProfit;

        // Store items for category breakdown
        const itemData = {
          name: productName,
          category: catKey,
          quantity: quantity,
          revenue: itemRevenue,
          cost: itemCost,
          profit: itemProfit
        };

        if (isRevenue) {
          revenueItems.push(itemData);
        } else if (isPipeline) {
          pipelineItems.push(itemData);
        }
      });

      // Update status map with cost
      statusMap[status].cost += orderCost;
      statusMap[status].profit += total - orderCost;

      if (isRevenue) {
        revenueRevenue += total;
        revenueOrders++;
        revenueCost += orderCost;
      } else if (isPipeline) {
        pipelineRevenue += total;
        pipelineOrders++;
        pipelineCost += orderCost;
      }
    });

    // ============================================================
    // CALCULATE MARGINS
    // ============================================================
    Object.keys(statusMap).forEach(key => {
      const s = statusMap[key];
      s.margin = s.revenue > 0 ? (s.profit / s.revenue) * 100 : 0;
    });

    // ============================================================
    // CATEGORIZE ITEMS
    // ============================================================
    const categorizeItems = (items: any[]) => {
      const categories: Record<string, { revenue: number; cost: number; profit: number; orders: number; margin: number }> = {
        products: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
        accessories: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
        services: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 }
      };

      items.forEach(item => {
        const cat = item.category || 'products';
        if (categories[cat]) {
          categories[cat].revenue += item.revenue;
          categories[cat].cost += item.cost;
          categories[cat].profit += item.profit;
          categories[cat].orders += item.quantity;
        }
      });

      Object.keys(categories).forEach(key => {
        const c = categories[key];
        c.margin = c.revenue > 0 ? (c.profit / c.revenue) * 100 : 0;
      });

      return categories;
    };

    const pipelineCategories = categorizeItems(pipelineItems);
    const revenueCategories = categorizeItems(revenueItems);

    // ============================================================
    // FINAL METRICS
    // ============================================================
    const totalRevenue = revenueRevenue + pipelineRevenue;
    const totalOrders = revenueOrders + pipelineOrders;
    const totalCost = revenueCost + pipelineCost;
    const totalProfit = totalRevenue - totalCost;
    const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const revenueProfit = revenueRevenue - revenueCost;
    const revenueMargin = revenueRevenue > 0 ? (revenueProfit / revenueRevenue) * 100 : 0;
    const pipelineProfit = pipelineRevenue - pipelineCost;
    const pipelineMargin = pipelineRevenue > 0 ? (pipelineProfit / pipelineRevenue) * 100 : 0;

    // ============================================================
    // RETURN RESPONSE
    // ============================================================
    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders,
        totalCost,
        totalProfit,
        totalMargin,
        avgOrderValue: revenueOrders > 0 ? revenueRevenue / revenueOrders : 0,
        conversionRate: totalOrders > 0 ? (revenueOrders / totalOrders) * 100 : 0
      },
      pipeline: {
        value: pipelineRevenue,
        orders: pipelineOrders,
        cost: pipelineCost,
        profit: pipelineProfit,
        margin: pipelineMargin
      },
      revenue: {
        value: revenueRevenue,
        orders: revenueOrders,
        cost: revenueCost,
        profit: revenueProfit,
        margin: revenueMargin
      },
      pipelineCategories: pipelineCategories,
      revenueCategories: revenueCategories,
      statusBreakdown: Object.entries(statusMap).map(([status, data]) => ({
        status,
        orders: data.orders,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.profit,
        margin: data.margin
      })),
      // TOP PERFORMING PRODUCTS - ONLY FROM REVENUE (PAID ORDERS)
      topProducts: Object.values(revenueProductSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      // PIPELINE PRODUCTS - PENDING ORDERS (shown separately below)
      pipelineProducts: Object.values(pipelineProductSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    });

  } catch (error) {
    console.error('Revenue API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}`;

fs.writeFileSync(apiPath, fixedApi, 'utf8');
console.log('✅ Rewrote API - top products only from revenue orders');
