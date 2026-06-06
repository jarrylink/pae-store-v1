import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET all users
export async function GET() {
  try {
    console.log("GET /api/users - fetching all users");
    const users = await sql`
      SELECT id, email, "firstName", "lastName", avatar, "emailVerified", phone, role,
             "createdAt", "updatedAt", "lastLogin", "isActive", permissions
      FROM "User"
      ORDER BY "createdAt" DESC
    `;
    console.log(`Found ${users.length} users`);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty array on error to prevent UI crashes
    return NextResponse.json([]);
  }
}

// POST new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating user with data:", body);

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM "User" WHERE email = ${body.email}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    // Handle permissions as PostgreSQL array
    const permissions = body.permissions || [];
    let permissionsValue;
    
    if (permissions.length === 0) {
      permissionsValue = '{}';
    } else {
      permissionsValue = '{ "' + permissions.join('", "') + '" }';
    }

    const result = await sql`
      INSERT INTO "User" (
        id, email, "firstName", "lastName", phone, password, role,
        "createdAt", "updatedAt", "lastLogin", "isActive", permissions,
        "emailVerified", avatar
      ) VALUES (
        ${id}, ${body.email}, ${body.firstName}, ${body.lastName},
        ${body.phone || null}, ${body.password}, ${body.role || 'customer'},
        ${now}, ${now}, null, ${body.isActive ?? true},
        ${permissionsValue}::text[],
        ${body.emailVerified || false}, ${body.avatar || ''}
      )
      RETURNING id, email, "firstName", "lastName", phone, role, "createdAt", "isActive", permissions
    `;

    console.log("User created with ID:", result[0].id);
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ 
      error: "Failed to create user"
    }, { status: 500 });
  }
}
