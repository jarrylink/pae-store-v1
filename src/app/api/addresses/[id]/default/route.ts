import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function getCurrentUser(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user_data');
    if (userCookie?.value) {
      return JSON.parse(decodeURIComponent(userCookie.value));
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
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const addressCheck = await sql`
      SELECT "userId" FROM "Address" WHERE id = ${addressId}
    `;
    
    if (addressCheck.length === 0 || addressCheck[0].userId !== currentUser.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    await sql`
      UPDATE "Address"
      SET "isDefault" = false
      WHERE "userId" = ${currentUser.id}
    `;
    
    await sql`
      UPDATE "Address"
      SET "isDefault" = true
      WHERE id = ${addressId}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting default:', error);
    return NextResponse.json({ error: 'Failed to set default' }, { status: 500 });
  }
}
