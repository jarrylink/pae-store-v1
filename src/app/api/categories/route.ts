import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon((process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pT4KLJb5CYOv@ep-round-hill-a1rhjo2j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'));

export async function GET() {
  try {
    const categories = await sql`
      SELECT id, name, slug, description, icon, image, "isActive"
      FROM "Category"
      ORDER BY name ASC
    `;
    
    return NextResponse.json({ 
      success: true, 
      categories: categories,
      count: categories.length 
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
