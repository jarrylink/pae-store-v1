const API_BASE = '/api/wishlist';

export interface WishlistItem {
  id: string;
  productId: number;
  addedAt: string;
  title?: string;
  price?: number;
  image?: string;
  inStock?: boolean;
}

export interface WishlistResponse {
  success: boolean;
  data: {
    userId: string;
    items: WishlistItem[];
  };
  count?: number;
  message?: string;
}

class WishlistService {
  private pendingRequests: Map<string, Promise<any>> = new Map();

  // Get user wishlist
  async getWishlist(userId: string): Promise<WishlistResponse> {
    const response = await fetch(`${API_BASE}?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch wishlist');
    }
    return response.json();
  }

  // Add item to wishlist with deduplication
  async addToWishlist(userId: string, productId: number): Promise<WishlistResponse> {
    const key = `add_${userId}_${productId}`;
    
    // Prevent duplicate requests
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }
    
    const promise = fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId }),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to wishlist');
      }
      return response.json();
    }).finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Remove item from wishlist with deduplication
  async removeFromWishlist(userId: string, productId: number): Promise<{ success: boolean; message?: string }> {
    const key = `remove_${userId}_${productId}`;
    
    // Prevent duplicate requests
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }
    
    const promise = fetch(`${API_BASE}?userId=${userId}&productId=${productId}`, {
      method: 'DELETE',
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove from wishlist');
      }
      return response.json();
    }).finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Check if product is in wishlist
  async checkInWishlist(userId: string, productId: number): Promise<boolean> {
    const wishlist = await this.getWishlist(userId);
    return wishlist.data?.items?.some(item => item.productId === productId) || false;
  }
}

export const wishlistService = new WishlistService();
