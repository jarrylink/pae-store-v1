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

    // Get all orders
    const orders = await sql\`
      SELECT id, status, total, items, "paymentMethod", "createdAt"
      FROM "Order"
      WHERE "createdAt" >= \${startDate.toISOString()}
      ORDER BY "createdAt" DESC
    \`;

    // Get all products with their cost prices
    const products = await sql\`
      SELECT id, title, price, "purchasePrice" as costPrice
      FROM "Product"
      WHERE "purchasePrice" IS NOT NULL AND "purchasePrice" > 0
    \`;

    // Get all services with their cost prices
    const services = await sql\`
      SELECT id, name, price, "costPrice"
      FROM "Service"
      WHERE "costPrice" IS NOT NULL AND "costPrice" > 0
    \`;

    // Get all accessories with their cost prices
    const accessories = await sql\`
      SELECT id, name, price, "costPrice"
      FROM "Accessory"
      WHERE "costPrice" IS NOT NULL AND "costPrice" > 0
    \`;

    // Create maps
    const costMap: Record<number, number> = {};
    products.forEach(p => { costMap[p.id] = Number(p.costPrice) || 0; });
    services.forEach(s => { costMap[s.id] = Number(s.costPrice) || 0; });
    accessories.forEach(a => { costMap[a.id] = Number(a.costPrice) || 0; });

    let pipelineRevenue = 0;
    let pipelineOrders = 0;
    let pipelineCost = 0;
    let revenueRevenue = 0;
    let revenueOrders = 0;
    let revenueCost = 0;
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalCost = 0;

    const revenueStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    const pipelineStatuses = ['pending'];

    orders.forEach((order: any) => {
      const status = order.status;
      const total = Number(order.total) || 0;
      const isRevenue = revenueStatuses.includes(status);
      const isPipeline = pipelineStatuses.includes(status);

      let items = order.items;
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch(e) { items = []; }
      }
      if (!Array.isArray(items)) { items = [items]; }

      let orderCost = 0;

      items.forEach((item: any) => {
        const quantity = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        let costPrice = 0;

        // Try to find cost by productId
        if (item.productId) {
          costPrice = costMap[Number(item.productId)] || 0;
        } else if (item.id && costMap[Number(item.id)]) {
          costPrice = costMap[Number(item.id)] || 0;
        }

        orderCost += costPrice * quantity;
      });

      if (isRevenue) {
        revenueRevenue += total;
        revenueOrders++;
        revenueCost += orderCost;
      } else if (isPipeline) {
        pipelineRevenue += total;
        pipelineOrders++;
        pipelineCost += orderCost;
      }

      totalRevenue += total;
      totalOrders++;
      totalCost += orderCost;
    });

    const totalProfit = totalRevenue - totalCost;
    const revenueProfit = revenueRevenue - revenueCost;
    const pipelineProfit = pipelineRevenue - pipelineCost;

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
      }
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
console.log('✅ Rewrote Revenue API with direct cost mapping');
