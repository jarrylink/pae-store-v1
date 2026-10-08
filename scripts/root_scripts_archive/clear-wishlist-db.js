const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function clearWishlist() {
    try {
        console.log('🗑️ Clearing wishlist items from database...');
        
        // Clear all wishlist items
        const result = await sql`DELETE FROM "WishlistItem" RETURNING id`;
        console.log(`✅ Cleared ${result.length} wishlist items`);
        
        // Get all users to show current state
        const users = await sql`SELECT id, email FROM "User" WHERE role IN ('customer', 'staff')`;
        console.log(`\n👥 Users that can have wishlists:`);
        users.forEach(u => console.log(`  - ${u.email} (${u.id})`));
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

clearWishlist();
