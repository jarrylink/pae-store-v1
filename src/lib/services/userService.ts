const API_BASE = '/api/users';

export interface UserFilters {
  role?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UserResponse {
  success: boolean;
  data: any;
  message?: string;
}

async function fetchWithRetry(url: string, options?: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed, ${retries - i - 1} retries left`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error("Max retries exceeded");
}

class UserService {
  async getUsers(filters: UserFilters = {}): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      
      const res = await fetchWithRetry(`${API_BASE}?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      
      const data = await res.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error in getUsers:', error);
      return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserById(id: string): Promise<any> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return await res.json();
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }

  async createUser(data: any): Promise<any> {
    try {
      console.log('Creating user with data:', data);
      const res = await fetchWithRetry(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const responseData = await res.json();
      console.log('Create user response status:', res.status);
      console.log('Create user response data:', responseData);
      
      if (!res.ok) {
        throw new Error(responseData.error || `Failed to create user (${res.status})`);
      }
      
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Error in createUser:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateUser(id: string, data: any): Promise<any> {
    try {
      console.log(`Updating user ${id} with data:`, data);
      const res = await fetchWithRetry(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      console.log('Update response status:', res.status);
      const responseData = await res.json();
      console.log('Update response data:', responseData);
      
      if (!res.ok) {
        throw new Error(responseData.error || `Failed to update user (${res.status})`);
      }
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Error in updateUser:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    }
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<any> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update user status');
      }
      return { success: true, data: await res.json() };
    } catch (error) {
      console.error('Error in toggleUserStatus:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserStats(): Promise<any> {
    try {
      const users = await this.getUsers();
      if (users.success && users.data) {
        const userList = users.data;
        return {
          total: userList.length,
          byRole: {
            superadmin: userList.filter((u: any) => u.role === 'superadmin').length,
            staff: userList.filter((u: any) => u.role === 'staff').length,
            customer: userList.filter((u: any) => u.role === 'customer').length,
          },
          active: userList.filter((u: any) => u.isActive).length,
          inactive: userList.filter((u: any) => !u.isActive).length,
        };
      }
      return { total: 0, byRole: {}, active: 0, inactive: 0 };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return { total: 0, byRole: {}, active: 0, inactive: 0 };
    }
  }

  async getRecentUsers(limit: number = 5): Promise<any[]> {
    try {
      const users = await this.getUsers({ limit });
      return users.success ? users.data : [];
    } catch (error) {
      console.error('Error in getRecentUsers:', error);
      return [];
    }
  }
}

export const userService = new UserService();
