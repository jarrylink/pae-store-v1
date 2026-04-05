SELECT COUNT(*) as order_count FROM "Order";
SELECT column_name FROM information_schema.columns WHERE table_name = 'Order' ORDER BY ordinal_position;
