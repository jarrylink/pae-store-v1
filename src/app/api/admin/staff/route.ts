import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'));

export async function GET(request: NextRequest) {
    try {
        console.log('?? Fetching staff users...');
        
        // Simple query to get all staff users
        const staff = await sql`
            SELECT 
                id, 
                "firstName",
                "lastName",
                email,
                role
            FROM "User" 
            WHERE role = 'staff' 
                AND "isActive" = true
            ORDER BY "firstName"
        `;
        
        console.log(`? Found ${staff.length} staff members`);
        
        // Format the response
        const formattedStaff = staff.map(s => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
            role: s.role,
            activeOrders: 0 // We'll update this separately
        }));
        
        console.log('Staff data:', formattedStaff.map(s => s.name));
        
        return NextResponse.json({ 
            success: true, 
            staff: formattedStaff
        });
    } catch (error) {
        console.error('? Error fetching staff:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
