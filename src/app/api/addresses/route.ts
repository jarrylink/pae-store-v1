import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'), {
  fetchOptions: { timeout: 30000 }
});

// Helper to get current user from cookie or query
async function getCurrentUser(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user_data');
    if (userCookie?.value) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.value));
        return userData;
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
      if (user.length > 0) {
        return user[0];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// GET /api/addresses - Get all addresses for user
export async function GET(request: NextRequest) {
  try {
    const queryUserId = request.nextUrl.searchParams.get('userId');
    const currentUser = await getCurrentUser(request);
    const userId = queryUserId || currentUser?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const addresses = await sql`
      SELECT * FROM "Address"
      WHERE "userId" = ${userId}
      ORDER BY "isDefault" DESC, "createdAt" DESC
    `;
    
    return NextResponse.json(addresses, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching addresses:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/addresses - Create a new address
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    const data = await request.json();
    const userId = data.userId || currentUser?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { type, name, street, city, state, country, postalCode, phone, isDefault } = data;
    
    if (!street || !city || !state) {
      return NextResponse.json({ error: 'Street, city, and state are required' }, { status: 400 });
    }
    
    // Check if this is the user's first address
    const existingCount = await sql`
      SELECT count(*) as count FROM "Address" WHERE "userId" = ${userId}
    `;
    const count = parseInt(existingCount[0]?.count || '0', 10);
    const shouldBeDefault = isDefault || count === 0;
    
    // If this address is set as default, unset any existing default for this user
    if (shouldBeDefault) {
      await sql`
        UPDATE "Address"
        SET "isDefault" = false
        WHERE "userId" = ${userId}
      `;
    }
    
    // Generate a unique ID for the address
    const addressId = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Safe values satisfying PostgreSQL NOT NULL constraints
    const safeType = type || 'home';
    const safeName = name && name.trim() ? name.trim() : (safeType === 'office' ? 'Office' : 'Home');
    const safeCountry = country && country.trim() ? country.trim() : 'Nigeria';
    const safePostalCode = postalCode && postalCode.trim() ? postalCode.trim() : '';
    const safePhone = phone && phone.trim() ? phone.trim() : null;
    
    const result = await sql`
      INSERT INTO "Address" (
        id, "userId", type, name, street, city, state, country, "postalCode", phone, "isDefault", "createdAt", "updatedAt"
      ) VALUES (
        ${addressId}, ${userId}, ${safeType}, ${safeName}, ${street.trim()}, ${city.trim()}, ${state.trim()}, 
        ${safeCountry}, ${safePostalCode}, ${safePhone}, ${shouldBeDefault}, NOW(), NOW()
      )
      RETURNING *
    `;
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating address:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
