import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'));

export interface ExecutiveMetrics {
  // Revenue Metrics
  totalRevenue: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  
  // Order Metrics
  totalOrders: number;
  dailyOrders: number;
  weeklyOrders: number;
  monthlyOrders: number;
  ordersGrowth: number;
  
  // Customer Metrics
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  averageOrderValue: number;
  
  // Profitability
  grossProfit: number;
  grossMargin: number;
  
  // Forecast
  revenueForecast: number;
  nextMonthForecast: number;
}

export class AnalyticsService {
  
  async getExecutiveMetrics(timeRange: string = '30days'): Promise<ExecutiveMetrics> {
    try {
      // Get current period metrics
      const currentPeriod = await sql`
        SELECT 
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as orders,
          COUNT(DISTINCT "userId") as unique_customers,
          COALESCE(AVG(total), 0) as avg_order_value
        FROM "Order"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      `;
      
      // Get previous period for comparison
      const previousPeriod = await sql`
        SELECT 
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as orders,
          COUNT(DISTINCT "userId") as unique_customers
        FROM "Order"
        WHERE "createdAt" >= NOW() - INTERVAL '60 days'
          AND "createdAt" < NOW() - INTERVAL '30 days'
      `;
      
      // Get today's metrics
      const today = await sql`
        SELECT 
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as orders
        FROM "Order"
        WHERE DATE("createdAt") = CURRENT_DATE
      `;
      
      // Get this week's metrics
      const thisWeek = await sql`
        SELECT 
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as orders
        FROM "Order"
        WHERE "createdAt" >= DATE_TRUNC('week', CURRENT_DATE)
      `;
      
      // Get this month's metrics
      const thisMonth = await sql`
        SELECT 
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as orders
        FROM "Order"
        WHERE "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)
      `;
      
      // Get total customers
      const totalCustomers = await sql`
        SELECT COUNT(*) as count FROM "User" WHERE role = 'customer'
      `;
      
      // Get new customers (last 30 days)
      const newCustomers = await sql`
        SELECT COUNT(*) as count FROM "User" 
        WHERE role = 'customer' 
          AND "createdAt" >= NOW() - INTERVAL '30 days'
      `;
      
      // Get returning customers
      const returningCustomers = await sql`
        SELECT COUNT(DISTINCT "userId") as count
        FROM "Order"
        WHERE "userId" IN (
          SELECT "userId" FROM "Order" 
          GROUP BY "userId" 
          HAVING COUNT(*) > 1
        )
      `;
      
      // Calculate growth percentages
      const revenueGrowth = previousPeriod[0].revenue > 0 
        ? ((currentPeriod[0].revenue - previousPeriod[0].revenue) / previousPeriod[0].revenue) * 100 
        : 0;
      
      const ordersGrowth = previousPeriod[0].orders > 0 
        ? ((currentPeriod[0].orders - previousPeriod[0].orders) / previousPeriod[0].orders) * 100 
        : 0;
      
      // Calculate retention rate
      const totalCustomerCount = Number(totalCustomers[0].count);
      const newCustomerCount = Number(newCustomers[0].count);
      const retentionRate = totalCustomerCount > 0 
        ? ((totalCustomerCount - newCustomerCount) / totalCustomerCount) * 100 
        : 0;
      
      // Simple revenue forecast (based on last 30 days trend)
      const dailyAverage = currentPeriod[0].revenue / 30;
      const revenueForecast = dailyAverage * 90; // Next 90 days
      const nextMonthForecast = dailyAverage * 30;
      
      // Gross profit calculation (using product purchase prices if available)
      const grossProfitResult = await sql`
        SELECT 
          COALESCE(SUM(o.total - COALESCE(p."purchasePrice", 0) * oi.quantity), 0) as gross_profit
        FROM "Order" o
        LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
        LEFT JOIN "Product" p ON oi."productId" = p.id
        WHERE o.status IN ('confirmed', 'delivered')
      `;
      
      const grossMargin = currentPeriod[0].revenue > 0 
        ? (grossProfitResult[0].gross_profit / currentPeriod[0].revenue) * 100 
        : 0;
      
      return {
        totalRevenue: Number(currentPeriod[0].revenue),
        dailyRevenue: Number(today[0].revenue),
        weeklyRevenue: Number(thisWeek[0].revenue),
        monthlyRevenue: Number(thisMonth[0].revenue),
        revenueGrowth,
        
        totalOrders: Number(currentPeriod[0].orders),
        dailyOrders: Number(today[0].orders),
        weeklyOrders: Number(thisWeek[0].orders),
        monthlyOrders: Number(thisMonth[0].orders),
        ordersGrowth,
        
        totalCustomers: Number(totalCustomers[0].count),
        newCustomers: Number(newCustomers[0].count),
        returningCustomers: Number(returningCustomers[0].count),
        customerRetentionRate: retentionRate,
        averageOrderValue: Number(currentPeriod[0].avg_order_value),
        
        grossProfit: Number(grossProfitResult[0].gross_profit),
        grossMargin,
        
        revenueForecast,
        nextMonthForecast
      };
      
    } catch (error) {
      console.error('Analytics Service Error:', error);
      throw error;
    }
  }
  
  async getRevenueTrend(days: number = 30) {
    return await sql`
      SELECT 
        DATE("createdAt") as date,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;
  }
  
  async getTopProducts(limit: number = 10) {
    return await sql`
      SELECT 
        p.id,
        p.title,
        p.category,
        p.price,
        COUNT(oi.id) as times_ordered,
        COALESCE(SUM(oi.quantity), 0) as total_quantity,
        COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
      GROUP BY p.id, p.title, p.category, p.price
      ORDER BY total_revenue DESC
      LIMIT ${limit}
    `;
  }
  
  async getCategoryPerformance() {
    return await sql`
      SELECT 
        p.category,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(oi.quantity), 0) as units_sold,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
      LEFT JOIN "Order" o ON oi."orderId" = o.id
      WHERE o.status IN ('confirmed', 'delivered')
      GROUP BY p.category
      ORDER BY revenue DESC
    `;
  }
}

export const analyticsService = new AnalyticsService();
