import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
    try {
        console.log('📋 Staff orders API called');
        
        // Get user_data cookie
        const userCookie = request.cookies.get('user_data');
        
        if (!userCookie?.value) {
            console.log('❌ No user_data cookie found');
            return NextResponse.json({ 
                success: false, 
                error: 'Unauthorized - Please log in again' 
            }, { status: 401 });
        }
        
        let userData;
        try {
            userData = JSON.parse(decodeURIComponent(userCookie.value));
            console.log('✅ User from cookie:', userData.email, 'Role:', userData.role, 'ID:', userData.id);
        } catch (e) {
            console.error('Error parsing user cookie:', e);
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid user data' 
            }, { status: 401 });
        }
        
        // Verify user is staff
        if (userData.role !== 'staff') {
            console.log('❌ User is not staff:', userData.role);
            return NextResponse.json({ 
                success: false, 
                error: 'Forbidden - Staff access only' 
            }, { status: 403 });
        }
        
        const staffId = userData.id;
        console.log(`🔍 Fetching orders for staff ID: ${staffId}`);
        
        // First, let's check if this staff has any orders assigned
        const checkOrders = await sql`
            SELECT COUNT(*) as count
            FROM "Order"
            WHERE "assignedStaffId" = ${staffId}
        `;
        console.log(`📊 Staff ${userData.email} has ${checkOrders[0].count} orders assigned`);
        
        // Fetch orders assigned to this staff member
        const orders = await sql`
            SELECT 
                o.id,
                o."orderNumber",
                o."customerName",
                o."customerPhone",
                o."customerEmail",
                o.total,
                o.status,
                o."createdAt",
                o.items, o."shippingAddress", o."paymentMethod", o."paymentStatus", o.notes
            FROM "Order" o
            WHERE o."assignedStaffId" = ${staffId}
            ORDER BY o."createdAt" DESC
        `;
        
        console.log(`✅ Found ${orders.length} orders for ${userData.email}`);
        if (orders.length > 0) {
            console.log('📦 Order numbers:', orders.map(o => o.orderNumber).join(', '));
        }
        
        const parsedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail,
            total: Number(order.total),
            status: order.status,
            createdAt: order.createdAt,
            items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
            shippingAddress: order.shippingAddress
        }));
        
        return NextResponse.json({ 
            success: true, 
            orders: parsedOrders
        });
    } catch (error) {
        console.error('Error fetching staff orders:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    // Add a small delay to show loading state (optional, remove in production)
    await new Promise(resolve => setTimeout(resolve, 500));
    // Add a small delay to simulate processing (optional)
    await new Promise(resolve => setTimeout(resolve, 500));
    // Add a small delay to simulate processing (optional)
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
        const { orderId, status } = await request.json();
        
        console.log(`📝 Updating order ${orderId} to status: ${status}`);
        
        if (!orderId || !status) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order ID and status are required' 
            }, { status: 400 });
        }
        
        // Get user from cookie
        const userCookie = request.cookies.get('user_data');
        
        if (!userCookie?.value) {
            return NextResponse.json({ 
                success: false, 
                error: 'Unauthorized' 
            }, { status: 401 });
        }
        
        let userData;
        try {
            userData = JSON.parse(decodeURIComponent(userCookie.value));
        } catch (e) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid user data' 
            }, { status: 401 });
        }
        
        if (userData.role !== 'staff') {
            return NextResponse.json({ 
                success: false, 
                error: 'Forbidden - Staff only' 
            }, { status: 403 });
        }
        
        // Verify order exists and is assigned to this staff
        const order = await sql`
            SELECT id, status, "assignedStaffId"
            FROM "Order"
            WHERE id = ${parseInt(orderId)}
        `;
        
        if (order.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order not found' 
            }, { status: 404 });
        }
        
        if (order[0].assignedStaffId !== userData.id) {
            return NextResponse.json({ 
                success: false, 
                error: 'This order is not assigned to you' 
            }, { status: 403 });
        }
        
        // Update order status
        const result = await sql`
            UPDATE "Order"
            SET status = ${status}, "updatedAt" = NOW()
            WHERE id = ${parseInt(orderId)}
            RETURNING id, status
        `;
        
        console.log(`✅ Order ${orderId} status updated from ${order[0].status} to ${status}`);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Order status updated successfully',
            order: result[0]
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Internal server error' 
        }, { status: 500 });
    }
}




