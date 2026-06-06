import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem } from '@/types/auth';
import { ORDERS } from '@/lib/data/orders';

// Helper to save orders to file
async function saveOrdersToFile(orders: Order[]) {
  const fs = await import('fs/promises');
  const path = await import('path');

  const filePath = path.join(process.cwd(), 'src/lib/data/orders.ts');
  const fileContent = `import { Order } from '@/types/auth';\n\nexport const ORDERS: Order[] = ${JSON.stringify(orders, null, 2)};\n`;

  await fs.writeFile(filePath, fileContent, 'utf-8');
}

// Generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `PA-\${year}\${month}\${day}-\${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let filteredOrders = [...ORDERS];

    // Filter by user ID if provided
    if (userId) {
      filteredOrders = filteredOrders.filter(order => order.userId === userId);
    }

    // Filter by status if provided
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // Sort by latest first
    filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(filteredOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.userId || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and items are required' },
        { status: 400 }
      );
    }

    // Generate order ID (auto-increment)
    const newOrderId = ORDERS.length > 0 ? Math.max(...ORDERS.map(o => o.id)) + 1 : 1;
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Create complete order object
    const newOrder: Order = {
      id: newOrderId,
      userId: orderData.userId,
      orderNumber,
      items: orderData.items.map((item: any, index: number) => ({
        id: index + 1,
        orderId: newOrderId,
        productId: item.productId,
        name: item.name,
        title: item.title,
        brand: item.brand,
        spec: item.spec,
        capacity: item.capacity,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal: orderData.subtotal || 0,
      shipping: orderData.shipping || 0,
      tax: orderData.tax || 0,
      total: orderData.total || 0,
      status: orderData.status || 'pending',
      shippingAddress: orderData.shippingAddress || null,
      billingAddress: orderData.billingAddress || null,
      paymentMethod: orderData.paymentMethod || 'pending',
      paymentStatus: 'pending',
      trackingNumber: undefined,
      estimatedDelivery: undefined,
      actualDelivery: undefined,
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to orders array
    const updatedOrders = [...ORDERS, newOrder];
    
    // Save to file
    await saveOrdersToFile(updatedOrders);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status, notes } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and status are required' },
        { status: 400 }
      );
    }

    const orderIndex = ORDERS.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order
    const updatedOrders = [...ORDERS];
    updatedOrders[orderIndex] = {
      ...updatedOrders[orderIndex],
      status,
      notes: notes || updatedOrders[orderIndex].notes,
      updatedAt: new Date().toISOString(),
    };

    // If status is confirmed and was pending, update payment status
    if (status === 'confirmed' && updatedOrders[orderIndex].status === 'pending') {
      updatedOrders[orderIndex].paymentStatus = 'paid';
    }

    // Save to file
    await saveOrdersToFile(updatedOrders);

    return NextResponse.json(updatedOrders[orderIndex]);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}




