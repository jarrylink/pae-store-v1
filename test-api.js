const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/analytics',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('BODY:', data);
  });
});

req.on('error', (e) => {
  console.error('ERROR:', e.message);
});

req.end();
