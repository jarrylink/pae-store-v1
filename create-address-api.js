const fs = require('fs');
const path = require('path');

// Ensure directory exists
const idDir = path.join(process.cwd(), 'src/app/api/addresses/[id]');
if (!fs.existsSync(idDir)) {
    fs.mkdirSync(idDir, { recursive: true });
    console.log('✅ Created directory:', idDir);
}

// Route.ts content
const routeContent = `import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Helper to get current user
async function getCurrentUser(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user_data');
    if (userCookie?.value) {
      const userData = JSON.parse(decodeURIComponent(userCookie.value));
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// DELETE - Remove an address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id;
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(\`🗑️ Deleting address \${addressId} for user \${currentUser.id}\`);
    
    const addressCheck = await sql\`
      SELECT "userId", "isDefault" FROM "Address" WHERE id = \${addressId}
    \`;
    
    if (addressCheck.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    if (addressCheck[0].userId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const wasDefault = addressCheck[0].isDefault;
    
    await sql\`
      DELETE FROM "Address" WHERE id = \${addressId}
    \`;
    
    if (wasDefault) {
      const remainingAddresses = await sql\`
        SELECT id FROM "Address" 
        WHERE "userId" = \${currentUser.id} 
        ORDER BY "createdAt" ASC 
        LIMIT 1
      \`;
      
      if (remainingAddresses.length > 0) {
        await sql\`
          UPDATE "Address"
          SET "isDefault" = true
          WHERE id = \${remainingAddresses[0].id}
        \`;
      }
    }
    
    console.log(\`✅ Address \${addressId} deleted successfully\`);
    return NextResponse.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}

// PUT - Update an address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id;
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const { type, name, street, city, state, country, postalCode, phone, isDefault } = data;
    
    console.log(\`✏️ Updating address \${addressId} for user \${currentUser.id}\`);
    
    const addressCheck = await sql\`
      SELECT "userId" FROM "Address" WHERE id = \${addressId}
    \`;
    
    if (addressCheck.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    if (addressCheck[0].userId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    if (isDefault) {
      await sql\`
        UPDATE "Address"
        SET "isDefault" = false
        WHERE "userId" = \${currentUser.id} AND id != \${addressId}
      \`;
    }
    
    const updatedAddress = await sql\`
      UPDATE "Address"
      SET 
        type = \${type},
        name = \${name || null},
        street = \${street},
        city = \${city},
        state = \${state},
        country = \${country || 'Nigeria'},
        "postalCode" = \${postalCode || null},
        phone = \${phone || null},
        "isDefault" = \${isDefault || false},
        "updatedAt" = NOW()
      WHERE id = \${addressId}
      RETURNING *
    \`;
    
    console.log(\`✅ Address \${addressId} updated successfully\`);
    return NextResponse.json(updatedAddress[0]);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

// GET - Get a single address
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id;
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const address = await sql\`
      SELECT * FROM "Address" 
      WHERE id = \${addressId} AND "userId" = \${currentUser.id}
    \`;
    
    if (address.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    return NextResponse.json(address[0]);
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json({ error: 'Failed to fetch address' }, { status: 500 });
  }
}
`;

// Write the route.ts file
const routeFilePath = path.join(idDir, 'route.ts');
fs.writeFileSync(routeFilePath, routeContent, 'utf8');
console.log('✅ Created route.ts at:', routeFilePath);

// Create default endpoint
const defaultDir = path.join(process.cwd(), 'src/app/api/addresses/[id]/default');
if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
    console.log('✅ Created directory:', defaultDir);
}

const defaultContent = `import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function getCurrentUser(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user_data');
    if (userCookie?.value) {
      return JSON.parse(decodeURIComponent(userCookie.value));
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id;
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const addressCheck = await sql\`
      SELECT "userId" FROM "Address" WHERE id = \${addressId}
    \`;
    
    if (addressCheck.length === 0 || addressCheck[0].userId !== currentUser.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    await sql\`
      UPDATE "Address"
      SET "isDefault" = false
      WHERE "userId" = \${currentUser.id}
    \`;
    
    await sql\`
      UPDATE "Address"
      SET "isDefault" = true
      WHERE id = \${addressId}
    \`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting default:', error);
    return NextResponse.json({ error: 'Failed to set default' }, { status: 500 });
  }
}
`;

const defaultFilePath = path.join(defaultDir, 'route.ts');
fs.writeFileSync(defaultFilePath, defaultContent, 'utf8');
console.log('✅ Created default route at:', defaultFilePath);
