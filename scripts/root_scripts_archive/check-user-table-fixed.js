import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env file');
  console.log('Please make sure your .env file exists and contains DATABASE_URL');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkUserTable() {
  try {
    console.log('🔍 CHECKING USER TABLE STRUCTURE');
    console.log('================================');
    
    // Check User table columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 User Table Columns:');
    console.table(columns);

    // Get a sample user to see actual data
    const sampleUsers = await sql`
      SELECT id, email, "firstName", "lastName", phone, role, "createdAt"
      FROM "User" 
      LIMIT 3;
    `;
    
    console.log('\n👤 Sample Users (first 3):');
    if (sampleUsers.length === 0) {
      console.log('No users found in database');
    } else {
      sampleUsers.forEach((user, index) => {
        console.log(`\n--- User ${index + 1} ---`);
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`First Name: ${user.firstName || 'NULL'}`);
        console.log(`Last Name: ${user.lastName || 'NULL'}`);
        console.log(`Full Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() || 'NULL');
        console.log(`Phone: ${user.phone || 'NULL'}`);
        console.log(`Role: ${user.role}`);
      });
    }

    // Check if there's a fullName column
    const hasFullName = columns.some(col => col.column_name === 'fullName');
    console.log(`\n🔍 Has 'fullName' column? ${hasFullName ? 'YES' : 'NO'}`);

    // Count total users
    const count = await sql`SELECT COUNT(*) FROM "User"`;
    console.log(`\n📊 Total users: ${count[0].count}`);

  } catch (error) {
    console.error('❌ Error checking user table:', error);
  }
}

checkUserTable();
