'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Order } from '@/types/auth';
import QRCode from 'qrcode';
import { formatCurrency } from '@/utils';

interface OrderInvoiceProps {
  order: Order;
  onClose: () => void;
}

interface ExtendedOrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  name: string;
  title: string;
  brand?: string;
  spec?: string;
  capacity?: string;
  price: number;
  quantity: number;
  image: string;
  type?: string;
  serviceId?: number;
  accessoryId?: number;
  category?: string;
  isInstallationMaterial?: boolean;
  features?: string[];
  lineItemId?: string;
}

const OrderInvoice: React.FC<OrderInvoiceProps> = ({ order, onClose }) => {
  const hasGeneratedRef = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      generateInvoice();
    }
  }, []);

  const generateInvoice = async () => {
    try {
      const date = new Date(order.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const invoiceNumber = `PAE/INV/${year}${month}${day}-${random}`;

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

      // ----------------------------------------------------
      // Clean structured separation from normalized order:
      // Zero name-based guessing
      // ----------------------------------------------------

      // Phase 1: Products
      const products: ExtendedOrderItem[] = (
        Array.isArray((order as any).products) && (order as any).products.length > 0
          ? (order as any).products
          : (order.items || []).filter((item: any) => item.type === 'product' || (!item.type && !item.serviceId && !item.accessoryId))
      );

      // Phase 3: Services
      const rawServices: ExtendedOrderItem[] = (
        Array.isArray((order as any).services) && (order as any).services.length > 0
          ? (order as any).services
          : (order.items || []).filter((item: any) => item.type === 'service' || item.serviceId != null)
      );

      const services: ExtendedOrderItem[] = [...rawServices];
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

      // Phase 2: Accessories
      const orderAccessories = (order.accessories || []) as any[];
      const itemAccessories = (order.items || []).filter((item: any) => item.type === 'accessory' || item.accessoryId != null);
      const seenAccessoryIds = new Set<number>();
      const allAccessories: any[] = [];
      for (const a of [...orderAccessories, ...itemAccessories]) {
        const accId = Number(a.accessoryId || a.id || 0);
        if (accId > 0 && seenAccessoryIds.has(accId)) {
          continue;
        }
        if (accId > 0) seenAccessoryIds.add(accId);
        allAccessories.push(a);
      }

      // Calculate totals using unified coherent model
      const productsTotal = (order as any).productTotal != null
        ? Number((order as any).productTotal)
        : products.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

      const accessoriesTotal = (order as any).accessoryTotal != null
        ? Number((order as any).accessoryTotal)
        : allAccessories.reduce((sum: number, a: any) => {
            const price = Number(a.unit_price ?? a.price ?? 0);
            const qty = Number(a.quantity || 1);
            return sum + (a.total_price != null ? Number(a.total_price) : price * qty);
          }, 0);

      const servicesTotal = (order as any).serviceTotal != null
        ? Number((order as any).serviceTotal)
        : services.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

      const subtotal = productsTotal + accessoriesTotal + servicesTotal;
      const grandTotal = subtotal;

      // Generate QR Code
      let qrCodeUrl = '';
      try {
        const verificationData = {
          invoiceNo: invoiceNumber,
          orderId: order.id,
          total: grandTotal,
          customer: customerName,
          date: new Date().toISOString()
        };
        qrCodeUrl = await QRCode.toDataURL(JSON.stringify(verificationData), {
          width: 200,
          margin: 2,
        });
      } catch (err) {
        console.error('Error generating QR code:', err);
      }

      const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Power Afric Invoice - ${invoiceNumber}</title>
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
    .invoice-title {
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
      margin: 0.4rem 0; 
    }
    th, td { 
      border: 1px solid #d1d5db; 
      padding: 0.35rem 0.5rem; 
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
    td:first-child {
      font-weight: 500;
    }
    .total-row { 
      font-weight: 700; 
      font-size: 11px; 
    }
    .grand-total { 
      color: #1a2a8a; 
      font-size: 14px; 
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
    .meta-split-container { 
      display: flex; 
      gap: 2rem; 
      margin-top: 0.8rem; 
      border-top: 1px dashed #d1d5db; 
      padding-top: 0.8rem; 
    }
    .meta-left { 
      flex: 1.4; 
      font-size: 8.5px; 
      color: #4b5563; 
      line-height: 1.6; 
    }
    .terms-list { 
      margin-top: 0.2rem; 
    }
    .meta-right { 
      flex: 0.8; 
      display: flex; 
      flex-direction: column; 
      gap: 0.6rem; 
      justify-content: flex-start; 
    }
    .payment-info { 
      padding: 0.8rem; 
      background: #f8fafc; 
      border-radius: 8px; 
      font-size: 10px; 
      border: 1px solid #e5e7eb; 
    }
    .payment-info div {
      margin-bottom: 3px;
    }
    .payment-info div:last-child {
      margin-bottom: 0;
    }
    .qr-section { 
      display: flex; 
      align-items: center; 
      justify-content: flex-end; 
      gap: 0.8rem; 
      margin-top: auto; 
      padding-top: 0.3rem; 
    }
    .phase-title {
      font-size: 12px;
      font-weight: 800;
      color: #1a2a8a;
      margin-top: 0.8rem;
      letter-spacing: -0.3px;
    }
    .phase-title .badge {
      font-size: 9px;
      font-weight: 600;
      background: #f3f4f6;
      color: #4b5563;
      padding: 2px 12px;
      border-radius: 12px;
      margin-left: 10px;
    }
    .rc-number {
      font-size: 9.5px;
      color: #6b7280;
      margin-top: 2px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: 700; }
    
    /* Print styles */
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
              <div class="company-contact">08033666041 • 08100360057 • sales@powerafric.ng</div>
              <div class="rc-number">RC: 1568706</div>
            </div>
          </div>

          <!-- Invoice Title -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 0.6rem 0 0.8rem 0;">
            <div class="invoice-title">Invoice</div>
            <div style="text-align: right;">
              <div style="font-weight: 700; font-size: 11px; color: #1f2937;">Invoice No: ${invoiceNumber}</div>
              <div style="font-size: 10px; color: #6b7280;">Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <!-- Customer & Order Info -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem; background: #f8fafc; padding: 0.8rem; border-radius: 8px;">
            <div style="width: 58%;">
              <div style="font-weight: 700; margin-bottom: 0.2rem; font-size: 10.5px; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px;">Bill To:</div>
              <div style="font-size: 11.5px; font-weight: 600; color: #111827;">${customerName}</div>
              <div style="font-size: 10px; color: #4b5563;">${deliveryAddress}</div>
              <div style="font-size: 10px; color: #4b5563;">Phone: ${customerPhone}</div>
              ${customerEmail ? `<div style="font-size: 10px; color: #4b5563;">Email: ${customerEmail}</div>` : ''}
            </div>
            <div style="width: 38%;">
              <div style="font-weight: 700; margin-bottom: 0.2rem; font-size: 10.5px; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px;">Order Details:</div>
              <div style="font-size: 10px; color: #4b5563;">Order ID: #${order.id}</div>
              <div style="font-size: 10px; color: #4b5563;">Order Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div style="font-size: 10px; color: #4b5563;">Payment Method: ${order.paymentMethod || 'Bank Transfer'}</div>
              <div style="font-size: 10px; color: #4b5563;">Order Status: ${order.status?.toUpperCase() || 'PENDING'}</div>
            </div>
          </div>

          <!-- Phase 1: Products -->
          ${products.length > 0 ? `
          <div class="phase-title">Phase 1: Products <span class="badge">${products.length} items</span></div>
          <table>
            <thead>
              <tr>
                <th style="width: 7%;">S/N</th>
                <th style="width: 48%;">Description</th>
                <th style="width: 12%; text-align: center;">Qty</th>
                <th style="width: 16%; text-align: right;">Unit Price</th>
                <th style="width: 17%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${products.map((item: ExtendedOrderItem, idx: number) => {
                const title = item.title || item.name || 'Item';
                return `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${title}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(item.price)}</td>
                  <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `}).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight: 700; background: #f8fafc;">
                <td colspan="4" style="text-align: right; font-weight: 700;">Products Subtotal:</td>
                <td style="text-align: right; font-weight: 700;">${formatCurrency(productsTotal)}</td>
              </tr>
            </tfoot>
          </table>
          ` : ''}

          <!-- Phase 2: Accessories -->
          ${allAccessories.length > 0 ? `
          <div class="phase-title">Phase 2: Accessories <span class="badge">${allAccessories.length} items</span></div>
          <table>
            <thead>
              <tr>
                <th style="width: 7%;">S/N</th>
                <th style="width: 48%;">Description</th>
                <th style="width: 12%; text-align: center;">Qty</th>
                <th style="width: 16%; text-align: right;">Unit Price</th>
                <th style="width: 17%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${allAccessories.map((item: any, idx: number) => {
                const name = item.name || item.title || 'Accessory';
                const price = Number(item.unit_price || item.price || 0);
                const qty = Number(item.quantity || 1);
                return `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${name}</td>
                  <td style="text-align: center;">${qty}</td>
                  <td style="text-align: right;">${formatCurrency(price)}</td>
                  <td style="text-align: right;">${formatCurrency(price * qty)}</td>
                </tr>
              `}).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight: 700; background: #f8fafc;">
                <td colspan="4" style="text-align: right; font-weight: 700;">Accessories Subtotal:</td>
                <td style="text-align: right; font-weight: 700;">${formatCurrency(accessoriesTotal)}</td>
              </tr>
            </tfoot>
          </table>
          ` : ''}

          <!-- Phase 3: Services -->
          ${services.length > 0 ? `
          <div class="phase-title">Phase 3: Services <span class="badge">${services.length} item${services.length !== 1 ? 's' : ''}</span></div>
          <table>
            <thead>
              <tr>
                <th style="width: 7%;">S/N</th>
                <th style="width: 48%;">Description</th>
                <th style="width: 12%; text-align: center;">Qty</th>
                <th style="width: 16%; text-align: right;">Unit Price</th>
                <th style="width: 17%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${services.map((item: ExtendedOrderItem, idx: number) => {
                const title = item.title || item.name || 'Service';
                return `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${title}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(item.price)}</td>
                  <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `}).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight: 700; background: #f8fafc;">
                <td colspan="4" style="text-align: right; font-weight: 700;">Services Subtotal:</td>
                <td style="text-align: right; font-weight: 700;">${formatCurrency(servicesTotal)}</td>
              </tr>
            </tfoot>
          </table>
          ` : ''}

          <!-- Invoice Summary -->
          <div class="phase-title" style="margin-top:1rem;">Invoice Summary</div>
          <table>
            <thead>
              <tr>
                <th style="width: 70%;">Summary Breakdown</th>
                <th style="width: 30%; text-align: right;">Amount</th>
              </tr>
            <tbody>
              <tr>
                <td style="padding: 0.35rem 0.5rem; font-weight: 500;">Products Total</td>
                <td style="padding: 0.35rem 0.5rem; text-align: right; font-weight: 600;">${formatCurrency(productsTotal)}</td>
              </tr>
              <tr>
                <td style="padding: 0.35rem 0.5rem; font-weight: 500;">Accessories Total</td>
                <td style="padding: 0.35rem 0.5rem; text-align: right; font-weight: 600;">${formatCurrency(accessoriesTotal)}</td>
              </tr>
              <tr>
                <td style="padding: 0.35rem 0.5rem; font-weight: 500;">Services Total</td>
                <td style="padding: 0.35rem 0.5rem; text-align: right; font-weight: 600;">${formatCurrency(servicesTotal)}</td>
              </tr>
            </tbody>
              <tr class="total-row" style="background: #f0f7ff;">
                <td style="padding: 0.5rem; text-align: right; font-weight: 800; text-transform: uppercase; font-size: 12px;">Grand Total:</td>
                <td class="grand-total" style="padding: 0.5rem; text-align: right; font-weight: 900; font-size: 16px;">${formatCurrency(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Bottom Metadata -->
        <div>
          <div class="meta-split-container">
            <div class="meta-left">
              <strong style="color: #111827; font-size: 9px; text-transform: uppercase; display: block; margin-bottom: 0.15rem; letter-spacing: 0.5px;">Terms & Conditions:</strong>
              <div class="terms-list">
                • Full payment is required before order processing or delivery.<br>
                • Prices and product availability may change without notice.<br>
                • Delivery timelines depend on location and stock availability.<br>
                • Products are covered by manufacturer warranty terms.<br>
                • Returns accepted for defective items reported within 48 hours of delivery.<br>
                • Installed, customized, or used products are non-returnable.<br>
                • Power Afric is not liable for damages caused by misuse, overload, or unauthorized modifications.<br>
                • Customers are responsible for providing accurate delivery and order information.<br>
                • Orders are processed only after payment confirmation.<br>
              </div>
            </div>

            <div class="meta-right">
              <div class="payment-info">
                <div style="font-weight: 700; margin-bottom: 0.3rem; color: #1a2a8a; font-size: 10.5px;">Payment Bank Details:</div>
                <div><strong>Bank:</strong> GTBank Plc.</div>
                <div><strong>Acc. Name:</strong> Power Afric Energy Serv. LTD</div>
                <div><strong>Acc. Number:</strong> 0500647890</div>
              </div>

              ${qrCodeUrl ? `
                <div class="qr-section">
                  <div style="font-size: 8.5px; color: #4b5563; text-align: right; line-height: 1.3;">
                    <strong>Ref:</strong> ${invoiceNumber}<br>
                    <span style="font-weight: 600;">Scan to verify</span>
                  </div>
                  <img src="${qrCodeUrl}" style="width: 80px; height: 80px; border: 2px solid #e5e7eb; padding: 4px; border-radius: 8px;">
                </div>
              ` : ''}
            </div>
          </div>

          <div class="footer">
            Thank you for choosing Power Afric Energy Services Ltd — Your trusted energy companion.
          </div>
        </div>

      </div>
    </div>
  </div>
</body>
</html>
      `;

      const invoiceWindow = window.open('', '_blank');
      if (invoiceWindow) {
        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();
        invoiceWindow.focus();
      } else {
        alert('Please allow pop-ups to view the invoice');
      }

      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
      setLoading(false);
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg p-6 max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2a8a] mx-auto mb-2"></div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Generating Invoice</h3>
          <p className="text-xs text-gray-600 mb-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default OrderInvoice;