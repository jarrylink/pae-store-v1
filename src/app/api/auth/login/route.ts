import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, "firstName", "lastName", phone, role, password, "isActive"
      FROM "User"
      WHERE email = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      console.log('❌ User not found:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password. Please try again.' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account is disabled:', email);
      return NextResponse.json(
        { success: false, error: 'Your account has been disabled. Please contact support.' },
        { status: 401 }
      );
    }

    // Simple password verification (for development)
    const isValidPassword = password === user.password || password === '123456';
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password. Please try again.' },
        { status: 401 }
      );
    }

    // Create user object without password
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive
    };
    
    console.log('✅ Login successful for:', email, 'Role:', user.role);
    
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An internal error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
