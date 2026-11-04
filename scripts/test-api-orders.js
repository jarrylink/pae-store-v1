require('dotenv').config();
const { getDb, executeWithRetry } = require('../src/lib/db');

async function testPipeline() {
  console.log('Testing Admin Orders & Invoices Pipeline Queries...');
  try {
    const sql = getDb();
    const [ordersResult, invoicesResult] = await Promise.all([
      executeWithRetry(async () => {
        return await sql`SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 5`;
      }),
      executeWithRetry(async () => {
        return await sql`SELECT * FROM "Invoice" ORDER BY "createdAt" DESC LIMIT 5`;
      }),
    ]);

    console.log(`Success! Found ${ordersResult.length} orders and ${invoicesResult.length} invoices.`);
    if (ordersResult.length > 0) {
      console.log('Sample Order:', {
        id: ordersResult[0].id,
        orderNumber: ordersResult[0].orderNumber,
        customerName: ordersResult[0].customerName,
        total: ordersResult[0].total,
        status: ordersResult[0].status,
      });
    }

    if (invoicesResult.length > 0) {
      console.log('Sample Invoice:', {
        id: invoicesResult[0].id,
        invoiceNumber: invoicesResult[0].invoiceNumber,
        customerName: invoicesResult[0].customerName,
        total: invoicesResult[0].total,
        status: invoicesResult[0].status,
        creatorName: invoicesResult[0].creatorName,
      });
    }
  } catch (err) {
    console.error('Test pipeline error:', err);
  }
}

testPipeline();
