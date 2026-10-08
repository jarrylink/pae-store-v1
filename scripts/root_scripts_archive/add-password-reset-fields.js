const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addPasswordResetFields() {
  console.log('🔐 Adding password reset fields to User table...');
  
  try {
    // Add resetToken column
    await sql`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "resetToken" TEXT
    `;
    console.log('✅ Added resetToken column');

    // Add resetTokenExpiry column
    await sql`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP
    `;
    console.log('✅ Added resetTokenExpiry column');

    console.log('🎉 Password reset fields added successfully!');
  } catch (error) {
    console.error('❌ Error adding password reset fields:', error);
  }
  process.exit();
}

addPasswordResetFields();
