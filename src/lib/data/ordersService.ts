import { Order, OrderItem } from '@/types/auth';

const API_BASE = '/api/orders';

export interface CreateOrderData {
  userId: string;
  items: Array<{
    productId: number;
    name: string;
    title: string;
    brand?: string;
    spec?: string;
    capacity?: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress?: any;
  billingAddress?: any;
  paymentMethod?: string;
  notes?: string;
  status: 'saved' | 'pending' | 'pending_agent';
}

class OrdersService {
  // Create a new order (for both checkout and save-for-agent)
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return await response.json();
  }

  // Get orders for a specific user
  async getUserOrders(userId: string): Promise<Order[]> {
    const response = await fetch(`${API_BASE}?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user orders');
    }

    return await response.json();
  }

  // Get all orders (for admin)
  async getAllOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE}/all`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch all orders');
    }

    return await response.json();
  }

  // Update order status (for admin)
  async updateOrderStatus(orderId: number, status: Order['status'], notes?: string): Promise<Order> {
    const response = await fetch(`${API_BASE}/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    return await response.json();
  }

  // Convert pending_agent order to paid order
  async confirmAgentOrder(orderId: number, paymentData: any): Promise<Order> {
    const response = await fetch(`${API_BASE}/${orderId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error('Failed to confirm agent order');
    }

    return await response.json();
  }

  // Generate order number
  generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `PA-${year}${month}${day}-${random}`;
  }
}

export const ordersService = new OrdersService();
