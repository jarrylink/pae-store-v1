const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function updateProductImages() {
    try {
        console.log('\n🖼️ UPDATING PRODUCT IMAGES WITH SOLAR-SPECIFIC IMAGES...\n');

        // Solar-specific images for products
        const solarImages = [
            'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1613665813446-82a78c468a1f?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1625014618426-fdd98192a0b7?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1562155618-e1a8bc2eb12f?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1595425974119-a7b2c1b63602?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1610792510261-a9db6b47b55a?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=600&h=400&fit=crop&crop=center'
        ];

        // Get all products
        const products = await sql`SELECT id, title FROM "Product" ORDER BY id`;
        
        console.log('📦 Updating Product images...');
        for (let i = 0; i < products.length; i++) {
            const imageIndex = i % solarImages.length;
            await sql`
                UPDATE "Product" 
                SET image = ${solarImages[imageIndex]}
                WHERE id = ${products[i].id}
            `;
            console.log(`  ✅ ${products[i].title}`);
        }

        console.log('\n✅ All product images updated with solar-specific images!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateProductImages();
