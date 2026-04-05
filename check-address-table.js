const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkAddressTable() {
  try {
    console.log('🔍 CHECKING ADDRESS TABLE');
    console.log('========================');
    
    // Check if Address table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Address'
      );
    `;
    console.log('Address table exists:', tableExists[0].exists);

    if (tableExists[0].exists) {
      // Get Address table columns
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'Address'
        ORDER BY ordinal_position;
      `;
      console.log('\n📋 Address Table Columns:');
      console.table(columns);

      // Count addresses
      const count = await sql`SELECT COUNT(*) FROM "Address"`;
      console.log(`\n📊 Total addresses: ${count[0].count}`);

      // Get sample addresses
      const samples = await sql`SELECT * FROM "Address" LIMIT 3`;
      if (samples.length > 0) {
        console.log('\n📦 Sample addresses:');
        console.log(samples);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAddressTable();
