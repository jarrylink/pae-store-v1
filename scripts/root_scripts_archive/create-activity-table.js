const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function createTable() {
    try {
        console.log('Creating ActivityLog table...');
        await sql`
            CREATE TABLE IF NOT EXISTS "ActivityLog" (
                id SERIAL PRIMARY KEY,
                "userId" TEXT NOT NULL,
                "userEmail" TEXT,
                "userRole" TEXT,
                action TEXT NOT NULL,
                "entityType" TEXT,
                "entityId" TEXT,
                "oldData" JSONB,
                "newData" JSONB,
                "ipAddress" TEXT,
                "userAgent" TEXT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_activity_user ON "ActivityLog"("userId")`;
        await sql`CREATE INDEX IF NOT EXISTS idx_activity_created ON "ActivityLog"("createdAt")`;
        await sql`CREATE INDEX IF NOT EXISTS idx_activity_action ON "ActivityLog"(action)`;
        
        console.log('✅ ActivityLog table created successfully');
        
        // Insert a test log
        await sql`
            INSERT INTO "ActivityLog" ("userId", "userEmail", "userRole", action, "entityType")
            VALUES ('system', 'system@admin.com', 'system', 'SYSTEM_STARTUP', 'System')
        `;
        console.log('✅ Test log inserted');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createTable();
