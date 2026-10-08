const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = match ? match[1] : null;

const sql = neon(DATABASE_URL);

async function checkOrderTable() {
  try {
    console.log('🔍 CHECKING ORDER TABLE FOR DELIVERY ADDRESS');
    console.log('===========================================');
    
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Order'
    `;
    
    const columnNames = columns.map(c => c.column_name);
    console.log('📋 Order table columns:', columnNames);
    
    if (columnNames.includes('deliveryAddress')) {
      console.log('✅ deliveryAddress column exists');
    } else if (columnNames.includes('shippingAddress')) {
      console.log('✅ shippingAddress column exists (can be used for delivery)');
    } else {
      console.log('❌ No address column found in Order table');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrderTable();
