const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function comprehensiveReset() {
    console.log('🔄 Comprehensive Database Reset');
    console.log('================================');
    
    try {
        // 1. Clear dependent tables first
        console.log('\n🗑️ Clearing data from tables...');
        
        await sql`DELETE FROM "ActivityLog"`;
        console.log('  ✓ ActivityLog cleared');
        
        await sql`DELETE FROM "WishlistItem"`;
        console.log('  ✓ WishlistItem cleared');
        
        await sql`DELETE FROM "Order"`;
        console.log('  ✓ Orders cleared');
        
        await sql`DELETE FROM "Address"`;
        console.log('  ✓ Addresses cleared');
        
        // Delete all users except we'll recreate them
        await sql`DELETE FROM "User"`;
        console.log('  ✓ Users cleared');
        
        // 2. Reset sequences
        console.log('\n🔄 Resetting sequences...');
        
        try {
            await sql`ALTER SEQUENCE "Order_id_seq" RESTART WITH 1`;
            console.log('  ✓ Order ID sequence reset to 1');
        } catch (e) {
            console.log('  ⚠ Order sequence reset skipped');
        }
        
        try {
            await sql`ALTER SEQUENCE "ActivityLog_id_seq" RESTART WITH 1`;
            console.log('  ✓ ActivityLog sequence reset to 1');
        } catch (e) {
            console.log('  ⚠ ActivityLog sequence reset skipped');
        }
        
        // 3. Create the 3 required accounts
        console.log('\n👥 Creating accounts...');
        
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        // Super Admin
        const superAdmin = await sql`
            INSERT INTO "User" (
                id, email, "firstName", "lastName", role, password, "isActive", "createdAt", "updatedAt"
            ) VALUES (
                'superadmin-001', 'superadmin@powerafric.ng', 'Super', 'Admin', 'superadmin', ${hashedPassword}, true, NOW(), NOW()
            )
            RETURNING id, email, role
        `;
        console.log(`  ✓ ${superAdmin[0].email} (${superAdmin[0].role})`);
        
        // Staff
        const staff = await sql`
            INSERT INTO "User" (
                id, email, "firstName", "lastName", role, password, "isActive", "createdAt", "updatedAt"
            ) VALUES (
                'staff-001', 'staff@powerafric.ng', 'Staff', 'User', 'staff', ${hashedPassword}, true, NOW(), NOW()
            )
            RETURNING id, email, role
        `;
        console.log(`  ✓ ${staff[0].email} (${staff[0].role})`);
        
        // Customer
        const customer = await sql`
            INSERT INTO "User" (
                id, email, "firstName", "lastName", role, password, "isActive", "createdAt", "updatedAt"
            ) VALUES (
                'customer-001', 'customer@powerafric.ng', 'Customer', 'User', 'customer', ${hashedPassword}, true, NOW(), NOW()
            )
            RETURNING id, email, role
        `;
        console.log(`  ✓ ${customer[0].email} (${customer[0].role})`);
        
        // 4. Verify final state
        console.log('\n📊 Final Database State:');
        console.log('========================');
        
        const finalUsers = await sql`
            SELECT id, email, role, "isActive" FROM "User" ORDER BY role
        `;
        console.log(`\n👥 Users (${finalUsers.length}):`);
        finalUsers.forEach(u => {
            console.log(`  - ${u.email}: ${u.role} (Active: ${u.isActive})`);
        });
        
        const productCount = await sql`SELECT COUNT(*) as count FROM "Product"`;
        console.log(`\n📦 Products: ${productCount[0].count} (preserved)`);
        
        const serviceCount = await sql`SELECT COUNT(*) as count FROM "Service"`;
        console.log(`🔧 Services: ${serviceCount[0].count} (preserved)`);
        
        const orderCount = await sql`SELECT COUNT(*) as count FROM "Order"`;
        console.log(`📋 Orders: ${orderCount[0].count}`);
        
        const addressCount = await sql`SELECT COUNT(*) as count FROM "Address"`;
        console.log(`🏠 Addresses: ${addressCount[0].count}`);
        
        const wishlistCount = await sql`SELECT COUNT(*) as count FROM "WishlistItem"`;
        console.log(`❤️ Wishlist: ${wishlistCount[0].count}`);
        
        const logCount = await sql`SELECT COUNT(*) as count FROM "ActivityLog"`;
        console.log(`📝 Activity Logs: ${logCount[0].count}`);
        
        console.log('\n✅ Database reset completed successfully!');
        console.log('\n📋 Test Accounts (password: 123456 for all):');
        console.log('  🔐 superadmin@powerafric.ng - Super Admin');
        console.log('  🔐 staff@powerafric.ng - Staff');
        console.log('  🔐 customer@powerafric.ng - Customer');
        
        console.log('\n💡 Next Steps:');
        console.log('  1. Restart your dev server: npm run dev');
        console.log('  2. Login with any account above');
        console.log('  3. Test all functionality');
        
    } catch (error) {
        console.error('❌ Error during reset:', error.message);
        if (error.message.includes('bcrypt')) {
            console.log('\n⚠️ Installing bcrypt...');
            const { exec } = require('child_process');
            exec('npm install bcrypt', (err, stdout) => {
                if (err) console.error('Failed to install bcrypt:', err);
                else console.log('✅ bcrypt installed. Please run this script again.');
            });
        }
    }
}

comprehensiveReset();
