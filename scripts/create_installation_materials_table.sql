-- Create InstallationMaterial table
CREATE TABLE IF NOT EXISTS "InstallationMaterial" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    category VARCHAR(100),
    image TEXT,
    sku VARCHAR(50),
    unit VARCHAR(50) DEFAULT 'piece',
    stock INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_installation_material_category ON "InstallationMaterial"(category);
CREATE INDEX IF NOT EXISTS idx_installation_material_is_active ON "InstallationMaterial"("isActive");
CREATE INDEX IF NOT EXISTS idx_installation_material_name ON "InstallationMaterial"(name);

-- Insert sample materials
INSERT INTO "InstallationMaterial" (name, description, price, category, sku, unit, stock) VALUES
('Panel Rack, Bolt & Nut', 'Mounting rack with bolts and nuts for solar panel installation', 50000, 'mounting', 'MAT-001', 'set', 50),
('6mm² PV Cable', 'Solar PV cable for panel connections', 96000, 'cables', 'MAT-002', 'yards', 200),
('AC Surge Device', 'Surge protection device for AC side', 16000, 'protection', 'MAT-003', 'piece', 30),
('100A Change Over Switch', 'Change over switch for generator/solar', 8000, 'switches', 'MAT-004', 'piece', 25),
('DC Surge Protective Device', 'Surge protection for DC side', 15000, 'protection', 'MAT-005', 'piece', 30),
('AC Voltage Regulator', 'Voltage regulator for AC output', 30000, 'regulators', 'MAT-006', 'piece', 20),
('DC Breaker', 'DC circuit breaker', 16000, 'breakers', 'MAT-007', 'piece', 40),
('AC Breaker', 'AC circuit breaker', 10000, 'breakers', 'MAT-008', 'piece', 40),
('10mm² Electrical Cable', 'Heavy duty electrical cable', 40000, 'cables', 'MAT-009', 'meters', 150),
('Breaker Compartment', 'Breaker enclosure box', 15000, 'enclosures', 'MAT-010', 'piece', 25),
('Trunking Pipe', 'Cable trunking pipe', 12000, 'conduits', 'MAT-011', 'meters', 100),
('MC4 Connector', 'Solar panel MC4 connector pair', 2500, 'connectors', 'MAT-012', 'pair', 100),
('Earthing Kit', 'Complete earthing/grounding kit', 18000, 'earthing', 'MAT-013', 'set', 30),
('Cable Ties', 'Heavy duty cable ties', 3000, 'accessories', 'MAT-014', 'pack', 200),
('Duct Tape', 'PVC electrical tape', 1500, 'accessories', 'MAT-015', 'roll', 150);
