const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'analytics', 'revenue-sales', 'route.ts');

const newApi = `import { NextRequest, NextResponse } from 'next/server';
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
    // STEP 1: GET ALL ORDERS IN DATE RANGE
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
    // STEP 2: GET ALL PRODUCTS WITH COST PRICES
    // ============================================================
    const products = await sql\`
      SELECT id, title, price, "purchasePrice" as costPrice 
      FROM "Product"
    \`;

    // ============================================================
    // STEP 3: GET ALL SERVICES WITH COST PRICES
    // ============================================================
    const services = await sql\`
      SELECT id, name, price, "costPrice" 
      FROM "Service"
    \`;

    // ============================================================
    // STEP 4: GET ALL ACCESSORIES WITH COST PRICES
    // ============================================================
    const accessories = await sql\`
      SELECT id, name, price, "costPrice" 
      FROM "Accessory"
    \`;

    // ============================================================
    // STEP 5: BUILD COST LOOKUP MAPS
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

    // Also build product name maps for top products
    const productNameMap: Record<number, string> = {};
    products.forEach((p: any) => {
      productNameMap[p.id] = p.title;
    });
    services.forEach((s: any) => {
      productNameMap[s.id] = s.name;
    });
    accessories.forEach((a: any) => {
      productNameMap[a.id] = a.name;
    });

    // ============================================================
    // STEP 6: INITIALIZE TOTALS
    // ============================================================
    const revenueStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    const pipelineStatuses = ['pending'];

    // Pipeline totals
    let pipelineRevenue = 0;
    let pipelineOrders = 0;
    let pipelineCost = 0;
    let pipelineItems: any[] = [];

    // Revenue totals
    let revenueRevenue = 0;
    let revenueOrders = 0;
    let revenueCost = 0;
    let revenueItems: any[] = [];

    // Status breakdown
    const statusMap: Record<string, { orders: number; revenue: number; cost: number }> = {};

    // Top products tracking
    const productSales: Record<string, { title: string; quantity: number; revenue: number; cost: number }> = {};

    // ============================================================
    // STEP 7: PROCESS EACH ORDER
    // ============================================================
    orders.forEach((order: any) => {
      const status = order.status;
      const total = Number(order.total) || 0;
      const isRevenue = revenueStatuses.includes(status);
      const isPipeline = pipelineStatuses.includes(status);

      // Initialize status map
      if (!statusMap[status]) {
        statusMap[status] = { orders: 0, revenue: 0, cost: 0 };
      }
      statusMap[status].orders++;
      statusMap[status].revenue += total;

      // Parse order items
      let items = order.items;
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch(e) { items = []; }
      }
      if (!Array.isArray(items)) { items = [items]; }

      let orderCost = 0;

      // Process each item in the order
      items.forEach((item: any) => {
        const quantity = Number(item.quantity) || 1;
        const price = Number(item.price) || Number(item.amount) || 0;
        const productId = Number(item.productId) || Number(item.id) || 0;
        
        // Get cost price from map
        const costPrice = costMap[productId] || 0;
        const itemCost = costPrice * quantity;
        const itemRevenue = price * quantity;

        orderCost += itemCost;

        // Track product sales
        const productName = item.title || item.name || productNameMap[productId] || 'Unknown Product';
        if (!productSales[productName]) {
          productSales[productName] = { title: productName, quantity: 0, revenue: 0, cost: 0 };
        }
        productSales[productName].quantity += quantity;
        productSales[productName].revenue += itemRevenue;
        productSales[productName].cost += itemCost;

        // Track items for category breakdown
        const category = item.type || 'product';
        const itemData = {
          name: productName,
          category: category,
          quantity: quantity,
          revenue: itemRevenue,
          cost: itemCost,
          profit: itemRevenue - itemCost,
          productId: productId
        };

        if (isRevenue) {
          revenueItems.push(itemData);
        } else if (isPipeline) {
          pipelineItems.push(itemData);
        }
      });

      // Update status map with cost
      statusMap[status].cost += orderCost;

      // Add to totals
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
    // STEP 8: CALCULATE FINAL METRICS
    // ============================================================
    const totalRevenue = revenueRevenue + pipelineRevenue;
    const totalOrders = revenueOrders + pipelineOrders;
    const totalCost = revenueCost + pipelineCost;
    const totalProfit = totalRevenue - totalCost;

    const revenueProfit = revenueRevenue - revenueCost;
    const pipelineProfit = pipelineRevenue - pipelineCost;

    // Category breakdowns
    const categorizeItems = (items: any[]) => {
      const categories: Record<string, { revenue: number; cost: number; profit: number; orders: number; margin: number }> = {
        products: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
        accessories: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
        services: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 }
      };

      items.forEach(item => {
        let cat = 'products';
        if (item.category === 'service' || item.category === 'services') cat = 'services';
        else if (item.category === 'accessory' || item.category === 'accessories') cat = 'accessories';
        
        categories[cat].revenue += item.revenue;
        categories[cat].cost += item.cost;
        categories[cat].profit += item.profit;
        categories[cat].orders += item.quantity;
      });

      // Calculate margins
      Object.keys(categories).forEach(key => {
        const c = categories[key];
        c.margin = c.revenue > 0 ? (c.profit / c.revenue) * 100 : 0;
      });

      return categories;
    };

    const pipelineCategories = categorizeItems(pipelineItems);
    const revenueCategories = categorizeItems(revenueItems);

    // ============================================================
    // STEP 9: RETURN RESPONSE
    // ============================================================
    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders,
        totalCost,
        totalProfit,
        totalMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        avgOrderValue: revenueOrders > 0 ? revenueRevenue / revenueOrders : 0,
        conversionRate: totalOrders > 0 ? (revenueOrders / totalOrders) * 100 : 0
      },
      pipeline: {
        value: pipelineRevenue,
        orders: pipelineOrders,
        cost: pipelineCost,
        profit: pipelineProfit,
        margin: pipelineRevenue > 0 ? (pipelineProfit / pipelineRevenue) * 100 : 0
      },
      revenue: {
        value: revenueRevenue,
        orders: revenueOrders,
        cost: revenueCost,
        profit: revenueProfit,
        margin: revenueRevenue > 0 ? (revenueProfit / revenueRevenue) * 100 : 0
      },
      pipelineCategories: pipelineCategories,
      revenueCategories: revenueCategories,
      statusBreakdown: Object.entries(statusMap).map(([status, data]) => ({
        status,
        orders: data.orders,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.revenue - data.cost,
        margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0
      })),
      products: Object.values(productSales)
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

fs.writeFileSync(apiPath, newApi, 'utf8');
console.log('✅ Rewrote Revenue API with proper data flow');
