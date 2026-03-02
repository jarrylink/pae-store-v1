const API_BASE = '/api/wishlist';

export interface WishlistResponse {
  success: boolean;
  data: {
    userId: string;
    items: Array<{
      id: string;
      productId: number;
      addedAt: string;
    }>;
  };
  count: number;
  message?: string;
}

export interface WishlistCheckResponse {
  success: boolean;
  data: {
    inWishlist: boolean;
  };
}

export interface WishlistCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

class WishlistService {
  // Get user wishlist
  async getWishlist(userId: string): Promise<WishlistResponse> {
    const response = await fetch(`${API_BASE}?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch wishlist');
    }
    return response.json();
  }

  // Add item to wishlist
  async addToWishlist(userId: string, productId: number): Promise<WishlistResponse> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, productId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to wishlist');
    }

    return response.json();
  }

  // Remove item from wishlist
  async removeFromWishlist(userId: string, productId: number): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${API_BASE}?userId=${userId}&productId=${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove from wishlist');
    }

    return response.json();
  }

  // Check if product is in wishlist
  async checkInWishlist(userId: string, productId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/check?userId=${userId}&productId=${productId}`);
    if (!response.ok) {
      throw new Error('Failed to check wishlist');
    }

    const data: WishlistCheckResponse = await response.json();
    return data.data.inWishlist;
  }

  // Get wishlist item count
  async getWishlistCount(userId: string): Promise<number> {
    const response = await fetch(`${API_BASE}/count?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to get wishlist count');
    }

    const data: WishlistCountResponse = await response.json();
    return data.data.count;
  }

  // Toggle wishlist item
  async toggleWishlistItem(userId: string, productId: number): Promise<{ added: boolean; message: string }> {
    const inWishlist = await this.checkInWishlist(userId, productId);
    
    if (inWishlist) {
      await this.removeFromWishlist(userId, productId);
      return { added: false, message: 'Removed from wishlist' };
    } else {
      await this.addToWishlist(userId, productId);
      return { added: true, message: 'Added to wishlist' };
    }
  }
}

export const wishlistService = new WishlistService();

