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

export async function DELETE(
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
      SELECT "userId", "isDefault" FROM "Address" WHERE id = ${addressId}
    `;
    
    if (addressCheck.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    if (addressCheck[0].userId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const wasDefault = addressCheck[0].isDefault;
    
    await sql`DELETE FROM "Address" WHERE id = ${addressId}`;
    
    if (wasDefault) {
      const remainingAddresses = await sql`
        SELECT id FROM "Address" 
        WHERE "userId" = ${currentUser.id} 
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
    
    const data = await request.json();
    const { type, name, street, city, state, country, postalCode, phone, isDefault } = data;
    
    const addressCheck = await sql`
      SELECT "userId" FROM "Address" WHERE id = ${addressId}
    `;
    
    if (addressCheck.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    if (addressCheck[0].userId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    if (isDefault) {
      await sql`
        UPDATE "Address"
        SET "isDefault" = false
        WHERE "userId" = ${currentUser.id} AND id != ${addressId}
      `;
    }
    
    const updatedAddress = await sql`
      UPDATE "Address"
      SET 
        type = ${type},
        name = ${name || null},
        street = ${street},
        city = ${city},
        state = ${state},
        country = ${country || 'Nigeria'},
        "postalCode" = ${postalCode || null},
        phone = ${phone || null},
        "isDefault" = ${isDefault || false},
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

export async function GET(
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
    
    const address = await sql`
      SELECT * FROM "Address" 
      WHERE id = ${addressId} AND "userId" = ${currentUser.id}
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
