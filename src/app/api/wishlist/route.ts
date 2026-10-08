import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'));

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const items = await sql`
      SELECT * FROM "WishlistItem" 
      WHERE "userId" = ${userId}
      ORDER BY "addedAt" DESC
    `;
    
    return NextResponse.json({ 
      success: true, 
      items: items 
    });
  } catch (error) {
    console.error('GET wishlist error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json();
    
    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and Product ID required' }, { status: 400 });
    }
    
    // Check if exists
    const existing = await sql`
      SELECT id FROM "WishlistItem" 
      WHERE "userId" = ${userId} AND "productId" = ${productId}
    `;
    
    if (existing.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item already in wishlist' 
      }, { status: 400 });
    }
    
    // Add new item
    const id = `wish_${Date.now()}_${productId}`;
    
    await sql`
      INSERT INTO "WishlistItem" (id, "userId", "productId", "addedAt")
      VALUES (${id}, ${userId}, ${productId}, NOW())
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Added to wishlist',
      item: { id, userId, productId }
    });
  } catch (error) {
    console.error('POST wishlist error:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    
    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and Product ID required' }, { status: 400 });
    }
    
    await sql`
      DELETE FROM "WishlistItem" 
      WHERE "userId" = ${userId} AND "productId" = ${productId}
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Removed from wishlist' 
    });
  } catch (error) {
    console.error('DELETE wishlist error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
