-- Rollback migration for seed data
-- This migration removes all seed data inserted in 002_seed_data.sql

-- Delete seed data in reverse order of dependencies
DELETE FROM notifications WHERE id IN (
    'd47ac10b-58cc-4372-a567-0e02b2c3d479',
    'd47ac10b-58cc-4372-a567-0e02b2c3d480',
    'd47ac10b-58cc-4372-a567-0e02b2c3d481'
);

DELETE FROM payment_transactions WHERE id IN (
    'c47ac10b-58cc-4372-a567-0e02b2c3d479',
    'c47ac10b-58cc-4372-a567-0e02b2c3d480',
    'c47ac10b-58cc-4372-a567-0e02b2c3d481',
    'c47ac10b-58cc-4372-a567-0e02b2c3d482'
);

DELETE FROM payments WHERE id IN (
    'b47ac10b-58cc-4372-a567-0e02b2c3d479',
    'b47ac10b-58cc-4372-a567-0e02b2c3d480',
    'b47ac10b-58cc-4372-a567-0e02b2c3d481'
);

DELETE FROM users WHERE id IN (
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'a47ac10b-58cc-4372-a567-0e02b2c3d480',
    'a47ac10b-58cc-4372-a567-0e02b2c3d481',
    'a47ac10b-58cc-4372-a567-0e02b2c3d482'
);

DELETE FROM municipalities WHERE id IN (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481'
);