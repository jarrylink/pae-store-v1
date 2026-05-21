const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkCategories() {
    try {
        // Check if table exists
        const tableExists = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'Category'
            )
        `;
        
        console.log('Category table exists:', tableExists[0].exists);
        
        if (tableExists[0].exists) {
            // Get categories
            const categories = await sql`
                SELECT * FROM "Category" 
                WHERE "isActive" = true 
                ORDER BY "displayOrder" ASC
            `;
            
            console.log(`\n📋 Categories found: ${categories.length}`);
            categories.forEach(cat => {
                console.log(`  - ${cat.name} (${cat.slug})`);
            });
        } else {
            console.log('Creating Category table...');
            // Create table and insert default categories
            await sql`
                CREATE TABLE "Category" (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    slug TEXT NOT NULL UNIQUE,
                    description TEXT,
                    icon TEXT,
                    image TEXT,
                    "parentId" INTEGER,
                    "displayOrder" INTEGER DEFAULT 0,
                    "isActive" BOOLEAN DEFAULT true,
                    "createdAt" TIMESTAMP DEFAULT NOW(),
                    "updatedAt" TIMESTAMP DEFAULT NOW()
                )
            `;
            
            // Insert default categories
            const defaultCategories = [
                { name: 'Solar Panels', slug: 'solar-panels', icon: '☀️', displayOrder: 1 },
                { name: 'Inverters', slug: 'inverters', icon: '⚡', displayOrder: 2 },
                { name: 'Batteries', slug: 'batteries', icon: '🔋', displayOrder: 3 },
                { name: 'ESS', slug: 'ess', icon: '🔋', displayOrder: 4, description: 'Energy Storage Systems' },
                { name: 'Street Light', slug: 'street-light', icon: '💡', displayOrder: 5 },
                { name: 'Accessories', slug: 'accessories', icon: '🔌', displayOrder: 6 },
                { name: 'Installation', slug: 'installation', icon: '🔧', displayOrder: 7 }
            ];
            
            for (const cat of defaultCategories) {
                await sql`
                    INSERT INTO "Category" (name, slug, description, icon, "displayOrder")
                    VALUES (${cat.name}, ${cat.slug}, ${cat.description || null}, ${cat.icon}, ${cat.displayOrder})
                `;
            }
            console.log('✅ Default categories inserted');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkCategories();
