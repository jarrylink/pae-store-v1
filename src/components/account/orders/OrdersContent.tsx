'use client';

import React, { useState } from 'react';
import { Order } from '@/types/auth';
import { formatCurrency } from '@/utils';
import OrderDetails from './OrderDetails';
import OrderReceipt from '../receipts/OrderReceipt';
import OrderInvoice from '../receipts/OrderInvoice';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  ShoppingBag,
  Download,
  FileText,
  MessageCircle,
  Plus,
  Home,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  AlertCircle,
  DollarSign,
  Edit
} from 'lucide-react';

interface OrdersContentProps {
  orders: Order[];
  onOrderSelect: (orderId: string) => void;
  selectedOrder: string | null;
  onBackToOrders: () => void;
}

const OrdersContent: React.FC<OrdersContentProps> = ({
  orders,
  onOrderSelect,
  selectedOrder,
  onBackToOrders
}) => {
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (receiptOrder) {
    return (
      <OrderReceipt
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    );
  }

  if (invoiceOrder) {
    return (
      <OrderInvoice
        order={invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
    );
  }

  if (selectedOrder) {
    const order = orders.find(o => o.id === Number(selectedOrder));
    if (!order) return null;

    return (
      <OrderDetails
        order={order}
        onBack={onBackToOrders}
      />
    );
  }

  // Payment Modal
  if (paymentOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Payment</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Order #{paymentOrder.id}</p>
              </div>
              <button
                onClick={() => setPaymentOrder(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close"
              >
                <XCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Amount */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount to Pay</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(paymentOrder.total)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#1a2a8a] dark:text-green-400" />
                Transfer to Account
              </h4>
              
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bank</span>
                  <span className="font-medium text-gray-900 dark:text-white">GTBank Plc.</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Account Name</span>
                  <span className="font-medium text-gray-900 dark:text-white">Power Afric Energy Serv. LTD</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-[#1a2a8a] dark:text-green-400">0500647890</span>
                    <button
                      onClick={() => copyToClipboard('0500647890', 'accountNumber')}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Copy account number"
                    >
                      {copiedField === 'accountNumber' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Payment Instructions</h5>
                  <ul className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 dark:text-yellow-400">•</span>
                      <span>Transfer the exact amount to the account above</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 dark:text-yellow-400">•</span>
                      <span>Use your order number <span className="font-mono font-medium text-gray-900 dark:text-white">#{paymentOrder.id}</span> as reference</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 dark:text-yellow-400">•</span>
                      <span>Click <strong>"I've Made Payment"</strong> after transfer</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  alert('Payment notification sent! We will confirm your payment shortly.');
                  setPaymentOrder(null);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Check className="w-5 h-5" />
                I've Made Payment
              </button>
              <button
                onClick={() => setPaymentOrder(null)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              Need help? Contact us on WhatsApp
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no orders
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Start shopping to place your first order!</p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Order History</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all your solar energy purchases</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
          <p className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400">
            {formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetails={() => onOrderSelect(String(order.id))}
            onDownloadReceipt={() => setReceiptOrder(order)}
            onGenerateInvoice={() => setInvoiceOrder(order)}
            onMakePayment={() => setPaymentOrder(order)}
          />
        ))}
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard: React.FC<{
  order: Order;
  onViewDetails: () => void;
  onDownloadReceipt: () => void;
  onGenerateInvoice: () => void;
  onMakePayment?: () => void;
}> = ({ order, onViewDetails, onDownloadReceipt, onGenerateInvoice, onMakePayment }) => {
  const router = useRouter();
  const { startEditingOrder } = useCartStore();
  const { addNotification } = useNotificationStore();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusProgress = (status: string) => {
    const steps: Record<string, number> = {
      pending: 1,
      confirmed: 2,
      shipped: 3,
      delivered: 4,
      cancelled: 0
    };
    return steps[status] || 0;
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleWhatsAppChat = () => {
    const companyPhoneNumber = '+2348033666041';

    const orderItems = [
      ...(Array.isArray((order as any).products) ? (order as any).products : (order.items || [])),
      ...(Array.isArray((order as any).services) ? (order as any).services : [])
    ];

    const itemsList = orderItems.length > 0
      ? orderItems.map((item: any) =>
          `• ${item.quantity}x ${item.title || item.name} - ${formatCurrency(item.price)} each (Total: ${formatCurrency(item.price * item.quantity)})`
        ).join('\n')
      : 'No items available';

    let deliveryAddressText = 'No shipping address provided';
    if (order.shippingAddress) {
      const addr = order.shippingAddress;
      const addressParts = [
        addr.name,
        addr.street,
        addr.city,
        addr.state,
        addr.country
      ].filter(Boolean);
      deliveryAddressText = addressParts.join('\n');
    }

    const message = `*New Order Inquiry - Order #${order.id}*

*Customer Details:*
Name: ${order.customerName || 'N/A'}
Email: ${order.customerEmail || 'N/A'}
Phone: ${order.customerPhone || 'N/A'}
Order Date: ${formatDate(order.createdAt)}
Order Status: ${order.status.toUpperCase()}
Payment Method: ${order.paymentMethod}
Payment Status: ${order.paymentStatus}

*Items Ordered:*
${itemsList}

*Order Summary:*
Subtotal: ${formatCurrency(order.subtotal)}
Shipping: ${formatCurrency(order.shipping)}
Tax: ${formatCurrency(order.tax)}
*Total: ${formatCurrency(order.total)}*

*Delivery Address:*
${deliveryAddressText}

I would like to discuss payment and delivery options for this order.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${companyPhoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const shippingDisplay = order.shippingAddress
    ? `${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""}`.replace(/^, |, $/g, "") || order.shippingAddress.street || "Address provided"
    : "No address provided";

  const orderItems = [
    ...(Array.isArray((order as any).products) ? (order as any).products : (order.items || [])),
    ...(Array.isArray((order as any).services) ? (order as any).services : [])
  ];
  const itemsCount = orderItems.length + (order.accessories?.length || 0);
  const showReceipt = order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered';

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <div className="flex items-center space-x-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Order #{order.id}
            </h4>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Placed on {formatDate(order.createdAt)} • {itemsCount} item{itemsCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="mt-2 md:mt-0 text-right">
          <p className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400">
            {formatCurrency(order.total)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {order.paymentMethod}
          </p>
        </div>
      </div>

      {/* Order Progress */}
      {order.status !== 'cancelled' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
            {['Order Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, index) => (
              <div key={step} className={getStatusProgress(order.status) > index ? 'text-[#1a2a8a] dark:text-green-400 font-medium' : ''}>
                {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#1a2a8a] to-[#40b553] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getStatusProgress(order.status) / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Order Items Preview */}
      {itemsCount > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex items-center space-x-4">
            {orderItems.slice(0, 3).map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <img
                  src={item.image || "/placeholder-image.png"}
                  alt={item.title || "Product image"}
                  className="w-12 h-12 object-cover rounded-lg"
                  onError={(e) => { e.currentTarget.src = "/placeholder-image.png"; }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {item.quantity}
                  </p>
                </div>
                {index < 2 && orderItems.length > 1 && (
                  <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                )}
              </div>
            ))}
            {orderItems.length > 3 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                +{orderItems.length - 3} more items
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 gap-3">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">Shipping to: {shippingDisplay}</span>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 text-sm font-medium text-[#1a2a8a] dark:text-green-400 hover:text-[#0f1a66] dark:hover:text-green-300 border border-[#1a2a8a] dark:border-green-400 rounded-lg transition-colors"
          >
            View Details
          </button>

          <button
            onClick={onGenerateInvoice}
            className="px-4 py-2 text-sm font-medium text-[#1a2a8a] dark:text-green-400 hover:text-[#0f1a66] dark:hover:text-green-300 border border-[#1a2a8a] dark:border-green-400 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            Invoice
          </button>

          {showReceipt && (
            <button
              onClick={onDownloadReceipt}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Receipt
            </button>
          )}

          {order.status === 'pending' && order.paymentStatus !== 'paid' && (
            <button
              onClick={() => {
                startEditingOrder(order);
                addNotification('info', `Order #${order.orderNumber || order.id} loaded into cart for editing.`);
                router.push('/cart');
              }}
              className="px-4 py-2 text-sm font-medium bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm hover:shadow-md"
              title="Edit this pending order"
            >
              <Edit className="w-4 h-4" />
              Edit Order
            </button>
          )}

          {order.status === 'pending' && (
            <button
              onClick={() => window.location.href = `/installation-accessories?orderId=${order.id}`}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:from-[#0f1a66] hover:to-[#2e8b47] transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Accessories
            </button>
          )}

          {order.status === 'pending' && onMakePayment && (
            <button
              onClick={onMakePayment}
              className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              Pay Now
            </button>
          )}

          <button
            onClick={handleWhatsAppChat}
            className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
            title="Discuss this order with our team"
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersContent;