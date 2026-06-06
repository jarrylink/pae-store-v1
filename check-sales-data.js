const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkData() {
  console.log('\n📊 REVENUE & SALES DATA AUDIT\n');
  
  // 1. Check orders for source/channel data
  const orderSources = await sql`SELECT source, COUNT(*) FROM "Order" GROUP BY source`;
  console.log('Order sources:', orderSources);
  
  // 2. Check geographic data
  const geoData = await sql`
    SELECT 
      "shippingAddress"->>'state' as state,
      "shippingAddress"->>'city' as city,
      COUNT(*) as orders,
      SUM(total) as revenue
    FROM "Order"
    WHERE "shippingAddress" IS NOT NULL
    GROUP BY "shippingAddress"->>'state', "shippingAddress"->>'city'
    ORDER BY revenue DESC
  `;
  console.log('Geographic data:', geoData.slice(0, 5));
  
  // 3. Check product sales (from order JSON)
  const orders = await sql`SELECT items FROM "Order" WHERE items IS NOT NULL LIMIT 5`;
  console.log('Sample order items (JSON):', orders);
  
  // 4. Check categories with revenue
  const categoryRevenue = await sql`
    SELECT category, COUNT(*) as product_count
    FROM "Product"
    GROUP BY category
    ORDER BY product_count DESC
  `;
  console.log('Category distribution:', categoryRevenue);
}

checkData();
