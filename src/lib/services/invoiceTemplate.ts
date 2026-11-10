import QRCode from 'qrcode';
import { formatCurrency } from '@/utils';

export interface UnifiedInvoiceItem {
  id?: number | string;
  title?: string;
  name?: string;
  description?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  unit_price?: number;
  total?: number;
  type?: 'product' | 'accessory' | 'service' | 'custom' | string;
  brand?: string;
  spec?: string;
  serviceId?: number;
  accessoryId?: number;
  productId?: number;
}

export interface UnifiedInvoiceData {
  id?: number | string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  customerAddress?: string;
  issueDate?: string;
  orderDate?: string;
  dueDate?: string;
  paymentMethod?: string;
  status?: string;
  products?: UnifiedInvoiceItem[];
  accessories?: UnifiedInvoiceItem[];
  services?: UnifiedInvoiceItem[];
  items?: UnifiedInvoiceItem[];
  productsTotal?: number;
  accessoriesTotal?: number;
  servicesTotal?: number;
  subtotal?: number;
  discount?: number;
  taxRate?: number;
  taxAmount?: number;
  grandTotal?: number;
  total?: number;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  terms?: string;
  notes?: string;
}

export function normalizeToUnifiedInvoice(data: any): UnifiedInvoiceData {
  const isOrder = 'items' in data && ('orderNumber' in data || 'total' in data);
  const now = new Date(data.createdAt || data.issueDate || Date.now());
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const invoiceNumber = data.invoiceNumber || data.orderNumber || `PAE/INV/${year}${month}${day}-${random}`;

  const customerName =
    data.customerName ||
    data.shippingAddress?.name ||
    (data.user?.firstName ? `${data.user.firstName} ${data.user.lastName || ''}`.trim() : '') ||
    'Walk-in Customer / Client';
  const customerPhone = data.customerPhone || data.shippingAddress?.phone || data.userPhone || data.phone || 'N/A';
  const customerEmail = data.customerEmail || data.user?.email || '';

  let deliveryAddress = data.customerAddress || 'No address provided';
  if (data.shippingAddress) {
    const addr = data.shippingAddress;
    deliveryAddress = [addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(', ');
  }

  // Phase categorization
  const allItems: any[] = Array.isArray(data.items) ? data.items : [];
  const orderAccessories: any[] = Array.isArray(data.accessories) ? data.accessories : [];
  const orderProducts: any[] = Array.isArray(data.products) ? data.products : [];
  const orderServices: any[] = Array.isArray(data.services) ? data.services : [];

  // 1. Products
  let products: UnifiedInvoiceItem[] = orderProducts.length > 0
    ? orderProducts
    : allItems.filter(item => item.type === 'product' || (!item.type && !item.serviceId && !item.accessoryId));

  // 2. Services
  let services: UnifiedInvoiceItem[] = orderServices.length > 0
    ? orderServices
    : allItems.filter(item => item.type === 'service' || item.serviceId != null);

  if (
    services.length === 0 &&
    (data.hasService || Number(data.servicePrice || 0) > 0) &&
    (data.serviceName || data.serviceId)
  ) {
    services.push({
      productId: data.serviceId ? Number(data.serviceId) : 0,
      serviceId: data.serviceId ? Number(data.serviceId) : 0,
      title: data.serviceName || 'Installation Service',
      name: data.serviceName || 'Installation Service',
      price: Number(data.servicePrice || 0),
      quantity: 1,
      type: 'service',
    });
  }

  // 3. Accessories
  const itemAccessories = allItems.filter(item => item.type === 'accessory' || item.accessoryId != null);
  const seenAccessoryIds = new Set<number>();
  const accessories: UnifiedInvoiceItem[] = [];
  for (const a of [...orderAccessories, ...itemAccessories]) {
    const accId = Number(a.accessoryId || a.id || 0);
    if (accId > 0 && seenAccessoryIds.has(accId)) continue;
    if (accId > 0) seenAccessoryIds.add(accId);
    accessories.push(a);
  }

  // If there are custom items with no type or custom type, add to products if products is empty
  const customItems = allItems.filter(item => item.type === 'custom');
  if (customItems.length > 0) {
    products = [...products, ...customItems];
  }

  // Totals
  const productsTotal = data.productTotal != null
    ? Number(data.productTotal)
    : products.reduce((sum, item) => sum + ((Number(item.price ?? item.unitPrice ?? 0)) * (Number(item.quantity || 1))), 0);

  const accessoriesTotal = data.accessoryTotal != null
    ? Number(data.accessoryTotal)
    : accessories.reduce((sum, item) => {
        const price = Number(item.unit_price ?? item.price ?? item.unitPrice ?? 0);
        const qty = Number(item.quantity || 1);
        return sum + (item.total != null ? Number(item.total) : price * qty);
      }, 0);

  const servicesTotal = data.serviceTotal != null
    ? Number(data.serviceTotal)
    : services.reduce((sum, item) => sum + ((Number(item.price ?? item.unitPrice ?? 0)) * (Number(item.quantity || 1))), 0);

  const subtotal = data.subtotal != null ? Number(data.subtotal) : (productsTotal + accessoriesTotal + servicesTotal);
  const discount = Number(data.discount || 0);
  const isInvoiceTabRecord = true;
  const taxRate = 0;
  const taxAmount = 0;
  const grandTotal = Math.max(0, subtotal - discount);

  return {
    id: data.id,
    invoiceNumber,
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    issueDate: data.issueDate || data.createdAt,
    orderDate: data.createdAt || data.issueDate,
    dueDate: data.dueDate,
    paymentMethod: data.paymentMethod || 'Bank Transfer',
    status: data.status || 'draft',
    products,
    accessories,
    services,
    productsTotal,
    accessoriesTotal,
    servicesTotal,
    subtotal,
    discount,
    taxRate,
    taxAmount,
    grandTotal,
    bankName: data.bankName || 'GTBank Plc.',
    accountName: data.accountName || 'Power Afric Energy Serv. LTD',
    accountNumber: data.accountNumber || '0500647850',
    notes: data.notes,
    terms: data.terms,
  };
}

export function generatePowerAfricInvoiceHTML(data: UnifiedInvoiceData, qrCodeUrl: string = ''): string {
  const products = data.products || [];
  const accessories = data.accessories || [];
  const services = data.services || [];
  const productsTotal = data.productsTotal || 0;
  const accessoriesTotal = data.accessoriesTotal || 0;
  const servicesTotal = data.servicesTotal || 0;
  const subtotal = data.subtotal || (productsTotal + accessoriesTotal + servicesTotal);
  const grandTotal = data.grandTotal || subtotal;

  const dateFormatted = data.issueDate
    ? new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Power Afric Invoice - ${data.invoiceNumber}</title>
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

    @media print {
      body { 
        background: white; 
        padding: 0; 
      }
      .a4 { 
        box-shadow: none; 
        border-radius: 0; 
        width: 100%;
        min-height: auto;
      }
      .no-print { 
        display: none !important; 
      }
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
              <div style="font-weight: 700; font-size: 11px; color: #1f2937;">Invoice No: ${data.invoiceNumber}</div>
              <div style="font-size: 10px; color: #6b7280;">Date: ${dateFormatted}</div>
              ${data.dueDate ? `<div style="font-size: 10px; color: #6b7280;">Due: ${new Date(data.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>` : ''}
            </div>
          </div>

          <!-- Customer & Order Info -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem; background: #f8fafc; padding: 0.8rem; border-radius: 8px;">
            <div style="width: 58%;">
              <div style="font-weight: 700; margin-bottom: 0.2rem; font-size: 10.5px; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px;">Bill To:</div>
              <div style="font-size: 11.5px; font-weight: 600; color: #111827;">${data.customerName || 'Walk-in Customer / Client'}</div>
              <div style="font-size: 10px; color: #4b5563;">${data.deliveryAddress || data.customerAddress || 'Direct Pickup / On-Site'}</div>
              <div style="font-size: 10px; color: #4b5563;">Phone: ${data.customerPhone || 'N/A'}</div>
              ${data.customerEmail ? `<div style="font-size: 10px; color: #4b5563;">Email: ${data.customerEmail}</div>` : ''}
            </div>
            <div style="width: 38%;">
              <div style="font-weight: 700; margin-bottom: 0.2rem; font-size: 10.5px; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px;">Order / Invoice Details:</div>
              ${data.id ? `<div style="font-size: 10px; color: #4b5563;">Ref ID: #${data.id}</div>` : ''}
              <div style="font-size: 10px; color: #4b5563;">Payment Method: ${data.paymentMethod || 'Bank Transfer'}</div>
              <div style="font-size: 10px; color: #4b5563;">Status: ${(data.status || 'PENDING').toUpperCase()}</div>
            </div>
          </div>

          <!-- Phase 1: Products -->
          ${products.length > 0 ? `
          <div class="phase-title">Phase 1: Products <span class="badge">${products.length} item${products.length !== 1 ? 's' : ''}</span></div>
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
              ${products.map((item, idx) => {
                const title = item.title || item.name || item.description || 'Solar Product';
                const price = Number(item.price ?? item.unitPrice ?? 0);
                const qty = Number(item.quantity || 1);
                return `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${title}</td>
                  <td style="text-align: center;">${qty}</td>
                  <td style="text-align: right;">${formatCurrency(price)}</td>
                  <td style="text-align: right;">${formatCurrency(price * qty)}</td>
                </tr>
              `;
              }).join('')}
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
          ${accessories.length > 0 ? `
          <div class="phase-title">Phase 2: Accessories <span class="badge">${accessories.length} item${accessories.length !== 1 ? 's' : ''}</span></div>
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
              ${accessories.map((item, idx) => {
                const name = item.name || item.title || item.description || 'Accessory';
                const price = Number(item.unit_price ?? item.price ?? item.unitPrice ?? 0);
                const qty = Number(item.quantity || 1);
                return `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${name}</td>
                  <td style="text-align: center;">${qty}</td>
                  <td style="text-align: right;">${formatCurrency(price)}</td>
                  <td style="text-align: right;">${formatCurrency(price * qty)}</td>
                </tr>
              `;
              }).join('')}
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
              ${services.map((item, idx) => {
                const title = item.title || item.name || item.description || 'Installation Service';
                const price = Number(item.price ?? item.unitPrice ?? 0);
                const qty = Number(item.quantity || 1);
                return `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${title}</td>
                  <td style="text-align: center;">${qty}</td>
                  <td style="text-align: right;">${formatCurrency(price)}</td>
                  <td style="text-align: right;">${formatCurrency(price * qty)}</td>
                </tr>
              `;
              }).join('')}
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
            </thead>
            <tbody>
              ${products.length > 0 ? `
              <tr>
                <td style="padding: 0.35rem 0.5rem; font-weight: 500;">Products Total</td>
                <td style="padding: 0.35rem 0.5rem; text-align: right; font-weight: 600;">${formatCurrency(productsTotal)}</td>
              </tr>` : ''}
              ${accessories.length > 0 ? `
              <tr>
                <td style="padding: 0.35rem 0.5rem; font-weight: 500;">Accessories Total</td>
                <td style="padding: 0.35rem 0.5rem; text-align: right; font-weight: 600;">${formatCurrency(accessoriesTotal)}</td>
              </tr>` : ''}
              ${services.length > 0 ? `
              <tr>
                <td style="padding: 0.35rem 0.5rem; font-weight: 500;">Services Total</td>
                <td style="padding: 0.35rem 0.5rem; text-align: right; font-weight: 600;">${formatCurrency(servicesTotal)}</td>
              </tr>` : ''}
              ${Number(data.discount || 0) > 0 ? `
              <tr>
                <td style="padding: 0.35rem 0.5rem; font-weight: 500; color: #dc2626;">Discount</td>
                <td style="padding: 0.35rem 0.5rem; text-align: right; font-weight: 600; color: #dc2626;">-${formatCurrency(data.discount || 0)}</td>
              </tr>` : ''}
              ${false ? `
              <tr>
                <td style="padding: 0.35rem 0.5rem; font-weight: 500;">VAT (${data.taxRate || 7.5}%)</td>
                <td style="padding: 0.35rem 0.5rem; text-align: right; font-weight: 600;">${formatCurrency(data.taxAmount || 0)}</td>
              </tr>` : ''}
            </tbody>
            <tfoot>
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
                ${data.terms ? data.terms.split('\n').map(t => `${t.trim()}<br>`).join('') : `
                • Full payment is required before order processing or delivery.<br>
                • Prices and product availability may change without notice.<br>
                • Delivery timelines depend on location and stock availability.<br>
                • Products are covered by manufacturer warranty terms.<br>
                • Returns accepted for defective items reported within 48 hours of delivery.<br>
                • Installed, customized, or used products are non-returnable.<br>
                • Power Afric is not liable for damages caused by misuse, overload, or unauthorized modifications.<br>
                • Customers are responsible for providing accurate delivery and order information.<br>
                • Orders are processed only after payment confirmation.<br>`}
              </div>
            </div>

            <div class="meta-right">
              <div class="payment-info">
                <div style="font-weight: 700; margin-bottom: 0.3rem; color: #1a2a8a; font-size: 10.5px;">Payment Bank Details:</div>
                <div><strong>Bank:</strong> ${data.bankName || 'GTBank Plc.'}</div>
                <div><strong>Acc. Name:</strong> ${data.accountName || 'Power Afric Energy Serv. LTD'}</div>
                <div><strong>Acc. Number:</strong> ${data.accountNumber || '0500647850'}</div>
              </div>

              ${qrCodeUrl ? `
                <div class="qr-section">
                  <div style="font-size: 8.5px; color: #4b5563; text-align: right; line-height: 1.3;">
                    <strong>Ref:</strong> ${data.invoiceNumber}<br>
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
</html>`;
}

export async function openPowerAfricInvoice(rawInvoiceOrOrder: any): Promise<void> {
  const unified = normalizeToUnifiedInvoice(rawInvoiceOrOrder);

  let qrCodeUrl = '';
  try {
    const verificationData = {
      invoiceNo: unified.invoiceNumber,
      id: unified.id,
      total: unified.grandTotal,
      customer: unified.customerName,
      date: new Date().toISOString(),
    };
    qrCodeUrl = await QRCode.toDataURL(JSON.stringify(verificationData), {
      width: 200,
      margin: 2,
    });
  } catch (err) {
    console.error('Error generating QR code for invoice:', err);
  }

  const html = generatePowerAfricInvoiceHTML(unified, qrCodeUrl);
  const invoiceWindow = window.open('', '_blank');
  if (invoiceWindow) {
    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
    invoiceWindow.focus();
  } else {
    alert('Please allow pop-ups to view the invoice');
  }
}
