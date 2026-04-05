import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: { timeout: 30000 }
});

// GET /api/services - Get all services (optionally filtered)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active') !== 'false';

    // Use tagged template syntax
    let query = sql`SELECT * FROM "Service"`;
    
    if (category || activeOnly) {
      const conditions = [];
      if (category) {
        conditions.push(sql`category = ${category}`);
      }
      if (activeOnly) {
        conditions.push(sql`"isActive" = true`);
      }
      
      // Combine conditions
      if (conditions.length === 1) {
        query = sql`${query} WHERE ${conditions[0]}`;
      } else if (conditions.length === 2) {
        query = sql`${query} WHERE ${conditions[0]} AND ${conditions[1]}`;
      }
    }
    
    query = sql`${query} ORDER BY "createdAt" DESC`;
    
    const services = await query;
    return NextResponse.json(services);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching services:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/services - Create a new service
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { name, description, price, category, duration, image, features, isActive } = data;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    // Use tagged template syntax
    const result = await sql`
      INSERT INTO "Service" (
        name, description, price, category, duration, image, features, "isActive", "createdAt", "updatedAt"
      ) VALUES (
        ${name},
        ${description || ''},
        ${price},
        ${category || ''},
        ${duration || ''},
        ${image || ''},
        ${features ? JSON.stringify(features) : null},
        ${isActive !== undefined ? isActive : true},
        NOW(),
        NOW()
      ) RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating service:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH /api/services - Update a service
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, name, description, price, category, duration, image, features, isActive } = data;

    if (!id) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    // Use tagged template syntax
    const result = await sql`
      UPDATE "Service" 
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        price = COALESCE(${price}, price),
        category = COALESCE(${category}, category),
        duration = COALESCE(${duration}, duration),
        image = COALESCE(${image}, image),
        features = COALESCE(${features ? JSON.stringify(features) : null}, features),
        "isActive" = COALESCE(${isActive}, "isActive"),
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating service:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/services?id=xxx - Delete a service
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    // Use tagged template syntax
    const result = await sql`
      DELETE FROM "Service" 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting service:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

