import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '50');
        
        // Simple query without dynamic filters for now
        const logs = await sql`
            SELECT * FROM "ActivityLog" 
            ORDER BY "createdAt" DESC 
            LIMIT ${limit}
        `;
        
        return NextResponse.json({ 
            success: true, 
            logs,
            total: logs.length 
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, userEmail, userRole, action, entityType, entityId, oldData, newData, ipAddress, userAgent } = body;
        
        await sql`
            INSERT INTO "ActivityLog" (
                "userId", "userEmail", "userRole", action, 
                "entityType", "entityId", "oldData", "newData", 
                "ipAddress", "userAgent"
            ) VALUES (
                ${userId}, ${userEmail || null}, ${userRole || null}, ${action},
                ${entityType || null}, ${entityId || null}, 
                ${oldData ? JSON.stringify(oldData) : null},
                ${newData ? JSON.stringify(newData) : null},
                ${ipAddress || null}, ${userAgent || null}
            )
        `;
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating activity log:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
