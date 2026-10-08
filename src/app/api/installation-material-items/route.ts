import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'));

// GET - Get installation material items for a service
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    const items = await sql`
      SELECT * FROM "InstallationMaterialItem"
      WHERE "serviceId" = ${parseInt(serviceId)}
      ORDER BY "sn" ASC
    `;

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching installation material items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST - Save installation material items for a service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, items } = body;

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    // Delete existing items for this service
    await sql`
      DELETE FROM "InstallationMaterialItem"
      WHERE "serviceId" = ${parseInt(serviceId)}
    `;

    // Insert new items
    if (items && items.length > 0) {
      for (const item of items) {
        await sql`
          INSERT INTO "InstallationMaterialItem" (
            "serviceId", "sn", "description", "qty", "unitCost", "total", "createdAt", "updatedAt"
          ) VALUES (
            ${parseInt(serviceId)},
            ${item.sn || 0},
            ${item.description || ''},
            ${item.qty || 0},
            ${item.unitCost || 0},
            ${item.total || 0},
            NOW(),
            NOW()
          )
        `;
      }
    }

    return NextResponse.json({ success: true, message: 'Items saved successfully' });
  } catch (error) {
    console.error('Error saving installation material items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save items' },
      { status: 500 }
    );
  }
}

// DELETE - Delete all items for a service
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    await sql`
      DELETE FROM "InstallationMaterialItem"
      WHERE "serviceId" = ${parseInt(serviceId)}
    `;

    return NextResponse.json({ success: true, message: 'Items deleted successfully' });
  } catch (error) {
    console.error('Error deleting installation material items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete items' },
      { status: 500 }
    );
  }
}
