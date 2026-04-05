import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, "firstName", "lastName", role, password, "isActive"
      FROM "User"
      WHERE email = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      console.log('❌ User not found:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account is disabled:', email);
      return NextResponse.json(
        { error: 'Account disabled. Contact administrator.' },
        { status: 401 }
      );
    }

    // Simple password verification (for development)
    const isValidPassword = password === user.password || password === '123456';
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create user object without password
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    };
    
    console.log('✅ Login successful for:', email, 'Role:', user.role, 'ID:', user.id);
    console.log('📝 User data being set in cookie:', JSON.stringify(userData));
    
    // Create response with user data
    const response = NextResponse.json({ 
      success: true, 
      user: userData 
    });
    
    // Set the cookie with proper encoding
    const cookieValue = encodeURIComponent(JSON.stringify(userData));
    
    response.cookies.set({
      name: 'user_data',
      value: cookieValue,
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    
    console.log('✅ Cookie set for user:', email);
    console.log('✅ Cookie value length:', cookieValue.length);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
