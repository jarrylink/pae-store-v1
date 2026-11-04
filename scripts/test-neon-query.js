require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

function cleanDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('channel_binding');
    return parsed.toString();
  } catch (e) {
    return url.replace(/([?&])channel_binding=[^&]*(&|$)/, '$1').replace(/[?&]$/, '');
  }
}

async function test() {
  const url = cleanDatabaseUrl(process.env.DATABASE_URL);
  const sql = neon(url);
  console.log('Querying Order and Invoice tables...');
  const [orders, invoices] = await Promise.all([
    sql`SELECT id, "orderNumber", "customerName", total, status FROM "Order" ORDER BY "createdAt" DESC LIMIT 3`,
    sql`SELECT id, "invoiceNumber", "customerName", total, status, "creatorName" FROM "Invoice" ORDER BY "createdAt" DESC LIMIT 3`
  ]);

  console.log('Orders found:', orders.length, orders);
  console.log('Invoices found:', invoices.length, invoices);
}

test().catch(console.error);
