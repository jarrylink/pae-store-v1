import { NextRequest, NextResponse } from 'next/server';
import { getUsers, saveUsers, findUserByEmail } from '@/lib/data/usersService';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone, avatar } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update only allowed fields – never change email
    users[userIndex] = {
      ...users[userIndex],
      firstName: firstName ?? users[userIndex].firstName,
      lastName: lastName ?? users[userIndex].lastName,
      phone: phone ?? users[userIndex].phone,
      avatar: avatar ?? users[userIndex].avatar,
      updatedAt: new Date().toISOString(),
    };

    await saveUsers(users);

    const { password, ...userWithoutPassword } = users[userIndex];
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
