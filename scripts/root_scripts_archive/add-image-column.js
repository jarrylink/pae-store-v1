const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function addImageColumn() {
    try {
        // Check if image column exists
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Category' AND column_name = 'image'
        `;
        
        if (columns.length === 0) {
            console.log('Adding image column to Category table...');
            await sql`
                ALTER TABLE "Category" 
                ADD COLUMN image TEXT,
                ADD COLUMN "description" TEXT
            `;
            console.log('✅ Added image and description columns');
        } else {
            console.log('✅ Image column already exists');
        }
        
        // Update existing categories with default images
        const defaultImages = {
            'solar-panels': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1775570367/Best_Off_Grid_Solar_Panels_xiuxdm.jpg',
            'inverters': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1775570366/HYBRID_SOLAR_INVERTER_1_g2gkpu.jpg',
            'batteries': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1775570366/LiTime_Best_LiFePO4_Lithium_Solar_Batteries_ulevtd.jpg',
            'ess': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1775570366/LiTime_Best_LiFePO4_Lithium_Solar_Batteries_ulevtd.jpg',
            'street-light': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1775570367/Best_Off_Grid_Solar_Panels_xiuxdm.jpg',
            'accessories': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1775570366/HYBRID_SOLAR_INVERTER_1_g2gkpu.jpg',
            'installation': 'https://res.cloudinary.com/djkudkxmx/image/upload/v1775570367/Complete_Off_Grid_Solar_System_Of_Xindun_ry6zin.jpg'
        };
        
        for (const [slug, imageUrl] of Object.entries(defaultImages)) {
            await sql`
                UPDATE "Category" 
                SET image = ${imageUrl} 
                WHERE slug = ${slug} AND (image IS NULL OR image = '')
            `;
        }
        
        console.log('✅ Updated categories with default images');
        
        // Verify
        const categories = await sql`SELECT name, slug, image FROM "Category" WHERE image IS NOT NULL`;
        console.log('\n📋 Categories with images:');
        categories.forEach(cat => {
            console.log(`  - ${cat.name}: ${cat.image?.substring(0, 50)}...`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

addImageColumn();
