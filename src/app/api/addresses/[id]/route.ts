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

// DELETE /api/addresses/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const addressId = params.id;
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryUserId = searchParams.get('userId');
    const currentUser = await getCurrentUser(request);
    const userId = queryUserId || currentUser?.id;
    
    const addressCheck = await sql`
      SELECT id, "userId", "isDefault" FROM "Address" WHERE id = ${addressId}
    `;
    
    if (addressCheck.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    const targetAddress = addressCheck[0];
    
    // Check authorization if user specified
    if (userId && targetAddress.userId !== userId && currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const wasDefault = targetAddress.isDefault;
    const ownerUserId = targetAddress.userId;
    
    await sql`DELETE FROM "Address" WHERE id = ${addressId}`;
    
    if (wasDefault) {
      const remainingAddresses = await sql`
        SELECT id FROM "Address" 
        WHERE "userId" = ${ownerUserId} 
        ORDER BY "createdAt" ASC 
        LIMIT 1
      `;
      
      if (remainingAddresses.length > 0) {
        await sql`
          UPDATE "Address"
          SET "isDefault" = true
          WHERE id = ${remainingAddresses[0].id}
        `;
      }
    }
    
    return NextResponse.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}

// PUT /api/addresses/[id]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const addressId = params.id;
  
  try {
    const data = await request.json();
    const currentUser = await getCurrentUser(request);
    const userId = data.userId || currentUser?.id;
    
    const addressCheck = await sql`
      SELECT id, "userId" FROM "Address" WHERE id = ${addressId}
    `;
    
    if (addressCheck.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    const existing = addressCheck[0];
    if (userId && existing.userId !== userId && currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { type, name, street, city, state, country, postalCode, phone, isDefault } = data;
    
    if (isDefault) {
      await sql`
        UPDATE "Address"
        SET "isDefault" = false
        WHERE "userId" = ${existing.userId} AND id != ${addressId}
      `;
    }
    
    const safeType = type || 'home';
    const safeName = name && name.trim() ? name.trim() : (safeType === 'office' ? 'Office' : 'Home');
    const safeCountry = country && country.trim() ? country.trim() : 'Nigeria';
    const safePostalCode = postalCode && postalCode.trim() ? postalCode.trim() : '';
    const safePhone = phone && phone.trim() ? phone.trim() : null;
    
    const updatedAddress = await sql`
      UPDATE "Address"
      SET 
        type = ${safeType},
        name = ${safeName},
        street = ${street ? street.trim() : ''},
        city = ${city ? city.trim() : ''},
        state = ${state ? state.trim() : ''},
        country = ${safeCountry},
        "postalCode" = ${safePostalCode},
        phone = ${safePhone},
        "isDefault" = ${isDefault === true},
        "updatedAt" = NOW()
      WHERE id = ${addressId}
      RETURNING *
    `;
    
    return NextResponse.json(updatedAddress[0]);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

// GET /api/addresses/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const addressId = params.id;
  
  try {
    const address = await sql`
      SELECT * FROM "Address" 
      WHERE id = ${addressId}
    `;
    
    if (address.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    return NextResponse.json(address[0]);
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json({ error: 'Failed to fetch address' }, { status: 500 });
  }
}
