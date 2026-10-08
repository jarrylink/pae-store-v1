import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export const revenueQueries = {
  // Get daily revenue
  getDailyRevenue: async () => {
    const result = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '1 day'
    `;
    return Number(result[0].revenue);
  },
  
  // Get weekly revenue
  getWeeklyRevenue: async () => {
    const result = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
    `;
    return Number(result[0].revenue);
  },
  
  // Get monthly revenue
  getMonthlyRevenue: async () => {
    const result = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    `;
    return Number(result[0].revenue);
  },
  
  // Get yearly revenue
  getYearlyRevenue: async () => {
    const result = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '365 days'
    `;
    return Number(result[0].revenue);
  },
  
  // Get revenue growth (compare with previous period)
  getRevenueGrowth: async (days: number = 30) => {
    const current = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
    `;
    
    const previous = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '${days * 2} days'
        AND "createdAt" < NOW() - INTERVAL '${days} days'
    `;
    
    const currentRevenue = Number(current[0].revenue);
    const previousRevenue = Number(previous[0].revenue);
    
    return previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
  },
  
  // Get revenue trend (last 6 months)
  getRevenueTrend: async () => {
    const result = await sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `;
    return result.map(r => ({
      month: r.month,
      revenue: Number(r.revenue),
      orders: Number(r.orders)
    }));
  }
};
