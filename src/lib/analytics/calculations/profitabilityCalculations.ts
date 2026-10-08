import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function calculateGrossProfit() {
  // Calculate revenue from delivered/confirmed orders
  const revenue = await sql`
    SELECT COALESCE(SUM(total), 0) as revenue
    FROM "Order"
    WHERE status IN ('confirmed', 'delivered')
  `;
  
  // Calculate cost of goods sold (if purchasePrice exists)
  const cogs = await sql`
    SELECT COALESCE(SUM(p."purchasePrice" * oi.quantity), 0) as cogs
    FROM "Order" o
    LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
    LEFT JOIN "Product" p ON oi."productId" = p.id
    WHERE o.status IN ('confirmed', 'delivered')
  `;
  
  const totalRevenue = Number(revenue[0].revenue);
  const totalCogs = Number(cogs[0].cogs);
  const grossProfit = totalRevenue - totalCogs;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  
  return {
    revenue: totalRevenue,
    cogs: totalCogs,
    grossProfit,
    grossMargin
  };
}

export async function calculateNetProfit() {
  // Simplified net profit calculation
  // For full implementation, need expense tracking
  const gross = await calculateGrossProfit();
  
  // Estimate operating expenses (10% of revenue as placeholder)
  const operatingExpenses = gross.revenue * 0.1;
  const netProfit = gross.grossProfit - operatingExpenses;
  const netMargin = gross.revenue > 0 ? (netProfit / gross.revenue) * 100 : 0;
  
  return {
    netProfit,
    netMargin,
    operatingExpenses
  };
}
