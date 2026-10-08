-- Create operational_costs table
CREATE TABLE IF NOT EXISTS operational_costs (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL CHECK (category IN ('cogs', 'opex')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO operational_costs (category, amount, description) VALUES
  ('cogs', 450000, 'AWS Hosting Infrastructure'),
  ('cogs', 120000, 'SMS Gateway API Costs'),
  ('cogs', 75000, 'Payment Processing Fees'),
  ('opex', 250000, 'Marketing Campaign'),
  ('opex', 180000, 'Customer Acquisition'),
  ('opex', 95000, 'Admin Tools & Software'),
  ('opex', 320000, 'Payroll & Benefits');

INSERT INTO subscriptions (user_id, plan_name, amount, status) VALUES
  ('user1', 'Premium Solar Plan', 25000, 'active'),
  ('user2', 'Standard Plan', 15000, 'active'),
  ('user3', 'Premium Plan', 25000, 'active'),
  ('user4', 'Enterprise Plan', 50000, 'active');
