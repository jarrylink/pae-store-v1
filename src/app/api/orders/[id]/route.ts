import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    timeout: 60000,
    retry: { attempts: 3, delay: 1000 }
  }
});

// Helper to authenticate user from cookies
function getUserFromRequest(request: NextRequest) {
  const userCookie = request.cookies.get('user_data');
  if (userCookie?.value) {
    try {
      return JSON.parse(decodeURIComponent(userCookie.value));
    } catch (e) {
      console.error('Error parsing user_data cookie:', e);
    }
  }
  return null;
}

// GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderIdNum = parseInt(id, 10);

    if (isNaN(orderIdNum)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const [orders, serviceCatalog, productCatalog] = await Promise.all([
      sql`
        SELECT
          o.id,
          o."userId",
          o."orderNumber",
          o.items,
          o.subtotal,
          o.shipping,
          o.tax,
          o.total,
          o.status,
          o."paymentMethod",
          o."paymentStatus",
          o."customerName",
          o."customerPhone",
          o."customerEmail",
          o."shippingAddress",
          o."serviceId",
          o."serviceName",
          o."servicePrice",
          o."hasService",
          o."createdAt",
          o."updatedAt",
          u.phone as "userPhone"
        FROM "Order" o
        LEFT JOIN "User" u ON o."userId" = u.id
        WHERE o.id = ${orderIdNum}
      `,
      sql`SELECT id, name, price FROM "Service"`,
      sql`SELECT id, title, price FROM "Product"`
    ]);

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];
    const serviceCatalogMap = new Map<number, any>(
      serviceCatalog.map((s: any) => [Number(s.id), s])
    );
    const productCatalogSet = new Set<number>(
      productCatalog.map((p: any) => Number(p.id))
    );

    const rawItems = order.items
      ? typeof order.items === 'string'
        ? JSON.parse(order.items)
        : order.items
      : [];

    const products: any[] = [];
    const services: any[] = [];
    const rawAccessoryItems: any[] = [];

    for (const item of rawItems) {
      const isExplicitService =
        item.type === 'service' || item.serviceId != null;

      const isCatalogService =
        !isExplicitService &&
        item.productId != null &&
        serviceCatalogMap.has(Number(item.productId)) &&
        !productCatalogSet.has(Number(item.productId));

      const isAccessory =
        item.type === 'accessory' || item.accessoryId != null;

      if (isExplicitService || isCatalogService) {
        const svcId = Number(item.serviceId ?? item.productId ?? order.serviceId ?? 0);
        const catalogItem = serviceCatalogMap.get(svcId);
        services.push({
          ...item,
          type: 'service',
          serviceId: svcId,
          productId: svcId,
          name: item.name || item.title || catalogItem?.name || 'Service',
          title: item.title || item.name || catalogItem?.name || 'Service',
          price: Number(item.price ?? catalogItem?.price ?? 0),
          quantity: Number(item.quantity || 1)
        });
      } else if (isAccessory) {
        rawAccessoryItems.push(item);
      } else {
        products.push({
          ...item,
          type: 'product',
          productId: Number(item.productId ?? item.id ?? 0),
          name: item.name || item.title || 'Product',
          title: item.title || item.name || 'Product',
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1)
        });
      }
    }

    if (
      services.length === 0 &&
      (order.hasService || Number(order.servicePrice || 0) > 0) &&
      (order.serviceName || order.serviceId)
    ) {
      const svcPrice = Number(order.servicePrice || 0);
      const svcId = Number(order.serviceId || 0);
      const catalogItem = serviceCatalogMap.get(svcId);
      services.push({
        productId: svcId,
        serviceId: svcId,
        title: order.serviceName || catalogItem?.name || 'Installation Service',
        name: order.serviceName || catalogItem?.name || 'Installation Service',
        price: svcPrice,
        quantity: 1,
        image: '',
        type: 'service',
        lineItemId: `legacy_service_${order.id}`
      });
    }

    const accessoriesFromDb = await sql`
      SELECT
        oa.id,
        oa."orderId",
        oa."accessoryId",
        oa.quantity,
        oa.unit_price,
        oa.total_price,
        oa.unit,
        a.name,
        a.image,
        a.sku,
        a.category
      FROM "OrderAccessory" oa
      LEFT JOIN "Accessory" a ON oa."accessoryId" = a.id
      WHERE oa."orderId" = ${order.id}
      ORDER BY oa.id ASC
    `;

    const normalizedAccessories: any[] = accessoriesFromDb.map((oa: any) => {
      const qty = Number(oa.quantity || 1);
      const unitPrice = Number(oa.unit_price || 0);
      const totalPrice = Number(
        oa.total_price != null ? oa.total_price : unitPrice * qty
      );
      return {
        id: oa.id,
        orderId: oa.orderId,
        accessoryId: Number(oa.accessoryId),
        name: oa.name || 'Accessory',
        title: oa.name || 'Accessory',
        quantity: qty,
        unit_price: unitPrice,
        price: unitPrice,
        total_price: totalPrice,
        unit: oa.unit || 'piece',
        image: oa.image || '',
        sku: oa.sku,
        category: oa.category,
        type: 'accessory' as const
      };
    });

    for (const item of rawAccessoryItems) {
      const accId = Number(item.accessoryId ?? item.productId ?? item.id ?? 0);
      if (
        accId > 0 &&
        !normalizedAccessories.some((a: any) => a.accessoryId === accId)
      ) {
        const qty = Number(item.quantity || 1);
        const unitPrice = Number(item.price || item.unit_price || 0);
        normalizedAccessories.push({
          accessoryId: accId,
          name: item.name || item.title || 'Accessory',
          title: item.title || item.name || 'Accessory',
          quantity: qty,
          unit_price: unitPrice,
          price: unitPrice,
          total_price: Number(
            item.total_price != null ? item.total_price : unitPrice * qty
          ),
          unit: item.unit || 'piece',
          image: item.image || '',
          type: 'accessory' as const
        });
      }
    }

    let productTotal = 0;
    for (const p of products) {
      productTotal += Number(p.price || 0) * Number(p.quantity || 1);
    }

    let serviceTotal = 0;
    for (const s of services) {
      serviceTotal += Number(s.price || 0) * Number(s.quantity || 1);
    }

    let accessoryTotal = 0;
    for (const a of normalizedAccessories) {
      accessoryTotal += Number(a.total_price || 0);
    }

    const shipping = Number(order.shipping || 0);
    const tax = Number(order.tax || 0);
    const subtotal = productTotal + accessoryTotal + serviceTotal;
    const grandTotal = subtotal + shipping + tax;

    const shippingAddress =
      order.shippingAddress
        ? typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress
        : null;

    const resolvedCustomerPhone =
      order.customerPhone ||
      (shippingAddress && shippingAddress.phone) ||
      order.userPhone ||
      '';

    return NextResponse.json({
      ...order,
      customerPhone: resolvedCustomerPhone,
      items: products,
      products,
      accessories: normalizedAccessories,
      services,
      shippingAddress,
      productTotal,
      accessoryTotal,
      serviceTotal,
      subtotal,
      shipping,
      tax,
      total: grandTotal,
      hasService: services.length > 0,
      serviceId: services[0]?.serviceId ?? order.serviceId ?? null,
      serviceName: services[0]?.name ?? order.serviceName ?? null,
      servicePrice: serviceTotal
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH /api/orders/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderIdNum = parseInt(id, 10);

    if (isNaN(orderIdNum)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const data = await request.json();
    console.log(`📝 PATCH /api/orders/${orderIdNum} request received`);

    // Fetch existing order from DB
    const existingOrders = await sql`
      SELECT * FROM "Order" WHERE id = ${orderIdNum}
    `;

    if (existingOrders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const existingOrder = existingOrders[0];

    // Authorization & Ownership Verification
    const authUser = getUserFromRequest(request);
    const effectiveUserId = authUser?.id || data.userId;
    let userRole = authUser?.role;

    if (!userRole && effectiveUserId) {
      try {
        const userRow = await sql`SELECT role FROM "User" WHERE id = ${effectiveUserId}`;
        if (userRow.length > 0 && userRow[0].role) {
          userRole = userRow[0].role;
        }
      } catch (err) {
        console.error('Error checking user role for order authorization:', err);
      }
    }

    const isStaffOrAdmin = ['admin', 'superadmin', 'staff'].includes(userRole || '');

    if (
      effectiveUserId &&
      existingOrder.userId &&
      effectiveUserId !== existingOrder.userId &&
      !isStaffOrAdmin
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to edit this order.' },
        { status: 403 }
      );
    }

    // Status Protection: Only "pending" orders can be edited
    if (existingOrder.status !== 'pending') {
      return NextResponse.json(
        {
          error: `This order can no longer be edited because its status is '${existingOrder.status}'. Only pending orders can be modified.`
        },
        { status: 409 }
      );
    }

    // Payment Protection: If order is already paid, editing is forbidden
    if (existingOrder.paymentStatus === 'paid') {
      return NextResponse.json(
        {
          error: 'This order cannot be edited because payment has already been received.'
        },
        { status: 409 }
      );
    }

    // Catalog lookup for deterministic classification (no name guessing)
    const [serviceCatalog, productCatalog, accessoryCatalog] = await Promise.all([
      sql`SELECT id, name, price, "isActive" FROM "Service"`,
      sql`SELECT id, title, price, "isActive" FROM "Product"`,
      sql`SELECT id, name, price, "isActive" FROM "Accessory"`
    ]);

    const serviceCatalogMap = new Map<number, any>(
      serviceCatalog.map((s: any) => [Number(s.id), s])
    );
    const productCatalogSet = new Set<number>(
      productCatalog.map((p: any) => Number(p.id))
    );

    const products: any[] = [];
    const services: any[] = [];
    const rawAccessoryItems: any[] = [];

    // Classify items
    for (const item of data.items || []) {
      const isExplicitService =
        item.type === 'service' || item.serviceId != null;

      const isCatalogService =
        !isExplicitService &&
        item.productId != null &&
        serviceCatalogMap.has(Number(item.productId)) &&
        !productCatalogSet.has(Number(item.productId));

      const isAccessory =
        item.type === 'accessory' || item.accessoryId != null;

      if (isExplicitService || isCatalogService) {
        const svcId = Number(item.serviceId ?? item.productId ?? 0);
        const catalogItem = serviceCatalogMap.get(svcId);
        services.push({
          ...item,
          type: 'service',
          serviceId: svcId,
          productId: svcId,
          name: item.name || item.title || catalogItem?.name || 'Service',
          title: item.title || item.name || catalogItem?.name || 'Service',
          price: Number(item.price ?? catalogItem?.price ?? 0),
          quantity: Number(item.quantity || 1)
        });
      } else if (isAccessory) {
        rawAccessoryItems.push(item);
      } else {
        products.push({
          ...item,
          type: 'product',
          productId: Number(item.productId ?? item.id ?? 0),
          name: item.name || item.title || 'Product',
          title: item.title || item.name || 'Product',
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1)
        });
      }
    }

    // Service compatibility
    if (
      services.length === 0 &&
      (data.hasService || Number(data.servicePrice || 0) > 0) &&
      (data.serviceName || data.serviceId)
    ) {
      const svcPrice = Number(data.servicePrice || 0);
      const svcId = Number(data.serviceId || 0);
      const catalogItem = serviceCatalogMap.get(svcId);
      services.push({
        productId: svcId,
        serviceId: svcId,
        title: data.serviceName || catalogItem?.name || 'Service',
        name: data.serviceName || catalogItem?.name || 'Service',
        price: svcPrice,
        quantity: 1,
        image: '',
        type: 'service',
        lineItemId: `service_${Date.now()}`
      });
    }

    const storedItems = [...products, ...services];

    // Normalize accessories
    const accessoriesList = data.accessories || [];
    const normalizedAccessories: any[] = [];
    const seenAccIds = new Set<number>();

    for (const acc of [...accessoriesList, ...rawAccessoryItems]) {
      const accId = Number(acc.accessoryId ?? acc.productId ?? acc.id ?? 0);
      if (accId > 0 && seenAccIds.has(accId)) continue;
      if (accId > 0) seenAccIds.add(accId);

      const unitPrice = Number(acc.unit_price ?? acc.price ?? 0);
      const qty = Number(acc.quantity || 1);
      const totalPrice = Number(
        acc.total_price != null ? acc.total_price : unitPrice * qty
      );

      normalizedAccessories.push({
        accessoryId: accId,
        name: acc.name || acc.title || 'Accessory',
        title: acc.title || acc.name || 'Accessory',
        quantity: qty,
        unit_price: unitPrice,
        price: unitPrice,
        total_price: totalPrice,
        unit: acc.unit || 'piece',
        image: acc.image || ''
      });
    }

    // ----------------------------------------------------
    // REVALIDATE VISIBILITY FOR NEWLY ADDED ITEMS (Phase 13)
    // Existing items in the order remain intact.
    // ----------------------------------------------------
    const rawExistingItems = existingOrder.items
      ? typeof existingOrder.items === 'string'
        ? JSON.parse(existingOrder.items)
        : existingOrder.items
      : [];

    const existingProductIds = new Set(
      rawExistingItems
        .filter((it: any) => it.type === 'product' || (!it.type && !it.serviceId && !it.accessoryId))
        .map((it: any) => Number(it.productId || it.id))
    );
    const existingServiceIds = new Set(
      rawExistingItems
        .filter((it: any) => it.type === 'service' || it.serviceId != null)
        .map((it: any) => Number(it.serviceId || it.productId || it.id))
    );

    const existingAccessories = await sql`
      SELECT "accessoryId" FROM "OrderAccessory" WHERE "orderId" = ${orderIdNum}
    `;
    const existingAccessoryIds = new Set(
      existingAccessories.map((ea: any) => Number(ea.accessoryId))
    );

    const productCatalogMap = new Map<number, any>(
      productCatalog.map((p: any) => [Number(p.id), p])
    );
    const accessoryCatalogMap = new Map<number, any>(
      accessoryCatalog.map((a: any) => [Number(a.id), a])
    );

    for (const prod of products) {
      const pId = Number(prod.productId || prod.id);
      if (!existingProductIds.has(pId)) {
        const catProd = productCatalogMap.get(pId);
        if (catProd && catProd.isActive === false) {
          return NextResponse.json(
            { error: `The item "${catProd.title}" is currently unavailable and cannot be added to the order.` },
            { status: 400 }
          );
        }
      }
    }

    for (const svc of services) {
      const sId = Number(svc.serviceId || svc.productId || svc.id);
      if (!existingServiceIds.has(sId)) {
        const catSvc = serviceCatalogMap.get(sId);
        if (catSvc && catSvc.isActive === false) {
          return NextResponse.json(
            { error: `The service "${catSvc.name}" is currently unavailable and cannot be added to the order.` },
            { status: 400 }
          );
        }
      }
    }

    for (const acc of normalizedAccessories) {
      const aId = Number(acc.accessoryId);
      if (!existingAccessoryIds.has(aId)) {
        const catAcc = accessoryCatalogMap.get(aId);
        if (catAcc && catAcc.isActive === false) {
          return NextResponse.json(
            { error: `The accessory "${catAcc.name}" is currently unavailable and cannot be added to the order.` },
            { status: 400 }
          );
        }
      }
    }

    // Recalculate totals server-side
    let productTotal = 0;
    for (const item of products) {
      productTotal += Number(item.price || 0) * Number(item.quantity || 1);
    }

    let serviceTotal = 0;
    for (const service of services) {
      serviceTotal += Number(service.price || 0) * Number(service.quantity || 1);
    }

    let accessoryTotal = 0;
    for (const accessory of normalizedAccessories) {
      accessoryTotal += Number(accessory.total_price || 0);
    }

    const shipping =
      data.shipping !== undefined
        ? Number(data.shipping)
        : Number(existingOrder.shipping || 0);

    const tax =
      data.tax !== undefined
        ? Number(data.tax)
        : Number(existingOrder.tax || 0);

    const subtotal = productTotal + serviceTotal + accessoryTotal;
    const grandTotal = subtotal + shipping + tax;

    // Resolve Customer Phone reliably
    let customerPhone =
      data.customerPhone ||
      data.shippingAddress?.phone ||
      existingOrder.customerPhone ||
      '';

    if (!customerPhone && existingOrder.userId) {
      try {
        const userRows = await sql`SELECT phone FROM "User" WHERE id = ${existingOrder.userId}`;
        if (userRows.length > 0 && userRows[0].phone) {
          customerPhone = userRows[0].phone;
        }
      } catch (err) {
        console.error('Error fetching user phone for PATCH order:', err);
      }
    }

    const customerName =
      data.customerName ||
      data.shippingAddress?.name ||
      existingOrder.customerName ||
      'Customer';

    const customerEmail =
      data.customerEmail ||
      existingOrder.customerEmail ||
      '';

    const shippingAddressPayload =
      data.shippingAddress !== undefined
        ? (typeof data.shippingAddress === 'string'
            ? data.shippingAddress
            : JSON.stringify(data.shippingAddress))
        : (existingOrder.shippingAddress
            ? (typeof existingOrder.shippingAddress === 'string'
                ? existingOrder.shippingAddress
                : JSON.stringify(existingOrder.shippingAddress))
            : null);

    const paymentMethod =
      data.paymentMethod ||
      existingOrder.paymentMethod ||
      'bank_transfer';

    const now = new Date().toISOString();

    // Atomically UPDATE the existing Order record (DO NOT INSERT A SECOND ORDER)
    const updateResult = await sql`
      UPDATE "Order"
      SET
        items = ${JSON.stringify(storedItems)},
        subtotal = ${subtotal},
        shipping = ${shipping},
        tax = ${tax},
        total = ${grandTotal},
        "customerName" = ${customerName},
        "customerPhone" = ${customerPhone},
        "customerEmail" = ${customerEmail},
        "serviceId" = ${services[0]?.serviceId || null},
        "serviceName" = ${services[0]?.name || null},
        "servicePrice" = ${serviceTotal},
        "hasService" = ${services.length > 0},
        "shippingAddress" = ${shippingAddressPayload},
        "paymentMethod" = ${paymentMethod},
        "updatedAt" = ${now}
      WHERE id = ${orderIdNum}
      RETURNING *
    `;

    const updatedOrder = updateResult[0];

    // Synchronize OrderAccessory records safely
    await sql`
      DELETE FROM "OrderAccessory"
      WHERE "orderId" = ${orderIdNum}
    `;

    if (normalizedAccessories.length > 0) {
      // Validate which accessoryIds actually exist in Accessory table to prevent FK constraint violation
      const candidateIds = normalizedAccessories
        .map((a: any) => Number(a.accessoryId))
        .filter((id: number) => id > 0);

      let validAccIdSet = new Set<number>();
      if (candidateIds.length > 0) {
        try {
          const validRows = await sql`
            SELECT id FROM "Accessory" WHERE id = ANY(${candidateIds})
          `;
          validAccIdSet = new Set(validRows.map((r: any) => Number(r.id)));
        } catch (fkCheckErr) {
          console.error('Error verifying accessory IDs against Accessory table:', fkCheckErr);
        }
      }

      for (const acc of normalizedAccessories) {
        if (acc.accessoryId > 0 && validAccIdSet.has(acc.accessoryId) && acc.unit_price >= 0) {
          await sql`
            INSERT INTO "OrderAccessory" (
              "orderId",
              "accessoryId",
              quantity,
              unit_price,
              total_price,
              unit,
              "createdAt",
              "updatedAt"
            )
            VALUES (
              ${orderIdNum},
              ${acc.accessoryId},
              ${acc.quantity},
              ${acc.unit_price},
              ${acc.total_price},
              ${acc.unit || 'piece'},
              ${now},
              ${now}
            )
          `;
        }
      }
    }

    console.log(`✅ Order #${orderIdNum} updated successfully without duplicate ID!`);

    // Return normalized structure matching GET
    updatedOrder.items = products;
    updatedOrder.products = products;
    updatedOrder.services = services;
    updatedOrder.accessories = normalizedAccessories;
    updatedOrder.customerPhone = customerPhone;

    updatedOrder.productTotal = productTotal;
    updatedOrder.serviceTotal = serviceTotal;
    updatedOrder.accessoryTotal = accessoryTotal;

    updatedOrder.subtotal = subtotal;
    updatedOrder.shipping = shipping;
    updatedOrder.tax = tax;
    updatedOrder.total = grandTotal;

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error(`Error updating order:`, error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Alias to PATCH
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}
