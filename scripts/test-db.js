const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const rawUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Function to clean url
function cleanDbUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('channel_binding');
    return parsed.toString();
  } catch (e) {
    return url.replace(/([?&])channel_binding=[^&]*(&|$)/, '$1').replace(/[?&]$/, '');
  }
}

async function test() {
  console.log('Testing raw URL...');
  try {
    const sqlRaw = neon(rawUrl);
    const resRaw = await sqlRaw`SELECT count(*) FROM "Order"`;
    console.log('Raw URL Success, order count:', resRaw[0]);
  } catch (err) {
    console.error('Raw URL Failed:', err.message);
  }

  console.log('Testing clean URL...');
  try {
    const cleanUrl = cleanDbUrl(rawUrl);
    console.log('Clean URL:', cleanUrl);
    const sqlClean = neon(cleanUrl);
    const resClean = await sqlClean`SELECT count(*) FROM "Order"`;
    console.log('Clean URL Success, order count:', resClean[0]);
  } catch (err) {
    console.error('Clean URL Failed:', err.message);
  }
}

test();
