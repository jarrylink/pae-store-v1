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

// GET single invoice by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    const isNumeric = /^\d+$/.test(id);
    let rows;
    if (isNumeric) {
      rows = await sql`SELECT * FROM "Invoice" WHERE id = ${parseInt(id, 10)}`;
    } else {
      rows = await sql`SELECT * FROM "Invoice" WHERE "invoiceNumber" = ${id}`;
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoice' }, { status: 500 });
  }
}

// PUT / PATCH update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await request.json();

    const isNumeric = /^\d+$/.test(id);
    const existing = isNumeric
      ? await sql`SELECT * FROM "Invoice" WHERE id = ${parseInt(id, 10)}`
      : await sql`SELECT * FROM "Invoice" WHERE "invoiceNumber" = ${id}`;

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const current = existing[0];
    const items: InvoiceItem[] = Array.isArray(body.items) ? body.items.map((item: any) => ({
      ...item,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
    })) : (current.items || []);

    const taxRate = body.taxRate !== undefined ? Number(body.taxRate) : Number(current.taxRate || 7.5);
    const discount = body.discount !== undefined ? Number(body.discount) : Number(current.discount || 0);
    const calculated = calculateInvoiceTotals(items, taxRate, discount);

    const customerName = body.customerName !== undefined ? body.customerName : current.customerName;
    const customerEmail = body.customerEmail !== undefined ? body.customerEmail : current.customerEmail;
    const customerPhone = body.customerPhone !== undefined ? body.customerPhone : current.customerPhone;
    const customerAddress = body.customerAddress !== undefined ? body.customerAddress : current.customerAddress;
    const issueDate = body.issueDate !== undefined ? body.issueDate : current.issueDate;
    const dueDate = body.dueDate !== undefined ? body.dueDate : current.dueDate;
    const status = body.status !== undefined ? body.status : current.status;
    const paymentMethod = body.paymentMethod !== undefined ? body.paymentMethod : current.paymentMethod;
    const bankName = body.bankName !== undefined ? body.bankName : current.bankName;
    const accountName = body.accountName !== undefined ? body.accountName : current.accountName;
    const accountNumber = body.accountNumber !== undefined ? body.accountNumber : current.accountNumber;
    const notes = body.notes !== undefined ? body.notes : current.notes;
    const terms = body.terms !== undefined ? body.terms : current.terms;

    const result = await sql`
      UPDATE "Invoice" SET
        "customerName" = ${customerName},
        "customerEmail" = ${customerEmail},
        "customerPhone" = ${customerPhone},
        "customerAddress" = ${customerAddress},
        "issueDate" = ${issueDate},
        "dueDate" = ${dueDate},
        items = ${JSON.stringify(items)}::jsonb,
        subtotal = ${calculated.subtotal},
        "taxRate" = ${taxRate},
        "taxAmount" = ${calculated.taxAmount},
        discount = ${calculated.discount},
        total = ${calculated.total},
        status = ${status},
        "paymentMethod" = ${paymentMethod},
        "bankName" = ${bankName},
        "accountName" = ${accountName},
        "accountNumber" = ${accountNumber},
        notes = ${notes},
        terms = ${terms},
        "updatedAt" = NOW()
      WHERE id = ${current.id}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to update invoice' }, { status: 500 });
  }
}

// DELETE invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    const isNumeric = /^\d+$/.test(id);
    let result;
    if (isNumeric) {
      result = await sql`DELETE FROM "Invoice" WHERE id = ${parseInt(id, 10)} RETURNING id`;
    } else {
      result = await sql`DELETE FROM "Invoice" WHERE "invoiceNumber" = ${id} RETURNING id`;
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete invoice' }, { status: 500 });
  }
}
