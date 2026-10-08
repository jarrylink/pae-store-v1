const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createTable() {
  console.log('Creating InstallationMaterialItem table...');
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "InstallationMaterialItem" (
        "id" SERIAL PRIMARY KEY,
        "serviceId" INTEGER NOT NULL,
        "sn" INTEGER NOT NULL,
        "description" TEXT NOT NULL,
        "qty" INTEGER NOT NULL DEFAULT 1,
        "unitCost" NUMERIC NOT NULL DEFAULT 0,
        "total" NUMERIC NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Table "InstallationMaterialItem" created successfully!');

    // Add foreign key constraint if it doesn't exist
    try {
      await sql`
        ALTER TABLE "InstallationMaterialItem" 
        ADD CONSTRAINT fk_installation_material_item_service 
        FOREIGN KEY ("serviceId") REFERENCES "Service"(id) ON DELETE CASCADE
      `;
      console.log('✅ Foreign key constraint added successfully!');
    } catch (fkError) {
      console.log('Foreign key constraint might already exist:', fkError.message);
    }

    // Create index
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_installation_material_items_service_id 
        ON "InstallationMaterialItem"("serviceId")
      `;
      console.log('✅ Index created successfully!');
    } catch (idxError) {
      console.log('Index might already exist:', idxError.message);
    }

    console.log('\n🎉 Setup complete! The InstallationMaterialItem table is ready.');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  }
  process.exit();
}

createTable();
