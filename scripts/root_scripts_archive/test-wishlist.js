const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function testWishlist() {
    try {
        // Get the customer user
        const users = await sql`
            SELECT id, email FROM "User" WHERE email = 'customer@powerafric.ng'
        `;
        
        if (users.length === 0) {
            console.log('Customer user not found');
            return;
        }
        
        const userId = users[0].id;
        console.log(`Testing wishlist for user: ${users[0].email} (${userId})`);
        
        // Check current wishlist
        const wishlist = await sql`
            SELECT * FROM "WishlistItem" WHERE "userId" = ${userId}
        `;
        console.log(`\nCurrent wishlist items: ${wishlist.length}`);
        wishlist.forEach(item => {
            console.log(`  - Product ID: ${item.productId}, Added: ${item.addedAt}`);
        });
        
        // Test adding a product (product ID 1)
        const productId = 1;
        console.log(`\nTesting add product ${productId}...`);
        
        // Check if exists
        const existing = await sql`
            SELECT id FROM "WishlistItem" 
            WHERE "userId" = ${userId} AND "productId" = ${productId}
        `;
        
        if (existing.length === 0) {
            // Add
            const newId = `wish_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            await sql`
                INSERT INTO "WishlistItem" (id, "userId", "productId", "addedAt")
                VALUES (${newId}, ${userId}, ${productId}, NOW())
            `;
            console.log(`✅ Added product ${productId} to wishlist`);
        } else {
            // Remove
            await sql`
                DELETE FROM "WishlistItem" 
                WHERE "userId" = ${userId} AND "productId" = ${productId}
            `;
            console.log(`✅ Removed product ${productId} from wishlist`);
        }
        
        // Show updated wishlist
        const updatedWishlist = await sql`
            SELECT * FROM "WishlistItem" WHERE "userId" = ${userId}
        `;
        console.log(`\nUpdated wishlist items: ${updatedWishlist.length}`);
        updatedWishlist.forEach(item => {
            console.log(`  - Product ID: ${item.productId}, Added: ${item.addedAt}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testWishlist();
