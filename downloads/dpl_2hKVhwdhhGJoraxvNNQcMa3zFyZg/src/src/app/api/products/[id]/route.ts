import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`GET /api/products/${id} - fetching product`);
    
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }
    
    const result = await sql`SELECT * FROM "Product" WHERE id = ${productId}`;

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`PUT /api/products/${id} - updating product`);
    
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }
    
    const body = await request.json();
    console.log("Update data:", body);

    const result = await sql`
      UPDATE "Product"
      SET
        title = ${body.title},
        brand = ${body.brand},
        spec = ${body.spec},
        price = ${body.price},
        image = ${body.image},
        category = ${body.category},
        warranty = ${body.warranty},
        "installationTime" = ${body.installationTime || "1-2 days"},
        capacity = ${body.capacity || "N/A"},
        "compatibleWith" = ${JSON.stringify(body.compatibleWith || [])},
        features = ${JSON.stringify(body.features || [])},
        "inStock" = ${body.inStock},
        inventory = ${body.inventory},
        "systemType" = ${body.systemType || "basic"},
        "updatedAt" = NOW()
      WHERE id = ${productId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    console.log("Product updated successfully:", result[0]);
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`DELETE /api/products/${id} - deleting product`);
    
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM "Product"
      WHERE id = ${productId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    console.log("Product deleted successfully, ID:", result[0].id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
