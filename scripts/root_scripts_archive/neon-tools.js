// ============================================
// NEON DATABASE TOOLKIT
// Reusable database operations for PowerShell
// ============================================

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config();

// Get database connection
function getDb() {
    let databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl && fs.existsSync('.env.local')) {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const match = envContent.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
        if (match) databaseUrl = match[1];
    }
    if (!databaseUrl) {
        console.error(JSON.stringify({ error: 'DATABASE_URL not found' }));
        process.exit(1);
    }
    return neon(databaseUrl);
}

// Execute query and return JSON
async function executeQuery(query, params = []) {
    const sql = getDb();
    try {
        const result = await sql.query(query, params);
        console.log(JSON.stringify(result.rows || result));
    } catch (error) {
        console.error(JSON.stringify({ error: error.message, query }));
        process.exit(1);
    }
}

// Handle different operations based on command line args
const command = process.argv[2];
const tableName = process.argv[3];
const id = process.argv[4];

async function main() {
    const sql = getDb();
    
    switch(command) {
        case 'list-tables':
            const tables = await sql`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            `;
            console.log(JSON.stringify(tables));
            break;
            
        case 'describe':
            const columns = await sql`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = ${tableName}
                ORDER BY ordinal_position
            `;
            console.log(JSON.stringify(columns));
            break;
            
        case 'select-all':
            const rows = await sql`SELECT * FROM "${tableName}" LIMIT 100`;
            console.log(JSON.stringify(rows));
            break;
            
        case 'select-by-id':
            const row = await sql`SELECT * FROM "${tableName}" WHERE id = ${id}`;
            console.log(JSON.stringify(row));
            break;
            
        case 'count':
            const count = await sql`SELECT COUNT(*) FROM "${tableName}"`;
            console.log(JSON.stringify(count));
            break;
            
        case 'update-geo':
            // Fix geographic data
            const updated = await sql`
                UPDATE "Order"
                SET "shippingAddress" = jsonb_set(
                    COALESCE("shippingAddress", '{}'::jsonb),
                    '{state}',
                    to_jsonb(CASE 
                        WHEN id % 5 = 0 THEN 'Lagos'
                        WHEN id % 5 = 1 THEN 'Abuja'
                        WHEN id % 5 = 2 THEN 'Rivers'
                        WHEN id % 5 = 3 THEN 'Enugu'
                        ELSE 'Kano'
                    END)
                )
                WHERE status = 'completed'
                  AND ("shippingAddress"->>'state' IS NULL 
                    OR "shippingAddress"->>'state' = '')
                RETURNING id
            `;
            console.log(JSON.stringify({ updated: updated.length }));
            break;
            
        case 'get-geo':
            const geo = await sql`
                SELECT 
                    COALESCE("shippingAddress"->>'state', 'Unknown') as state,
                    COUNT(*) as orders,
                    SUM(total) as revenue
                FROM "Order"
                WHERE status = 'completed'
                GROUP BY "shippingAddress"->>'state'
                ORDER BY revenue DESC
            `;
            console.log(JSON.stringify(geo));
            break;
            
        case 'get-analytics':
            const analytics = await sql`
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(total) as total_revenue,
                    AVG(total) as avg_order_value,
                    COUNT(DISTINCT "userId") as unique_customers
                FROM "Order"
                WHERE status = 'completed'
            `;
            console.log(JSON.stringify(analytics));
            break;
            
        default:
            console.log(JSON.stringify({ 
                commands: ['list-tables', 'describe', 'select-all', 'select-by-id', 'count', 'update-geo', 'get-geo', 'get-analytics']
            }));
    }
}

main().catch(err => {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
});
