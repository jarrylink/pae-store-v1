import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { InvoiceItem } from '@/types/invoice';

function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number = 7.5, discount: number = 0) {
  const subtotal = items.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return acc + (qty * price);
  }, 0);

  const discountAmount = Math.max(0, Number(discount) || 0);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const rate = Math.max(0, Number(taxRate) || 0);
  const taxAmount = (discountedSubtotal * rate) / 100;
  const total = discountedSubtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    discount: discountAmount,
    total: Math.round(total * 100) / 100,
  };
}

// GET /api/invoices
export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('userId') || request.headers.get('x-user-id') || '';
    const role = searchParams.get('role') || request.headers.get('x-user-role') || '';
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();
    const creatorFilter = searchParams.get('creator');

    let queryText = `SELECT * FROM "Invoice" WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    // Isolation: Sales agents can ONLY see their own invoices
    if (role === 'sales_agent') {
      queryText += ` AND "createdBy" = $${paramIndex++}`;
      params.push(userId);
    } else if (creatorFilter && creatorFilter !== 'all') {
      // Superadmin filtering by specific creator
      queryText += ` AND "createdBy" = $${paramIndex++}`;
      params.push(creatorFilter);
    }

    if (status && status !== 'all') {
      queryText += ` AND "status" = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      queryText += ` AND ("invoiceNumber" ILIKE $${paramIndex} OR "customerName" ILIKE $${paramIndex} OR "customerEmail" ILIKE $${paramIndex} OR "creatorName" ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY "createdAt" DESC, id DESC`;

    const invoices = await sql.query(queryText, params);
    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}

// POST /api/invoices
export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const generatedInvoiceNumber = `PAE/INV/${dateStr}-${randomHex}`;

    const invoiceNumber = body.invoiceNumber?.trim() || generatedInvoiceNumber;
    const customerName = body.customerName?.trim();
    if (!customerName) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    const items: InvoiceItem[] = Array.isArray(body.items) ? body.items.map((item: any) => ({
      ...item,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
    })) : [];

    const taxRate = body.taxRate !== undefined ? Number(body.taxRate) : 7.5;
    const discount = Number(body.discount) || 0;
    const calculated = calculateInvoiceTotals(items, taxRate, discount);

    const issueDate = body.issueDate || now.toISOString().slice(0, 10);
    const dueDate = body.dueDate || null;
    const status = body.status || 'draft';
    const paymentMethod = body.paymentMethod || 'Bank Transfer';
    const bankName = body.bankName || 'GTBank Plc.';
    const accountName = body.accountName || 'Power Afric Energy Serv. LTD';
    const accountNumber = body.accountNumber || '0500647850';

    const createdBy = body.createdBy || 'superadmin';
    const creatorName = body.creatorName || 'Super Admin';
    const creatorEmail = body.creatorEmail || '';
    const creatorRole = body.creatorRole || 'superadmin';

    const result = await sql`
      INSERT INTO "Invoice" (
        "invoiceNumber", "customerName", "customerEmail", "customerPhone", "customerAddress",
        "issueDate", "dueDate", items, subtotal, "taxRate", "taxAmount", discount, total,
        status, "paymentMethod", "bankName", "accountName", "accountNumber", notes, terms,
        "createdBy", "creatorName", "creatorEmail", "creatorRole", "createdAt", "updatedAt"
      ) VALUES (
        ${invoiceNumber},
        ${customerName},
        ${body.customerEmail || ''},
        ${body.customerPhone || ''},
        ${body.customerAddress || ''},
        ${issueDate},
        ${dueDate},
        ${JSON.stringify(items)}::jsonb,
        ${calculated.subtotal},
        ${taxRate},
        ${calculated.taxAmount},
        ${calculated.discount},
        ${calculated.total},
        ${status},
        ${paymentMethod},
        ${bankName},
        ${accountName},
        ${accountNumber},
        ${body.notes || 'Payment is required within specified due date. Thank you for your business!'},
        ${body.terms || '• Prices and product availability may change without notice.\n• Orders are processed only after payment confirmation.\n• Warranty applies as per manufacturer terms.'},
        ${createdBy},
        ${creatorName},
        ${creatorEmail},
        ${creatorRole},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      return NextResponse.json({ error: 'Invoice number already exists. Please use a unique number.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
  }
}
