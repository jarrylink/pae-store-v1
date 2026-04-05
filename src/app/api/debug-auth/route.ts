import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const cookies = request.cookies.getAll();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('🔍 Debug Auth - Cookies:', cookies);
    console.log('🔍 Debug Auth - Headers:', headers);
    
    return NextResponse.json({
        cookies: cookies.map(c => ({ name: c.name, value: c.value })),
        headers: {
            'user-agent': headers['user-agent'],
            'x-user-id': headers['x-user-id']
        }
    });
}
