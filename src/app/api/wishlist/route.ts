import { NextRequest, NextResponse } from 'next/server';
import { WISHLISTS } from '@/lib/data/wishlists';
import { WishlistItem } from '@/types/auth';

// Helper function to write wishlists back to file
async function writeWishlistsToFile(updatedWishlists: typeof WISHLISTS) {
  const fs = await import('fs/promises');
  const path = await import('path');

  const wishlistsFilePath = path.join(process.cwd(), 'src/lib/data/wishlists.ts');

  // Read the original file to preserve structure
  const originalContent = await fs.readFile(wishlistsFilePath, 'utf-8');

  // Extract the part before WISHLISTS array
  const beforeWishlists = originalContent.split('export const WISHLISTS: Wishlist[] = [')[0];

  // Create new file content
  const fileContent = beforeWishlists +
    `export const WISHLISTS: Wishlist[] = ${JSON.stringify(updatedWishlists, null, 2)};\n`;

  await fs.writeFile(wishlistsFilePath, fileContent, 'utf-8');
}

// GET - Get wishlist for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user's wishlist or create empty one
    let userWishlist = WISHLISTS.find(w => w.userId === userId);
    
    if (!userWishlist) {
      userWishlist = { userId, items: [] };
      WISHLISTS.push(userWishlist);
      await writeWishlistsToFile(WISHLISTS);
    }

    return NextResponse.json({
      success: true,
      data: userWishlist
    });

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Find or create user's wishlist
    let userWishlist = WISHLISTS.find(w => w.userId === userId);
    
    if (!userWishlist) {
      userWishlist = { userId, items: [] };
      WISHLISTS.push(userWishlist);
    }

    // Check if item already exists
    const existingItem = userWishlist.items.find(item => item.productId === productId);
    
    if (existingItem) {
      return NextResponse.json({
        success: false,
        error: 'Item already in wishlist'
      }, { status: 400 });
    }

    // Add new item
    const newItem: WishlistItem = {
      id: `wl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      addedAt: new Date().toISOString()
    };

    userWishlist.items.push(newItem);

    // Write to file
    await writeWishlistsToFile(WISHLISTS);

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Item added to wishlist'
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Find user's wishlist
    const userWishlist = WISHLISTS.find(w => w.userId === userId);
    
    if (!userWishlist) {
      return NextResponse.json(
        { success: false, error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Remove item
    const initialLength = userWishlist.items.length;
    userWishlist.items = userWishlist.items.filter(item => item.productId !== parseInt(productId));

    if (userWishlist.items.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Item not found in wishlist' },
        { status: 404 }
      );
    }

    // Write to file
    await writeWishlistsToFile(WISHLISTS);

    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist'
    });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
}
