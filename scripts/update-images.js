const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function updateImages() {
    try {
        console.log('\n🖼️ UPDATING IMAGE URLs...\n');

        // 1. UPDATE PRODUCTS with solar-related images
        const productImages = [
            'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop', // solar panels
            'https://images.unsplash.com/photo-1613665813446-82a78c468a1f?w=600&h=400&fit=crop', // solar energy
            'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=400&fit=crop', // solar farm
            'https://images.unsplash.com/photo-1625014618426-fdd98192a0b7?w=600&h=400&fit=crop', // solar panel
            'https://images.unsplash.com/photo-1562155618-e1a8bc2eb12f?w=600&h=400&fit=crop', // inverter
            'https://images.unsplash.com/photo-1595425974119-a7b2c1b63602?w=600&h=400&fit=crop', // solar battery
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop', // solar installation
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop', // solar panel close
            'https://images.unsplash.com/photo-1610792510261-a9db6b47b55a?w=600&h=400&fit=crop', // solar tech
            'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=600&h=400&fit=crop'  // solar energy
        ];

        // Get all products
        const products = await sql`SELECT id FROM "Product" ORDER BY id`;
        
        console.log('📦 Updating Product images...');
        for (let i = 0; i < products.length; i++) {
            const imageIndex = i % productImages.length;
            await sql`
                UPDATE "Product" 
                SET image = ${productImages[imageIndex]}
                WHERE id = ${products[i].id}
            `;
            console.log(`  ✅ Product ${products[i].id} updated`);
        }

        // 2. UPDATE SERVICES with service-related images
        const serviceImages = [
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop', // installation
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop', // maintenance
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop', // repair
            'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop', // consultation
            'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=400&fit=crop', // training
            'https://images.unsplash.com/photo-1531415074968-036ba1b7f91d?w=600&h=400&fit=crop', // support
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop', // upgrade
            'https://images.unsplash.com/photo-1518459031860-a1ff60a9e37e?w=600&h=400&fit=crop', // maintenance
            'https://images.unsplash.com/photo-1517891034288-8a7d2f11ccb4?w=600&h=400&fit=crop', // installation
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop'  // workshop
        ];

        const services = await sql`SELECT id FROM "Service" ORDER BY id`;
        
        console.log('\n🔧 Updating Service images...');
        for (let i = 0; i < services.length; i++) {
            const imageIndex = i % serviceImages.length;
            await sql`
                UPDATE "Service" 
                SET image = ${serviceImages[imageIndex]}
                WHERE id = ${services[i].id}
            `;
            console.log(`  ✅ Service ${services[i].id} updated`);
        }

        // 3. UPDATE ACCESSORIES with accessory-related images
        const accessoryImages = [
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop', // cable
            'https://images.unsplash.com/photo-1595425974119-a7b2c1b63602?w=600&h=400&fit=crop', // battery
            'https://images.unsplash.com/photo-1562155618-e1a8bc2eb12f?w=600&h=400&fit=crop', // switch
            'https://images.unsplash.com/photo-1610792510261-a9db6b47b55a?w=600&h=400&fit=crop', // connector
            'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=400&fit=crop', // panel
            'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop', // solar
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop', // installation
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop', // tools
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop', // maintenance
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop'  // equipment
        ];

        const accessories = await sql`SELECT id FROM "Accessory" ORDER BY id`;
        
        console.log('\n📎 Updating Accessory images...');
        for (let i = 0; i < accessories.length; i++) {
            const imageIndex = i % accessoryImages.length;
            await sql`
                UPDATE "Accessory" 
                SET image = ${accessoryImages[imageIndex]}
                WHERE id = ${accessories[i].id}
            `;
            console.log(`  ✅ Accessory ${accessories[i].id} updated`);
        }

        // 4. VERIFY
        console.log('\n📊 VERIFICATION:');
        
        const productResult = await sql`
            SELECT COUNT(*) as count FROM "Product" WHERE image IS NOT NULL AND image != ''
        `;
        const serviceResult = await sql`
            SELECT COUNT(*) as count FROM "Service" WHERE image IS NOT NULL AND image != ''
        `;
        const accessoryResult = await sql`
            SELECT COUNT(*) as count FROM "Accessory" WHERE image IS NOT NULL AND image != ''
        `;

        console.log(`  ✅ Products with images: ${productResult[0].count}`);
        console.log(`  ✅ Services with images: ${serviceResult[0].count}`);
        console.log(`  ✅ Accessories with images: ${accessoryResult[0].count}`);

        console.log('\n✅ ALL IMAGES UPDATED SUCCESSFULLY!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateImages();
