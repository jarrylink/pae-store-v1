import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET all categories
export async function GET(request: NextRequest) {
    try {
        const categories = await sql`
            SELECT * FROM "Category" 
            WHERE "isActive" = true 
            ORDER BY "displayOrder" ASC
        `;
        
        return NextResponse.json({ success: true, categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST a new category
export async function POST(request: NextRequest) {
    try {
        const { name, slug, description, icon, image, parentId, displayOrder } = await request.json();
        
        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }
        
        const result = await sql`
            INSERT INTO "Category" (name, slug, description, icon, image, "parentId", "displayOrder")
            VALUES (${name}, ${slug}, ${description || null}, ${icon || null}, ${image || null}, ${parentId || null}, ${displayOrder || 0})
            RETURNING *
        `;
        
        return NextResponse.json({ success: true, category: result[0] });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

// PUT - Update a category
export async function PUT(request: NextRequest) {
    try {
        const { id, name, slug, description, icon, image, displayOrder, isActive } = await request.json();
        
        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }
        
        const result = await sql`
            UPDATE "Category" 
            SET 
                name = COALESCE(${name}, name),
                slug = COALESCE(${slug}, slug),
                description = COALESCE(${description}, description),
                icon = COALESCE(${icon}, icon),
                image = COALESCE(${image}, image),
                "displayOrder" = COALESCE(${displayOrder}, "displayOrder"),
                "isActive" = COALESCE(${isActive}, "isActive"),
                "updatedAt" = NOW()
            WHERE id = ${id}
            RETURNING *
        `;
        
        return NextResponse.json({ success: true, category: result[0] });
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// DELETE a category
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }
        
        await sql`DELETE FROM "Category" WHERE id = ${id}`;
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
