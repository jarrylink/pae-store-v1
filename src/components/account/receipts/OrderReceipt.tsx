'use client';

import React, { useEffect, useRef } from 'react';
import { Order } from '@/types/auth';
import QRCode from 'qrcode';
import { formatCurrency } from '@/utils';

interface OrderReceiptProps {
  order: Order;
  onClose: () => void;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ order, onClose }) => {
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (!hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      generateReceipt();
    }
  }, []);

  const generateReceipt = async () => {
    try {
      const date = new Date(order.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const receiptNumber = `PAE/FDCR/PA-${year}${month}${day}-${random}/${year}`;

      const customerName = order.customerName || order.shippingAddress?.name || 'Walk-in Customer';
      const customerPhone = order.customerPhone || order.shippingAddress?.phone || (order as any).userPhone || (order as any).phone || 'N/A';
      const customerEmail = order.customerEmail || '';

      let deliveryAddress = 'No address provided';
      if (order.shippingAddress) {
        const addr = order.shippingAddress;
        deliveryAddress = [
          addr.street,
          addr.city,
          addr.state,
          addr.country
        ].filter(Boolean).join(', ');
      }

      // Extract normalized products, services, accessories
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
          type: 'service',
          image: '',
          lineItemId: `legacy_service_${order.id}`
        });
      }

      const orderAccessories = (order.accessories || []) as any[];
      const itemAccessories = (order.items || []).filter((item: any) => item.type === 'accessory' || item.accessoryId != null);
      const seenAccessoryIds = new Set<number>();
      const accessories: any[] = [];
      for (const a of [...orderAccessories, ...itemAccessories]) {
        const accId = Number(a.accessoryId || a.id || 0);
        if (accId > 0 && seenAccessoryIds.has(accId)) {
          continue;
        }
        if (accId > 0) seenAccessoryIds.add(accId);
        accessories.push(a);
      }

      const productsTotal = (order as any).productTotal != null
        ? Number((order as any).productTotal)
        : products.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

      const accessoriesTotal = (order as any).accessoryTotal != null
        ? Number((order as any).accessoryTotal)
        : accessories.reduce((sum, a) => {
            const price = Number(a.unit_price ?? a.price ?? 0);
            const qty = Number(a.quantity || 1);
            return sum + (a.total_price != null ? Number(a.total_price) : price * qty);
          }, 0);

      const servicesTotal = (order as any).serviceTotal != null
        ? Number((order as any).serviceTotal)
        : services.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

      const shipping = Number(order.shipping || 0);
      const tax = Number(order.tax || 0);
      const subtotal = productsTotal + accessoriesTotal + servicesTotal;
      const grandTotal = subtotal + shipping + tax;

      // Generate QR Code
      let qrCodeUrl = '';
      try {
        const verificationData = {
          receiptNo: receiptNumber,
          orderId: order.id,
          total: grandTotal,
          customer: customerName
        };
        qrCodeUrl = await QRCode.toDataURL(JSON.stringify(verificationData), {
          width: 180,
          margin: 2,
        });
      } catch (err) {
        console.error('Error generating QR code:', err);
      }

      const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Power Afric Receipt - ${receiptNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    @page { 
      size: A4; 
      margin: 0;
    }
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    body {
      margin: 0; 
      padding: 20px; 
      background: #f0f2f5;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex; 
      flex-direction: column; 
      align-items: center;
    }
    .a4 {
      width: 210mm; 
      min-height: 297mm; 
      position: relative;
      margin: 0 auto; 
      background: white; 
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      border-radius: 4px;
      overflow: hidden;
    }
    .logo-pattern {
      position: absolute; 
      inset: 0;
      background-image: url("https://res.cloudinary.com/djkudkxmx/image/upload/v1762182244/logo-blue_yns0bj.png");
      background-size: 60px auto; 
      background-repeat: repeat; 
      opacity: 0.05;
    }
    .inner-paper-wrapper {
      position: relative;
      width: 94%; 
      min-height: 96%; 
      margin: 2% auto;
      border-radius: 12px;
      background: linear-gradient(135deg, #07A500, #3E4095);
      padding: 6px;
    }
    .inner-paper {
      width: 100%; 
      min-height: 100%; 
      border-radius: 10px; 
      background: white;
      padding: 2rem 2.5rem; 
      box-sizing: border-box; 
      display: flex; 
      flex-direction: column;
    }
    .company-header { 
      display: flex; 
      align-items: center; 
      gap: 1.2rem; 
      margin-bottom: 0.5rem; 
      border-bottom: 2px solid #f0f2f5;
      padding-bottom: 0.8rem;
    }
    .company-title {
      font-size: 22px;
      font-weight: 900;
      color: #1a2a8a;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    .company-address { 
      font-size: 10.5px; 
      color: #4b5563; 
      line-height: 1.5;
    }
    .company-contact {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }
    .receipt-title {
      background: linear-gradient(135deg, #07A500, #3E4095);
      color: white;
      font-weight: 700;
      padding: 0.35rem 2rem;
      border-radius: 6px;
      font-size: 15px;
      display: inline-block;
      letter-spacing: 1px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      font-size: 10.5px; 
      margin: 0.6rem 0; 
    }
    th, td { 
      border: 1px solid #d1d5db; 
      padding: 0.4rem 0.6rem; 
      text-align: left; 
    }
    th { 
      background: #f8f9fa; 
      font-weight: 700; 
      font-size: 9.5px; 
      text-transform: uppercase; 
      letter-spacing: 0.8px;
      color: #1f2937;
    }
    td {
      font-weight: 400;
      color: #374151;
    }
    .total-row { 
      font-weight: 700; 
      font-size: 11px; 
    }
    .grand-total { 
      color: #1a2a8a; 
      font-size: 15px; 
      font-weight: 900; 
    }
    .footer { 
      text-align: center; 
      font-size: 9px; 
      color: #6b7280; 
      border-top: 1px dashed #d1d5db; 
      padding-top: 0.8rem; 
      margin-top: 0.8rem; 
    }
    .info-row { 
      display: flex; 
      margin-bottom: 0.2rem; 
      font-size: 10.5px; 
    }
    .info-label { 
      font-weight: 600; 
      width: 80px; 
      color: #4b5563;
    }
    .info-value {
      color: #1f2937;
    }
    .customer-section {
      background: #f8fafc;
      padding: 0.8rem;
      border-radius: 8px;
      margin: 0.6rem 0;
    }
    .qr-section { 
      display: flex; 
      justify-content: flex-end; 
      margin-top: 0.8rem; 
      align-items: center;
      gap: 1rem;
    }
    .category-total {
      font-weight: 600;
      background: #f8fafc;
    }
    .category-total td:last-child {
      font-weight: 700;
    }
    .products-total td:last-child {
      color: #1a2a8a;
      font-weight: 700;
    }
    .accessories-total td:last-child {
      color: #6b7280;
      font-weight: 600;
    }
    .services-total td:last-child {
      color: #6b7280;
      font-weight: 600;
    }
    .grand-total-row td:last-child {
      color: #1a2a8a;
      font-weight: 900;
      font-size: 16px;
    }
    .grand-total-row {
      border-top: 2px solid #1a2a8a;
      background: #f0f7ff;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: 700; }
    
    @media print {
      body { 
        background: white; 
        padding: 0; 
      }
      .a4 { 
        box-shadow: none; 
        border-radius: 0; 
      }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <div class="a4">
    <div class="logo-pattern"></div>
    <div class="inner-paper-wrapper">
      <div class="inner-paper">
        <div>
          <!-- Company Header -->
          <div class="company-header">
            <img src="https://res.cloudinary.com/djkudkxmx/image/upload/v1762182244/logo-blue_yns0bj.png" alt="Power Afric Energy" style="width: 60px; height: auto;">
            <div>
              <div class="company-title">Power Afric Energy Services Ltd</div>
              <div class="company-address">B3&B4 Khalil Rahman Complex, GRA, Katsina</div>
              <div class="company-contact">08033666041 • 08100360057 • stor@powerafric.ng</div>
            </div>
          </div>

          <!-- Receipt Title -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 0.6rem 0 0.8rem 0;">
            <div class="receipt-title">Payment Receipt</div>
            <div style="text-align: right;">
              <div style="font-weight: 700; font-size: 11px; color: #1f2937;">Receipt No: ${receiptNumber}</div>
              <div style="font-size: 10px; color: #6b7280;">Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="customer-section">
            <div class="info-row"><span class="info-label">Customer:</span><span class="info-value">${customerName}</span></div>
            <div class="info-row"><span class="info-label">Address:</span><span class="info-value">${deliveryAddress}</span></div>
            <div class="info-row"><span class="info-label">Phone:</span><span class="info-value">${customerPhone}</span></div>
            ${customerEmail ? `<div class="info-row"><span class="info-label">Email:</span><span class="info-value">${customerEmail}</span></div>` : ''}
            <div class="info-row"><span class="info-label">Order ID:</span><span class="info-value">#${order.id}</span></div>
            <div class="info-row"><span class="info-label">Status:</span><span class="info-value" style="text-transform: uppercase; font-weight: 600; color: ${order.status === 'confirmed' ? '#16a34a' : '#f59e0b'};">${order.status || 'Pending'}</span></div>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th style="width: 55%;">Description</th>
                <th style="width: 12%; text-align: center;">Qty</th>
                <th style="width: 16%; text-align: right;">Unit Price</th>
                <th style="width: 17%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${products.map((item: any) => {
                const title = item.title || item.name || 'Product';
                return `
                <tr>
                  <td>${title}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(item.price)}</td>
                  <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `}).join('')}
              
              ${accessories.length > 0 ? accessories.map((acc: any) => `
                <tr>
                  <td style="padding-left: 1.5rem; color: #4b5563;">↳ ${acc.name || acc.title || 'Accessory'}</td>
                  <td style="text-align: center;">${acc.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(Number(acc.unit_price || acc.price || 0))}</td>
                  <td style="text-align: right;">${formatCurrency(Number(acc.total_price || acc.quantity * (acc.unit_price || acc.price || 0)))}</td>
                </tr>
              `).join('') : ''}

              ${services.length > 0 ? services.map((svc: any) => {
                const title = svc.title || svc.name || 'Service';
                return `
                <tr>
                  <td>${title} (Service)</td>
                  <td style="text-align: center;">${svc.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(svc.price)}</td>
                  <td style="text-align: right;">${formatCurrency(svc.price * svc.quantity)}</td>
                </tr>
              `}).join('') : ''}
            </tbody>
            <tfoot>
              <!-- Products Total -->
              <tr class="category-total products-total">
                <td colspan="3" style="text-align: right; font-weight: 700; color: #1a2a8a;">Products Total:</td>
                <td style="text-align: right; font-weight: 700; color: #1a2a8a;">${formatCurrency(productsTotal)}</td>
              </tr>
              <!-- Accessories Total -->
              ${accessoriesTotal > 0 ? `
              <tr class="category-total accessories-total">
                <td colspan="3" style="text-align: right; font-weight: 600; color: #6b7280;">Accessories Total:</td>
                <td style="text-align: right; font-weight: 600; color: #6b7280;">${formatCurrency(accessoriesTotal)}</td>
              </tr>
              ` : ''}
              <!-- Services Total -->
              ${servicesTotal > 0 ? `
              <tr class="category-total services-total">
                <td colspan="3" style="text-align: right; font-weight: 600; color: #6b7280;">Services Total:</td>
                <td style="text-align: right; font-weight: 600; color: #6b7280;">${formatCurrency(servicesTotal)}</td>
              </tr>
              ` : ''}
              <!-- Shipping -->
              ${shipping > 0 ? `
              <tr class="category-total shipping-total">
                <td colspan="3" style="text-align: right; font-weight: 600; color: #6b7280;">Shipping:</td>
                <td style="text-align: right; font-weight: 600; color: #6b7280;">${formatCurrency(shipping)}</td>
              </tr>
              ` : ''}
              <!-- Tax -->
              ${tax > 0 ? `
              <tr class="category-total tax-total">
                <td colspan="3" style="text-align: right; font-weight: 600; color: #6b7280;">Tax:</td>
                <td style="text-align: right; font-weight: 600; color: #6b7280;">${formatCurrency(tax)}</td>
              </tr>
              ` : ''}
              <!-- Grand Total -->
              <tr class="grand-total-row">
                <td colspan="3" style="text-align: right; font-weight: 800; font-size: 12px; text-transform: uppercase; color: #1a2a8a;">Grand Total:</td>
                <td class="grand-total" style="text-align: right; font-weight: 900; font-size: 16px;">${formatCurrency(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Payment Info & QR -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.8rem; border-top: 1px dashed #d1d5db; padding-top: 0.8rem;">
            <div style="font-size: 9px; color: #4b5563;">
              <div style="font-weight: 700; color: #1f2937; font-size: 10px; margin-bottom: 0.2rem;">Payment Method: ${order.paymentMethod || 'Bank Transfer'}</div>
              <div>Payment Status: <span style="font-weight: 600; color: ${order.paymentStatus === 'paid' ? '#16a34a' : '#f59e0b'}; text-transform: uppercase;">${order.paymentStatus || 'Pending'}</span></div>
            </div>
            ${qrCodeUrl ? `
            <div class="qr-section">
              <div style="text-align: center;">
                <img src="${qrCodeUrl}" style="width: 70px; height: 70px; border: 2px solid #e5e7eb; padding: 4px; border-radius: 8px;">
                <div style="font-size: 7.5px; color: #6b7280; margin-top: 2px;">Scan to verify</div>
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div style="font-weight: 600; color: #1f2937; font-size: 10px; margin-bottom: 0.2rem;">Thank you for choosing Power Afric Energy Services Ltd</div>
            <div>Your trusted energy companion — Powering Nigeria's sustainable future.</div>
          </div>

        </div>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      const receiptWindow = window.open('', '_blank');
      if (receiptWindow) {
        receiptWindow.document.write(receiptHTML);
        receiptWindow.document.close();
        receiptWindow.focus();
      } else {
        alert('Please allow pop-ups to view the receipt');
      }

      onClose();
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2a8a] mx-auto mb-2"></div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Generating Receipt</h3>
        <p className="text-xs text-gray-600 mb-2">Please wait...</p>
      </div>
    </div>
  );
};

export default OrderReceipt;