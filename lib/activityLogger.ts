import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface ActivityLogData {
  userId: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(data: ActivityLogData) {
  try {
    await sql`
      INSERT INTO "ActivityLog" (
        "userId", "userEmail", "userRole", action, 
        "entityType", "entityId", "oldData", "newData", 
        "ipAddress", "userAgent", "createdAt"
      ) VALUES (
        ${data.userId}, ${data.userEmail || null}, ${data.userRole || null}, ${data.action},
        ${data.entityType || null}, ${data.entityId || null}, 
        ${data.oldData ? JSON.stringify(data.oldData) : null},
        ${data.newData ? JSON.stringify(data.newData) : null},
        ${data.ipAddress || null}, ${data.userAgent || null}, NOW()
      )
    `;
    console.log(`📝 Activity logged: ${data.action}`);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Simplified version - just return empty array for now
export async function getActivityLogs(filters?: {
  userId?: string;
  action?: string;
  entityType?: string;
  limit?: number;
}) {
  // Return empty array to avoid complex queries
  console.log('getActivityLogs called with filters:', filters);
  return [];
}
