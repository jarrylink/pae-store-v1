const http = require('http');

console.log('\n📡 Testing API...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/analytics/revenue-sales?range=30d',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('\n📊 API Response:');
      console.log(`Total Revenue: ₦${parsed.metrics?.totalRevenue}`);
      console.log(`Total Orders: ${parsed.metrics?.totalOrders}`);
      console.log(`Avg Order Value: ₦${parsed.metrics?.avgOrderValue}`);
      console.log(`Categories: ${parsed.categories?.length}`);
      console.log(`Products: ${parsed.products?.length}`);
    } catch(e) {
      console.log('Error parsing response:', data.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error('ERROR:', e.message);
});

req.end();
