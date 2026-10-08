const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function createCategoriesTable() {
    try {
        console.log('📦 Creating categories table...');
        
        // Create categories table
        await sql`
            CREATE TABLE IF NOT EXISTS "Category" (
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
        
        console.log('✅ Categories table created');
        
        // Insert default categories
        const defaultCategories = [
            { name: 'Solar Panels', slug: 'solar-panels', icon: '☀️', displayOrder: 1 },
            { name: 'Inverters', slug: 'inverters', icon: '⚡', displayOrder: 2 },
            { name: 'Batteries', slug: 'batteries', icon: '🔋', displayOrder: 3 },
            { name: 'ESS', slug: 'ess', icon: '🔋', displayOrder: 4, description: 'Energy Storage Systems' },
            { name: 'Street Light', slug: 'street-light', icon: '💡', displayOrder: 5 },
            { name: 'Accessories', slug: 'accessories', icon: '🔌', displayOrder: 6 },
            { name: 'Installation', slug: 'installation', icon: '🔧', displayOrder: 7 },
            { name: 'Charge Controller', slug: 'charge-controller', icon: '⚙️', displayOrder: 8 },
            { name: 'Generator', slug: 'generator', icon: '🔧', displayOrder: 9 },
            { name: 'UPS', slug: 'ups', icon: '⚡', displayOrder: 10 }
        ];
        
        for (const cat of defaultCategories) {
            await sql`
                INSERT INTO "Category" (name, slug, description, icon, "displayOrder", "isActive")
                VALUES (${cat.name}, ${cat.slug}, ${cat.description || null}, ${cat.icon}, ${cat.displayOrder}, true)
                ON CONFLICT (slug) DO UPDATE SET
                    name = EXCLUDED.name,
                    icon = EXCLUDED.icon,
                    "displayOrder" = EXCLUDED."displayOrder",
                    "updatedAt" = NOW()
            `;
        }
        
        console.log('✅ Default categories inserted');
        
        // Verify
        const categories = await sql`SELECT * FROM "Category" ORDER BY "displayOrder"`;
        console.log('\n📋 Categories in database:');
        categories.forEach(cat => {
            console.log(`  ${cat.displayOrder}. ${cat.name} (${cat.slug})`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createCategoriesTable();
