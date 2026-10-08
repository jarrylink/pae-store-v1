const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function cleanDatabaseData() {
    console.log('?? Cleaning database data...\n');

    try {
        // Get all orders
        const orders = await sql
            SELECT id, items FROM "Order"
        ;

        for (const order of orders) {
            let items = typeof order.items === 'string' 
                ? JSON.parse(order.items) 
                : order.items;

            let cleaned = false;

            // Clean each item
            items = items.map((item: any) => {
                if (item.title && typeof item.title === 'string') {
                    const original = item.title;
                    item.title = item.title
                        .replace(/Ãƒâ€�/g, '�')
                        .replace(/ÃƒÆ’/g, '�')
                        .replace(/Ã¢â‚¬â„¢/g, "'")
                        .replace(/Ãƒ/g, '')
                        .replace(/â€¢/g, '�')
                        .replace(/Ã¢/g, '')
                        .replace(/â‚¬/g, '�')
                        .replace(/Ã/g, '')
                        .replace(/�/g, '')
                        .trim();
                    if (original !== item.title) cleaned = true;
                }
                if (item.name && typeof item.name === 'string') {
                    const original = item.name;
                    item.name = item.name
                        .replace(/Ãƒâ€�/g, '�')
                        .replace(/ÃƒÆ’/g, '�')
                        .replace(/Ã¢â‚¬â„¢/g, "'")
                        .replace(/Ãƒ/g, '')
                        .replace(/â€¢/g, '�')
                        .replace(/Ã¢/g, '')
                        .replace(/â‚¬/g, '�')
                        .replace(/Ã/g, '')
                        .replace(/�/g, '')
                        .trim();
                    if (original !== item.name) cleaned = true;
                }
                return item;
            });

            if (cleaned) {
                await sql
                    UPDATE "Order" 
                    SET items = 
                    WHERE id = 
                ;
                console.log(? Cleaned order );
            }
        }

        // Clean Accessory names
        const accessories = await sql
            SELECT id, name FROM "Accessory"
        ;

        for (const acc of accessories) {
            const original = acc.name;
            const cleaned = acc.name
                .replace(/Ãƒâ€�/g, '�')
                .replace(/ÃƒÆ’/g, '�')
                .replace(/Ã¢â‚¬â„¢/g, "'")
                .replace(/Ãƒ/g, '')
                .replace(/â€¢/g, '�')
                .replace(/Ã¢/g, '')
                .replace(/â‚¬/g, '�')
                .replace(/Ã/g, '')
                .replace(/�/g, '')
                .trim();
            
            if (original !== cleaned) {
                await sql
                    UPDATE "Accessory" 
                    SET name = 
                    WHERE id = 
                ;
                console.log(? Cleaned accessory :  -> );
            }
        }

        console.log('\n? Database cleanup complete!');
    } catch (error) {
        console.error('? Error:', error.message);
    }
}

cleanDatabaseData();
