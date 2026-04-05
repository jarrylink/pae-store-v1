import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  console.log('Creating User table...');
  await sql`
    CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      avatar TEXT,
      "emailVerified" BOOLEAN DEFAULT false,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      password TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW(),
      "lastLogin" TIMESTAMP,
      "isActive" BOOLEAN DEFAULT true,
      permissions TEXT[]
    );
  `;

  console.log('Inserting users...');
  const users = [
    {
      id: "superadmin-001",
      email: "superadmin@powerafric.com",
      firstName: "Jafar",
      lastName: "Admin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jafar",
      emailVerified: true,
      phone: "+2348012345678",
      role: "superadmin",
      password: "12345",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-11-24T12:00:00Z",
      lastLogin: "2024-11-24T08:30:00Z",
      isActive: true,
      permissions: ["users:create","users:read","users:update","users:delete","products:create","products:read","products:update","products:delete","orders:create","orders:read","orders:update","orders:delete","analytics:read","settings:manage","system:admin"]
    },
    {
      id: "staff-001",
      email: "staff1@powerafric.com",
      firstName: "Ahmad",
      lastName: "Staff",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
      emailVerified: true,
      phone: "+2348023456789",
      role: "staff",
      password: "123456",
      createdAt: "2024-02-15T00:00:00Z",
      updatedAt: "2026-02-26T13:42:53.033Z",
      lastLogin: "2024-11-24T09:15:00Z",
      isActive: true,
      permissions: ["products:read","products:update","orders:read","orders:update","users:read","analytics:read"]
    },
    {
      id: "user-1772001830294-tly6d7e9s",
      email: "cus1@powerafric.ng",
      firstName: "Jafar",
      lastName: "Muhammad",
      avatar: "",
      emailVerified: false,
      phone: "07039797368",
      role: "customer",
      password: "123456",
      createdAt: "2026-02-25T06:43:50.294Z",
      updatedAt: "2026-02-25T06:43:50.294Z",
      lastLogin: "2026-02-25T06:43:50.294Z",
      isActive: true,
      permissions: ["orders:read","orders:create","profile:read","profile:update"]
    },
    {
      id: "user-1772111899737-j6dlobt80",
      email: "cus2@powerafric.ng",
      firstName: "Ridwan",
      lastName: "Mogaji",
      avatar: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEhUQEBAVFhUVFRAXFhUXFhUVFhUVFRUWGBcVFxUaHSggGBolGxUVITEiJSkrLi4uGB8zODMtNygtLisBCgoKDg0OFRAQFSsdFR0tKy0tLSstLS0tLSstKystLS0rLSsrLSstLS0tLSstKysrLSsrKy0rNSsrKystKy0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAQUDBAYCB//EAEYQAAIBAgMFBAYHBQcCBwAAAAECAAMRBBIhBTFBUWEGEyJxMkKBkaFCFSNSYnKx0TNyc+HwFkNTkqKz8SQ0B4ODhJPC0v/EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAIREBAQEBAAEDBQEAAAAAAAAAAAERAgMSMUEiIzJCURP/2gAMAwEAAhEDEQA/APh0REBERKEmIlCTEQERJgREmIEWi0mLQItFp6tIgRaJMQIiTIgJEmIESJMQIiIkERJgIiJQkxJlCIiAkxEBERKqYkSYCb+B2xXo3yPcGmaZVwKiGnfNkyuCLBtfOaEQOgwfaZhjTj6qAvlcKqeFVbuu7SwN/CBbSXFHterpRatVbvaVHG3XKcj12QpQqGw1Yq7Ak/Z6zh4jB9KO2cJSSqyvhmoFcCtGgEXve67yma6P4QzE5SSCTrrNXHYDZlKk4RqTthxUp5iw+ufE27tyR6QpBm1G7JPn94jB9QfBbPWpTFSnhgFxDodaaq1B6FUIxtUYuudUIdiGvrpOUxe06QOAxaLSWqhLVlpKtPWlXuhKLYAlbcNbTmovGD6RtXtphSlSmuZjUbF03ZFtmpGk6YdxmtcgGmDf7F+U5/E9sGJqVKNI0qtapRqVqgqZrtSufq1K+AEkk3zb7bpy8Rg6HtB2j+kU1o01ZUWo1S7d2CCy5cirSRFVd5OlyTcyg7w2y3OW97XNr2te3O08xAREiBMiJEBERIEREBEiJAkxEBERKEREsExEQJiIgIiICIiAiIgIiICIiBERECIiICIiQJERIERED/9k=",
      emailVerified: false,
      phone: "07039797364",
      role: "customer",
      password: "1234567890",
      createdAt: "2026-02-26T13:18:19.737Z",
      updatedAt: "2026-02-26T13:42:36.275Z",
      lastLogin: null,
      isActive: true,
      permissions: []
    },
    {
      id: "user-1772200023648-zbzvjsegb",
      email: "staff2@powerafric.ng",
      firstName: "Safiyya",
      lastName: "Lawal",
      avatar: "",
      emailVerified: false,
      phone: "12344321123",
      role: "customer",
      password: "123456",
      createdAt: "2026-02-27T13:47:03.648Z",
      updatedAt: "2026-02-27T13:47:03.648Z",
      lastLogin: "2026-02-27T13:47:03.648Z",
      isActive: true,
      permissions: ["orders:read","orders:create","profile:read","profile:update"]
    }
  ];

  for (const user of users) {
    await sql`
      INSERT INTO "User" (id, email, "firstName", "lastName", avatar, "emailVerified", phone, role, password, "createdAt", "updatedAt", "lastLogin", "isActive", permissions)
      VALUES (${user.id}, ${user.email}, ${user.firstName}, ${user.lastName}, ${user.avatar}, ${user.emailVerified}, ${user.phone}, ${user.role}, ${user.password}, ${user.createdAt}, ${user.updatedAt}, ${user.lastLogin}, ${user.isActive}, ${user.permissions})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  console.log('Database setup complete.');
}

setup().catch(console.error);
