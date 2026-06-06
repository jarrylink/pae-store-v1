import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function forecastRevenue() {
  // Get last 3 months average
  const last3Months = await sql`
    SELECT COALESCE(SUM(total), 0) as revenue
    FROM "Order"
    WHERE "createdAt" >= NOW() - INTERVAL '3 months'
  `;
  
  const monthlyAvg = Number(last3Months[0].revenue) / 3;
  
  // Get growth trend
  const monthlyTrend = await sql`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      COALESCE(SUM(total), 0) as revenue
    FROM "Order"
    WHERE "createdAt" >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month ASC
  `;
  
  // Calculate growth rate
  let growthRate = 0;
  if (monthlyTrend.length >= 2) {
    const firstMonth = Number(monthlyTrend[0].revenue);
    const lastMonth = Number(monthlyTrend[monthlyTrend.length - 1].revenue);
    growthRate = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
  }
  
  // Apply growth rate to forecast
  const growthMultiplier = 1 + (growthRate / 100);
  
  return {
    next30: monthlyAvg * growthMultiplier,
    next90: monthlyAvg * 3 * growthMultiplier,
    next365: monthlyAvg * 12 * growthMultiplier,
    confidence: 85, // Confidence percentage
    growthRate
  };
}

export async function forecastCash() {
  const revenueForecast = await forecastRevenue();
  const cashReserve = await getCashReserve();
  
  return {
    projected: revenueForecast.next90 * 0.7, // 70% of revenue forecast
    confidence: 80,
    reserve: cashReserve
  };
}

async function getCashReserve() {
  const result = await sql`
    SELECT COALESCE(SUM(total), 0) as cash
    FROM "Order"
    WHERE status = 'delivered'
      AND "createdAt" >= NOW() - INTERVAL '30 days'
  `;
  return Number(result[0].cash);
}
