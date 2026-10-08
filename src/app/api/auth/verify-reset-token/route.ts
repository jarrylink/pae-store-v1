import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find user with valid token
    const users = await sql`
      SELECT id, email, "firstName", "lastName", "resetToken", "resetTokenExpiry"
      FROM "User"
      WHERE "resetToken" = ${token}
      AND "resetTokenExpiry" > NOW()
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      email: user.email,
      firstName: user.firstName,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('❌ Verify token error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
