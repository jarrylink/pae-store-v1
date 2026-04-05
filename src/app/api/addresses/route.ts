import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: { timeout: 30000 }
});

// GET /api/addresses?userId=xxx - Get all addresses for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const addresses = await sql`
      SELECT * FROM "Address" 
      WHERE "userId" = ${userId} 
      ORDER BY "isDefault" DESC
    `;

    return NextResponse.json(addresses);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching addresses:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/addresses - Create a new address
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { userId, type, name, street, city, state, country, postalCode, phone, isDefault } = data;

    if (!userId || !street || !city || !state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If this address is set as default, unset any existing default
    if (isDefault) {
      await sql`
        UPDATE "Address" 
        SET "isDefault" = false 
        WHERE "userId" = ${userId}
      `;
    }

    // Let the database generate the ID
    const result = await sql`
      INSERT INTO "Address" (
        "userId", "type", "name", "street", "city", 
        "state", "country", "postalCode", "phone", "isDefault"
      ) VALUES (
        ${userId}, 
        ${type || 'home'}, 
        ${name || ''}, 
        ${street}, 
        ${city},
        ${state}, 
        ${country || 'Nigeria'}, 
        ${postalCode || ''}, 
        ${phone || ''}, 
        ${isDefault || false}
      ) RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating address:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH /api/addresses - Update an address
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, type, name, street, city, state, country, postalCode, phone, isDefault, userId } = data;

    if (!id) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
    }

    // If setting as default, unset any existing default for this user
    if (isDefault && userId) {
      await sql`
        UPDATE "Address" 
        SET "isDefault" = false 
        WHERE "userId" = ${userId}
      `;
    }

    const result = await sql`
      UPDATE "Address" 
      SET 
        "type" = COALESCE(${type}, "type"),
        "name" = COALESCE(${name}, "name"),
        "street" = COALESCE(${street}, "street"),
        "city" = COALESCE(${city}, "city"),
        "state" = COALESCE(${state}, "state"),
        "country" = COALESCE(${country}, "country"),
        "postalCode" = COALESCE(${postalCode}, "postalCode"),
        "phone" = COALESCE(${phone}, "phone"),
        "isDefault" = COALESCE(${isDefault}, "isDefault"),
        "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating address:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/addresses?id=xxx - Delete an address
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM "Address" 
      WHERE "id" = ${id}
      RETURNING "id"
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting address:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
