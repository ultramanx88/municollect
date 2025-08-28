# @municollect/shared

Shared TypeScript types, interfaces, validation schemas, and constants for the MuniCollect monorepo.

## Overview

This package provides type-safe contracts between the frontend and backend applications, ensuring consistency across the entire system.

## Installation

This package is automatically available to other packages in the monorepo through workspace dependencies.

## Usage

### Types

```typescript
import { User, Payment, Municipality } from '@municollect/shared';

const user: User = {
  id: '123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'resident',
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### API Interfaces

```typescript
import { PaymentRequest, PaymentResponse } from '@municollect/shared';

const paymentRequest: PaymentRequest = {
  municipalityId: '456',
  serviceType: 'waste_management',
  amount: 100.00,
  currency: 'USD',
  userDetails: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  }
};
```

### Validation Schemas

```typescript
import { PaymentRequestSchema, UserSchema } from '@municollect/shared';

// Validate payment request
const result = PaymentRequestSchema.safeParse(paymentData);
if (result.success) {
  // Data is valid
  console.log(result.data);
} else {
  // Handle validation errors
  console.error(result.error.issues);
}
```

### Constants

```typescript
import { 
  SERVICE_TYPES, 
  PAYMENT_STATUSES, 
  API_ENDPOINTS,
  VALIDATION_LIMITS 
} from '@municollect/shared';

// Use constants instead of magic strings
const serviceType = SERVICE_TYPES.WASTE_MANAGEMENT;
const status = PAYMENT_STATUSES.PENDING;
const endpoint = API_ENDPOINTS.PAYMENTS_INITIATE;
```

## Package Structure

```
src/
├── types/           # Core type definitions
│   ├── index.ts     # Main entity types (User, Payment, etc.)
│   └── common.ts    # Utility types and common interfaces
├── interfaces/      # API contract interfaces
│   └── index.ts     # Request/response interfaces
├── validators/      # Zod validation schemas
│   └── index.ts     # Validation schemas for all types
├── constants.ts     # Application constants
└── index.ts         # Main export file
```

## Key Features

### Type Safety
- Comprehensive TypeScript types for all entities
- Strict typing prevents runtime errors
- Consistent data structures across frontend and backend

### Validation
- Zod schemas for runtime validation
- Input sanitization and error handling
- Custom validation functions for business logic

### Constants
- Centralized constants prevent magic strings
- API endpoints, error codes, and configuration values
- Validation limits and business rules

### API Contracts
- Request/response interfaces for all endpoints
- Consistent error handling structures
- Pagination and filtering interfaces

## Development

### Building

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

### Watch Mode

```bash
npm run dev
```

## Integration with Go Backend

The TypeScript types in this package should be manually synchronized with Go structs in the backend. Key considerations:

1. **Field Names**: Use `json` tags in Go structs to match TypeScript property names
2. **Date Handling**: Go `time.Time` maps to TypeScript `Date`
3. **Optional Fields**: Go pointers (`*string`) map to TypeScript optional properties (`string?`)
4. **Enums**: Go constants map to TypeScript union types

Example Go struct:

```go
type User struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    Email     string    `json:"email" gorm:"unique;not null"`
    FirstName string    `json:"firstName" gorm:"column:first_name"`
    LastName  string    `json:"lastName" gorm:"column:last_name"`
    Phone     *string   `json:"phone,omitempty"`
    Role      string    `json:"role" gorm:"default:resident"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}
```

## Contributing

When adding new types or interfaces:

1. Add the TypeScript definition to the appropriate file
2. Create corresponding Zod validation schema
3. Add any related constants
4. Update this README if needed
5. Ensure the Go backend structs are synchronized
6. Run `npm run build` to verify compilation