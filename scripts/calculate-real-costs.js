const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function calculateRealCosts() {
    try {
        console.log('📊 CALCULATING REAL COSTS FROM DATABASE:\n');
        
        // Get all orders with their items
        const orders = await sql`
            SELECT id, status, total, items 
            FROM "Order" 
            WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
        `;
        
        let totalRevenue = 0;
        let totalCost = 0;
        let totalOrders = 0;
        
        for (const order of orders) {
            let items = order.items;
            if (typeof items === 'string') {
                items = JSON.parse(items);
            }
            
            let orderCost = 0;
            let orderRevenue = 0;
            
            if (Array.isArray(items)) {
                for (const item of items) {
                    const productId = item.productId;
                    const quantity = Number(item.quantity) || 1;
                    const price = Number(item.price) || 0;
                    
                    // Get cost price for this product
                    if (productId) {
                        const product = await sql`
                            SELECT "purchasePrice" as cost 
                            FROM "Product" 
                            WHERE id = ${productId}
                        `;
                        const costPrice = product.length > 0 ? Number(product[0].cost) || 0 : 0;
                        orderCost += costPrice * quantity;
                    }
                    
                    orderRevenue += price * quantity;
                }
            }
            
            totalRevenue += orderRevenue;
            totalCost += orderCost;
            totalOrders++;
            
            console.log(`Order #${order.id}: Revenue=${orderRevenue}, Cost=${orderCost}, Profit=${orderRevenue - orderCost}`);
        }
        
        console.log('\n📊 SUMMARY:');
        console.log(`  Total Orders: ${totalOrders}`);
        console.log(`  Total Revenue: ${totalRevenue}`);
        console.log(`  Total Cost: ${totalCost}`);
        console.log(`  Total Profit: ${totalRevenue - totalCost}`);
        console.log(`  Margin: ${totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1) : 0}%`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

calculateRealCosts();
