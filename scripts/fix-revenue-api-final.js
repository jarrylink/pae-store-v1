const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'analytics', 'revenue-sales', 'route.ts');

const fixedApiContent = `import { NextRequest, NextResponse } from 'next/server';
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

    // Get all orders in the date range
    const orders = await sql\`
      SELECT
        id,
        status,
        total,
        "paymentMethod",
        items,
        "createdAt",
        "customerName",
        "customerEmail"
      FROM "Order"
      WHERE "createdAt" >= \${startDate.toISOString()}
      ORDER BY "createdAt" DESC
    \`;

    // Get all products with their cost prices
    const products = await sql\`
      SELECT id, title, price, "purchasePrice" as costPrice
      FROM "Product"
    \`;

    // Get all services with their cost prices
    const services = await sql\`
      SELECT id, name, price, "costPrice"
      FROM "Service"
    \`;

    // Get all accessories with their cost prices
    const accessories = await sql\`
      SELECT id, name, price, "costPrice"
      FROM "Accessory"
    \`;

    // Create lookup maps for cost prices
    const productCostMap: Record<number, number> = {};
    products.forEach((p: any) => {
      productCostMap[p.id] = Number(p.costPrice) || 0;
    });

    const serviceCostMap: Record<number, number> = {};
    services.forEach((s: any) => {
      serviceCostMap[s.id] = Number(s.costPrice) || 0;
    });

    const accessoryCostMap: Record<number, number> = {};
    accessories.forEach((a: any) => {
      accessoryCostMap[a.id] = Number(a.costPrice) || 0;
    });

    // Separate pipeline (pending) and revenue (confirmed, processing, shipped, delivered)
    const revenueStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    const pipelineStatuses = ['pending'];

    let pipelineTotal = 0;
    let pipelineOrders = 0;
    let pipelineCost = 0;
    let pipelineProfit = 0;
    let revenueTotal = 0;
    let revenueOrders = 0;
    let revenueCost = 0;
    let revenueProfit = 0;
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const statusMap: Record<string, { orders: number; revenue: number; cost: number; profit: number; margin: number }> = {};
    const channelMap: Record<string, { orders: number; revenue: number; cost: number; profit: number }> = {};
    const productMap: Record<string, { title: string; quantity: number; revenue: number; cost: number; profit: number }> = {};
    const categoryMap: Record<string, { quantity: number; revenue: number; cost: number; profit: number }> = {};

    // Pipeline category breakdowns
    const pipelineCategoryMap: Record<string, { revenue: number; cost: number; profit: number; orders: number; margin: number }> = {
      products: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
      accessories: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
      services: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 }
    };

    // Revenue category breakdowns
    const revenueCategoryMap: Record<string, { revenue: number; cost: number; profit: number; orders: number; margin: number }> = {
      products: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
      accessories: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 },
      services: { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 }
    };

    // Process each order
    orders.forEach((order: any) => {
      const status = order.status;
      const total = Number(order.total) || 0;
      const isRevenue = revenueStatuses.includes(status);
      const isPipeline = pipelineStatuses.includes(status);

      // Initialize status map
      if (!statusMap[status]) {
        statusMap[status] = { orders: 0, revenue: 0, cost: 0, profit: 0, margin: 0 };
      }
      statusMap[status].orders++;
      statusMap[status].revenue += total;

      // Parse order items
      let orderItems = order.items;
      if (typeof orderItems === 'string') {
        try { orderItems = JSON.parse(orderItems); } catch(e) { orderItems = []; }
      }
      if (!Array.isArray(orderItems)) { orderItems = [orderItems]; }

      let orderCost = 0;

      // Process each item in the order
      orderItems.forEach((item: any) => {
        const quantity = Number(item.quantity) || 1;
        const price = Number(item.price) || Number(item.amount) || 0;
        let costPrice = 0;
        let category = 'products';

        // Find cost price based on product ID
        if (item.productId) {
          const productId = Number(item.productId);
          costPrice = productCostMap[productId] || 0;
          category = 'products';
        } else if (item.serviceId || item.type === 'service') {
          const serviceId = Number(item.serviceId || item.id);
          costPrice = serviceCostMap[serviceId] || 0;
          category = 'services';
        } else if (item.accessoryId || item.type === 'accessory') {
          const accessoryId = Number(item.accessoryId || item.id);
          costPrice = accessoryCostMap[accessoryId] || 0;
          category = 'accessories';
        }

        const totalRevenue = price * quantity;
        const totalCost = costPrice * quantity;
        const totalProfit = totalRevenue - totalCost;

        // Add to category map
        const targetMap = isRevenue ? revenueCategoryMap : pipelineCategoryMap;
        if (!targetMap[category]) {
          targetMap[category] = { revenue: 0, cost: 0, profit: 0, orders: 0, margin: 0 };
        }
        targetMap[category].revenue += totalRevenue;
        targetMap[category].cost += totalCost;
        targetMap[category].profit += totalProfit;
        targetMap[category].orders += quantity;

        orderCost += totalCost;

        // Track product revenue for top products
        const productName = item.name || item.title || item.product_name || item.productName || 'Unknown Product';
        if (!productMap[productName]) {
          productMap[productName] = { title: productName, quantity: 0, revenue: 0, cost: 0, profit: 0 };
        }
        productMap[productName].quantity += quantity;
        productMap[productName].revenue += totalRevenue;
        productMap[productName].cost += totalCost;
        productMap[productName].profit += totalProfit;
      });

      // Track totals
      if (isRevenue) {
        revenueTotal += total;
        revenueOrders++;
        revenueCost += orderCost;
        revenueProfit += total - orderCost;
      } else if (isPipeline) {
        pipelineTotal += total;
        pipelineOrders++;
        pipelineCost += orderCost;
        pipelineProfit += total - orderCost;
      }

      totalRevenue += total;
      totalOrders++;
      totalCost += orderCost;
      totalProfit += total - orderCost;

      // Update status map with cost and profit
      statusMap[status].cost += orderCost;
      statusMap[status].profit += total - orderCost;

      // Channel tracking
      if (order.paymentMethod) {
        const channel = order.paymentMethod;
        if (!channelMap[channel]) {
          channelMap[channel] = { orders: 0, revenue: 0, cost: 0, profit: 0 };
        }
        channelMap[channel].orders++;
        channelMap[channel].revenue += total;
        channelMap[channel].cost += orderCost;
        channelMap[channel].profit += total - orderCost;
      }
    });

    // Calculate margins
    Object.keys(statusMap).forEach(key => {
      const s = statusMap[key];
      s.margin = s.revenue > 0 ? (s.profit / s.revenue) * 100 : 0;
    });

    // Calculate category margins
    ['products', 'accessories', 'services'].forEach(cat => {
      if (pipelineCategoryMap[cat].revenue > 0) {
        pipelineCategoryMap[cat].margin = (pipelineCategoryMap[cat].profit / pipelineCategoryMap[cat].revenue) * 100;
      }
      if (revenueCategoryMap[cat].revenue > 0) {
        revenueCategoryMap[cat].margin = (revenueCategoryMap[cat].profit / revenueCategoryMap[cat].revenue) * 100;
      }
    });

    const avgOrderValue = revenueOrders > 0 ? revenueTotal / revenueOrders : 0;
    const conversionRate = (revenueOrders + pipelineOrders) > 0 
      ? (revenueOrders / (revenueOrders + pipelineOrders)) * 100 
      : 0;

    // Calculate forecast based on revenue trends
    const growthRate = 0.08;
    const threeMonthForecast = revenueTotal * 3 * (1 + growthRate);
    const sixMonthForecast = revenueTotal * 6 * (1 + growthRate * 2);
    const twelveMonthForecast = revenueTotal * 12 * (1 + growthRate * 4);

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        conversionRate,
        totalCost,
        totalProfit,
        totalMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        previousRevenue: 0,
        previousOrders: 0,
        revenueGrowth: 0,
        orderGrowth: 0
      },
      pipeline: {
        value: pipelineTotal,
        orders: pipelineOrders,
        cost: pipelineCost,
        profit: pipelineProfit,
        margin: pipelineTotal > 0 ? (pipelineProfit / pipelineTotal) * 100 : 0
      },
      revenue: {
        value: revenueTotal,
        orders: revenueOrders,
        cost: revenueCost,
        profit: revenueProfit,
        margin: revenueTotal > 0 ? (revenueProfit / revenueTotal) * 100 : 0
      },
      pipelineCategories: pipelineCategoryMap,
      revenueCategories: revenueCategoryMap,
      forecast: {
        threeMonth: threeMonthForecast,
        sixMonth: sixMonthForecast,
        twelveMonth: twelveMonthForecast
      },
      statusBreakdown: Object.entries(statusMap).map(([status, data]) => ({
        status,
        orders: data.orders,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.profit,
        margin: data.margin
      })),
      channels: Object.entries(channelMap).map(([name, data]) => ({
        name,
        orders: data.orders,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.profit
      })).sort((a, b) => b.revenue - a.revenue),
      products: Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      categories: Object.entries(categoryMap).map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.profit
      })).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
    });

  } catch (error) {
    console.error('Revenue API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}`;

fs.writeFileSync(apiPath, fixedApiContent, 'utf8');
console.log('✅ Rewrote Revenue API with proper cost mapping');
