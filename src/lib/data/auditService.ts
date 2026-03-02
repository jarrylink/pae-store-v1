// Audit logging service for monitoring system activities
// In production, this would write to PostgreSQL audit_logs table

export interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

class AuditService {
  private logs: AuditLog[] = [];
  private storageKey = 'power_afric_audit_logs';

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          this.logs = JSON.parse(saved);
        } catch (error) {
          console.error('Failed to parse audit logs:', error);
        }
      }
    }
  }

  private saveLogs() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    }
  }

  async logAction(action: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...action,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(log); // Add to beginning for chronological order
    // Keep only last 1000 logs in memory for performance
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }
    
    this.saveLogs();
    
    // In production, this would be an API call to save to PostgreSQL
    console.log('AUDIT LOG:', log);
  }

  async getLogs(options?: {
    userId?: string;
    action?: string;
    resource?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    let filtered = [...this.logs];

    if (options?.userId) {
      filtered = filtered.filter(log => log.userId === options.userId);
    }
    if (options?.action) {
      filtered = filtered.filter(log => log.action === options.action);
    }
    if (options?.resource) {
      filtered = filtered.filter(log => log.resource === options.resource);
    }
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  // Common action types
  static Actions = {
    LOGIN: 'USER_LOGIN',
    LOGOUT: 'USER_LOGOUT',
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    VIEW: 'VIEW',
    EXPORT: 'EXPORT',
    IMPORT: 'IMPORT',
  } as const;

  static Resources = {
    USER: 'USER',
    PRODUCT: 'PRODUCT',
    ORDER: 'ORDER',
    CART: 'CART',
    SYSTEM: 'SYSTEM',
  } as const;
}

// Export singleton instance
export const auditService = new AuditService();
