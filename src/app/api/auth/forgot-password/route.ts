import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { emailService } from '@/lib/services/emailService';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, "firstName", "lastName"
      FROM "User"
      WHERE email = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      // For security, don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await sql`
      UPDATE "User"
      SET 
        "resetToken" = ${resetToken},
        "resetTokenExpiry" = ${resetTokenExpiry.toISOString()}
      WHERE id = ${user.id}
    `;

    // Build reset link
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    console.log('?? Password reset link generated for:', user.email);
    console.log('?? Reset link:', resetLink);

    // Send email
    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        resetLink,
        user.firstName
      );
      console.log('? Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('? Failed to send password reset email:', emailError);
      // Still return success to the user, but log the error
      // In production, you might want to return an error here
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email. Please check your inbox.',
      // Remove in production
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
    });

  } catch (error) {
    console.error('? Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
