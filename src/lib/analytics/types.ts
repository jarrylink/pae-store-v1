export interface RevenueMetrics {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  growth: number;
  trend: { month: string; revenue: number; orders: number }[];
  dailyTrend: { day: string; revenue: number; orders: number }[];
  weeklyTrend: { week: string; revenue: number; orders: number }[];
}

export interface ProfitabilityMetrics {
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  cogs: number;
  expenses: {
    operating: number;
    marketing: number;
    shipping: number;
    total: number;
  };
}

export interface OperationalMetrics {
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  deliveries: {
    onTime: number;
    delayed: number;
    averageDays: number;
    completionRate: number;
  };
  transactions: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
}

export interface MarketplaceMetrics {
  vendors: {
    total: number;
    active: number;
    topPerformers: { id: number; name: string; revenue: number; rating: number }[];
    revenueByVendor: { name: string; revenue: number }[];
  };
  installers: {
    total: number;
    active: number;
    available: number;
    avgRating: number;
    totalJobsCompleted: number;
    topPerformers: { id: number; name: string; jobs: number; rating: number }[];
  };
}

export interface CustomerMetrics {
  total: number;
  new: number;
  returning: number;
  retentionRate: number;
  churnRate: number;
  lifetimeValue: number;
  repeatPurchaseRate: number;
  averageOrderValue: number;
  acquisitionCost: number;
  customerSegments: {
    segment: string;
    count: number;
    percentage: number;
  }[];
}

export interface ForecastMetrics {
  revenue: {
    next30: number;
    next90: number;
    next365: number;
    confidence: number;
  };
  inventory: {
    daysUntilOutOfStock: number;
    recommendedReorder: { productId: number; name: string; quantity: number }[];
    riskProducts: { productId: number; name: string; daysLeft: number }[];
  };
  cash: {
    projected: number;
    confidence: number;
    reserve: number;
  };
}

export interface Alert {
  type: 'revenue' | 'profitability' | 'operations' | 'marketplace' | 'customer' | 'inventory' | 'forecast';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  action?: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
}

export interface AIInsight {
  type: 'positive' | 'negative' | 'neutral' | 'alert';
  title: string;
  message: string;
  action: string;
  confidence?: number;
}

export interface ExecutiveMetrics {
  revenue: RevenueMetrics;
  profitability: ProfitabilityMetrics;
  operational: OperationalMetrics;
  marketplace: MarketplaceMetrics;
  customer: CustomerMetrics;
  forecast: ForecastMetrics;
  alerts: Alert[];
  aiInsights: AIInsight[];
  lastUpdated: string;
}
