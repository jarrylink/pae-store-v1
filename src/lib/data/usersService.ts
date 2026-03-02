import { User } from '@/lib/data/users';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE_PATH = path.join(process.cwd(), 'src/lib/data/users.json');

export async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  const content = JSON.stringify(users, null, 2);
  await fs.writeFile(USERS_FILE_PATH, content, 'utf-8');
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find(u => u.id === id);
}

export async function verifyUserCredentials(email: string, password: string): Promise<User | null> {
  const users = await getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user && user.password === password && user.isActive) {
    return user;
  }
  return null;
}

