const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkOrderAndInvoice() {
    try {
        // Get the most recent order
        const orders = await sql
            SELECT 
                id, 
                status, 
                total, 
                items, 
                accessories,
                "customerName",
                "customerEmail",
                "customerPhone",
                "shippingAddress",
                "createdAt"
            FROM "Order" 
            ORDER BY id DESC 
            LIMIT 1
        ;
        
        if (orders.length === 0) {
            console.log('❌ No orders found');
            return;
        }
        
        const order = orders[0];
        console.log('📦 ORDER DETAILS:');
        console.log(  Order ID: );
        console.log(  Status: );
        console.log(  Total: ₦);
        console.log(  Customer: );
        console.log(  Email: );
        console.log(  Phone: );
        console.log(  Date: );
        console.log('');
        
        // Parse items
        let items = order.items;
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch(e) { items = []; }
        }
        
        console.log('📋 ITEMS:');
        let productTotal = 0;
        let accessoryTotal = 0;
        let serviceTotal = 0;
        
        if (Array.isArray(items)) {
            items.forEach((item, index) => {
                const price = Number(item.price) || 0;
                const qty = Number(item.quantity) || 1;
                const total = price * qty;
                const type = item.type || 'product';
                
                console.log(  . );
                console.log(     Price: ₦ ×  = ₦);
                console.log(     Type: );
                console.log(     Product ID: );
                console.log('');
                
                if (type === 'accessory' || item.accessoryId) {
                    accessoryTotal += total;
                } else if (type === 'service' || item.serviceId) {
                    serviceTotal += total;
                } else {
                    productTotal += total;
                }
            });
        }
        
        // Parse accessories
        let accessories = order.accessories;
        if (typeof accessories === 'string') {
            try { accessories = JSON.parse(accessories); } catch(e) { accessories = []; }
        }
        
        if (accessories && accessories.length > 0) {
            console.log('📎 ACCESSORIES:');
            accessories.forEach((acc, index) => {
                const price = Number(acc.unit_price || acc.price) || 0;
                const qty = Number(acc.quantity) || 1;
                const total = price * qty;
                console.log(  . );
                console.log(     Price: ₦ ×  = ₦);
                accessoryTotal += total;
            });
            console.log('');
        }
        
        console.log('💰 TOTALS:');
        console.log(  Products: ₦);
        console.log(  Accessories: ₦);
        console.log(  Services: ₦);
        console.log(  Grand Total: ₦);
        console.log('');
        console.log(✅ Calculated Total: ₦);
        
        // Check if the order has accessories data
        if (order.accessories) {
            console.log(\n📎 Order Accessories: );
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkOrderAndInvoice();
