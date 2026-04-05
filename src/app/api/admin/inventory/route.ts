import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function logActivity(userId: string, userEmail: string, userRole: string, action: string, entityType: string, entityId: string, oldData: any, newData: any) {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS "ActivityLog" (
                id SERIAL PRIMARY KEY,
                "userId" TEXT NOT NULL,
                "userEmail" TEXT,
                "userRole" TEXT,
                action TEXT NOT NULL,
                "entityType" TEXT,
                "entityId" TEXT,
                "oldData" JSONB,
                "newData" JSONB,
                "ipAddress" TEXT,
                "userAgent" TEXT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await sql`
            INSERT INTO "ActivityLog" (
                "userId", "userEmail", "userRole", action, 
                "entityType", "entityId", "oldData", "newData"
            ) VALUES (
                ${userId}, ${userEmail || null}, ${userRole || null}, ${action},
                ${entityType || null}, ${entityId || null}, 
                ${oldData ? JSON.stringify(oldData) : null},
                ${newData ? JSON.stringify(newData) : null}
            )
        `;
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, action, userId, userEmail, userRole } = body;
        
        // Get order details
        const order = await sql`
            SELECT * FROM "Order" WHERE id = ${parseInt(orderId)}
        `;
        
        if (order.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        const orderData = order[0];
        const oldStatus = orderData.status;
        
        // Parse items
        let items = orderData.items;
        if (typeof items === 'string') {
            items = JSON.parse(items);
        }
        
        if (action === 'confirm') {
            // Only confirm if status is 'pending'
            if (oldStatus !== 'pending') {
                return NextResponse.json({ error: `Cannot confirm order with status: ${oldStatus}` }, { status: 400 });
            }
            
            // Update inventory for each product
            const inventoryUpdates = [];
            for (const item of items) {
                if (item.type !== 'service' && item.productId) {
                    const product = await sql`
                        SELECT inventory, title FROM "Product" WHERE id = ${item.productId}
                    `;
                    
                    if (product.length > 0) {
                        if (product[0].inventory < item.quantity) {
                            return NextResponse.json({ 
                                error: `Insufficient stock for ${product[0].title}. Available: ${product[0].inventory}, Required: ${item.quantity}` 
                            }, { status: 400 });
                        }
                        
                        const newInventory = product[0].inventory - item.quantity;
                        await sql`
                            UPDATE "Product" 
                            SET inventory = ${newInventory}, 
                                "inStock" = ${newInventory > 0}
                            WHERE id = ${item.productId}
                        `;
                        
                        inventoryUpdates.push({
                            productId: item.productId,
                            productName: product[0].title,
                            oldInventory: product[0].inventory,
                            newInventory: newInventory,
                            quantityDeducted: item.quantity
                        });
                    }
                }
            }
            
            // Update order status to confirmed
            await sql`
                UPDATE "Order" 
                SET status = 'confirmed', updatedAt = NOW()
                WHERE id = ${parseInt(orderId)}
            `;
            
            // Log activity
            await logActivity(
                userId, userEmail, userRole, 
                'ORDER_CONFIRMED', 'Order', orderId,
                { status: orderData.status },
                { status: 'confirmed', inventoryUpdates }
            );
            
            return NextResponse.json({ 
                success: true, 
                message: 'Order confirmed and inventory updated',
                inventoryUpdates
            });
        } else if (action === 'cancel') {
            // Return inventory if order was confirmed or processing
            if (oldStatus === 'confirmed' || oldStatus === 'processing') {
                const inventoryRestores = [];
                for (const item of items) {
                    if (item.type !== 'service' && item.productId) {
                        const product = await sql`
                            SELECT inventory, title FROM "Product" WHERE id = ${item.productId}
                        `;
                        
                        if (product.length > 0) {
                            const newInventory = product[0].inventory + item.quantity;
                            await sql`
                                UPDATE "Product" 
                                SET inventory = ${newInventory}, 
                                    "inStock" = true
                                WHERE id = ${item.productId}
                            `;
                            
                            inventoryRestores.push({
                                productId: item.productId,
                                productName: product[0].title,
                                oldInventory: product[0].inventory,
                                newInventory: newInventory,
                                quantityRestored: item.quantity
                            });
                        }
                    }
                }
                
                await logActivity(
                    userId, userEmail, userRole,
                    'ORDER_CANCELLED', 'Order', orderId,
                    { status: oldStatus },
                    { status: 'cancelled', inventoryRestores }
                );
            }
            
            // Update order status to cancelled
            await sql`
                UPDATE "Order" 
                SET status = 'cancelled', updatedAt = NOW()
                WHERE id = ${parseInt(orderId)}
            `;
            
            return NextResponse.json({ 
                success: true, 
                message: 'Order cancelled and inventory restored'
            });
        }
        
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Inventory update error:', error);
        return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const lowStock = await sql`
            SELECT id, title, inventory, price
            FROM "Product"
            WHERE inventory < 10 AND inventory > 0
            ORDER BY inventory ASC
        `;
        
        const outOfStock = await sql`
            SELECT COUNT(*) as count
            FROM "Product"
            WHERE inventory = 0 OR "inStock" = false
        `;
        
        const totalValue = await sql`
            SELECT SUM(inventory * price) as total_value
            FROM "Product"
            WHERE inventory > 0
        `;
        
        return NextResponse.json({
            lowStockProducts: lowStock,
            outOfStockCount: outOfStock[0].count,
            totalInventoryValue: totalValue[0].total_value || 0
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }
}
