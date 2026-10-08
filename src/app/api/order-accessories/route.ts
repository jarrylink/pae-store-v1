import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'), {
  fetchOptions: { timeout: 30000 }
});

// GET /api/order-accessories?orderId=123
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const accessories = await sql`
      SELECT 
        oa.*,
        a.name,
        a.description,
        a.image,
        a.sku,
        a.category
      FROM "OrderAccessory" oa
      LEFT JOIN "Accessory" a ON oa."accessoryId" = a.id
      WHERE oa."orderId" = ${parseInt(orderId)}
      ORDER BY oa.id ASC
    `;

    return NextResponse.json(accessories);
  } catch (error) {
    console.error('Error fetching order accessories:', error);
    return NextResponse.json({ error: 'Failed to fetch accessories' }, { status: 500 });
  }
}

// POST /api/order-accessories - Add accessories to an order
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { orderId, accessories } = data;

    if (!orderId || !accessories || accessories.length === 0) {
      return NextResponse.json({ error: 'Order ID and accessories required' }, { status: 400 });
    }

    const results = [];
    
    for (const item of accessories) {
      const existing = await sql`
        SELECT id, quantity FROM "OrderAccessory"
        WHERE "orderId" = ${orderId} 
        AND "accessoryId" = ${item.accessoryId}
      `;

      let result;
      if (existing.length > 0) {
        const newQuantity = existing[0].quantity + item.quantity;
        result = await sql`
          UPDATE "OrderAccessory"
          SET 
            quantity = ${newQuantity},
            total_price = ${newQuantity} * unit_price,
            "updatedAt" = NOW()
          WHERE "orderId" = ${orderId} 
          AND "accessoryId" = ${item.accessoryId}
          RETURNING *
        `;
      } else {
        result = await sql`
          INSERT INTO "OrderAccessory" (
            "orderId", "accessoryId", quantity, unit_price, total_price, unit, "createdAt", "updatedAt"
          ) VALUES (
            ${orderId},
            ${item.accessoryId},
            ${item.quantity},
            ${item.unit_price},
            ${item.quantity * item.unit_price},
            ${item.unit || 'piece'},
            NOW(),
            NOW()
          ) RETURNING *
        `;
      }
      results.push(result[0]);
    }

    // Recalculate order subtotal and total coherently
    const currentOrder = await sql`
      SELECT items, shipping, tax, "servicePrice"
      FROM "Order"
      WHERE id = ${orderId}
    `;

    const accTotalResult = await sql`
      SELECT COALESCE(SUM(total_price), 0) as total
      FROM "OrderAccessory"
      WHERE "orderId" = ${orderId}
    `;
    const accessoryTotal = Number(accTotalResult[0]?.total || 0);

    let productTotal = 0;
    let serviceTotal = 0;
    const items = currentOrder[0]?.items
      ? typeof currentOrder[0].items === 'string'
        ? JSON.parse(currentOrder[0].items)
        : currentOrder[0].items
      : [];

    for (const it of items) {
      const price = Number(it.price || 0);
      const qty = Number(it.quantity || 1);
      if (it.type === 'service' || it.serviceId != null) {
        serviceTotal += price * qty;
      } else if (it.type !== 'accessory') {
        productTotal += price * qty;
      }
    }

    if (serviceTotal === 0 && Number(currentOrder[0]?.servicePrice || 0) > 0) {
      serviceTotal = Number(currentOrder[0].servicePrice);
    }

    const shipping = Number(currentOrder[0]?.shipping || 0);
    const tax = Number(currentOrder[0]?.tax || 0);
    const subtotal = productTotal + serviceTotal + accessoryTotal;
    const total = subtotal + shipping + tax;

    await sql`
      UPDATE "Order"
      SET 
        subtotal = ${subtotal},
        total = ${total},
        "updatedAt" = NOW()
      WHERE id = ${orderId}
    `;

    return NextResponse.json({ success: true, accessories: results });
  } catch (error) {
    console.error('Error adding accessories to order:', error);
    return NextResponse.json({ error: 'Failed to add accessories' }, { status: 500 });
  }
}
