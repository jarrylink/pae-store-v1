import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/data/users'; // Use server-side User type
import { getUsers, saveUsers, findUserByEmail } from '@/lib/data/usersService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const users = await getUsers();

    // Create new user object
    const newUser: User = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      email,
      firstName,
      lastName,
      avatar: '',
      emailVerified: false,
      phone: phone || '',
      role: 'customer',
      password, // Now TypeScript knows this field exists
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      permissions: ['orders:read', 'orders:create', 'profile:read', 'profile:update']
    };

    users.push(newUser);
    await saveUsers(users);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
