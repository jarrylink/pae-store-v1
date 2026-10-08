import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'));

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`GET /api/users/${id} - fetching user`);
    
    const result = await sql`
      SELECT id, email, "firstName", "lastName", avatar, "emailVerified", phone, role,
             "createdAt", "updatedAt", "lastLogin", "isActive", permissions
      FROM "User"
      WHERE id = ${id}
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PATCH update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(`PATCH /api/users/${id} - updating user:`, body);

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (body.firstName !== undefined) {
      updates.push(`"firstName" = $${paramIndex++}`);
      values.push(body.firstName);
    }
    if (body.lastName !== undefined) {
      updates.push(`"lastName" = $${paramIndex++}`);
      values.push(body.lastName);
    }
    if (body.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(body.phone);
    }
    if (body.avatar !== undefined) {
      updates.push(`avatar = $${paramIndex++}`);
      values.push(body.avatar);
    }
    if (body.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(body.role);
    }
    if (body.isActive !== undefined) {
      updates.push(`"isActive" = $${paramIndex++}`);
      values.push(body.isActive);
    }
    if (body.emailVerified !== undefined) {
      updates.push(`"emailVerified" = $${paramIndex++}`);
      values.push(body.emailVerified);
    }
    if (body.password !== undefined && body.password) {
      updates.push(`password = $${paramIndex++}`);
      values.push(body.password);
    }
    if (body.permissions !== undefined) {
      // Handle permissions array
      const permissions = body.permissions || [];
      let permissionsValue;
      if (permissions.length === 0) {
        permissionsValue = '{}';
      } else {
        permissionsValue = '{ "' + permissions.join('", "') + '" }';
      }
      updates.push(`permissions = $${paramIndex++}::text[]`);
      values.push(permissionsValue);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push(`"updatedAt" = NOW()`);
    values.push(id);

    const query = `
      UPDATE "User"
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, "firstName", "lastName", avatar, "emailVerified", phone, role,
                "createdAt", "updatedAt", "lastLogin", "isActive", permissions
    `;

    // Execute query and handle result as array directly
    const result = await sql.query(query, values);
    
    // The result might be an array or an object with rows
    // Let's handle both cases safely
    const rows = Array.isArray(result) ? result : (result as any).rows;
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User updated successfully");
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ 
      error: "Failed to update user",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// PUT update full user (kept for compatibility)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params });
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`DELETE /api/users/${id} - deleting user`);

    const result = await sql`
      DELETE FROM "User"
      WHERE id = ${id}
      RETURNING id
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
