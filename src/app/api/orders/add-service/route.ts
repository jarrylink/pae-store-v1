import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📦 Add Service Request:', JSON.stringify(body, null, 2));

    const { orderId, serviceId, serviceName, servicePrice, quantity } = body;

    // Validate required fields
    if (!orderId || !serviceId || !serviceName || servicePrice === undefined) {
      console.error('❌ Missing required fields:', { orderId, serviceId, serviceName, servicePrice });
      return NextResponse.json(
        { error: 'Missing required fields: orderId, serviceId, serviceName, servicePrice' },
        { status: 400 }
      );
    }

    // Ensure orderId is a number
    const orderIdNum = typeof orderId === 'string' ? parseInt(orderId) : orderId;
    if (isNaN(orderIdNum)) {
      return NextResponse.json({ error: 'Invalid orderId, must be a number' }, { status: 400 });
    }

    // Get the current order
    console.log('🔍 Fetching order:', orderIdNum);
    const currentOrder = await sql`
      SELECT id, items, total, subtotal, shipping, tax, "hasService", "serviceId", "serviceName", "servicePrice"
      FROM "Order"
      WHERE id = ${orderIdNum}
    `;

    console.log('📋 Current order found:', currentOrder.length > 0);

    if (currentOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = currentOrder[0];
    let items = order.items
      ? typeof order.items === 'string'
        ? JSON.parse(order.items)
        : order.items
      : [];

    console.log('📋 Current items:', JSON.stringify(items, null, 2));

    const qty = Number(quantity || 1);
    const price = typeof servicePrice === 'string' ? parseFloat(servicePrice) : Number(servicePrice);
    const numServiceId = Number(serviceId);

    // Check if service already exists
    const existingServiceIndex = items.findIndex(
      (item: any) =>
        (item.type === 'service' || item.serviceId != null) &&
        Number(item.serviceId ?? item.productId) === numServiceId
    );

    if (existingServiceIndex >= 0) {
      // Update existing service quantity
      items[existingServiceIndex].quantity =
        Number(items[existingServiceIndex].quantity || 1) + qty;
      console.log('🔄 Updated existing service, new quantity:', items[existingServiceIndex].quantity);
    } else {
      // Add new service with explicit discriminated fields
      const serviceItem = {
        productId: numServiceId,
        serviceId: numServiceId,
        title: serviceName,
        name: serviceName,
        price: price,
        quantity: qty,
        type: 'service',
        image: '',
        lineItemId: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      items.push(serviceItem);
      console.log('✅ Added new service:', JSON.stringify(serviceItem, null, 2));
    }

    // Fetch existing accessories total from OrderAccessory
    const accResult = await sql`
      SELECT COALESCE(SUM(total_price), 0) as acc_total
      FROM "OrderAccessory"
      WHERE "orderId" = ${orderIdNum}
    `;
    const accessoryTotal = Number(accResult[0]?.acc_total || 0);

    // Calculate unified totals
    let productTotal = 0;
    let serviceTotal = 0;

    for (const item of items) {
      const itemPrice = Number(item.price || 0);
      const itemQty = Number(item.quantity || 1);
      if (item.type === 'service' || item.serviceId != null) {
        serviceTotal += itemPrice * itemQty;
      } else {
        productTotal += itemPrice * itemQty;
      }
    }

    const shipping = Number(order.shipping || 0);
    const tax = Number(order.tax || 0);
    const subtotal = productTotal + accessoryTotal + serviceTotal;
    const total = subtotal + shipping + tax;

    console.log('💰 New productTotal:', productTotal);
    console.log('💰 New accessoryTotal:', accessoryTotal);
    console.log('💰 New serviceTotal:', serviceTotal);
    console.log('💰 New subtotal:', subtotal);
    console.log('💰 New total:', total);

    const itemsJson = JSON.stringify(items);

    // Update order
    const result = await sql`
      UPDATE "Order"
      SET
        items = ${itemsJson}::jsonb,
        subtotal = ${subtotal},
        total = ${total},
        "hasService" = true,
        "serviceId" = ${numServiceId},
        "serviceName" = ${serviceName},
        "servicePrice" = ${serviceTotal},
        "updatedAt" = NOW()
      WHERE id = ${orderIdNum}
      RETURNING *
    `;

    console.log('✅ Order updated successfully');

    return NextResponse.json({
      success: true,
      order: result[0],
      message: 'Service added successfully'
    });

  } catch (error) {
    console.error('❌ Error adding service to order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add service' },
      { status: 500 }
    );
  }
}
