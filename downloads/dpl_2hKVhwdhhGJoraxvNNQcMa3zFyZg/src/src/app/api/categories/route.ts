import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const categories = await sql`
      SELECT id, name, slug, description, icon, "isActive"
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, icon } = body;
    
    const result = await sql`
      INSERT INTO "Category" (name, slug, description, icon, "isActive")
      VALUES (${name}, ${slug}, ${description}, ${icon}, true)
      RETURNING *
    `;
    
    return NextResponse.json({ success: true, category: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
