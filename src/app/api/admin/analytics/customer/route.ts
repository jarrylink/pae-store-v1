import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    let days = 30;
    switch(range) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 30;
    }
    
    const now = new Date();
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // ============================================================
    // CUSTOMER SEGMENTATION
    // ============================================================
    
    // Get all customers
    const allCustomers = await sql`
      SELECT id, "firstName", "lastName", email, "createdAt", "lastLogin"
      FROM "User"
      WHERE role = 'customer'
    `;
    
    // Get customer order history
    const customerOrders = await sql`
      SELECT "userId", COUNT(*) as order_count, SUM(total) as total_spent
      FROM "Order"
      WHERE status IN ('confirmed', 'delivered')
      GROUP BY "userId"
    `;
    
    // Build customer data with order metrics
    const customersWithOrders = allCustomers.map(customer => {
      const orders = customerOrders.find(o => o.userId === customer.id);
      return {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        joinDate: customer.createdAt,
        lastActive: customer.lastLogin,
        orderCount: orders ? Number(orders.order_count) : 0,
        totalSpent: orders ? Number(orders.total_spent) : 0,
        avgOrderValue: orders ? Number(orders.total_spent) / Number(orders.order_count) : 0
      };
    });
    
    // Segment customers
    const segments = {
      vip: customersWithOrders.filter(c => c.totalSpent > 1000000),
      regular: customersWithOrders.filter(c => c.totalSpent > 200000 && c.totalSpent <= 1000000),
      occasional: customersWithOrders.filter(c => c.totalSpent > 50000 && c.totalSpent <= 200000),
      new: customersWithOrders.filter(c => c.orderCount === 0 || c.orderCount === 1),
      atRisk: customersWithOrders.filter(c => {
        const lastActive = new Date(c.lastActive);
        const daysSinceActive = (new Date().getTime() - lastActive.getTime()) / (1000 * 3600 * 24);
        return daysSinceActive > 60 && c.orderCount > 0;
      })
    };
    
    // ============================================================
    // RETENTION & CHURN
    // ============================================================
    
    // Calculate retention rates
    const allTimeCustomers = customersWithOrders.length;
    const returningCustomers = customersWithOrders.filter(c => c.orderCount > 1).length;
    const retentionRate = allTimeCustomers > 0 ? (returningCustomers / allTimeCustomers) * 100 : 0;
    
    // Calculate churn rate (customers not active in last 90 days)
    const churnedCustomers = customersWithOrders.filter(c => {
      const lastActive = new Date(c.lastActive || c.joinDate);
      const daysSinceActive = (new Date().getTime() - lastActive.getTime()) / (1000 * 3600 * 24);
      return daysSinceActive > 90 && c.orderCount > 0;
    });
    const churnRate = allTimeCustomers > 0 ? (churnedCustomers.length / allTimeCustomers) * 100 : 0;
    
    // ============================================================
    // LIFETIME VALUE (LTV)
    // ============================================================
    
    const totalRevenue = customersWithOrders.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgLTV = allTimeCustomers > 0 ? totalRevenue / allTimeCustomers : 0;
    
    // LTV by segment
    const ltvBySegment = {
      vip: segments.vip.reduce((sum, c) => sum + c.totalSpent, 0) / (segments.vip.length || 1),
      regular: segments.regular.reduce((sum, c) => sum + c.totalSpent, 0) / (segments.regular.length || 1),
      occasional: segments.occasional.reduce((sum, c) => sum + c.totalSpent, 0) / (segments.occasional.length || 1)
    };
    
    // ============================================================
    // CUSTOMER JOURNEY (simplified)
    // ============================================================
    
    const journey = [
      { stage: 'Awareness', count: allCustomers.length, percentage: 100 },
      { stage: 'First Visit', count: allCustomers.filter(c => c.orderCount >= 1).length, percentage: (allCustomers.filter(c => c.orderCount >= 1).length / allCustomers.length) * 100 },
      { stage: 'First Purchase', count: customersWithOrders.filter(c => c.orderCount >= 1).length, percentage: (customersWithOrders.filter(c => c.orderCount >= 1).length / allCustomers.length) * 100 },
      { stage: 'Repeat Purchase', count: customersWithOrders.filter(c => c.orderCount >= 2).length, percentage: (customersWithOrders.filter(c => c.orderCount >= 2).length / allCustomers.length) * 100 },
      { stage: 'Loyal Customer', count: customersWithOrders.filter(c => c.orderCount >= 5).length, percentage: (customersWithOrders.filter(c => c.orderCount >= 5).length / allCustomers.length) * 100 },
      { stage: 'Advocate', count: customersWithOrders.filter(c => c.orderCount >= 10).length, percentage: (customersWithOrders.filter(c => c.orderCount >= 10).length / allCustomers.length) * 100 }
    ];
    
    // ============================================================
    // CUSTOMER SATISFACTION (estimated)
    // ============================================================
    
    // Based on order completion rate
    const completedOrders = await sql`SELECT COUNT(*) as count FROM "Order" WHERE status IN ('confirmed', 'delivered')`;
    const totalOrders = await sql`SELECT COUNT(*) as count FROM "Order"`;
    const satisfactionScore = totalOrders[0].count > 0 ? (completedOrders[0].count / totalOrders[0].count) * 100 : 80;
    
    // ============================================================
    // AI RECOMMENDATIONS
    // ============================================================
    
    const recommendations = [];
    
    if (retentionRate < 30) {
      recommendations.push({
        type: 'action',
        title: 'Low Customer Retention',
        message: `Your retention rate is ${retentionRate.toFixed(0)}%. Consider implementing a loyalty program.`,
        action: 'Launch loyalty program'
      });
    }
    
    if (churnRate > 20) {
      recommendations.push({
        type: 'alert',
        title: 'High Churn Rate',
        message: `${churnRate.toFixed(0)}% of customers haven't returned. Send re-engagement campaigns.`,
        action: 'Run re-engagement campaign'
      });
    }
    
    if (segments.vip.length > 0) {
      recommendations.push({
        type: 'positive',
        title: 'VIP Customer Opportunity',
        message: `${segments.vip.length} VIP customers generate high value. Offer exclusive perks.`,
        action: 'Create VIP program'
      });
    }
    
    if (segments.atRisk.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'At-Risk Customers',
        message: `${segments.atRisk.length} customers haven't engaged in 60+ days. Win them back.`,
        action: 'Send win-back offers'
      });
    }
    
    return NextResponse.json({
      success: true,
      metrics: {
        totalCustomers: allCustomers.length,
        newCustomers: segments.new.length,
        returningCustomers: returningCustomers,
        retentionRate: retentionRate,
        churnRate: churnRate,
        avgLTV: avgLTV,
        customerSatisfaction: satisfactionScore
      },
      segments: {
        vip: segments.vip.length,
        regular: segments.regular.length,
        occasional: segments.occasional.length,
        new: segments.new.length,
        atRisk: segments.atRisk.length
      },
      ltvBySegment: ltvBySegment,
      journey: journey,
      topCustomers: customersWithOrders.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10),
      recommendations: recommendations
    });
    
  } catch (error) {
    console.error('Customer API Error:', error);
    return NextResponse.json({ 
      success: false, 
      metrics: {
        totalCustomers: 0, newCustomers: 0, returningCustomers: 0,
        retentionRate: 0, churnRate: 0, avgLTV: 0, customerSatisfaction: 0
      },
      segments: { vip: 0, regular: 0, occasional: 0, new: 0, atRisk: 0 },
      ltvBySegment: { vip: 0, regular: 0, occasional: 0 },
      journey: [],
      topCustomers: [],
      recommendations: []
    });
  }
}
