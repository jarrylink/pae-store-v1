const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

console.log('?? DATABASE DIAGNOSTIC TOOL');
console.log('============================\n');

// Test 1: Check if DATABASE_URL exists
console.log('?? Test 1: Checking DATABASE_URL...');
if (!process.env.DATABASE_URL) {
    console.error('? DATABASE_URL not found in environment!');
    process.exit(1);
}
console.log('? DATABASE_URL found');

// Test 2: Test connection
console.log('\n?? Test 2: Testing database connection...');
const sql = neon(process.env.DATABASE_URL);

async function runDiagnostics() {
    try {
        // Test basic query
        const now = await sqlSELECT NOW() as current_time;
        console.log('? Connected to database!');
        console.log(   Server time: );

        // Test 3: Check if Accessory table exists
        console.log('\n?? Test 3: Checking Accessory table...');
        const tableCheck = await sql
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'Accessory'
            ) as exists
        ;
        
        const exists = tableCheck[0].exists;
        console.log(   Accessory table exists: );

        if (exists) {
            // Get table structure
            console.log('\n?? Test 4: Getting Accessory table structure...');
            const columns = await sql
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'Accessory' 
                ORDER BY ordinal_position
            ;
            
            console.log(   Columns found: );
            columns.forEach(col => {
                console.log(   - :  ());
            });

            // Get count
            console.log('\n?? Test 5: Getting accessory count...');
            const count = await sqlSELECT COUNT(*) as total FROM "Accessory";
            console.log(   Total accessories: );

            // Get sample data
            if (count[0].total > 0) {
                console.log('\n?? Test 6: Getting sample data...');
                const sample = await sqlSELECT * FROM "Accessory" LIMIT 3;
                sample.forEach(a => {
                    console.log(   - :  - ?);
                });
            }
        } else {
            // Create the table if it doesn't exist
            console.log('\n?? Test 4: Creating Accessory table...');
            await sql
                CREATE TABLE IF NOT EXISTS "Accessory" (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(12,2) NOT NULL,
                    category VARCHAR(100) DEFAULT 'accessories',
                    image TEXT,
                    sku VARCHAR(50) UNIQUE,
                    unit VARCHAR(50) DEFAULT 'piece',
                    stock INTEGER DEFAULT 0,
                    "isActive" BOOLEAN DEFAULT true,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ;
            console.log('? Accessory table created!');

            // Insert sample data
            console.log('\n?? Inserting sample accessories...');
            await sql
                INSERT INTO "Accessory" (name, description, price, category, sku, unit, stock) VALUES
                ('Panel Rack, Bolt & Nut', 'Mounting rack with bolts and nuts for solar panel installation', 50000, 'mounting', 'ACC-001', 'set', 50),
                ('6mm² PV Cable', 'Solar PV cable for panel connections', 96000, 'cables', 'ACC-002', 'yards', 200),
                ('AC Surge Device', 'Surge protection device for AC side', 16000, 'protection', 'ACC-003', 'piece', 30),
                ('100A Change Over Switch', 'Change over switch for generator/solar', 8000, 'switches', 'ACC-004', 'piece', 25),
                ('DC Surge Protective Device', 'Surge protection for DC side', 15000, 'protection', 'ACC-005', 'piece', 30),
                ('AC Voltage Regulator', 'Voltage regulator for AC output', 30000, 'regulators', 'ACC-006', 'piece', 20),
                ('DC Breaker', 'DC circuit breaker', 16000, 'breakers', 'ACC-007', 'piece', 40),
                ('AC Breaker', 'AC circuit breaker', 10000, 'breakers', 'ACC-008', 'piece', 40),
                ('10mm² Electrical Cable', 'Heavy duty electrical cable', 40000, 'cables', 'ACC-009', 'meters', 150),
                ('Breaker Compartment', 'Breaker enclosure box', 15000, 'enclosures', 'ACC-010', 'piece', 25),
                ('Trunking Pipe', 'Cable trunking pipe', 12000, 'conduits', 'ACC-011', 'meters', 100)
            ON CONFLICT (sku) DO NOTHING
            ;
            console.log('? Sample data inserted!');
        }

        console.log('\n? DIAGNOSTICS COMPLETE!');
        process.exit(0);
    } catch (error) {
        console.error('\n? Error during diagnostics:');
        console.error(   );
        if (error.stack) {
            console.error(   Stack: ...);
        }
        process.exit(1);
    }
}

runDiagnostics();
