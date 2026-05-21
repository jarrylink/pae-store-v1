const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function resetWishlist() {
    try {
        // Drop and recreate WishlistItem table
        await sql`DROP TABLE IF EXISTS "WishlistItem" CASCADE`;
        
        await sql`
            CREATE TABLE "WishlistItem" (
                id TEXT PRIMARY KEY,
                "userId" TEXT NOT NULL,
                "productId" INTEGER NOT NULL,
                "addedAt" TIMESTAMP DEFAULT NOW()
            )
        `;
        
        console.log('✅ WishlistItem table recreated');
        
        // Create index for faster queries
        await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_user ON "WishlistItem"("userId")`;
        await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_product ON "WishlistItem"("productId")`;
        
        console.log('✅ Indexes created');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

resetWishlist();
