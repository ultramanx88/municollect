-- Seed data migration for development and testing
-- This migration inserts sample data for development and testing purposes

-- Insert sample municipalities
INSERT INTO municipalities (id, name, code, contact_email, contact_phone, payment_config, created_at, updated_at) VALUES
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Springfield Municipality',
    'SPRING',
    'admin@springfield.gov',
    '+1-555-0101',
    '{"wasteManagementFee": 25.00, "waterBillEnabled": true, "currency": "USD", "paymentMethods": ["qr_code", "online"], "qrCodeExpirationMinutes": 60}',
    NOW(),
    NOW()
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Riverside City',
    'RIVER',
    'payments@riverside.gov',
    '+1-555-0102',
    '{"wasteManagementFee": 30.00, "waterBillEnabled": true, "currency": "USD", "paymentMethods": ["qr_code", "online", "phone"], "qrCodeExpirationMinutes": 45}',
    NOW(),
    NOW()
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Greenville Township',
    'GREEN',
    'billing@greenville.gov',
    '+1-555-0103',
    '{"wasteManagementFee": 20.00, "waterBillEnabled": false, "currency": "USD", "paymentMethods": ["qr_code"], "qrCodeExpirationMinutes": 30}',
    NOW(),
    NOW()
);

-- Insert sample users
INSERT INTO users (id, email, first_name, last_name, phone, role, created_at, updated_at) VALUES
(
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'john.doe@example.com',
    'John',
    'Doe',
    '+1-555-1001',
    'resident',
    NOW(),
    NOW()
),
(
    'a47ac10b-58cc-4372-a567-0e02b2c3d480',
    'jane.smith@example.com',
    'Jane',
    'Smith',
    '+1-555-1002',
    'resident',
    NOW(),
    NOW()
),
(
    'a47ac10b-58cc-4372-a567-0e02b2c3d481',
    'admin@springfield.gov',
    'Admin',
    'User',
    '+1-555-1003',
    'municipal_staff',
    NOW(),
    NOW()
),
(
    'a47ac10b-58cc-4372-a567-0e02b2c3d482',
    'super.admin@municollect.com',
    'Super',
    'Admin',
    '+1-555-1004',
    'admin',
    NOW(),
    NOW()
);

-- Insert sample payments
INSERT INTO payments (id, municipality_id, user_id, service_type, amount, currency, status, qr_code, due_date, created_at, updated_at) VALUES
(
    'b47ac10b-58cc-4372-a567-0e02b2c3d479',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'waste_management',
    25.00,
    'USD',
    'pending',
    'QR_SPRING_WM_001',
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
),
(
    'b47ac10b-58cc-4372-a567-0e02b2c3d480',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'a47ac10b-58cc-4372-a567-0e02b2c3d480',
    'water_bill',
    45.50,
    'USD',
    'completed',
    'QR_RIVER_WB_001',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '5 days'
),
(
    'b47ac10b-58cc-4372-a567-0e02b2c3d481',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'waste_management',
    20.00,
    'USD',
    'pending',
    'QR_GREEN_WM_001',
    NOW() + INTERVAL '15 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
);

-- Update paid_at for completed payment
UPDATE payments SET paid_at = NOW() - INTERVAL '5 days' WHERE status = 'completed';

-- Insert sample payment transactions
INSERT INTO payment_transactions (id, payment_id, status, transaction_data, created_at) VALUES
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d479',
    'b47ac10b-58cc-4372-a567-0e02b2c3d479',
    'pending',
    '{"method": "qr_code", "initiated_by": "user", "ip_address": "192.168.1.100"}',
    NOW()
),
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d480',
    'b47ac10b-58cc-4372-a567-0e02b2c3d480',
    'pending',
    '{"method": "qr_code", "initiated_by": "user", "ip_address": "192.168.1.101"}',
    NOW() - INTERVAL '10 days'
),
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d481',
    'b47ac10b-58cc-4372-a567-0e02b2c3d480',
    'completed',
    '{"method": "qr_code", "payment_processor": "stripe", "transaction_id": "txn_1234567890", "ip_address": "192.168.1.101"}',
    NOW() - INTERVAL '5 days'
),
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d482',
    'b47ac10b-58cc-4372-a567-0e02b2c3d481',
    'pending',
    '{"method": "qr_code", "initiated_by": "user", "ip_address": "192.168.1.102"}',
    NOW() - INTERVAL '5 days'
);

-- Insert sample notifications
INSERT INTO notifications (id, user_id, type, title, message, status, data, created_at) VALUES
(
    'd47ac10b-58cc-4372-a567-0e02b2c3d479',
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'payment_reminder',
    'Payment Due Soon',
    'Your waste management fee payment of $25.00 is due in 30 days.',
    'sent',
    '{"payment_id": "b47ac10b-58cc-4372-a567-0e02b2c3d479", "amount": 25.00, "due_date": "2024-12-31"}',
    NOW()
),
(
    'd47ac10b-58cc-4372-a567-0e02b2c3d480',
    'a47ac10b-58cc-4372-a567-0e02b2c3d480',
    'payment_confirmation',
    'Payment Successful',
    'Your water bill payment of $45.50 has been processed successfully.',
    'delivered',
    '{"payment_id": "b47ac10b-58cc-4372-a567-0e02b2c3d480", "amount": 45.50, "transaction_id": "txn_1234567890"}',
    NOW() - INTERVAL '5 days'
),
(
    'd47ac10b-58cc-4372-a567-0e02b2c3d481',
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'system_update',
    'System Maintenance',
    'The payment system will be under maintenance on Sunday from 2 AM to 4 AM.',
    'sent',
    '{"maintenance_start": "2024-12-15T02:00:00Z", "maintenance_end": "2024-12-15T04:00:00Z"}',
    NOW() - INTERVAL '2 days'
);