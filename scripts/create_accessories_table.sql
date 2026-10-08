-- Create Accessories table
CREATE TABLE IF NOT EXISTS "Accessory" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) DEFAULT 'accessories',
    image TEXT,
    sku VARCHAR(50),
    unit VARCHAR(50) DEFAULT 'piece',
    stock INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_accessory_category ON "Accessory"(category);
CREATE INDEX IF NOT EXISTS idx_accessory_is_active ON "Accessory"("isActive");
CREATE INDEX IF NOT EXISTS idx_accessory_name ON "Accessory"(name);

-- Insert the accessories
INSERT INTO "Accessory" (name, description, price, category, sku, unit, stock) VALUES
('Panel Rack, Bolt & Nut', 'Mounting rack with bolts and nuts for solar panel installation', 50000, 'mounting', 'ACC-001', 'set', 50),
('6mm² PV Cable', 'Solar PV cable for panel connections', 96000, 'cables', 'ACC-002', 'yards', 200),
('AC Surge Device', 'Surge protection device for AC side', 16000, 'protection', 'ACC-003', 'piece', 30),
('100A Change Over Switch', 'Change over switch for generator/solar', 8000, 'switches', 'ACC-004', 'piece', 25),
('DC Surge Protective Device', 'Surge protection for DC side', 15000, 'protection', 'ACC-005', 'piece', 30),
('AC Voltage Regulator', 'Voltage regulator for AC output', 30000, 'regulators', 'ACC-006', 'piece', 20),
('DC Breaker', 'DC circuit breaker', 16000, 'breakers', 'ACC-007', 'piece', 40),
('AC Breaker', 'AC circuit breaker', 10000, 'breakers', 'ACC-008', 'piece', 40),
('10mm² Electrical Cable', 'Heavy duty electrical cable', 40000, 'cables', 'ACC-009', 'meters', 150),
('Breaker Compartment', 'Breaker enclosure box', 15000, 'enclosures', 'ACC-010', 'piece', 25),
('Trunking Pipe', 'Cable trunking pipe', 12000, 'conduits', 'ACC-011', 'meters', 100);
