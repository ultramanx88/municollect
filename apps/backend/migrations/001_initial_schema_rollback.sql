-- Rollback migration for initial schema
-- This migration drops all tables and indexes created in 001_initial_schema.sql

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS municipalities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop UUID extension if no other tables use it
-- Note: Be careful with this in production - other applications might use it
-- DROP EXTENSION IF EXISTS "uuid-ossp";