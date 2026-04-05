'use client';

import React, { useState } from 'react';
import { Order } from '@/types/auth';
import OrderDetails from './OrderDetails';
import OrderReceipt from '../receipts/OrderReceipt';

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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Transfer Details</h3>
              <button
                onClick={() => setPaymentOrder(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order #{paymentOrder.id}</p>
                <p className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400">
                  ₦{paymentOrder.total.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Please transfer the exact amount to complete your order
                </p>
              </div>

              {/* Bank Account 1 - Main Account */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Main Account</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bank Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">First Bank of Nigeria</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Name:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">Power Afric Solutions Ltd</span>
                      <button
                        onClick={() => copyToClipboard('Power Afric Solutions Ltd', 'accountName')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Copy account name"
                      >
                        {copiedField === 'accountName' ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-gray-900 dark:text-white">0123456789</span>
                      <button
                        onClick={() => copyToClipboard('0123456789', 'accountNumber1')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Copy account number"
                      >
                        {copiedField === 'accountNumber1' ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Account 2 - Secondary Account */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Secondary Account</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bank Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">GTBank Plc</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Name:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">Power Afric Solutions Ltd</span>
                      <button
                        onClick={() => copyToClipboard('Power Afric Solutions Ltd', 'accountName2')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Copy account name"
                      >
                        {copiedField === 'accountName2' ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-gray-900 dark:text-white">0123456790</span>
                      <button
                        onClick={() => copyToClipboard('0123456790', 'accountNumber2')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Copy account number"
                      >
                        {copiedField === 'accountNumber2' ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment Instructions
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
                  <li>Make a transfer to either of the accounts above</li>
                  <li>Use your order number <span className="font-mono font-medium">#{paymentOrder.id}</span> as payment reference</li>
                  <li>After payment, click "I've Paid" below to notify us</li>
                  <li>Your order will be confirmed within 30 minutes</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    alert('Payment notification sent! We will confirm your payment shortly.');
                    setPaymentOrder(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:from-[#0f1a66] hover:to-[#2e8b47] transition-all font-medium"
                >
                  I've Made Payment
                </button>
                <button
                  onClick={() => setPaymentOrder(null)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Contact Support */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-500">
                Need help? Contact us on WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no orders
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
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
            ₦{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
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
  onMakePayment?: () => void;
}> = ({ order, onViewDetails, onDownloadReceipt, onMakePayment }) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleWhatsAppChat = () => {
    const companyPhoneNumber = '+2348033666041';
    
    // Safe check for items
    const orderItems = order.items && Array.isArray(order.items) ? order.items : [];
    
    const itemsList = orderItems.length > 0 
      ? orderItems.map((item: any) =>
          `• ${item.quantity}x ${item.title} - ${formatCurrency(item.price)} each (Total: ${formatCurrency(item.price * item.quantity)})`
        ).join('\n')
      : 'No items available';

    // Format delivery address
    let deliveryAddressText = 'No shipping address provided';
    if (order.shippingAddress) {
      const addr = order.shippingAddress;
      const addressParts = [
        addr.name,
        addr.street,
        addr.city,
        addr.state,
        addr.country,
        addr.phone ? `Phone: ${addr.phone}` : null
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

  // Format shipping display - safe check for items
  const shippingDisplay = order.shippingAddress 
    ? `${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""}`.replace(/^, |, $/g, "") || order.shippingAddress.street || "Address provided" 
    : "No address provided";

  // Safe check for items length
  const orderItems = order.items && Array.isArray(order.items) ? order.items : [];
  const itemsCount = orderItems.length;

  // Check if receipt should be available (confirmed, shipped, or delivered)
  const showReceipt = order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered';

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300">
      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <div className="flex items-center space-x-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Order #{order.id}
            </h4>
            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
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

      {/* Order Items Preview - Only show if there are items */}
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 gap-3">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Shipping to: {shippingDisplay}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 text-sm font-medium text-[#1a2a8a] dark:text-green-400 hover:text-[#0f1a66] dark:hover:text-green-300 border border-[#1a2a8a] dark:border-green-400 rounded-lg transition-colors"
          >
            View Details
          </button>
          
          {/* Download Receipt - Only for confirmed/shipped/delivered orders */}
          {showReceipt && (
            <button
              onClick={onDownloadReceipt}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
            >
              Download Receipt
            </button>
          )}

          {/* Make Payment Button - Only for pending orders */}
          {order.status === 'pending' && onMakePayment && (
            <button
              onClick={onMakePayment}
              className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Make Payment
            </button>
          )}

          {/* Talk to Agent Button */}
          <button
            onClick={handleWhatsAppChat}
            className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center"
            title="Discuss this order with our team"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.121 1.521 5.861L.53 23.22c-.092.361.222.675.583.583l5.36-1.002C8.08 23.657 9.994 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.935 0-3.78-.525-5.36-1.44l-3.84.72.72-3.84C2.525 15.78 2 13.935 2 12 2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
            </svg>
            Talk to Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersContent;
