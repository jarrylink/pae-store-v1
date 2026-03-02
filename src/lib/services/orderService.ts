import { Order } from '@/types/auth';

const API_BASE = '/api/orders';

export interface OrderFilters {
  userId?: string;
  status?: Order['status'];
  limit?: number;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  total: number;
  stats?: any;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  byStatus: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

class OrderService {
  // Get all orders with optional filters
  async getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();

    if (filters.userId) params.append('userId', filters.userId);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }

  // Get orders for a specific user (convenience method)
  async getUserOrders(userId: string): Promise<Order[]> {
    const response = await this.getOrders({ userId });
    return response.data;
  }

  // Get recent orders
  async getRecentOrders(limit: number = 5): Promise<OrdersResponse> {
    return this.getOrders({ limit });
  }

  // Get order statistics
  async getOrderStats(): Promise<OrderStats> {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch order statistics');
    }

    const data = await response.json();
    return data.data;
  }

  // Get order by ID
  async getOrderById(id: number): Promise<Order> {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const data = await response.json();
    return data.data;
  }

  // Update order status
  async updateOrderStatus(id: number, status: Order['status'], trackingNumber?: string): Promise<Order> {
    const response = await fetch(`${API_BASE}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, trackingNumber })
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    const data = await response.json();
    return data.data;
  }

  // Create a new order
  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const data = await response.json();
    return data.data;
  }
}

export const orderService = new OrderService();
