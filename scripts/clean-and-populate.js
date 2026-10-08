const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function cleanAndPopulate() {
    try {
        console.log('\n🔄 CLEANING AND POPULATING TABLES...\n');

        // 1. DELETE ALL EXISTING DATA
        console.log('🗑️ Deleting existing data...');
        await sql`DELETE FROM "Product"`;
        await sql`DELETE FROM "Service"`;
        await sql`DELETE FROM "Accessory"`;
        console.log('✅ All existing data deleted');

        // 2. RESET SEQUENCES
        console.log('\n🔄 Resetting sequences...');
        await sql`ALTER SEQUENCE "Product_id_seq" RESTART WITH 1`;
        await sql`ALTER SEQUENCE "Service_id_seq" RESTART WITH 1`;
        await sql`ALTER SEQUENCE "Accessory_id_seq" RESTART WITH 1`;
        console.log('✅ Sequences reset');

        // 3. INSERT PRODUCTS (10 items at ₦10,000 each)
        console.log('\n📦 Inserting 10 Products...');
        const products = [
            { title: 'Solar Panel 100W', brand: 'Power Afric', spec: '100W Mono', category: 'Solar Panels', capacity: '100W', warranty: '2 Years', installationTime: '1 Day', systemType: 'Off-Grid' },
            { title: 'Solar Panel 200W', brand: 'Power Afric', spec: '200W Mono', category: 'Solar Panels', capacity: '200W', warranty: '2 Years', installationTime: '1 Day', systemType: 'Off-Grid' },
            { title: 'Solar Panel 300W', brand: 'Power Afric', spec: '300W Mono', category: 'Solar Panels', capacity: '300W', warranty: '3 Years', installationTime: '1 Day', systemType: 'Off-Grid' },
            { title: 'Solar Panel 400W', brand: 'Power Afric', spec: '400W Mono', category: 'Solar Panels', capacity: '400W', warranty: '3 Years', installationTime: '1-2 Days', systemType: 'Off-Grid' },
            { title: 'Solar Panel 500W', brand: 'Power Afric', spec: '500W Mono', category: 'Solar Panels', capacity: '500W', warranty: '5 Years', installationTime: '1-2 Days', systemType: 'Off-Grid' },
            { title: '5KVA Hybrid Inverter', brand: 'Power Afric', spec: '5KVA Hybrid', category: 'Inverters', capacity: '5KVA', warranty: '3 Years', installationTime: '2 Days', systemType: 'Hybrid' },
            { title: '7.5KVA Hybrid Inverter', brand: 'Power Afric', spec: '7.5KVA Hybrid', category: 'Inverters', capacity: '7.5KVA', warranty: '3 Years', installationTime: '2 Days', systemType: 'Hybrid' },
            { title: '10KVA Hybrid Inverter', brand: 'Power Afric', spec: '10KVA Hybrid', category: 'Inverters', capacity: '10KVA', warranty: '3 Years', installationTime: '2 Days', systemType: 'Hybrid' },
            { title: 'Lithium Battery 5kWh', brand: 'Power Afric', spec: '5kWh LiFePO4', category: 'Batteries', capacity: '5kWh', warranty: '5 Years', installationTime: '1 Day', systemType: 'Off-Grid' },
            { title: 'Lithium Battery 10kWh', brand: 'Power Afric', spec: '10kWh LiFePO4', category: 'Batteries', capacity: '10kWh', warranty: '5 Years', installationTime: '1 Day', systemType: 'Off-Grid' }
        ];

        for (const product of products) {
            await sql`
                INSERT INTO "Product" (
                    title, brand, spec, price, image, category, warranty, 
                    "installationTime", capacity, "compatibleWith", features, 
                    "inStock", inventory, "systemType", "purchasePrice", "createdAt", "updatedAt"
                ) VALUES (
                    ${product.title},
                    ${product.brand},
                    ${product.spec},
                    10000,
                    '',
                    ${product.category},
                    ${product.warranty},
                    ${product.installationTime},
                    ${product.capacity},
                    '[]',
                    '[]',
                    true,
                    100,
                    ${product.systemType},
                    6000,
                    NOW(),
                    NOW()
                )
            `;
            console.log(`  ✅ ${product.title}`);
        }

        // 4. INSERT SERVICES (10 items at ₦5,000 each)
        console.log('\n🔧 Inserting 10 Services...');
        const services = [
            { name: 'Basic Installation', description: 'Standard solar panel installation', category: 'installation', duration: '1 Day' },
            { name: 'Standard Installation', description: 'Complete system installation with testing', category: 'installation', duration: '2 Days' },
            { name: 'Premium Installation', description: 'Full installation with optimization', category: 'installation', duration: '3 Days' },
            { name: 'Maintenance Package', description: 'Monthly system maintenance', category: 'maintenance', duration: 'Monthly' },
            { name: 'Premium Maintenance', description: 'Full system maintenance and cleaning', category: 'maintenance', duration: 'Monthly' },
            { name: 'Emergency Repair', description: '24/7 emergency repair service', category: 'repair', duration: 'Same Day' },
            { name: 'System Upgrade', description: 'Upgrade existing solar system', category: 'upgrade', duration: '2 Days' },
            { name: 'Consultation', description: 'Expert energy consultation', category: 'consultation', duration: '1 Day' },
            { name: 'Technical Support', description: 'Remote technical support', category: 'support', duration: 'Ongoing' },
            { name: 'Training Workshop', description: 'Solar system training workshop', category: 'training', duration: '3 Days' }
        ];

        for (const service of services) {
            await sql`
                INSERT INTO "Service" (
                    name, description, price, category, duration, image, 
                    features, "isActive", "costPrice", "createdAt", "updatedAt"
                ) VALUES (
                    ${service.name},
                    ${service.description},
                    5000,
                    ${service.category},
                    ${service.duration},
                    '',
                    '[]',
                    true,
                    2500,
                    NOW(),
                    NOW()
                )
            `;
            console.log(`  ✅ ${service.name}`);
        }

        // 5. INSERT ACCESSORIES (10 items at ₦1,000 each)
        console.log('\n📎 Inserting 10 Accessories...');
        const accessories = [
            { name: 'MC4 Connector', description: 'Solar panel connector', category: 'Connectors', unit: 'Set', sku: 'ACC-001' },
            { name: 'Solar Cable 10m', description: 'Solar cable 10 meters', category: 'Cables', unit: 'Meter', sku: 'ACC-002' },
            { name: 'Solar Cable 20m', description: 'Solar cable 20 meters', category: 'Cables', unit: 'Meter', sku: 'ACC-003' },
            { name: 'DC Breaker', description: 'DC circuit breaker', category: 'Breakers', unit: 'Piece', sku: 'ACC-004' },
            { name: 'AC Breaker', description: 'AC circuit breaker', category: 'Breakers', unit: 'Piece', sku: 'ACC-005' },
            { name: 'Change Over Switch', description: 'Manual change over switch', category: 'Switches', unit: 'Piece', sku: 'ACC-006' },
            { name: 'Surge Protector', description: 'AC surge protection device', category: 'Protection', unit: 'Piece', sku: 'ACC-007' },
            { name: 'PV Combiner Box', description: 'Solar combiner box', category: 'Boxes', unit: 'Piece', sku: 'ACC-008' },
            { name: 'Mounting Bracket', description: 'Solar panel mounting bracket', category: 'Mounting', unit: 'Set', sku: 'ACC-009' },
            { name: 'Battery Terminal', description: 'Battery terminal connector', category: 'Connectors', unit: 'Set', sku: 'ACC-010' }
        ];

        for (const accessory of accessories) {
            await sql`
                INSERT INTO "Accessory" (
                    name, description, price, category, image, sku, unit, 
                    stock, "isActive", "costPrice", "createdAt", "updatedAt"
                ) VALUES (
                    ${accessory.name},
                    ${accessory.description},
                    1000,
                    ${accessory.category},
                    '',
                    ${accessory.sku},
                    ${accessory.unit},
                    100,
                    true,
                    500,
                    NOW(),
                    NOW()
                )
            `;
            console.log(`  ✅ ${accessory.name}`);
        }

        // 6. VERIFY COUNTS
        console.log('\n📊 VERIFICATION:');
        
        const productCount = await sql`SELECT COUNT(*) as count FROM "Product"`;
        const serviceCount = await sql`SELECT COUNT(*) as count FROM "Service"`;
        const accessoryCount = await sql`SELECT COUNT(*) as count FROM "Accessory"`;
        
        console.log(`  ✅ Products: ${productCount[0].count} items at ₦10,000 each`);
        console.log(`  ✅ Services: ${serviceCount[0].count} items at ₦5,000 each`);
        console.log(`  ✅ Accessories: ${accessoryCount[0].count} items at ₦1,000 each`);

        // 7. SHOW SAMPLE DATA
        console.log('\n📋 SAMPLE DATA:');
        
        const sampleProducts = await sql`SELECT id, title, price FROM "Product" LIMIT 3`;
        console.log('\n  Products:');
        sampleProducts.forEach(p => {
            console.log(`    - ${p.title}: ₦${p.price}`);
        });

        const sampleServices = await sql`SELECT id, name, price FROM "Service" LIMIT 3`;
        console.log('\n  Services:');
        sampleServices.forEach(s => {
            console.log(`    - ${s.name}: ₦${s.price}`);
        });

        const sampleAccessories = await sql`SELECT id, name, price FROM "Accessory" LIMIT 3`;
        console.log('\n  Accessories:');
        sampleAccessories.forEach(a => {
            console.log(`    - ${a.name}: ₦${a.price}`);
        });

        console.log('\n✅ CLEANUP AND POPULATION COMPLETE!');
        console.log('📊 Summary:');
        console.log(`  - 10 Products at ₦10,000 each`);
        console.log(`  - 10 Services at ₦5,000 each`);
        console.log(`  - 10 Accessories at ₦1,000 each`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

cleanAndPopulate();
