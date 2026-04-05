import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const response = NextResponse.next();
    
    // Ensure user data is passed to API routes via headers
    const userDataCookie = request.cookies.get('user_data');
    if (userDataCookie?.value) {
        try {
            const userData = JSON.parse(decodeURIComponent(userDataCookie.value));
            response.headers.set('x-user-id', userData.id);
            response.headers.set('x-user-role', userData.role);
            response.headers.set('x-user-email', userData.email);
        } catch (e) {
            console.error('Error parsing user cookie in middleware:', e);
        }
    }
    
    return response;
}

export const config = {
    matcher: '/api/:path*',
};

