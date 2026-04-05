import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!, { fetchOptions: { timeout: 30000 } });

// GET all products
export async function GET() {
  try {
    console.log("GET /api/products - fetching all products");
    const products = await sql`SELECT * FROM "Product" ORDER BY id`;
    console.log(`Found ${products.length} products`);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating product with data:", body);
    
    const result = await sql`
      INSERT INTO "Product" (
        title, brand, spec, price, image, category, warranty,
        "installationTime", capacity, "compatibleWith", features,
        "inStock", inventory, "systemType"
      ) VALUES (
        ${body.title}, ${body.brand}, ${body.spec}, ${body.price}, ${body.image},
        ${body.category}, ${body.warranty}, ${body.installationTime || "1-2 days"},
        ${body.capacity || "N/A"}, 
        ${JSON.stringify(body.compatibleWith || [])},
        ${JSON.stringify(body.features || [])}, 
        ${body.inStock}, ${body.inventory},
        ${body.systemType || "basic"}
      )
      RETURNING *
    `;
    
    console.log("Product created with ID:", result[0].id);
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}


