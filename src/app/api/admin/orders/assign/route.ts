import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'));

export async function POST(request: NextRequest) {
    try {
        const { orderId, staffId } = await request.json();
        
        console.log(`?? Assigning order ${orderId} to staff ${staffId}`);
        
        if (!orderId || !staffId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order ID and Staff ID are required' 
            }, { status: 400 });
        }
        
        // Get staff details
        const staff = await sql`
            SELECT id, "firstName", "lastName", email
            FROM "User"
            WHERE id = ${staffId} AND role = 'staff'
        `;
        
        if (staff.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Staff member not found' 
            }, { status: 404 });
        }
        
        // Check if order exists
        const order = await sql`
            SELECT id FROM "Order" WHERE id = ${parseInt(orderId)}
        `;
        
        if (order.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order not found' 
            }, { status: 404 });
        }
        
        // Update order with assigned staff - now TEXT matches TEXT
        const result = await sql`
            UPDATE "Order"
            SET 
                "assignedStaffId" = ${staff[0].id},
                "assignedStaffName" = ${staff[0].firstName + ' ' + staff[0].lastName},
                "assignedStaffEmail" = ${staff[0].email},
                "updatedAt" = NOW()
            WHERE id = ${parseInt(orderId)}
            RETURNING id, "assignedStaffId", "assignedStaffName", "assignedStaffEmail"
        `;
        
        console.log(`? Order ${orderId} assigned to ${staff[0].firstName} ${staff[0].lastName}`);
        
        return NextResponse.json({ 
            success: true, 
            message: `Order assigned to ${staff[0].firstName} ${staff[0].lastName}`,
            order: result[0]
        });
    } catch (error) {
        console.error('Error assigning order:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
