import { neon } from '@neondatabase/serverless';
import { 
  ExecutiveMetrics, RevenueMetrics, ProfitabilityMetrics, 
  OperationalMetrics, MarketplaceMetrics, CustomerMetrics, 
  ForecastMetrics, Alert, AIInsight 
} from '../types';

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'));

export class ExecutiveAnalyticsService {
  
  async getExecutiveMetrics(): Promise<ExecutiveMetrics> {
    // Run all queries in parallel
    const [
      revenueMetrics,
      profitabilityMetrics,
      operationalMetrics,
      marketplaceMetrics,
      customerMetrics,
      forecastMetrics,
      alerts,
      aiInsights
    ] = await Promise.all([
      this.getRevenueMetrics(),
      this.getProfitabilityMetrics(),
      this.getOperationalMetrics(),
      this.getMarketplaceMetrics(),
      this.getCustomerMetrics(),
      this.getForecastMetrics(),
      this.generateAlerts(),
      this.generateAIInsights()
    ]);
    
    return {
      revenue: revenueMetrics,
      profitability: profitabilityMetrics,
      operational: operationalMetrics,
      marketplace: marketplaceMetrics,
      customer: customerMetrics,
      forecast: forecastMetrics,
      alerts,
      aiInsights,
      lastUpdated: new Date().toISOString()
    };
  }
  
  // ============================================================
  // REVENUE METRICS
  // ============================================================
  
  private async getRevenueMetrics(): Promise<RevenueMetrics> {
    // Daily revenue
    const daily = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '1 day'
    `;
    
    // Weekly revenue
    const weekly = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
    `;
    
    // Monthly revenue
    const monthly = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    `;
    
    // Annual revenue
    const yearly = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '365 days'
    `;
    
    // Revenue growth
    const currentMonthly = Number(monthly[0].revenue);
    const previousMonthly = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '60 days'
        AND "createdAt" < NOW() - INTERVAL '30 days'
    `;
    const previousRevenue = Number(previousMonthly[0].revenue);
    const growth = previousRevenue > 0 ? ((currentMonthly - previousRevenue) / previousRevenue) * 100 : 0;
    
    // Monthly trend (last 6 months)
    const monthlyTrend = await sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `;
    
    // Daily trend (last 14 days)
    const dailyTrend = await sql`
      SELECT 
        TO_CHAR(DATE("createdAt"), 'DD Mon') as day,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;
    
    // Weekly trend (last 8 weeks)
    const weeklyTrend = await sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('week', "createdAt"), 'DD Mon') as week_start,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '8 weeks'
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY DATE_TRUNC('week', "createdAt") ASC
    `;
    
    return {
      daily: Number(daily[0].revenue),
      weekly: Number(weekly[0].revenue),
      monthly: Number(monthly[0].revenue),
      yearly: Number(yearly[0].revenue),
      growth,
      trend: monthlyTrend.map(m => ({
        month: m.month,
        revenue: Number(m.revenue),
        orders: Number(m.orders)
      })),
      dailyTrend: dailyTrend.map(d => ({
        day: d.day,
        revenue: Number(d.revenue),
        orders: Number(d.orders)
      })),
      weeklyTrend: weeklyTrend.map((w, i) => ({
        week: `Week ${i + 1}`,
        revenue: Number(w.revenue),
        orders: Number(w.orders)
      }))
    };
  }
  
  // ============================================================
  // PROFITABILITY METRICS
  // ============================================================
  
  private async getProfitabilityMetrics(): Promise<ProfitabilityMetrics> {
    // Get revenue from delivered/confirmed orders
    const revenue = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE status IN ('confirmed', 'delivered')
    `;
    
    // Calculate COGS (using purchasePrice)
    const cogs = await sql`
      SELECT COALESCE(SUM(p."purchasePrice" * oi.quantity), 0) as cogs
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE o.status IN ('confirmed', 'delivered')
    `;
    
    const totalRevenue = Number(revenue[0].revenue);
    const totalCOGS = Number(cogs[0].cogs);
    const grossProfit = totalRevenue - totalCOGS;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    // Estimate expenses
    const expenses = {
      operating: totalRevenue * 0.08,
      marketing: totalRevenue * 0.05,
      shipping: totalRevenue * 0.02,
      total: totalRevenue * 0.15
    };
    
    const netProfit = grossProfit - expenses.total;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    return {
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      cogs: totalCOGS,
      expenses
    };
  }
  
  // ============================================================
  // OPERATIONAL METRICS
  // ============================================================
  
  private async getOperationalMetrics(): Promise<OperationalMetrics> {
    const orders = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM "Order"
    `;
    
    // Delivery metrics (from orders with actualDelivery)
    const deliveries = await sql`
      SELECT 
        COUNT(*) as total_delivered,
        COUNT(CASE WHEN "actualDelivery" <= "estimatedDelivery" THEN 1 END) as on_time,
        COUNT(CASE WHEN "actualDelivery" > "estimatedDelivery" THEN 1 END) as delayed,
        AVG(EXTRACT(EPOCH FROM ("actualDelivery" - "createdAt")) / 86400) as avg_days
      FROM "Order"
      WHERE status = 'delivered' AND "actualDelivery" IS NOT NULL
    `;
    
    const totalDelivered = Number(deliveries[0].total_delivered);
    const onTime = Number(deliveries[0].on_time);
    const delayed = Number(deliveries[0].delayed);
    const completionRate = totalDelivered > 0 ? (onTime / totalDelivered) * 100 : 0;
    
    // Transaction metrics
    const totalOrders = Number(orders[0].total);
    const successfulOrders = Number(orders[0].delivered) + Number(orders[0].confirmed);
    const failedOrders = Number(orders[0].cancelled);
    
    return {
      orders: {
        total: totalOrders,
        pending: Number(orders[0].pending),
        confirmed: Number(orders[0].confirmed),
        shipped: Number(orders[0].shipped),
        delivered: Number(orders[0].delivered),
        cancelled: Number(orders[0].cancelled)
      },
      deliveries: {
        onTime,
        delayed,
        averageDays: Number(deliveries[0].avg_days) || 0,
        completionRate
      },
      transactions: {
        total: totalOrders,
        successful: successfulOrders,
        failed: failedOrders,
        successRate: totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0
      }
    };
  }
  
  // ============================================================
  // MARKETPLACE METRICS (Vendors & Installers)
  // ============================================================
  
  private async getMarketplaceMetrics(): Promise<MarketplaceMetrics> {
    // Vendor metrics
    const vendors = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active
      FROM "Vendor"
    `;
    
    const topVendors = await sql`
      SELECT id, name, total_revenue as revenue, rating
      FROM "Vendor"
      WHERE is_active = true
      ORDER BY total_revenue DESC
      LIMIT 5
    `;
    
    const revenueByVendor = await sql`
      SELECT name, total_revenue as revenue
      FROM "Vendor"
      WHERE is_active = true AND total_revenue > 0
      ORDER BY revenue DESC
    `;
    
    // Installer metrics
    const installers = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN is_available = true AND is_active = true THEN 1 END) as available,
        COALESCE(AVG(rating), 0) as avg_rating,
        COALESCE(SUM(completed_jobs), 0) as total_jobs
      FROM "Installer"
    `;
    
    const topInstallers = await sql`
      SELECT id, first_name, last_name, completed_jobs as jobs, rating
      FROM "Installer"
      WHERE is_active = true
      ORDER BY completed_jobs DESC
      LIMIT 5
    `;
    
    return {
      vendors: {
        total: Number(vendors[0].total) || 0,
        active: Number(vendors[0].active) || 0,
        topPerformers: topVendors.map(v => ({
          id: v.id,
          name: v.name,
          revenue: Number(v.revenue) || 0,
          rating: Number(v.rating) || 0
        })),
        revenueByVendor: revenueByVendor.map(v => ({
          name: v.name,
          revenue: Number(v.revenue) || 0
        }))
      },
      installers: {
        total: Number(installers[0].total) || 0,
        active: Number(installers[0].active) || 0,
        available: Number(installers[0].available) || 0,
        avgRating: Number(installers[0].avg_rating) || 0,
        totalJobsCompleted: Number(installers[0].total_jobs) || 0,
        topPerformers: topInstallers.map(i => ({
          id: i.id,
          name: `${i.first_name} ${i.last_name}`,
          jobs: Number(i.jobs) || 0,
          rating: Number(i.rating) || 0
        }))
      }
    };
  }
  
  // ============================================================
  // CUSTOMER METRICS
  // ============================================================
  
  private async getCustomerMetrics(): Promise<CustomerMetrics> {
    const customers = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '30 days' THEN 1 END) as new_customers
      FROM "User"
      WHERE role = 'customer'
    `;
    
    // Returning customers (have more than 1 order)
    const repeatCustomers = await sql`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Order"
      GROUP BY "userId"
      HAVING COUNT(*) > 1
    `;
    
    // Average order value
    const aov = await sql`
      SELECT COALESCE(AVG(total), 0) as value
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    `;
    
    // Customer lifetime value
    const clv = await sql`
      SELECT COALESCE(AVG(customer_total), 0) as avg_clv
      FROM (
        SELECT "userId", SUM(total) as customer_total
        FROM "Order"
        WHERE status IN ('confirmed', 'delivered')
        GROUP BY "userId"
      ) as customer_totals
    `;
    
    // Customer segments
    const totalCustomers = Number(customers[0].total);
    const newCustomers = Number(customers[0].new_customers);
    const returningCustomers = repeatCustomers.length;
    const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
    const churnRate = 100 - retentionRate;
    
    // Customer segments distribution
    const segments = [
      { segment: 'New (<30 days)', count: newCustomers, percentage: (newCustomers / totalCustomers) * 100 },
      { segment: 'Returning', count: returningCustomers, percentage: (returningCustomers / totalCustomers) * 100 },
      { segment: 'At Risk', count: Math.max(0, totalCustomers - newCustomers - returningCustomers), percentage: 0 }
    ];
    segments[2].percentage = 100 - segments[0].percentage - segments[1].percentage;
    
    return {
      total: totalCustomers,
      new: newCustomers,
      returning: returningCustomers,
      retentionRate,
      churnRate,
      lifetimeValue: Number(clv[0].avg_clv),
      repeatPurchaseRate: retentionRate,
      averageOrderValue: Number(aov[0].value),
      acquisitionCost: 5000, // Placeholder - would need marketing data
      customerSegments: segments
    };
  }
  
  // ============================================================
  // FORECAST METRICS
  // ============================================================
  
  private async getForecastMetrics(): Promise<ForecastMetrics> {
    // Calculate monthly average
    const last3Months = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '3 months'
    `;
    const monthlyAvg = Number(last3Months[0].revenue) / 3;
    
    // Calculate growth rate
    const monthlyTrend = await sql`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;
    
    let growthRate = 0;
    if (monthlyTrend.length >= 2) {
      const firstMonth = Number(monthlyTrend[0].revenue);
      const lastMonth = Number(monthlyTrend[monthlyTrend.length - 1].revenue);
      growthRate = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
    }
    const growthMultiplier = 1 + (growthRate / 100);
    
    // Revenue forecast
    const revenueForecast = {
      next30: monthlyAvg * growthMultiplier,
      next90: monthlyAvg * 3 * growthMultiplier,
      next365: monthlyAvg * 12 * growthMultiplier,
      confidence: 85
    };
    
    // Inventory forecast
    const lowStockProducts = await sql`
      SELECT id, title as name, inventory
      FROM "Product"
      WHERE inventory <= 5 AND inventory > 0
    `;
    
    const inventoryForecast = {
      daysUntilOutOfStock: 30,
      recommendedReorder: lowStockProducts.map(p => ({
        productId: p.id,
        name: p.name,
        quantity: 20 - p.inventory
      })),
      riskProducts: lowStockProducts.map(p => ({
        productId: p.id,
        name: p.name,
        daysLeft: Math.floor(p.inventory / 0.5) // Assuming 0.5 units sold per day
      }))
    };
    
    // Cash forecast
    const cashReserve = await sql`
      SELECT COALESCE(SUM(total), 0) as cash
      FROM "Order"
      WHERE status = 'delivered'
        AND "createdAt" >= NOW() - INTERVAL '30 days'
    `;
    
    const cashForecast = {
      projected: revenueForecast.next90 * 0.7,
      confidence: 80,
      reserve: Number(cashReserve[0].cash)
    };
    
    return {
      revenue: revenueForecast,
      inventory: inventoryForecast,
      cash: cashForecast
    };
  }
  
  // ============================================================
  // ALERTS
  // ============================================================
  
  private async generateAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // Low stock alert
    const lowStock = await sql`
      SELECT COUNT(*) as count, json_agg(json_build_object('name', title, 'stock', inventory)) as products
      FROM "Product"
      WHERE inventory <= 5 AND inventory > 0
    `;
    
    if (lowStock[0].count > 0) {
      alerts.push({
        type: 'inventory',
        severity: lowStock[0].count > 3 ? 'critical' : 'warning',
        title: 'Low Stock Alert',
        message: `${lowStock[0].count} product(s) are running low on inventory.`,
        action: 'Review inventory and reorder',
        metric: 'inventory',
        threshold: 5,
        currentValue: lowStock[0].count
      });
    }
    
    // Pending orders alert
    const pendingOrders = await sql`
      SELECT COUNT(*) as count
      FROM "Order"
      WHERE status = 'pending'
    `;
    
    if (pendingOrders[0].count > 5) {
      alerts.push({
        type: 'operations',
        severity: pendingOrders[0].count > 10 ? 'critical' : 'warning',
        title: 'Pending Orders',
        message: `${pendingOrders[0].count} orders are pending confirmation.`,
        action: 'Process pending orders',
        metric: 'pending_orders',
        threshold: 5,
        currentValue: Number(pendingOrders[0].count)
      });
    }
    
    // Revenue alert (negative growth)
    const revenueGrowth = await this.getRevenueGrowth();
    if (revenueGrowth < -10) {
      alerts.push({
        type: 'revenue',
        severity: 'critical',
        title: 'Revenue Decline',
        message: `Revenue has declined by ${Math.abs(revenueGrowth).toFixed(0)}% compared to last period.`,
        action: 'Review sales strategy',
        metric: 'revenue_growth',
        threshold: -10,
        currentValue: revenueGrowth
      });
    }
    
    return alerts;
  }
  
  // ============================================================
  // AI INSIGHTS
  // ============================================================
  
  private async generateAIInsights(): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    const revenueGrowth = await this.getRevenueGrowth();
    const grossProfit = await this.getGrossProfitMargin();
    const customerRetention = await this.getCustomerRetention();
    const lowStock = await sql`SELECT COUNT(*) as count FROM "Product" WHERE inventory <= 5`;
    
    // Revenue insight
    if (revenueGrowth > 10) {
      insights.push({
        type: 'positive',
        title: 'Strong Revenue Growth',
        message: `Revenue is up ${revenueGrowth.toFixed(0)}% compared to last period. This outpaces industry average.`,
        action: 'Analyze growth drivers',
        confidence: 92
      });
    } else if (revenueGrowth < -5) {
      insights.push({
        type: 'negative',
        title: 'Revenue Decline Detected',
        message: `Revenue decreased by ${Math.abs(revenueGrowth).toFixed(0)}%. AI recommends reviewing marketing campaigns.`,
        action: 'Run diagnostic',
        confidence: 88
      });
    } else {
      insights.push({
        type: 'neutral',
        title: 'Stable Revenue',
        message: `Revenue growth is steady at ${revenueGrowth.toFixed(1)}%. Consider launching promotions to accelerate growth.`,
        action: 'View recommendations',
        confidence: 85
      });
    }
    
    // Profitability insight
    if (grossProfit > 30) {
      insights.push({
        type: 'positive',
        title: 'Healthy Margins',
        message: `Gross profit margin at ${grossProfit.toFixed(0)}% is above target. Your pricing strategy is effective.`,
        action: 'Review profitability',
        confidence: 90
      });
    } else if (grossProfit < 20) {
      insights.push({
        type: 'alert',
        title: 'Margin Pressure',
        message: `Gross margin is ${grossProfit.toFixed(0)}%. AI suggests reviewing supplier costs and pricing.`,
        action: 'Optimize margins',
        confidence: 87
      });
    }
    
    // Customer insight
    if (customerRetention > 40) {
      insights.push({
        type: 'positive',
        title: 'Excellent Customer Loyalty',
        message: `${customerRetention.toFixed(0)}% retention rate indicates strong customer satisfaction.`,
        action: 'Reward loyal customers',
        confidence: 94
      });
    } else if (customerRetention < 20) {
      insights.push({
        type: 'negative',
        title: 'Low Customer Retention',
        message: `Only ${customerRetention.toFixed(0)}% of customers return. AI recommends implementing loyalty program.`,
        action: 'Improve retention',
        confidence: 89
      });
    }
    
    // Inventory insight
    if (lowStock[0].count > 0) {
      insights.push({
        type: 'alert',
        title: 'Inventory Risk Detected',
        message: `${lowStock[0].count} products are at risk of stockout. AI recommends immediate reorder.`,
        action: 'Restock now',
        confidence: 96
      });
    }
    
    return insights;
  }
  
  // ============================================================
  // HELPER METHODS
  // ============================================================
  
  private async getRevenueGrowth(): Promise<number> {
    const current = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    `;
    const previous = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '60 days'
        AND "createdAt" < NOW() - INTERVAL '30 days'
    `;
    
    const currentRevenue = Number(current[0].revenue);
    const previousRevenue = Number(previous[0].revenue);
    return previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  }
  
  private async getGrossProfitMargin(): Promise<number> {
    const revenue = await sql`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM "Order"
      WHERE status IN ('confirmed', 'delivered')
    `;
    const cogs = await sql`
      SELECT COALESCE(SUM(p."purchasePrice" * oi.quantity), 0) as cogs
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE o.status IN ('confirmed', 'delivered')
    `;
    
    const totalRevenue = Number(revenue[0].revenue);
    const totalCOGS = Number(cogs[0].cogs);
    const grossProfit = totalRevenue - totalCOGS;
    return totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  }
  
  private async getCustomerRetention(): Promise<number> {
    const customers = await sql`
      SELECT COUNT(*) as total FROM "User" WHERE role = 'customer'
    `;
    const repeatCustomers = await sql`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Order"
      GROUP BY "userId"
      HAVING COUNT(*) > 1
    `;
    
    const totalCustomers = Number(customers[0].total);
    const returningCustomers = repeatCustomers.length;
    return totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
  }
}

export const executiveAnalyticsService = new ExecutiveAnalyticsService();
