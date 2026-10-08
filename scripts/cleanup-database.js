const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function cleanupDatabase() {
    try {
        console.log('🗑️ STARTING DATABASE CLEANUP...\n');

        // 1. Get admin and staff users to preserve
        const usersToKeep = await sql`
            SELECT id, email, role 
            FROM "User" 
            WHERE role IN ('superadmin', 'admin', 'staff')
        `;
        console.log('👤 Users to keep:');
        usersToKeep.forEach(u => {
            console.log(`  - ${u.email} (${u.role})`);
        });

        // 2. Delete order accessories first (child records)
        console.log('\n🗑️ Deleting order accessories...');
        await sql`DELETE FROM "OrderAccessory"`;

        // 3. Delete orders
        console.log('🗑️ Deleting orders...');
        await sql`DELETE FROM "Order"`;

        // 4. Delete addresses
        console.log('🗑️ Deleting addresses...');
        await sql`DELETE FROM "Address"`;

        // 5. Delete wishlist items
        console.log('🗑️ Deleting wishlist items...');
        await sql`DELETE FROM "WishlistItem"`;

        // 6. Delete cart items (if exists)
        console.log('🗑️ Deleting cart items...');
        try {
            await sql`DELETE FROM "CartItem"`;
        } catch (e) {
            console.log('  ⚠️ CartItem table not found, skipping...');
        }

        // 7. Delete non-admin/non-staff users - using a different approach
        console.log('🗑️ Deleting regular users (keeping admin/staff users)...');
        
        // Get all user IDs to keep
        const keepIds = usersToKeep.map(u => u.id);
        
        // Delete users one by one if not in keep list
        const allUsers = await sql`
            SELECT id, email, role FROM "User"
        `;
        
        for (const user of allUsers) {
            if (!keepIds.includes(user.id) && !['superadmin', 'admin', 'staff'].includes(user.role)) {
                await sql`
                    DELETE FROM "User" WHERE id = ${user.id}
                `;
                console.log(`  ✅ Deleted user: ${user.email} (${user.role})`);
            }
        }

        // 8. Reset ID sequences
        console.log('\n🔄 Resetting ID sequences...');
        
        const tables = ['"User"', '"Order"', '"Address"', '"WishlistItem"', '"OrderAccessory"'];
        for (const table of tables) {
            try {
                // Check if sequence exists
                const seqCheck = await sql`
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.sequences 
                        WHERE sequence_name = '${table.toLowerCase()}_id_seq'
                    )
                `;
                if (seqCheck[0].exists) {
                    await sql`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`;
                    console.log(`  ✅ Reset ${table} sequence`);
                }
            } catch (e) {
                console.log(`  ⚠️ Could not reset ${table} sequence`);
            }
        }

        // 9. Verify remaining users
        console.log('\n📊 REMAINING USERS:');
        const remainingUsers = await sql`
            SELECT id, email, role, "firstName", "lastName" 
            FROM "User" 
            ORDER BY role
        `;
        remainingUsers.forEach(u => {
            console.log(`  - ${u.email} (${u.role}): ${u.firstName} ${u.lastName}`);
        });

        // 10. Count remaining records
        console.log('\n📊 DATABASE SUMMARY:');
        
        const counts = await sql`
            SELECT 
                (SELECT COUNT(*) FROM "User") as users,
                (SELECT COUNT(*) FROM "Order") as orders,
                (SELECT COUNT(*) FROM "Address") as addresses,
                (SELECT COUNT(*) FROM "WishlistItem") as wishlist,
                (SELECT COUNT(*) FROM "OrderAccessory") as order_accessories
        `;
        console.log(`  Users: ${counts[0].users}`);
        console.log(`  Orders: ${counts[0].orders}`);
        console.log(`  Addresses: ${counts[0].addresses}`);
        console.log(`  Wishlist Items: ${counts[0].wishlist}`);
        console.log(`  Order Accessories: ${counts[0].order_accessories}`);

        console.log('\n✅ DATABASE CLEANUP COMPLETE!');
        console.log('📝 Admin/Staff accounts preserved:');
        usersToKeep.forEach(u => {
            console.log(`  - ${u.email} (${u.role})`);
        });

    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        console.error('Full error:', error);
    }
}

cleanupDatabase();
