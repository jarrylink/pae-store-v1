import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'), {
    fetchOptions: { timeout: 30000 }
});

export async function GET(request: NextRequest) {
    try {
        console.log('?? Fetching dashboard stats...');
        
        // Get initial total inventory (from database - we'll calculate units sold)
        const products = await sql`
            SELECT 
                COUNT(*) as total,
                COALESCE(SUM(inventory), 0) as total_inventory,
                COALESCE(SUM(inventory * price), 0) as total_value,
                COUNT(CASE WHEN inventory = 0 THEN 1 END) as sold_out,
                COUNT(CASE WHEN inventory < 10 AND inventory > 0 THEN 1 END) as low_stock
            FROM "Product"
        `;
        
        // Calculate units sold based on confirmed orders
        const soldUnits = await sql`
            SELECT COALESCE(SUM(
                (SELECT COALESCE(SUM((item->>'quantity')::int), 0) 
                 FROM jsonb_array_elements(items) as item 
                 WHERE (item->>'type') != 'service')
            ), 0) as units_sold
            FROM "Order"
            WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        `;
        
        const orders = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
                COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
                COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
                COALESCE(SUM(CASE WHEN status IN ('confirmed','processing','shipped','delivered') THEN total ELSE 0 END), 0) as total_revenue,
                COALESCE(SUM(CASE WHEN "hasService" = false AND status IN ('confirmed','processing','shipped','delivered') THEN total ELSE 0 END), 0) as product_revenue,
                COALESCE(SUM(CASE WHEN "hasService" = true AND status IN ('confirmed','processing','shipped','delivered') THEN "servicePrice" ELSE 0 END), 0) as service_revenue
            FROM "Order"
        `;
        
        const services = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN "isActive" = true THEN 1 END) as active
            FROM "Service"
        `;
        
        const serviceOrders = await sql`
            SELECT 
                COUNT(CASE WHEN status = 'confirmed' AND "hasService" = true THEN 1 END) as confirmed,
                COUNT(CASE WHEN status = 'delivered' AND "hasService" = true THEN 1 END) as completed
            FROM "Order"
        `;
        
        const users = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN "isActive" = true THEN 1 END) as active,
                COUNT(CASE WHEN "isActive" = false THEN 1 END) as inactive
            FROM "User"
        `;
        
        const recentOrders = await sql`
            SELECT 
                id, "orderNumber", "customerName", total, status, "paymentStatus", "createdAt"
            FROM "Order"
            ORDER BY "createdAt" DESC
            LIMIT 10
        `;
        
        const parsedRecentOrders = recentOrders.map(order => ({
            ...order,
            createdAt: order.createdAt,
            total: Number(order.total)
        }));
        
        const dashboardData = {
            products: {
                total: Number(products[0]?.total) || 0,
                totalInventory: Number(products[0]?.total_inventory) || 0,
                totalValue: Number(products[0]?.total_value) || 0,
                soldOut: Number(products[0]?.sold_out) || 0,
                lowStock: Number(products[0]?.low_stock) || 0,
                unitsSold: Number(soldUnits[0]?.units_sold) || 0
            },
            orders: {
                total: Number(orders[0]?.total) || 0,
                pending: Number(orders[0]?.pending) || 0,
                confirmed: Number(orders[0]?.confirmed) || 0,
                processing: Number(orders[0]?.processing) || 0,
                shipped: Number(orders[0]?.shipped) || 0,
                delivered: Number(orders[0]?.delivered) || 0,
                totalRevenue: Number(orders[0]?.total_revenue) || 0,
                productRevenue: Number(orders[0]?.product_revenue) || 0,
                serviceRevenue: Number(orders[0]?.service_revenue) || 0
            },
            services: {
                total: Number(services[0]?.total) || 0,
                active: Number(services[0]?.active) || 0,
                confirmed: Number(serviceOrders[0]?.confirmed) || 0,
                completed: Number(serviceOrders[0]?.completed) || 0
            },
            users: {
                total: Number(users[0]?.total) || 0,
                active: Number(users[0]?.active) || 0,
                inactive: Number(users[0]?.inactive) || 0
            },
            recentOrders: parsedRecentOrders
        };
        
        console.log('? Dashboard stats fetched successfully');
        return NextResponse.json(dashboardData);
        
    } catch (error) {
        console.error('? Error fetching dashboard stats:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            products: { total: 0, totalInventory: 0, totalValue: 0, soldOut: 0, lowStock: 0, unitsSold: 0 },
            orders: { total: 0, pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, totalRevenue: 0, productRevenue: 0, serviceRevenue: 0 },
            services: { total: 0, active: 0, confirmed: 0, completed: 0 },
            users: { total: 0, active: 0, inactive: 0 },
            recentOrders: []
        }, { status: 500 });
    }
}

