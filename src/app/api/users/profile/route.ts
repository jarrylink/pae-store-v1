import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone, avatar } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE "User"
      SET
        "firstName" = COALESCE(${firstName}, "firstName"),
        "lastName" = COALESCE(${lastName}, "lastName"),
        phone = COALESCE(${phone}, phone),
        avatar = COALESCE(${avatar}, avatar),
        "updatedAt" = NOW()
      WHERE email = ${email}
      RETURNING id, email, "firstName", "lastName", phone, avatar, role, "isActive", "createdAt", "updatedAt"
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
