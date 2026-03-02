export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  emailVerified: boolean;
  phone?: string;
  role: 'superadmin' | 'staff' | 'customer';
  password: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  isActive: boolean;
  permissions?: string[];
}

