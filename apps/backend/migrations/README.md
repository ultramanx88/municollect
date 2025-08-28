# Database Migrations

This directory contains database migrations for the MuniCollect backend application.

## Migration Files

Migration files follow the naming convention: `{version}_{name}.sql` and `{version}_{name}_rollback.sql`

- `{version}`: A numeric version (e.g., 001, 002, 003)
- `{name}`: A descriptive name for the migration (e.g., initial_schema, add_user_preferences)
- The rollback file is optional but recommended for production deployments

### Current Migrations

1. **001_initial_schema.sql** - Creates all core tables with proper indexes and constraints
   - Users table with authentication and profile information
   - Municipalities table with payment configuration
   - Payments table with transaction tracking
   - Payment transactions table for audit trail
   - Notifications table for user communications

2. **002_seed_data.sql** - Inserts sample data for development and testing
   - Sample municipalities (Springfield, Riverside, Greenville)
   - Test users with different roles
   - Sample payments and transactions
   - Example notifications

## Running Migrations

### Prerequisites

1. Ensure PostgreSQL is running and accessible
2. Set the `DATABASE_URL` environment variable or use the `-db` flag
3. Build the migration tool: `go build -o migrate ./cmd/migrate`

### Commands

#### Apply all pending migrations
```bash
./migrate -action=up
```

#### Check migration status
```bash
./migrate -action=status
```

#### Rollback the last migration
```bash
./migrate -action=rollback
```

#### Rollback to a specific version
```bash
./migrate -action=rollback -version=001
```

#### Validate migration files
```bash
./migrate -action=validate
```

#### Custom database URL
```bash
./migrate -action=up -db="postgres://user:password@localhost:5432/dbname?sslmode=disable"
```

#### Custom migrations directory
```bash
./migrate -action=up -migrations=/path/to/migrations
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (required if not using -db flag)

Example:
```bash
export DATABASE_URL="postgres://user:password@localhost:5432/municollect_dev?sslmode=disable"
```

## Migration Best Practices

### Creating New Migrations

1. **Use sequential version numbers**: Start with 001, then 002, 003, etc.
2. **Descriptive names**: Use clear, descriptive names for your migrations
3. **Always create rollback files**: Include a corresponding `_rollback.sql` file
4. **Test thoroughly**: Test both up and down migrations in a development environment

### Writing Migration SQL

1. **Use IF NOT EXISTS**: For CREATE statements to avoid errors on re-runs
2. **Add proper indexes**: Include performance-optimizing indexes
3. **Use constraints**: Add CHECK constraints for data validation
4. **Handle existing data**: Consider existing data when altering tables
5. **Use transactions**: Wrap complex migrations in transactions

### Example Migration

**003_add_user_preferences.sql**:
```sql
-- Add user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_enabled BOOLEAN DEFAULT true,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
```

**003_add_user_preferences_rollback.sql**:
```sql
-- Remove user preferences table
DROP TABLE IF EXISTS user_preferences CASCADE;
```

## Troubleshooting

### Common Issues

1. **Migration fails**: Check the error message and ensure your SQL is valid
2. **Rollback fails**: Ensure the rollback SQL properly undoes the up migration
3. **Connection issues**: Verify your DATABASE_URL is correct and the database is accessible
4. **Permission issues**: Ensure the database user has sufficient privileges

### Recovery

If a migration fails partway through:

1. Check the migration status: `./migrate -action=status`
2. Manually fix any partial changes in the database
3. Mark the migration as rolled back in the migrations table if needed
4. Re-run the migration

### Development vs Production

- **Development**: Use seed data migrations for testing
- **Production**: Never run seed data migrations, only schema changes
- **Staging**: Test all migrations thoroughly before production deployment

## Integration with Application

The migration system is integrated with the main application through the `config` package. The application can automatically run pending migrations on startup by calling:

```go
runner := config.NewMigrationRunner(db, "migrations")
if err := runner.RunMigrations(); err != nil {
    log.Fatal("Failed to run migrations:", err)
}
```

## Monitoring

The migrations table tracks:
- Which migrations have been applied
- When they were applied
- The SQL that was executed
- Rollback information

Query the migrations table to see the current state:
```sql
SELECT version, name, applied_at, rolled_back_at FROM migrations ORDER BY applied_at;
```