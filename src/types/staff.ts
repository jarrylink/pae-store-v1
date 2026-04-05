export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'manager' | 'staff' | 'installer' | 'delivery';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderAssignment {
  id: string;
  orderId: number;
  userId: string;
  assignedBy: string;
  assignedAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
  completedAt?: string;
}

export interface OrderNote {
  id: string;
  orderId: number;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  type: 'general' | 'customer' | 'internal' | 'status_change' | 'assignment';
  createdAt: string;
  isInternal: boolean;
}
