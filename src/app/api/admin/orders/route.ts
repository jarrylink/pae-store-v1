import { NextRequest, NextResponse } from 'next/server';
import { getDb, executeWithRetry } from '@/lib/db';

// GET /api/admin/orders - Fetch ALL orders and invoices for admin pipeline
export async function GET() {
  try {
    const sql = getDb();

    console.log('Admin: Fetching all orders and invoices for pipeline...');

    // Fetch store orders and invoices concurrently with retry
    const [ordersResult, invoicesResult] = await Promise.allSettled([
      executeWithRetry(async () => {
        return await sql`
          SELECT * FROM "Order"
          ORDER BY "createdAt" DESC
        `;
      }),
      executeWithRetry(async () => {
        return await sql`
          SELECT * FROM "Invoice"
          ORDER BY "createdAt" DESC
        `;
      }),
    ]);

    const rawOrders = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
    const rawInvoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value : [];

    if (ordersResult.status === 'rejected') {
      console.error('Failed to query Order table:', ordersResult.reason);
    }
    if (invoicesResult.status === 'rejected') {
      console.error('Failed to query Invoice table:', invoicesResult.reason);
    }

    // Format Store Orders
    const formattedOrders = rawOrders.map((order: any) => ({
      ...order,
      id: Number(order.id),
      isInvoice: false,
      entryType: 'order',
      total: Number(order.total) || 0,
    }));

    // Format Invoices into pipeline order items
    const formattedInvoices = rawInvoices.map((inv: any) => ({
      id: Number(inv.id),
      uniqueKey: `inv-${inv.id}`,
      orderNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      customerEmail: inv.customerEmail || '',
      customerPhone: inv.customerPhone || '',
      shippingAddress: inv.customerAddress ? { street: inv.customerAddress, city: 'Nigeria' } : null,
      total: Math.max(0, (Number(inv.subtotal) || 0) - (Number(inv.discount) || 0)),
      subtotal: Number(inv.subtotal) || 0,
      taxAmount: 0,
      discount: Number(inv.discount) || 0,
      status: inv.status, // draft | issued | paid | overdue | cancelled
      createdAt: inv.createdAt,
      items: Array.isArray(inv.items) ? inv.items : [],
      paymentMethod: inv.paymentMethod || 'Bank Transfer',
      bankName: inv.bankName,
      accountNumber: inv.accountNumber,
      assignedStaffId: null,
      assignedStaffName: inv.creatorName || inv.createdBy,
      assignedStaffEmail: inv.creatorEmail || '',
      isInvoice: true,
      entryType: 'invoice',
      creatorName: inv.creatorName || inv.createdBy,
      creatorRole: inv.creatorRole || 'staff',
      dueDate: inv.dueDate,
      notes: inv.notes,
      terms: inv.terms,
    }));

    // Merge and sort newest first
    const combined = [...formattedOrders, ...formattedInvoices].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    console.log(`Admin: Returning ${formattedOrders.length} store orders + ${formattedInvoices.length} invoices (total: ${combined.length})`);

    return NextResponse.json({
      success: true,
      orders: combined,
      meta: {
        totalOrdersCount: formattedOrders.length,
        totalInvoicesCount: formattedInvoices.length,
        ordersTotalValue: formattedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
        invoicesTotalValue: formattedInvoices.reduce((sum: number, i: any) => sum + (i.total || 0), 0),
      }
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    }, { status: 500 });
  }
}

// PATCH /api/admin/orders?id=123 - Update order or invoice status
export async function PATCH(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const isInvoiceParam = searchParams.get('isInvoice');

    const body = await request.json();
    const { status, isInvoice: bodyIsInvoice } = body;

    if (!idParam || !status) {
      return NextResponse.json({
        success: false,
        error: 'ID and status are required'
      }, { status: 400 });
    }

    const isInvoiceTarget = isInvoiceParam === 'true' || bodyIsInvoice === true || idParam.startsWith('inv-');
    const numericId = parseInt(idParam.replace('inv-', ''));

    if (isNaN(numericId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid order or invoice ID'
      }, { status: 400 });
    }

    console.log(`Admin: Updating ${isInvoiceTarget ? 'invoice' : 'order'} ${numericId} to status: ${status}`);

    if (isInvoiceTarget) {
      const result = await executeWithRetry(async () => {
        return await sql`
          UPDATE "Invoice"
          SET status = ${status}, "updatedAt" = NOW()
          WHERE id = ${numericId}
          RETURNING *
        `;
      });

      if (result.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Invoice not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        order: {
          ...result[0],
          isInvoice: true,
          entryType: 'invoice',
          orderNumber: result[0].invoiceNumber,
        }
      });
    }

    // Attempt to update Order
    const result = await executeWithRetry(async () => {
      return await sql`
        UPDATE "Order"
        SET status = ${status}, "updatedAt" = NOW()
        WHERE id = ${numericId}
        RETURNING *
      `;
    });

    if (result.length === 0) {
      // Fallback: check if it's an Invoice if not found in Order
      const invoiceFallback = await executeWithRetry(async () => {
        return await sql`
          UPDATE "Invoice"
          SET status = ${status}, "updatedAt" = NOW()
          WHERE id = ${numericId}
          RETURNING *
        `;
      });

      if (invoiceFallback.length > 0) {
        return NextResponse.json({
          success: true,
          order: {
            ...invoiceFallback[0],
            isInvoice: true,
            entryType: 'invoice',
            orderNumber: invoiceFallback[0].invoiceNumber,
          }
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Order or invoice not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        ...result[0],
        isInvoice: false,
        entryType: 'order',
      }
    });
  } catch (error) {
    console.error('Admin update error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order'
    }, { status: 500 });
  }
}
