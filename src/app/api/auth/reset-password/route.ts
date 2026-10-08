import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'));

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find user with valid token
    const users = await sql`
      SELECT id, email, "resetToken", "resetTokenExpiry"
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

    // Update password and clear reset token
    await sql`
      UPDATE "User"
      SET 
        password = ${newPassword},
        "resetToken" = NULL,
        "resetTokenExpiry" = NULL
      WHERE id = ${user.id}
    `;

    console.log('? Password reset successful for:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (error) {
    console.error('? Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
