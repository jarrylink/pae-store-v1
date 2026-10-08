const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createOrderAccessoryTable() {
    console.log('?? Creating OrderAccessory Table\n');
    console.log('='.repeat(50) + '\n');

    try {
        // Step 1: Create the table
        console.log('?? Step 1: Creating OrderAccessory table...');
        await sql
            CREATE TABLE IF NOT EXISTS "OrderAccessory" (
                id SERIAL PRIMARY KEY,
                "orderId" INTEGER NOT NULL,
                "accessoryId" INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                unit_price DECIMAL(12,2) NOT NULL,
                total_price DECIMAL(12,2) NOT NULL,
                unit VARCHAR(50) DEFAULT 'piece',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ;
        console.log('   ? Table created');

        // Step 2: Add foreign key constraints
        console.log('\n?? Step 2: Adding foreign key constraints...');
        await sql
            ALTER TABLE "OrderAccessory" 
            ADD CONSTRAINT fk_order_accessory_order 
                FOREIGN KEY ("orderId") 
                REFERENCES "Order"(id) 
                ON DELETE CASCADE
        ;
        console.log('   ? Added foreign key to Order table');

        await sql
            ALTER TABLE "OrderAccessory" 
            ADD CONSTRAINT fk_order_accessory_accessory 
                FOREIGN KEY ("accessoryId") 
                REFERENCES "Accessory"(id) 
                ON DELETE RESTRICT
        ;
        console.log('   ? Added foreign key to Accessory table');

        // Step 3: Create indexes
        console.log('\n?? Step 3: Creating indexes...');
        await sql
            CREATE INDEX IF NOT EXISTS idx_order_accessory_order 
            ON "OrderAccessory"("orderId")
        ;
        console.log('   ? Created index on orderId');

        await sql
            CREATE INDEX IF NOT EXISTS idx_order_accessory_accessory 
            ON "OrderAccessory"("accessoryId")
        ;
        console.log('   ? Created index on accessoryId');

        await sql
            CREATE INDEX IF NOT EXISTS idx_order_accessory_created 
            ON "OrderAccessory"("createdAt")
        ;
        console.log('   ? Created index on createdAt');

        // Step 4: Create unique constraint
        console.log('\n?? Step 4: Creating unique constraint...');
        await sql
            CREATE UNIQUE INDEX IF NOT EXISTS idx_order_accessory_unique 
            ON "OrderAccessory"("orderId", "accessoryId")
        ;
        console.log('   ? Created unique constraint on (orderId, accessoryId)');

        // Step 5: Verify the table
        console.log('\n?? Step 5: Verifying table structure...');
        const columns = await sql
            SELECT 
                column_name, 
                data_type, 
                is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'OrderAccessory'
            ORDER BY ordinal_position
        ;
        
        console.log('\n?? Table Structure:');
        columns.forEach(c => {
            console.log(   - :  ());
        });

        // Step 6: Check if any data exists
        const count = await sqlSELECT COUNT(*) as total FROM "OrderAccessory";
        console.log(\n?? Total records: );

        console.log('\n? OrderAccessory table created successfully!');
        console.log('?? Ready to store order accessories!');

    } catch (error) {
        console.error('? Error creating table:', error.message);
        if (error.message.includes('already exists')) {
            console.log('??  The table might already exist. Skipping creation.');
        }
    }
}

createOrderAccessoryTable();
