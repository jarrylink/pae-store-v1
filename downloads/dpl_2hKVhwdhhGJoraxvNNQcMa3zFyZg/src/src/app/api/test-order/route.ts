import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: { timeout: 30000 }
});

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    console.log('Test endpoint received:', JSON.stringify(orderData, null, 2));
    
    // Just return a success response for testing
    return NextResponse.json({ 
      success: true, 
      message: 'Test endpoint working',
      received: orderData 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Test endpoint error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
