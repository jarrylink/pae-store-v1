import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM "User" WHERE email = ${email}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    // Default customer permissions as PostgreSQL array
    const customerPermissions = [
      'orders:read',
      'orders:create',
      'profile:read',
      'profile:update'
    ];
    
    // Format as PostgreSQL array literal
    const permissionsSql = '{ "orders:read", "orders:create", "profile:read", "profile:update" }';

    const result = await sql`
      INSERT INTO "User" (
        id, email, "firstName", "lastName", phone, password, role,
        "createdAt", "updatedAt", "lastLogin", "isActive", permissions,
        "emailVerified", avatar
      ) VALUES (
        ${id}, ${email}, ${firstName}, ${lastName},
        ${phone || null}, ${password}, 'customer',
        ${now}, ${now}, ${now}, true,
        ${permissionsSql}::text[],
        false, ''
      )
      RETURNING id, email, "firstName", "lastName", phone, role, "createdAt", "isActive"
    `;

    const newUser = result[0];
    console.log("User registered with ID:", newUser.id);
    
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
