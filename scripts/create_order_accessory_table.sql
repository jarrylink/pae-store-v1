-- ============================================
-- MIGRATION: Create OrderAccessory Table
-- Date: 2026-07-07
-- Description: Create OrderAccessory table to store accessories linked to orders
-- ============================================

-- Step 1: Create OrderAccessory table
CREATE TABLE IF NOT EXISTS "OrderAccessory" (
    id SERIAL PRIMARY KEY,
    "orderId" INTEGER NOT NULL,
    "accessoryId" INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'piece',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add foreign key constraints
ALTER TABLE "OrderAccessory" 
ADD CONSTRAINT fk_order_accessory_order 
    FOREIGN KEY ("orderId") 
    REFERENCES "Order"(id) 
    ON DELETE CASCADE;

ALTER TABLE "OrderAccessory" 
ADD CONSTRAINT fk_order_accessory_accessory 
    FOREIGN KEY ("accessoryId") 
    REFERENCES "Accessory"(id) 
    ON DELETE RESTRICT;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_accessory_order ON "OrderAccessory"("orderId");
CREATE INDEX IF NOT EXISTS idx_order_accessory_accessory ON "OrderAccessory"("accessoryId");
CREATE INDEX IF NOT EXISTS idx_order_accessory_created ON "OrderAccessory"("createdAt");

-- Step 4: Create composite unique constraint to prevent duplicate accessories per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_accessory_unique 
    ON "OrderAccessory"("orderId", "accessoryId");

-- Step 5: Verify the table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'OrderAccessory'
ORDER BY ordinal_position;
