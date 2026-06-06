import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: { timeout: 30000 }
});

// Helper to get current user from cookie
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
    
    // Also check for user_id cookie
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

// GET /api/addresses - Get all addresses for the current user
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = currentUser.id;
    console.log(`Fetching addresses for user: ${userId}`);
    
    const addresses = await sql`
      SELECT * FROM "Address"
      WHERE "userId" = ${userId}
      ORDER BY "isDefault" DESC, "createdAt" DESC
    `;
    
    console.log(`Found ${addresses.length} addresses for user ${userId}`);
    
    return NextResponse.json(addresses);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching addresses:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/addresses - Create a new address for the current user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = currentUser.id;
    const data = await request.json();
    
    const { type, name, street, city, state, country, postalCode, phone, isDefault } = data;
    
    if (!street || !city || !state) {
      return NextResponse.json({ error: 'Street, city, and state are required' }, { status: 400 });
    }
    
    // If this address is set as default, unset any existing default for this user
    if (isDefault) {
      await sql`
        UPDATE "Address"
        SET "isDefault" = false
        WHERE "userId" = ${userId}
      `;
    }
    
    // Generate a unique ID for the address
    const addressId = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const result = await sql`
      INSERT INTO "Address" (
        id, "userId", type, name, street, city, state, country, "postalCode", phone, "isDefault", "createdAt", "updatedAt"
      ) VALUES (
        ${addressId}, ${userId}, ${type}, ${name || null}, ${street}, ${city}, ${state}, ${country || 'Nigeria'}, 
        ${postalCode || null}, ${phone || null}, ${isDefault || false}, NOW(), NOW()
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
