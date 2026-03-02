import { NextRequest, NextResponse } from 'next/server';
import { getUsers, saveUsers, findUserById } from '@/lib/data/usersService';
import { User } from '@/lib/data/users';

// GET /api/users – list all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const users = await getUsers();
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users – create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, role, permissions, avatar, emailVerified, isActive } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const users = await getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      email,
      firstName,
      lastName,
      avatar: avatar || '',
      emailVerified: emailVerified || false,
      phone: phone || '',
      role: role || 'customer',
      password: password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      isActive: isActive ?? true,
      permissions: permissions || []
    };

    users.push(newUser);
    await saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users – update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...userData } = body;
    if (!id) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const users = await getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = { ...users[index], ...userData, updatedAt: new Date().toISOString() };
    users[index] = updatedUser;
    await saveUsers(users);

    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users – delete user
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const users = await getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await saveUsers(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

