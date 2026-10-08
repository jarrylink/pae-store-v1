import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'));

// GET /api/order-notes?orderId=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID required'
      }, { status: 400 });
    }

    const notes = await sql`
      SELECT * FROM "OrderNote"
      WHERE "orderId" = ${orderId}
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json({
      success: true,
      notes: notes
    });
  } catch (error) {
    console.error('Notes fetch error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notes'
    }, { status: 500 });
  }
}

// POST /api/order-notes - Create note
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const result = await sql`
      INSERT INTO "OrderNote" (
        id,
        "orderId",
        "authorId",
        "authorName",
        "authorRole",
        content,
        type,
        "createdAt",
        "isInternal"
      ) VALUES (
        ${`NOTE-${Date.now()}`},
        ${data.orderId},
        ${data.authorId},
        ${data.authorName},
        ${data.authorRole},
        ${data.content},
        ${data.type || 'general'},
        ${new Date().toISOString()},
        ${data.isInternal ?? false}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      note: result[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Note creation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create note'
    }, { status: 500 });
  }
}

// DELETE /api/order-notes?id=xyz
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Note ID required'
      }, { status: 400 });
    }

    await sql`DELETE FROM "OrderNote" WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: 'Note deleted'
    });
  } catch (error) {
    console.error('Note deletion error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete note'
    }, { status: 500 });
  }
}
