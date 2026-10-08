import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'), {
  fetchOptions: { timeout: 30000 }
});

async function getCurrentUser(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user_data');
    if (userCookie?.value) {
      try {
        return JSON.parse(decodeURIComponent(userCookie.value));
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }
    const userIdCookie = request.cookies.get('user_id');
    if (userIdCookie?.value) {
      const user = await sql`
        SELECT id, email, "firstName", "lastName", role
        FROM "User"
        WHERE id = ${userIdCookie.value}
      `;
      if (user.length > 0) return user[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const addressId = params.id;
  
  try {
    let bodyUserId = null;
    try {
      const body = await request.json();
      bodyUserId = body?.userId;
    } catch (_) {}
    
    const queryUserId = request.nextUrl.searchParams.get('userId');
    const currentUser = await getCurrentUser(request);
    const userId = bodyUserId || queryUserId || currentUser?.id;
    
    const addressCheck = await sql`
      SELECT id, "userId" FROM "Address" WHERE id = ${addressId}
    `;
    
    if (addressCheck.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    const targetUserId = addressCheck[0].userId;
    if (userId && targetUserId !== userId && currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    await sql`
      UPDATE "Address"
      SET "isDefault" = false
      WHERE "userId" = ${targetUserId}
    `;
    
    await sql`
      UPDATE "Address"
      SET "isDefault" = true, "updatedAt" = NOW()
      WHERE id = ${addressId}
    `;
    
    return NextResponse.json({ success: true, message: 'Default address updated' });
  } catch (error) {
    console.error('Error setting default:', error);
    return NextResponse.json({ error: 'Failed to set default' }, { status: 500 });
  }
}
