'use client';

import React, { useEffect, useRef } from 'react';
import { Order } from '@/types/auth';
import QRCode from 'qrcode';
import { formatCurrency } from '@/utils';

interface OrderInvoiceProps {
  order: Order;
  onClose: () => void;
}

const OrderInvoice: React.FC<OrderInvoiceProps> = ({ order, onClose }) => {
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (!hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      generateInvoice();
    }
  }, []);

  const generateInvoice = async () => {
    try {
      // Generate invoice number (different format from receipt)
      const date = new Date(order.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const invoiceNumber = `PAE/INV/${year}${month}${day}-${random}`;

      // Get customer information
      const customerName = order.customerName || order.shippingAddress?.name || 'Walk-in Customer';
      const customerPhone = order.customerPhone || order.shippingAddress?.phone || 'N/A';
      const customerEmail = order.customerEmail || '';

      // Format address
      let deliveryAddress = 'No address provided';
      if (order.shippingAddress) {
        const addr = order.shippingAddress;
        deliveryAddress = [
          addr.street,
          addr.city,
          addr.state,
          addr.country
        ].filter(Boolean).join(', ');
        if (addr.phone) deliveryAddress += `\nPhone: ${addr.phone}`;
      }

      // Generate QR Code for invoice verification
      let qrCodeUrl = '';
      try {
        const verificationData = {
          invoiceNo: invoiceNumber,
          orderId: order.id,
          total: order.total,
          customer: customerName,
          date: new Date().toISOString()
        };
        qrCodeUrl = await QRCode.toDataURL(JSON.stringify(verificationData), {
          width: 100,
          margin: 1,
        });
      } catch (err) {
        console.error('Error generating QR code:', err);
      }

      // Calculate tax (assuming 7.5% VAT for Nigeria)
      const vatRate = 0.075;
      const subtotal = order.subtotal || (order.total / (1 + vatRate));
      const vatAmount = order.total - subtotal;

      // Create invoice HTML
      const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Power Afric Invoice - ${invoiceNumber}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      margin: 0; padding: 20px; background: #e5e7eb;
      font-family: Arial, sans-serif;
      display: flex; flex-direction: column; align-items: center;
    }
    .a4 {
      width: 210mm; min-height: 297mm; position: relative;
      margin: 0 auto; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .logo-pattern {
      position: absolute; inset: 0;
      background-image: url("https://res.cloudinary.com/djkudkxmx/image/upload/v1762182244/logo-blue_yns0bj.png");
      background-size: 50px auto; background-repeat: repeat; opacity: 0.08;
    }
    .inner-paper-wrapper {
      position: absolute; width: 94%; height: 96%; top: 2%; left: 3%;
      border-radius: 16px; background: linear-gradient(to right, #07A500, #3E4095);
      padding: 6px;
    }
    .inner-paper {
      width: 100%; height: 100%; border-radius: 12px; background: white;
      padding: 1.5rem; box-sizing: border-box; overflow-y: auto;
    }
    .company-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .company-title { font-size: 20px; font-weight: bold; color: #1a2a8a; }
    .company-address { font-size: 10px; color: #4b5563; }
    .invoice-title {
      background: linear-gradient(to right, #07A500, #3E4095);
      color: white; font-weight: bold; padding: 0.25rem 1.5rem;
      border-radius: 4px; font-size: 16px; display: inline-block;
    }
    .info-row { display: flex; margin-bottom: 0.25rem; font-size: 12px; }
    .info-label { font-weight: bold; width: 70px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5rem 0; }
    th, td { border: 1px solid #d1d5db; padding: 0.3rem; text-align: left; }
    th { background: #f3f4f6; }
    .total-row { font-weight: bold; font-size: 13px; }
    .grand-total { color: #1a2a8a; font-size: 16px; }
    .footer { margin-top: 1rem; text-align: center; font-size: 9px; color: #6b7280; }
    .qr-section { display: flex; justify-content: flex-end; margin-top: 1rem; }
    .no-print { text-align: center; margin-top: 20px; }
    .payment-info { margin-top: 1rem; padding: 0.5rem; background: #f8f9fa; border-radius: 8px; font-size: 10px; }
    .terms { margin-top: 1rem; font-size: 9px; color: #6b7280; border-top: 1px dashed #d1d5db; padding-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="no-print">
  </div>

  <div class="a4">
    <div class="logo-pattern"></div>
    <div class="inner-paper-wrapper">
      <div class="inner-paper">

        <!-- Company Header -->
        <div class="company-header">
          <img src="https://res.cloudinary.com/djkudkxmx/image/upload/v1762182244/logo-blue_yns0bj.png" alt="Logo" style="width: 60px;">
          <div>
            <div class="company-title">POWER AFRIC ENERGY SERVICES LTD</div>
            <div class="company-address">B3&B4 Khalil Rahman Complex, GRA, Katsina</div>
            <div class="company-address">08033666041 • 08100360057 • sales@powerafric.ng</div>
            <div class="company-address">RC: 1234567 • VAT: 23456789-001</div>
          </div>
        </div>

        <!-- Invoice Title -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 1rem 0;">
          <div class="invoice-title">TAX INVOICE</div>
          <div style="text-align: right;">
            <div style="font-weight: 600; font-size: 11px;">Invoice No: ${invoiceNumber}</div>
            <div style="font-size: 10px;">Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <!-- Customer & Order Info -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
          <div style="width: 60%;">
            <div style="font-weight: bold; margin-bottom: 0.25rem;">Bill To:</div>
            <div style="font-size: 11px;">${customerName}</div>
            <div style="font-size: 11px;">${deliveryAddress}</div>
            <div style="font-size: 11px;">Phone: ${customerPhone}</div>
            ${customerEmail ? `<div style="font-size: 11px;">Email: ${customerEmail}</div>` : ''}
          </div>
          <div style="width: 35%;">
            <div style="font-weight: bold; margin-bottom: 0.25rem;">Order Details:</div>
            <div style="font-size: 11px;">Order ID: #${order.id}</div>
            <div style="font-size: 11px;">Order Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
            <div style="font-size: 11px;">Payment Method: ${order.paymentMethod || 'Bank Transfer'}</div>
            <div style="font-size: 11px;">Order Status: ${order.status?.toUpperCase() || 'PENDING'}</div>
          </div>
        </div>

        <!-- Items Table -->
         <table>
          <thead>
            <tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price (₦)</th><th>Total (₦)</th></tr>
          </thead>
          <tbody>
            ${order.items.map((item: any, idx: number) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td>${item.title}${item.type === 'service' ? ' <span style="font-size:9px;">(Installation Service)</span>' : ''}<br><span style="font-size:9px; color:#666;">${item.brand || 'Solar Product'}</span></td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${formatCurrency(item.price)}</td>
                <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
               </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr><td colspan="4" style="text-align: right; font-weight: bold;">Subtotal:</td><td style="text-align: right;">${formatCurrency(subtotal)}</td></tr>
            <tr><td colspan="4" style="text-align: right;">VAT (7.5%):</td><td style="text-align: right;">${formatCurrency(vatAmount)}</td></tr>
            <tr class="total-row"><td colspan="4" style="text-align: right;">TOTAL AMOUNT DUE:</td><td class="grand-total" style="text-align: right;">${formatCurrency(order.total)}</td></tr>
          </tfoot>
         </table>

        <!-- Payment Information -->
        <div class="payment-info">
          <div style="font-weight: bold; margin-bottom: 0.25rem;">Payment Instructions:</div>
          <div>Bank: GTBank Plc.</div>
          <div>Account Name: Power Afric Energy Serv. LTD</div>
          <div>Account Number: 0500647890</div>
          <div style="margin-top: 0.25rem; font-size: 9px;">Please use Invoice No: ${invoiceNumber} as payment reference</div>
        </div>

        <!-- QR Code -->
        ${qrCodeUrl ? `
          <div class="qr-section">
            <div style="text-align: center;">
              <img src="${qrCodeUrl}" style="width: 70px; height: 70px;">
              <div style="font-size: 8px;">Scan to verify invoice</div>
            </div>
          </div>
        ` : ''}

        <!-- Terms & Footer -->

        <div class="terms">
          <strong>Terms & Conditions:</strong><br>
            * Full payment is required before order processing or delivery.<br>
            * Prices and product availability may change without notice.<br>
            * Delivery timelines depend on location and stock availability.<br>
            * Products are covered by manufacturer warranty terms.<br>
            * Returns are only accepted for defective or incorrect items reported within 48 hours of delivery.<br>
            * Installed, customized, or used products are non-returnable.<br>
            * Power Afric is not liable for damages caused by misuse, overload, unstable power, or unauthorized modifications.<br>
            * Customers are responsible for providing accurate delivery and order information.<br>
            * Orders are processed only after payment confirmation.<br>
        </div>

        <div class="footer">
          Thank you for choosing Power Afric Energy Services Ltd - Your trusted energy companion.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      // Open in new tab
      const invoiceWindow = window.open('', '_blank');
      if (invoiceWindow) {
        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();
        invoiceWindow.focus();
      } else {
        alert('Please allow pop-ups to view the invoice');
      }

      onClose();
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2a8a] mx-auto mb-2"></div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Generating Invoice</h3>
        <p className="text-xs text-gray-600 mb-2">Please wait...</p>
      </div>
    </div>
  );
};

export default OrderInvoice;

