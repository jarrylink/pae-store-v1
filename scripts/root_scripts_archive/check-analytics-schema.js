const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const databaseUrl = dbMatch ? dbMatch[1] : null;

if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(databaseUrl);

async function checkAnalyticsSchema() {
    console.log('\n🔍 ANALYTICS TABLES & STRUCTURE\n');
    console.log('=' .repeat(60));
    
    // Check for analytics-specific tables
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name LIKE '%analytics%'
        ORDER BY table_name
    `;
    
    if (tables.length > 0) {
        console.log('\n📊 Analytics Tables Found:');
        tables.forEach(table => {
            console.log(`  • ${table.table_name}`);
        });
    } else {
        console.log('\n⚠️ No analytics-specific tables found');
    }
    
    // Check for DailySalesAnalytics table (mentioned in your schema)
    const dailyAnalytics = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'DailySalesAnalytics'
        ORDER BY column_name
    `;
    
    if (dailyAnalytics.length > 0) {
        console.log('\n📈 DailySalesAnalytics Structure:');
        dailyAnalytics.forEach(col => {
            console.log(`  • ${col.column_name}: ${col.data_type}`);
        });
    }
    
    // Check for CustomerAnalytics table
    const customerAnalytics = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'CustomerAnalytics'
        ORDER BY column_name
    `;
    
    if (customerAnalytics.length > 0) {
        console.log('\n👥 CustomerAnalytics Structure:');
        customerAnalytics.forEach(col => {
            console.log(`  • ${col.column_name}: ${col.data_type}`);
        });
    }
    
    // Check existing data in analytics tables
    if (dailyAnalytics.length > 0) {
        const sampleData = await sql`
            SELECT * FROM "DailySalesAnalytics" 
            ORDER BY date DESC 
            LIMIT 5
        `;
        
        if (sampleData.length > 0) {
            console.log('\n📊 Sample Daily Analytics Data:');
            sampleData.forEach(row => {
                console.log(`  • Date: ${row.date}, Revenue: ₦${row.revenue}, Orders: ${row.orders}`);
            });
        }
    }
}

checkAnalyticsSchema().catch(console.error);
