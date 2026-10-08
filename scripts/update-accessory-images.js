const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function updateAccessoryImages() {
    try {
        console.log('\n📎 UPDATING ACCESSORY IMAGES...\n');

        const accessoryImages = [
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1595425974119-a7b2c1b63602?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1562155618-e1a8bc2eb12f?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1610792510261-a9db6b47b55a?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop&crop=center'
        ];

        const accessories = await sql`SELECT id, name FROM "Accessory" ORDER BY id`;
        
        console.log('📎 Updating Accessory images...');
        for (let i = 0; i < accessories.length; i++) {
            const imageIndex = i % accessoryImages.length;
            await sql`
                UPDATE "Accessory" 
                SET image = ${accessoryImages[imageIndex]}
                WHERE id = ${accessories[i].id}
            `;
            console.log(`  ✅ ${accessories[i].name}`);
        }

        console.log('\n✅ All accessory images updated!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateAccessoryImages();
