import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function GET(request: NextRequest) {
  try {
    // Get real-time data for alerts
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Check low stock products
    const lowStockProducts = await sql`
      SELECT id, title, inventory, price
      FROM "Product"
      WHERE inventory < 10 AND inventory > 0
      ORDER BY inventory ASC
    `;

    // Check out of stock products
    const outOfStockProducts = await sql`
      SELECT id, title, inventory, price
      FROM "Product"
      WHERE inventory = 0
      ORDER BY id
    `;

    // Check pending orders (payment not captured)
    const pendingOrders = await sql`
      SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as value
      FROM "Order"
      WHERE status = 'pending'
        AND "createdAt" >= ${thirtyDaysAgo.toISOString()}
    `;

    // Check high value pending orders
    const highValuePending = await sql`
      SELECT id, "orderNumber", total
      FROM "Order"
      WHERE status = 'pending'
        AND total > 500000
      ORDER BY total DESC
      LIMIT 5
    `;

    // Check delayed orders (processing/shipped for more than 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const delayedOrders = await sql`
      SELECT id, "orderNumber", status, total, "createdAt"
      FROM "Order"
      WHERE status IN ('processing', 'shipped')
        AND "createdAt" <= ${sevenDaysAgo.toISOString()}
      ORDER BY "createdAt" ASC
    `;

    // Check customer churn risk (no purchase in 60+ days)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const inactiveCustomers = await sql`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Order"
      WHERE "userId" IS NOT NULL
        AND "userId" != ''
      GROUP BY "userId"
      HAVING MAX("createdAt") <= ${sixtyDaysAgo.toISOString()}
    `;

    // Check revenue anomaly (unusually low revenue day)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayRevenue = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND "createdAt" >= ${todayStart.toISOString()}
    `;
    
    const avgDailyRevenue = await sql`
      SELECT COALESCE(AVG(daily_revenue), 0) as avg
      FROM (
        SELECT DATE("createdAt") as date, SUM(total) as daily_revenue
        FROM "Order"
        WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
          AND "createdAt" >= ${thirtyDaysAgo.toISOString()}
        GROUP BY DATE("createdAt")
      ) as daily
    `;

    const isRevenueLow = todayRevenue[0].revenue < avgDailyRevenue[0].avg * 0.5;

    // Build alerts array
    const alerts = [];

    // Inventory alerts
    if (outOfStockProducts.length > 0) {
      alerts.push({
        id: 'inv-001',
        type: 'critical',
        category: 'inventory',
        title: 'Out of Stock Products',
        message: `${outOfStockProducts.length} products are out of stock.`,
        details: outOfStockProducts.slice(0, 5).map(p => p.title).join(', '),
        timestamp: now.toISOString(),
        action: 'Review inventory and reorder immediately'
      });
    }

    if (lowStockProducts.length > 0) {
      alerts.push({
        id: 'inv-002',
        type: 'warning',
        category: 'inventory',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} products are running low (stock < 10).`,
        details: lowStockProducts.slice(0, 5).map(p => `${p.title} (${p.inventory} left)`).join(', '),
        timestamp: now.toISOString(),
        action: 'Review and reorder soon'
      });
    }

    // Order alerts
    if (pendingOrders[0].value > 1000000) {
      alerts.push({
        id: 'ord-001',
        type: 'warning',
        category: 'orders',
        title: 'High Pending Payment Value',
        message: `₦${Number(pendingOrders[0].value).toLocaleString()} in pending payments (${pendingOrders[0].count} orders).`,
        details: highValuePending.map(o => `Order ${o.orderNumber}: ₦${Number(o.total).toLocaleString()}`).join(', '),
        timestamp: now.toISOString(),
        action: 'Follow up on pending payments'
      });
    }

    if (delayedOrders.length > 0) {
      alerts.push({
        id: 'ord-002',
        type: 'warning',
        category: 'orders',
        title: 'Delayed Orders',
        message: `${delayedOrders.length} orders have been processing/shipped for over 7 days.`,
        details: delayedOrders.slice(0, 5).map(o => `Order ${o.orderNumber} (${o.status})`).join(', '),
        timestamp: now.toISOString(),
        action: 'Check delivery status and update tracking'
      });
    }

    // Customer alerts
    if (inactiveCustomers.length > 0) {
      alerts.push({
        id: 'cst-001',
        type: 'info',
        category: 'customers',
        title: 'Customer Churn Risk',
        message: `${inactiveCustomers.length} customers haven't purchased in 60+ days.`,
        timestamp: now.toISOString(),
        action: 'Launch retention campaign'
      });
    }

    // Revenue alert
    if (isRevenueLow) {
      alerts.push({
        id: 'rev-001',
        type: 'warning',
        category: 'revenue',
        title: 'Unusual Low Revenue Day',
        message: `Today's revenue (₦${Number(todayRevenue[0].revenue).toLocaleString()}) is 50% below average (₦${Number(avgDailyRevenue[0].avg).toLocaleString()}).`,
        timestamp: now.toISOString(),
        action: 'Investigate sales performance'
      });
    }

    return NextResponse.json({
      success: true,
      alerts,
      summary: {
        critical: alerts.filter(a => a.type === 'critical').length,
        warning: alerts.filter(a => a.type === 'warning').length,
        info: alerts.filter(a => a.type === 'info').length,
        total: alerts.length
      },
      metrics: {
        outOfStock: outOfStockProducts.length,
        lowStock: lowStockProducts.length,
        pendingOrders: pendingOrders[0].count,
        pendingValue: Number(pendingOrders[0].value),
        delayedOrders: delayedOrders.length
      }
    });

  } catch (error) {
    console.error('Alerts API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}

