-- Power Afric Store - Complete Database Setup
-- Run this in pgAdmin Query Tool on pa_store_prod_v1 database

-- 1. Enable security extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop and recreate application user
DROP USER IF EXISTS power_afric_app;
CREATE USER power_afric_app WITH PASSWORD 'Ik4%_S2=WsH@B|KZjFfDeN*GA6yXo#&b';

-- 3. Grant database connection
GRANT CONNECT ON DATABASE pa_store_prod_v1 TO power_afric_app;

-- 4. Secure the database
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- 5. Grant table permissions to application user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO power_afric_app;

-- 6. Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO power_afric_app;

-- 7. Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO power_afric_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE ON SEQUENCES TO power_afric_app;

-- 8. Verify setup
SELECT '✅ DATABASE SETUP COMPLETE' as status;

-- 9. Show user permissions
SELECT 
    table_name,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.role_table_grants 
WHERE grantee = 'power_afric_app' 
AND table_schema = 'public'
GROUP BY table_name;

-- 10. Show extensions
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');
