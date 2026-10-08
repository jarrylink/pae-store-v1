const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAnalytics() {
  console.log('📊 CURRENT ANALYTICS DATA STATUS\n');
  
  // 1. Orders summary
  console.log('📋 ORDERS SUMMARY:');
  const orders = await sql`
    SELECT 
      COUNT(*) as total_orders,
      SUM(total) as total_revenue,
      AVG(total) as avg_order_value,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
      COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered
    FROM "Order"
  `;
  console.log(`   Total Orders: ${orders[0].total_orders}`);
  console.log(`   Total Revenue: ₦${orders[0].total_revenue?.toLocaleString() || 0}`);
  console.log(`   Average Order Value: ₦${orders[0].avg_order_value?.toLocaleString() || 0}`);
  console.log(`   Order Status: Pending:${orders[0].pending}, Confirmed:${orders[0].confirmed}, Shipped:${orders[0].shipped}, Delivered:${orders[0].delivered}`);
  
  // 2. Products summary
  console.log('\n📦 PRODUCTS SUMMARY:');
  const products = await sql`
    SELECT 
      COUNT(*) as total_products,
      SUM(inventory) as total_inventory,
      COUNT(CASE WHEN inventory <= 5 AND inventory > 0 THEN 1 END) as low_stock,
      COUNT(CASE WHEN inventory = 0 THEN 1 END) as out_of_stock
    FROM "Product"
  `;
  console.log(`   Total Products: ${products[0].total_products}`);
  console.log(`   Total Inventory: ${products[0].total_inventory}`);
  console.log(`   Low Stock (≤5): ${products[0].low_stock}`);
  console.log(`   Out of Stock: ${products[0].out_of_stock}`);
  
  // 3. Revenue by month (last 6 months)
  console.log('\n📈 REVENUE TREND (Last 6 months):');
  const monthlyRevenue = await sql`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      SUM(total) as revenue,
      COUNT(*) as orders
    FROM "Order"
    WHERE "createdAt" >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month DESC
  `;
  monthlyRevenue.forEach(m => {
    console.log(`   ${m.month.toISOString().slice(0,7)}: ₦${m.revenue?.toLocaleString() || 0} (${m.orders} orders)`);
  });
  
  // 4. Top selling products
  console.log('\n🏆 TOP SELLING PRODUCTS:');
  const topProducts = await sql`
    SELECT p.title, p."totalSold" as units_sold, p.price
    FROM "Product" p
    WHERE p."totalSold" > 0
    ORDER BY p."totalSold" DESC
    LIMIT 5
  `;
  if (topProducts.length > 0) {
    topProducts.forEach(p => {
      console.log(`   ${p.title}: ${p.units_sold} units sold`);
    });
  } else {
    console.log('   No sales data yet (totalSold field not populated)');
  }
  
  // 5. Category distribution
  console.log('\n📁 CATEGORY DISTRIBUTION:');
  const categories = await sql`
    SELECT category, COUNT(*) as count
    FROM "Product"
    GROUP BY category
    ORDER BY count DESC
  `;
  categories.forEach(c => {
    console.log(`   ${c.category}: ${c.count} products`);
  });
  
  // 6. Users summary
  console.log('\n👤 USERS SUMMARY:');
  const users = await sql`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
      COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff,
      COUNT(CASE WHEN role = 'superadmin' THEN 1 END) as admins
    FROM "User"
  `;
  console.log(`   Total Users: ${users[0].total_users}`);
  console.log(`   Customers: ${users[0].customers}`);
  console.log(`   Staff: ${users[0].staff}`);
  console.log(`   Admins: ${users[0].admins}`);
  
  // 7. Check what analytics fields exist
  console.log('\n🔍 ANALYTICS FIELDS STATUS:');
  const productColumns = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'Product' 
    AND column_name IN ('totalSold', 'totalRevenue', 'views', 'cartAdds')
  `;
  console.log(`   Product analytics fields: ${productColumns.map(c => c.column_name).join(', ') || 'none'}`);
  
  const userColumns = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'User' 
    AND column_name IN ('totalSpent', 'orderCount', 'lastPurchaseAt')
  `;
  console.log(`   User analytics fields: ${userColumns.map(c => c.column_name).join(', ') || 'none'}`);
}

checkAnalytics();
