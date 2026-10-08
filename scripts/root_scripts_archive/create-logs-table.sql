-- Create ActivityLog table for tracking all actions
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    id SERIAL PRIMARY KEY,
    userId TEXT NOT NULL,
    userEmail TEXT,
    userRole TEXT,
    action TEXT NOT NULL,
    entityType TEXT,
    entityId TEXT,
    oldData JSONB,
    newData JSONB,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_user ON "ActivityLog"(userId);
CREATE INDEX IF NOT EXISTS idx_activity_created ON "ActivityLog"(createdAt);
CREATE INDEX IF NOT EXISTS idx_activity_action ON "ActivityLog"(action);
