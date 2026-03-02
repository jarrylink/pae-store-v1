import { User } from '@/types/auth';

const API_BASE = '/api/users';

export interface UserFilters {
  role?: 'superadmin' | 'staff' | 'customer';
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  success: boolean;
  data: Omit<User, 'password'>[];
  total: number;
  page: number;
  limit: number;
}

export interface UserResponse {
  success: boolean;
  data: Omit<User, 'password'>;
  message?: string;
}

class UserService {
  // Get all users with optional filters – API returns array directly
  async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const data = await response.json(); // API returns array of users without passwords

    // Wrap to match UsersResponse interface
    return {
      success: true,
      data: data,
      total: data.length,
      page: filters.page || 1,
      limit: filters.limit || data.length
    };
  }

  // Get a single user by ID (not used in admin page, but kept for completeness)
  async getUserById(id: string): Promise<UserResponse> {
    const users = await this.getUsers();
    const user = users.data.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      success: true,
      data: user
    };
  }

  // Create a new user
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'avatar' | 'emailVerified'>): Promise<UserResponse> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Create user failed:', error);
      throw new Error(error.error || 'Failed to create user');
    }

    const newUser = await response.json();
    return {
      success: true,
      data: newUser
    };
  }

  // Update a user
  async updateUser(id: string, userData: Partial<User>): Promise<UserResponse> {
    const response = await fetch(API_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...userData }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Update user failed:', error);
      throw new Error(error.error || 'Failed to update user');
    }

    const updatedUser = await response.json();
    return {
      success: true,
      data: updatedUser
    };
  }

  // Toggle user active status
  async toggleUserStatus(id: string, isActive: boolean): Promise<UserResponse> {
    const response = await fetch(API_BASE, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, isActive }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Toggle user status failed:', error);
      throw new Error(error.error || 'Failed to update user status');
    }

    const updatedUser = await response.json();
    return {
      success: true,
      data: updatedUser
    };
  }

  // Delete a user
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Delete user failed:', error);
      throw new Error(error.error || 'Failed to delete user');
    }

    return response.json();
  }

  // Get user statistics – computed from fetched users
  async getUserStats(): Promise<{
    total: number;
    byRole: { [key: string]: number };
    active: number;
    inactive: number;
  }> {
    const usersResponse = await this.getUsers(); // now returns wrapped response
    const users = usersResponse.data;

    const stats = {
      total: users.length,
      byRole: {
        superadmin: users.filter(u => u.role === 'superadmin').length,
        staff: users.filter(u => u.role === 'staff').length,
        customer: users.filter(u => u.role === 'customer').length,
      },
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
    };

    return stats;
  }

  // Get recent users
  async getRecentUsers(limit: number = 5): Promise<Omit<User, 'password'>[]> {
    const usersResponse = await this.getUsers();
    // Sort by createdAt descending and limit
    return usersResponse.data
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const userService = new UserService();
