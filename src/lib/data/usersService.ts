import sql from '@/lib/neon-client';
import { User } from '@/types/auth';

export async function getUsers(): Promise<User[]> {
  const result = await sql`SELECT * FROM "User"`;
  return result as User[];
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await sql`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`;
  return users[0] as User | undefined;
}

export async function verifyUserCredentials(email: string, password: string): Promise<User | null> {
  const users = await sql`SELECT * FROM "User" WHERE email = ${email} AND password = ${password} AND "isActive" = true LIMIT 1`;
  return users[0] as User | null;
}
