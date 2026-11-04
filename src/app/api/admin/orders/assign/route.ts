import { NextRequest, NextResponse } from 'next/server';
import { getDb, executeWithRetry } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { orderId, staffId } = await request.json();
        const sql = getDb();
        
        console.log(`Assigning order ${orderId} to staff ${staffId}`);
        
        if (!orderId || !staffId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order ID and Staff ID are required' 
            }, { status: 400 });
        }
        
        const result = await executeWithRetry(async () => {
            // Get staff details
            const staff = await sql`
                SELECT id, "firstName", "lastName", email
                FROM "User"
                WHERE id = ${staffId} AND role = 'staff'
            `;
            
            if (staff.length === 0) {
                return { error: 'Staff member not found', status: 404 };
            }
            
            // Check if order exists
            const order = await sql`
                SELECT id FROM "Order" WHERE id = ${parseInt(orderId)}
            `;
            
            if (order.length === 0) {
                return { error: 'Order not found', status: 404 };
            }
            
            // Update order with assigned staff
            const updated = await sql`
                UPDATE "Order"
                SET 
                    "assignedStaffId" = ${staff[0].id},
                    "assignedStaffName" = ${staff[0].firstName + ' ' + staff[0].lastName},
                    "assignedStaffEmail" = ${staff[0].email},
                    "updatedAt" = NOW()
                WHERE id = ${parseInt(orderId)}
                RETURNING id, "assignedStaffId", "assignedStaffName", "assignedStaffEmail"
            `;

            return {
                staffMember: staff[0],
                order: updated[0]
            };
        });

        if ('error' in result && result.error) {
            return NextResponse.json({ success: false, error: result.error }, { status: result.status || 400 });
        }
        
        return NextResponse.json({ 
            success: true, 
            message: `Order assigned to ${result.staffMember.firstName} ${result.staffMember.lastName}`,
            order: result.order
        });
    } catch (error) {
        console.error('Error assigning order:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
