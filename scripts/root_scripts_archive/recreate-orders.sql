-- Drop existing table and all dependencies
DROP TABLE IF EXISTS "Order" CASCADE;

-- Create fresh orders table with all needed fields
CREATE TABLE "Order" (
    id SERIAL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderNumber" TEXT UNIQUE NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    "shippingAddress" JSONB,
    "billingAddress" JSONB,
    "paymentMethod" TEXT DEFAULT 'bank_transfer',
    "paymentStatus" TEXT DEFAULT 'pending',
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    -- Customer information (denormalized)
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    
    -- Installation fields
    "installationFee" DECIMAL(10,2) DEFAULT 0,
    "requiresInstallation" BOOLEAN DEFAULT FALSE
);

-- Create indexes for fast lookups
CREATE INDEX idx_order_userId ON "Order"("userId");
CREATE INDEX idx_order_customerEmail ON "Order"("customerEmail");
CREATE INDEX idx_order_orderNumber ON "Order"("orderNumber");
CREATE INDEX idx_order_status ON "Order"("status");
CREATE INDEX idx_order_createdAt ON "Order"("createdAt" DESC);

-- Verify table was created
SELECT '✅ Orders table recreated successfully' as message;

-- Show table structure
\d "Order"
