'use client';


interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
}
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { useRouter } from 'next/navigation';
import OrdersContent from '@/components/account/orders/OrdersContent';

export default function AccountOrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/account/orders');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, user?.id]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${user?.id}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    fetchOrders(); // Refresh orders when coming back
  };

  // Check for success message from checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const orderId = params.get("orderId");
      useNotificationStore.getState().addNotification('success', `Order #${orderId} placed successfully! It will be confirmed after payment.`);
      // Remove success params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrdersContent
        orders={orders}
        onOrderSelect={handleOrderSelect}
        selectedOrder={selectedOrder}
        onBackToOrders={handleBackToOrders}
      />
    </div>
  );
}




