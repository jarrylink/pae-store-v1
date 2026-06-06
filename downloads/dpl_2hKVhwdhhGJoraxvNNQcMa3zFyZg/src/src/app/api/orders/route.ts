import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: { timeout: 30000 }
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    console.log('🔍 Orders API GET - userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Query the real database
    const orders = await sql`
      SELECT 
        id, 
        "userId", 
        "orderNumber", 
        items, 
        subtotal, 
        shipping, 
        tax, 
        total,
        status, 
        "paymentMethod", 
        "paymentStatus",
        "customerName", 
        "customerPhone", 
        "customerEmail",
        "shippingAddress",
        "serviceId",
        "serviceName",
        "servicePrice",
        "hasService",
        "createdAt", 
        "updatedAt"
      FROM "Order" 
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
    `;
    
    console.log(`✅ Found ${orders.length} orders for user ${userId}`);
    
    // Parse JSON fields
    const parsedOrders = orders.map(order => ({
      ...order,
      items: order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [],
      shippingAddress: order.shippingAddress ? (typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress) : null
    }));
    
    return NextResponse.json(parsedOrders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    console.log('📝 Creating order for user:', orderData.userId);
    
    const orderNumber = `ORD-${Date.now()}`;
    const now = new Date().toISOString();

    const result = await sql`
      INSERT INTO "Order" (
        "userId", "orderNumber", items, subtotal, shipping, tax, total,
        status, "paymentMethod", "paymentStatus",
        "customerName", "customerPhone", "customerEmail",
        "serviceId", "serviceName", "servicePrice", "hasService",
        "shippingAddress", "createdAt", "updatedAt"
      ) VALUES (
        ${orderData.userId},
        ${orderNumber},
        ${JSON.stringify(orderData.items || [])},
        ${orderData.subtotal || 0},
        ${orderData.shipping || 0},
        ${orderData.tax || 0},
        ${orderData.total || 0},
        ${orderData.status || 'pending'},
        ${orderData.paymentMethod || 'bank_transfer'},
        'pending',
        ${orderData.customerName || 'Customer'},
        ${orderData.customerPhone || ''},
        ${orderData.customerEmail || ''},
        ${orderData.serviceId || null},
        ${orderData.serviceName || null},
        ${orderData.servicePrice || 0},
        ${orderData.hasService || false},
        ${orderData.shippingAddress ? JSON.stringify(orderData.shippingAddress) : null},
        ${now},
        ${now}
      ) RETURNING *
    `;

    const newOrder = result[0];
    newOrder.items = newOrder.items ? (typeof newOrder.items === 'string' ? JSON.parse(newOrder.items) : newOrder.items) : [];
    
    console.log(`✅ Order created: ${newOrder.id}`);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
