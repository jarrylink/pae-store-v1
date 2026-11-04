const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function createInvoiceTable() {
  console.log('🚀 Creating Invoice Table in Neon DB...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "Invoice" (
        id SERIAL PRIMARY KEY,
        "invoiceNumber" VARCHAR(100) UNIQUE NOT NULL,
        "customerName" VARCHAR(255) NOT NULL,
        "customerEmail" VARCHAR(255),
        "customerPhone" VARCHAR(50),
        "customerAddress" TEXT,
        "issueDate" DATE NOT NULL DEFAULT CURRENT_DATE,
        "dueDate" DATE,
        "items" JSONB NOT NULL DEFAULT '[]',
        "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
        "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
        "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
        "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
        "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
        "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
        "paymentMethod" VARCHAR(100) DEFAULT 'Bank Transfer',
        "bankName" VARCHAR(100) DEFAULT 'GTBank Plc.',
        "accountName" VARCHAR(255) DEFAULT 'Power Afric Energy Serv. LTD',
        "accountNumber" VARCHAR(50) DEFAULT '0500647850',
        "notes" TEXT,
        "terms" TEXT,
        "createdBy" VARCHAR(255) NOT NULL,
        "creatorName" VARCHAR(255),
        "creatorEmail" VARCHAR(255),
        "creatorRole" VARCHAR(50) DEFAULT 'superadmin',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Invoice table created or already exists.');

    await sql`CREATE INDEX IF NOT EXISTS idx_invoice_created_by ON "Invoice"("createdBy");`;
    await sql`CREATE INDEX IF NOT EXISTS idx_invoice_number ON "Invoice"("invoiceNumber");`;
    await sql`CREATE INDEX IF NOT EXISTS idx_invoice_status ON "Invoice"("status");`;
    console.log('✅ Indexes created successfully.');

    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Invoice'
      ORDER BY ordinal_position
    `;
    console.log('📋 Invoice columns:', columns.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  } catch (err) {
    console.error('❌ Error creating Invoice table:', err);
  }
}

createInvoiceTable();
