import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');
        
        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }
        
        // Get user by email
        const user = await sql`
            SELECT id, email, "firstName", "lastName", role
            FROM "User"
            WHERE email = ${email}
        `;
        
        if (user.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const staffId = user[0].id;
        
        // Get orders for this staff
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
                o.items
            FROM "Order" o
            WHERE o."assignedStaffId" = ${staffId}
            ORDER BY o."createdAt" DESC
        `;
        
        return NextResponse.json({
            user: user[0],
            orders: orders.map(o => ({
                ...o,
                total: Number(o.total),
                items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
            }))
        });
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
