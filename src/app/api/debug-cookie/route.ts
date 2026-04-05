import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const userCookie = request.cookies.get('user_data');
    
    let userData = null;
    if (userCookie?.value) {
        try {
            userData = JSON.parse(decodeURIComponent(userCookie.value));
        } catch (e) {
            console.error('Error parsing:', e);
        }
    }
    
    return NextResponse.json({
        hasCookie: !!userCookie,
        cookieValue: userCookie?.value?.substring(0, 100),
        parsedUser: userData,
        allCookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value?.substring(0, 50) }))
    });
}
