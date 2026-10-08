import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'), {
  fetchOptions: {
    timeout: 60000,
    retry: { attempts: 3, delay: 1000 }
  }
});

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
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
        WHERE o."userId" = ${userId}
        ORDER BY o."createdAt" DESC
      `,
      sql`SELECT id, name, price FROM "Service"`,
      sql`SELECT id, title, price FROM "Product"`
    ]);

    const serviceCatalogMap = new Map<number, any>(
      serviceCatalog.map((s: any) => [Number(s.id), s])
    );
    const productCatalogSet = new Set<number>(
      productCatalog.map((p: any) => Number(p.id))
    );

    const ordersWithData = [];

    for (const order of orders) {
      const rawItems =
        order.items
          ? typeof order.items === 'string'
            ? JSON.parse(order.items)
            : order.items
          : [];

      // --------------------------------------------
      // PHASE 1 + PHASE 3: SEPARATE PRODUCTS & SERVICES
      // Deterministic classification based on explicit fields
      // and catalog primary keys (zero name guessing)
      // --------------------------------------------
      const products: any[] = [];
      const services: any[] = [];
      const rawAccessoryItems: any[] = [];

      for (const item of rawItems) {
        const isExplicitService =
          item.type === 'service' ||
          item.serviceId != null;

        const isCatalogService =
          !isExplicitService &&
          item.productId != null &&
          serviceCatalogMap.has(Number(item.productId)) &&
          !productCatalogSet.has(Number(item.productId));

        const isAccessory =
          item.type === 'accessory' ||
          item.accessoryId != null;

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

      // Backward compatibility for older orders where
      // the service only exists in top-level Order columns.
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

      // --------------------------------------------
      // PHASE 2: ACCESSORIES
      // Accessories come from OrderAccessory relation
      // --------------------------------------------
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
        LEFT JOIN "Accessory" a
          ON oa."accessoryId" = a.id
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

      // Merge any accessory from raw items if not already present
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

      // --------------------------------------------
      // UNIFIED TOTAL CALCULATION MODEL
      // --------------------------------------------
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

      ordersWithData.push({
        ...order,
        customerPhone: resolvedCustomerPhone,

        // Backward compatibility: items contains only products
        items: products,

        // Explicit three-phase order structure
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
      });
    }

    return NextResponse.json(ordersWithData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);

    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const orderNumber = `ORD-${Date.now()}`;
    const now = new Date().toISOString();

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

    // Separate products and services deterministically
    for (const item of data.items || []) {
      const isExplicitService =
        item.type === 'service' ||
        item.serviceId != null;

      const isCatalogService =
        !isExplicitService &&
        item.productId != null &&
        serviceCatalogMap.has(Number(item.productId)) &&
        !productCatalogSet.has(Number(item.productId));

      const isAccessory =
        item.type === 'accessory' ||
        item.accessoryId != null;

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

    // Compatibility with checkout sending service through top-level fields
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

    // Keep products + services in Order.items with explicit types
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

    // --------------------------------------------
    // REVALIDATE CATALOGUE VISIBILITY (Phase 11 & 12)
    // --------------------------------------------
    const productCatalogMap = new Map<number, any>(
      productCatalog.map((p: any) => [Number(p.id), p])
    );
    const accessoryCatalogMap = new Map<number, any>(
      accessoryCatalog.map((a: any) => [Number(a.id), a])
    );

    for (const prod of products) {
      const pId = Number(prod.productId || prod.id);
      const catProd = productCatalogMap.get(pId);
      if (catProd && catProd.isActive === false) {
        return NextResponse.json(
          {
            error: `One or more items in your cart are currently unavailable ("${catProd.title}"). Please review your cart.`
          },
          { status: 400 }
        );
      }
    }

    for (const svc of services) {
      const sId = Number(svc.serviceId || svc.productId || svc.id);
      const catSvc = serviceCatalogMap.get(sId);
      if (catSvc && catSvc.isActive === false) {
        return NextResponse.json(
          {
            error: `The service "${catSvc.name}" is currently unavailable. Please review your order.`
          },
          { status: 400 }
        );
      }
    }

    for (const acc of normalizedAccessories) {
      const aId = Number(acc.accessoryId);
      const catAcc = accessoryCatalogMap.get(aId);
      if (catAcc && catAcc.isActive === false) {
        return NextResponse.json(
          {
            error: `The accessory "${catAcc.name}" is currently unavailable. Please review your cart.`
          },
          { status: 400 }
        );
      }
    }

    // --------------------------------------------
    // UNIFIED TOTAL CALCULATION MODEL
    // --------------------------------------------
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

    const shipping = Number(data.shipping || 0);
    const tax = Number(data.tax || 0);

    const subtotal = productTotal + serviceTotal + accessoryTotal;
    const grandTotal = subtotal + shipping + tax;

    let customerPhone = data.customerPhone || data.shippingAddress?.phone || '';
    if (!customerPhone && data.userId) {
      try {
        const userRows = await sql`SELECT phone FROM "User" WHERE id = ${data.userId}`;
        if (userRows.length > 0 && userRows[0].phone) {
          customerPhone = userRows[0].phone;
        }
      } catch (err) {
        console.error('Error fetching user phone fallback:', err);
      }
    }

    console.log('Order totals:', {
      productTotal,
      serviceTotal,
      accessoryTotal,
      shipping,
      tax,
      subtotal,
      grandTotal,
      customerPhone
    });

    const result = await sql`
      INSERT INTO "Order" (
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
        "serviceId",
        "serviceName",
        "servicePrice",
        "hasService",
        "shippingAddress",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${data.userId},
        ${orderNumber},
        ${JSON.stringify(storedItems)},
        ${subtotal},
        ${shipping},
        ${tax},
        ${grandTotal},
        ${data.status || 'pending'},
        ${data.paymentMethod || 'bank_transfer'},
        'pending',
        ${data.customerName || 'Customer'},
        ${customerPhone},
        ${data.customerEmail || ''},
        ${services[0]?.serviceId || data.serviceId || null},
        ${services[0]?.name || data.serviceName || null},
        ${serviceTotal},
        ${services.length > 0},
        ${
          data.shippingAddress
            ? JSON.stringify(data.shippingAddress)
            : null
        },
        ${now},
        ${now}
      )
      RETURNING *
    `;

    const newOrder = result[0];

    // Save accessories to OrderAccessory table
    if (normalizedAccessories.length > 0) {
      for (const acc of normalizedAccessories) {
        if (acc.accessoryId > 0 && acc.unit_price >= 0) {
          await sql`
            INSERT INTO "OrderAccessory" (
              "orderId",
              "accessoryId",
              quantity,
              unit_price,
              total_price,
              unit
            )
            VALUES (
              ${newOrder.id},
              ${acc.accessoryId},
              ${acc.quantity},
              ${acc.unit_price},
              ${acc.total_price},
              ${acc.unit || 'piece'}
            )
          `;
        }
      }
    }

    // Return clean three-phase structure
    newOrder.items = products;
    newOrder.products = products;
    newOrder.services = services;
    newOrder.accessories = normalizedAccessories;

    newOrder.productTotal = productTotal;
    newOrder.serviceTotal = serviceTotal;
    newOrder.accessoryTotal = accessoryTotal;

    newOrder.subtotal = subtotal;
    newOrder.shipping = shipping;
    newOrder.tax = tax;
    newOrder.total = grandTotal;

    return NextResponse.json(
      newOrder,
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating order:', error);

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
