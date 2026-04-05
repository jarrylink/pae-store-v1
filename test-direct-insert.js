import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

async function testDirectInsert() {
  try {
    console.log('Testing direct order insert with customer data...');
    
    const result = await sql`
      INSERT INTO "Order" (
        "userId", 
        "orderNumber", 
        items, 
        subtotal, 
        total,
        status, 
        "paymentMethod",
        "paymentStatus", 
        "createdAt", 
        "updatedAt",
        "customerName", 
        "customerPhone", 
        "customerEmail"
      ) VALUES (
        'test-user-id',
        'TEST-' || Date.now(),
        '[{"productId":1,"title":"Test Product","price":1000,"quantity":1}]',
        1000,
        1000,
        'pending',
        'bank_transfer',
        'pending',
        NOW(),
        NOW(),
        'Test Customer',
        '08012345678',
        'test@example.com'
      ) RETURNING *
    `;
    
    console.log('✅ Direct insert successful:', result[0]);
    
  } catch (error) {
    console.error('❌ Direct insert failed:', error);
  }
}

testDirectInsert();
