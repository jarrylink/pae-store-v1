import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { PRODUCTS as existingProducts } from '@/lib/data/products';

const PRODUCTS_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'products.ts');

export async function GET() {
  try {
    return NextResponse.json(existingProducts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const products = await request.json();
    
    // Validate that products is an array
    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products must be an array' },
        { status: 400 }
      );
    }

    // Create the updated file content
    const fileContent = `import { Product } from '@/types';\n\nexport const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};\n`;
    
    // Write to file
    await fs.writeFile(PRODUCTS_FILE_PATH, fileContent, 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Products updated successfully',
      count: products.length 
    });
    
  } catch (error) {
    console.error('Failed to update products:', error);
    return NextResponse.json(
      { error: 'Failed to update products' },
      { status: 500 }
    );
  }
}
