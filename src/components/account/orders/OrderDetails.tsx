'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { Order } from '@/types/auth';
import { formatCurrency } from '@/utils';
import OrderAccessoriesSummary from './OrderAccessoriesSummary';
import { 
  ArrowLeft, 
  Package, 
  Wrench, 
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  DollarSign,
  Edit
} from 'lucide-react';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack }) => {
  const router = useRouter();
  const { startEditingOrder } = useCartStore();
  const { addNotification } = useNotificationStore();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Separate items by type from normalized order or fallbacks
  const products: any[] = (
    Array.isArray((order as any).products) && (order as any).products.length > 0
      ? (order as any).products
      : (order.items || []).filter((item: any) => item.type === 'product' || (!item.type && !item.serviceId && !item.accessoryId))
  );

  const rawServices: any[] = (
    Array.isArray((order as any).services) && (order as any).services.length > 0
      ? (order as any).services
      : (order.items || []).filter((item: any) => item.type === 'service' || item.serviceId != null)
  );

  const services: any[] = [...rawServices];
  if (
    services.length === 0 &&
    (order.hasService || Number(order.servicePrice || 0) > 0) &&
    (order.serviceName || order.serviceId)
  ) {
    services.push({
      productId: order.serviceId ? Number(order.serviceId) : 0,
      serviceId: order.serviceId ? Number(order.serviceId) : 0,
      title: order.serviceName || 'Installation Service',
      name: order.serviceName || 'Installation Service',
      price: Number(order.servicePrice || 0),
      quantity: 1,
      type: 'service'
    });
  }

  const accessories = order.accessories || [];

  // Calculate totals - same unified model
  const productTotal = (order as any).productTotal != null
    ? Number((order as any).productTotal)
    : products.reduce((sum: number, item: any) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

  const accessoryTotal = (order as any).accessoryTotal != null
    ? Number((order as any).accessoryTotal)
    : accessories.reduce((sum: number, a: any) => sum + Number(a.total_price != null ? a.total_price : (Number(a.unit_price || a.price || 0) * Number(a.quantity || 1))), 0);

  const serviceTotal = (order as any).serviceTotal != null
    ? Number((order as any).serviceTotal)
    : services.reduce((sum: number, s: any) => sum + (Number(s.price || 0) * Number(s.quantity || 1)), 0);

  const shipping = Number(order.shipping || 0);
  const tax = Number(order.tax || 0);
  const grandTotal = productTotal + accessoryTotal + serviceTotal + shipping + tax;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order #{order.orderNumber || order.id}</h3>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
          </span>
        </div>

        {order.status === 'pending' && order.paymentStatus !== 'paid' && (
          <button
            onClick={() => {
              startEditingOrder(order);
              addNotification('info', `Order #${order.orderNumber || order.id} loaded into cart for editing.`);
              router.push('/cart');
            }}
            className="px-4 py-2 text-sm font-medium bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm hover:shadow-md self-start sm:self-auto"
            title="Edit this pending order"
          >
            <Edit className="w-4 h-4" />
            Edit Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1a2a8a] dark:text-green-400" />
              Order Items
            </h4>
            {products.length === 0 && services.length === 0 && accessories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No items in this order</p>
            ) : (
              <>
                {/* Products */}
                {products.map((item: any, index: number) => (
                  <div key={item.id || index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
                    <img
                      src={item.image || '/placeholder-image.png'}
                      alt={item.title || 'Product'}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.title || item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(Number(item.price))} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(Number(item.price) * Number(item.quantity))}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Services */}
                {services.map((serviceItem: any, index: number) => (
                  <div key={serviceItem.id || serviceItem.serviceId || index} className="flex items-center gap-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-2xl">
                      <Wrench className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{serviceItem.title || serviceItem.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Installation Service {Number(serviceItem.quantity || 1) > 1 ? `• ${formatCurrency(Number(serviceItem.price))} × ${serviceItem.quantity}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(Number(serviceItem.price) * Number(serviceItem.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Accessories */}
                {accessories.length > 0 && (
                  <OrderAccessoriesSummary
                    accessories={accessories.map((a: any) => ({
        id: a.id,
        name: a.name || a.title || '',
        quantity: a.quantity || 1,
        unit_price: a.unit_price || a.price || 0,
        total_price: a.total_price || (a.price * a.quantity) || 0,
        unit: a.unit || 'piece',
        image: a.image || ''
      }))}
                    className="mt-4"
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#1a2a8a] dark:text-green-400" />
              Order Summary
            </h4>
            <div className="space-y-3">
              {productTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Products</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(productTotal)}</span>
                </div>
              )}
              {serviceTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Service</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(serviceTotal)}</span>
                </div>
              )}
              {accessoryTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Accessories</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(accessoryTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(Number(order.shipping) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Tax</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(Number(order.tax) || 0)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-[#1a2a8a] dark:text-green-400">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#1a2a8a] dark:text-green-400" />
                Shipping Address
              </h4>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress.name || order.customerName}</p>
                <p className="text-gray-500 dark:text-gray-400">{order.shippingAddress.street}</p>
                <p className="text-gray-500 dark:text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {order.shippingAddress.phone || order.customerPhone}
                </p>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1a2a8a] dark:text-green-400" />
              Customer
            </h4>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                <User className="w-3 h-3" />
                {order.customerName}
              </p>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {order.customerEmail}
              </p>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {order.customerPhone}
              </p>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Order placed: {formatDate(order.createdAt)}
              </p>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                Payment: {order.paymentMethod}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;