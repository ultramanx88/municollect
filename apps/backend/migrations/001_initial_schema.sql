-- Initial schema migration for MuniCollect
-- This migration creates all the core tables with proper indexes and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'resident' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Municipalities table
CREATE TABLE IF NOT EXISTS municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    payment_config JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for municipalities table
CREATE INDEX IF NOT EXISTS idx_municipalities_name ON municipalities(name);
CREATE INDEX IF NOT EXISTS idx_municipalities_code ON municipalities(code);
CREATE INDEX IF NOT EXISTS idx_municipalities_contact_email ON municipalities(contact_email);
CREATE INDEX IF NOT EXISTS idx_municipalities_created_at ON municipalities(created_at);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    qr_code VARCHAR(255) UNIQUE,
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_municipality_user ON payments(municipality_id, user_id);
CREATE INDEX IF NOT EXISTS idx_payments_municipality_service ON payments(municipality_id, service_type);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_service_type ON payments(service_type);
CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_qr_code ON payments(qr_code);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    transaction_data JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for payment_transactions table
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent' NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    read_at TIMESTAMP
);

-- Create indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

-- Add constraints for enum-like fields
ALTER TABLE users ADD CONSTRAINT chk_users_role 
    CHECK (role IN ('resident', 'municipal_staff', 'admin'));

ALTER TABLE payments ADD CONSTRAINT chk_payments_service_type 
    CHECK (service_type IN ('waste_management', 'water_bill'));

ALTER TABLE payments ADD CONSTRAINT chk_payments_currency 
    CHECK (currency IN ('USD', 'EUR', 'GBP'));

ALTER TABLE payments ADD CONSTRAINT chk_payments_status 
    CHECK (status IN ('pending', 'completed', 'failed', 'expired'));

ALTER TABLE payments ADD CONSTRAINT chk_payments_amount_positive 
    CHECK (amount > 0);

ALTER TABLE payment_transactions ADD CONSTRAINT chk_payment_transactions_status 
    CHECK (status IN ('pending', 'completed', 'failed', 'expired'));

ALTER TABLE notifications ADD CONSTRAINT chk_notifications_type 
    CHECK (type IN ('payment_reminder', 'payment_confirmation', 'payment_failed', 'system_update'));

ALTER TABLE notifications ADD CONSTRAINT chk_notifications_status 
    CHECK (status IN ('sent', 'delivered', 'read', 'failed'));