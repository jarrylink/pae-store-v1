'use client';

import React from 'react';
import { Order } from '@/types/auth';

interface OrderReceiptProps {
  order: Order;
  onClose: () => void;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ order, onClose }) => {
    const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const downloadPDF = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll create a printable version
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - Order ${order.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              color: #1a2a8a;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #1a2a8a; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              color: #1a2a8a; 
              margin-bottom: 10px;
            }
            .subtitle { 
              color: #40b553; 
              font-size: 16px;
            }
            .section { 
              margin-bottom: 20px; 
            }
            .section-title { 
              font-weight: bold; 
              border-bottom: 1px solid #ccc; 
              padding-bottom: 5px; 
              margin-bottom: 10px;
            }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px;
            }
            .total { 
              font-weight: bold; 
              font-size: 18px; 
              border-top: 2px solid #1a2a8a; 
              padding-top: 10px;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              color: #666; 
              font-size: 12px;
            }
            .security { 
              background: #f5f5f5; 
              padding: 15px; 
              margin: 20px 0; 
              border-left: 4px solid #40b553;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">POWER AFRIC STORE</div>
            <div class="subtitle">Nigeria's Solar Energy Leader</div>
            <div>OFFICIAL RECEIPT</div>
          </div>
          
          <div class="section">
            <div class="section-title">Order Information</div>
            <div class="item">
              <span>Order ID:</span>
              <span>${order.id}</span>
            </div>
            <div class="item">
              <span>Date:</span>
              <span>${formatDate(order.createdAt)}</span>
            </div>
            <div class="item">
              <span>Status:</span>
              <span>${order.status.toUpperCase()}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Items</div>
            ${order.items.map(item => `
              <div class="item">
                <span>${item.title} (Qty: ${item.quantity})</span>
                <span>₦${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="section-title">Payment Summary</div>
            <div class="item">
              <span>Subtotal:</span>
              <span>₦${order.total.toLocaleString()}</span>
            </div>
            <div class="item">
              <span>Shipping:</span>
              <span>₦0</span>
            </div>
            <div class="item">
              <span>Tax:</span>
              <span>₦0</span>
            </div>
            <div class="item total">
              <span>TOTAL:</span>
              <span>₦${order.total.toLocaleString()}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Payment Method</div>
            <div>${order.paymentMethod}</div>
          </div>

          <div class="security">
            <strong>Security Reference:</strong> REF-${order.id}-${Math.random().toString(36).substr(2, 9).toUpperCase()}
            <br>
            <small>Keep this receipt for your records and warranty claims</small>
          </div>

          <div class="footer">
            Thank you for choosing Power Afric Store!<br>
            For inquiries: support@powerafric.com | +234 801 234 5678<br>
            www.powerafricstore.com
          </div>
        </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">POWER AFRIC STORE</h2>
              <p className="text-blue-100">Official Receipt</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-600">Order ID</p>
              <p className="text-gray-900">{order.id}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Date</p>
              <p className="text-gray-900">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Status</p>
              <p className="text-gray-900 capitalize">{order.status}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Payment Method</p>
              <p className="text-gray-900">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity} × ₦{item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-semibold text-[#1a2a8a]">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₦{order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">₦0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">₦0</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-gray-900">TOTAL</span>
                <span className="text-[#1a2a8a]">₦{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Security Reference */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="font-semibold text-yellow-800 mb-2">Security Reference</p>
            <p className="text-yellow-700 text-sm font-mono">
              REF-{order.id}-{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
            <p className="text-yellow-600 text-xs mt-2">
              Keep this reference for warranty claims and customer support
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-gray-500 mb-2">QR Code</div>
            <div className="bg-gray-200 w-32 h-32 mx-auto flex items-center justify-center rounded">
              <span className="text-gray-500 text-xs">Scan for verification</span>
            </div>
            <p className="text-gray-600 text-xs mt-2">Scan to verify receipt authenticity</p>
          </div>
        </div>

        {/* Receipt Actions */}
        <div className="flex space-x-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={downloadPDF}
            className="flex-1 bg-[#1a2a8a] hover:bg-[#0f1a66] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;



