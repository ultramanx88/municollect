# Design Document: MuniCollect Monorepo Migration

## Overview

This design document outlines the architecture and implementation strategy for migrating the existing MuniCollect Next.js application to a modern monorepo architecture. The migration transforms the current single-stack application into a full-stack solution with clear separation of concerns, improved scalability, and enhanced maintainability.

The new architecture will consist of:
- **Backend**: Go + Fiber + GORM + PostgreSQL
- **Frontend**: Next.js with enhanced UI/UX
- **Shared**: TypeScript types and interfaces
- **Infrastructure**: Docker containerization and deployment automation

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Monorepo Structure"
        subgraph "apps/"
            FE[Frontend - Next.js]
            BE[Backend - Go + Fiber]
        end
        
        subgraph "packages/"
            SHARED[Shared Types - TypeScript]
        end
    end
    
    subgraph "External Services"
        DB[(PostgreSQL Database)]
        FIREBASE[Firebase - Notifications]
        RENDER[Render.com - Deployment]
    end
    
    FE --> BE
    BE --> DB
    BE --> FIREBASE
    FE --> SHARED
    BE --> SHARED
    
    RENDER --> FE
    RENDER --> BE
```

### Technology Stack Rationale

**Go + Fiber Backend**:
- **Performance**: Go's compiled nature and Fiber's Express-like API provide excellent performance for payment processing
- **Concurrency**: Go's goroutines handle multiple payment requests efficiently
- **Type Safety**: Strong typing prevents runtime errors in financial transactions
- **Ecosystem**: Rich ecosystem for database operations (GORM) and HTTP handling

**Next.js Frontend**:
- **Existing Codebase**: Preserves current investment in Next.js knowledge and components
- **PWA Support**: Maintains mobile-first approach with offline capabilities
- **Performance**: Built-in optimizations for municipal service delivery
- **Developer Experience**: Hot reload and modern development workflow

**PostgreSQL Database**:
- **ACID Compliance**: Critical for financial transaction integrity
- **Scalability**: Handles growing municipal user base
- **JSON Support**: Flexible schema for varying municipal requirements
- **Performance**: Excellent indexing and query optimization

**Turborepo Monorepo**:
- **Build Optimization**: Intelligent caching and parallel builds
- **Code Sharing**: Shared types prevent API contract mismatches
- **Developer Experience**: Unified development workflow across packages

## Components and Interfaces

### Monorepo Structure

```
municollect-monorepo/
├── apps/
│   ├── backend/                 # Go + Fiber API Server
│   │   ├── cmd/
│   │   │   └── server/         # Application entry point
│   │   ├── internal/
│   │   │   ├── handlers/       # HTTP request handlers
│   │   │   ├── models/         # GORM models
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Authentication, CORS, etc.
│   │   │   └── config/         # Configuration management
│   │   ├── migrations/         # Database migrations
│   │   └── Dockerfile
│   │
│   └── frontend/               # Next.js Application
│       ├── src/
│       │   ├── app/           # App Router pages
│       │   ├── components/    # React components
│       │   ├── hooks/         # Custom React hooks
│       │   ├── lib/          # Utilities and API clients
│       │   └── types/        # Frontend-specific types
│       ├── public/           # Static assets
│       └── Dockerfile
│
├── packages/
│   └── shared/                # Shared TypeScript Types
│       ├── src/
│       │   ├── types/        # Core type definitions
│       │   ├── interfaces/   # API contracts
│       │   └── validators/   # Shared validation logic
│       └── package.json
│
├── turbo.json                 # Turborepo configuration
├── docker-compose.yml         # Local development environment
└── package.json              # Root package configuration
```

### API Design

**RESTful API Endpoints**:

```typescript
// Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
DELETE /api/auth/logout

// User Management
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/municipalities

// Municipality Management
GET    /api/municipalities
GET    /api/municipalities/:id
POST   /api/municipalities (admin only)
PUT    /api/municipalities/:id (admin only)

// Payment Services
GET    /api/payments/services
POST   /api/payments/initiate
GET    /api/payments/history
GET    /api/payments/:id/status

// QR Code Generation
POST   /api/qr/generate
GET    /api/qr/:code/details

// Notifications
POST   /api/notifications/send
GET    /api/notifications/history
PUT    /api/notifications/:id/read
```

**Type-Safe API Contracts**:

```typescript
// packages/shared/src/interfaces/payment.ts
export interface PaymentRequest {
  municipalityId: string;
  serviceType: 'waste_management' | 'water_bill';
  amount: number;
  currency: string;
  userDetails: UserDetails;
  dueDate?: Date;
}

export interface PaymentResponse {
  id: string;
  qrCode: string;
  status: PaymentStatus;
  expiresAt: Date;
  paymentUrl: string;
}
```

### Frontend Architecture

**Component Structure**:
- **Pages**: App Router pages for different user flows
- **Components**: Reusable UI components with Tailwind CSS
- **Hooks**: Custom hooks for API integration and state management
- **Services**: API client with type-safe request/response handling
- **Context**: Global state management for authentication and user preferences

**PWA Enhancements**:
- Service worker for offline functionality
- App manifest for mobile installation
- Splash screen for native app experience
- Push notification support via Firebase

### Backend Architecture

**Layered Architecture**:

```go
// internal/handlers/payment.go - HTTP Layer
func (h *PaymentHandler) CreatePayment(c *fiber.Ctx) error {
    var req shared.PaymentRequest
    if err := c.BodyParser(&req); err != nil {
        return fiber.NewError(400, "Invalid request")
    }
    
    payment, err := h.paymentService.CreatePayment(req)
    if err != nil {
        return err
    }
    
    return c.JSON(payment)
}

// internal/services/payment.go - Business Logic Layer
func (s *PaymentService) CreatePayment(req PaymentRequest) (*Payment, error) {
    // Validate municipality
    // Generate QR code
    // Create payment record
    // Send notification
}

// internal/models/payment.go - Data Layer
type Payment struct {
    ID            string    `gorm:"primaryKey"`
    MunicipalityID string   `gorm:"not null"`
    UserID        string    `gorm:"not null"`
    Amount        float64   `gorm:"not null"`
    Status        string    `gorm:"not null"`
    CreatedAt     time.Time
    UpdatedAt     time.Time
}
```

## Data Models

### Database Schema

**Core Entities**:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'resident',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Municipalities table
CREATE TABLE municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    payment_config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    user_id UUID REFERENCES users(id),
    service_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    qr_code VARCHAR(255) UNIQUE,
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment history for audit trail
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id),
    status VARCHAR(20) NOT NULL,
    transaction_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Indexing Strategy**:
- Primary keys on all tables for fast lookups
- Composite index on (user_id, municipality_id) for user payment history
- Index on qr_code for quick QR code validation
- Index on (municipality_id, service_type) for service filtering
- Partial index on status for active payments

### Type Synchronization

**Shared Type Definitions**:

```typescript
// packages/shared/src/types/user.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'resident' | 'municipal_staff' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Corresponding Go struct
type User struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    Email     string    `json:"email" gorm:"unique;not null"`
    FirstName string    `json:"firstName" gorm:"column:first_name;not null"`
    LastName  string    `json:"lastName" gorm:"column:last_name;not null"`
    Phone     *string   `json:"phone,omitempty"`
    Role      string    `json:"role" gorm:"default:resident"`
    CreatedAt time.Time `json:"createdAt" gorm:"column:created_at"`
    UpdatedAt time.Time `json:"updatedAt" gorm:"column:updated_at"`
}
```

## Error Handling

### Frontend Error Handling

**API Error Management**:
- Centralized error handling in API client
- User-friendly error messages for common scenarios
- Retry logic for network failures
- Offline state management with queue for failed requests

```typescript
// lib/api-client.ts
class ApiClient {
  async request<T>(endpoint: string, options: RequestOptions): Promise<T> {
    try {
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new NetworkError('Connection failed');
    }
  }
}
```

### Backend Error Handling

**Structured Error Responses**:

```go
// internal/middleware/error.go
func ErrorHandler(c *fiber.Ctx, err error) error {
    code := fiber.StatusInternalServerError
    message := "Internal Server Error"
    
    switch e := err.(type) {
    case *ValidationError:
        code = fiber.StatusBadRequest
        message = e.Message
    case *NotFoundError:
        code = fiber.StatusNotFound
        message = e.Message
    case *AuthenticationError:
        code = fiber.StatusUnauthorized
        message = "Authentication required"
    }
    
    return c.Status(code).JSON(fiber.Map{
        "error": message,
        "code": code,
        "timestamp": time.Now().Unix(),
    })
}
```

**Database Error Handling**:
- Connection pool management with retry logic
- Transaction rollback for payment operations
- Graceful degradation for non-critical features
- Comprehensive logging for debugging

## Testing Strategy

### Frontend Testing

**Testing Pyramid**:
1. **Unit Tests**: Component logic and utility functions
2. **Integration Tests**: API integration and user flows
3. **E2E Tests**: Critical payment workflows

```typescript
// __tests__/components/PaymentForm.test.tsx
describe('PaymentForm', () => {
  it('validates required fields', async () => {
    render(<PaymentForm />);
    
    fireEvent.click(screen.getByText('Submit Payment'));
    
    expect(screen.getByText('Amount is required')).toBeInTheDocument();
  });
  
  it('generates QR code on successful submission', async () => {
    const mockCreatePayment = jest.fn().mockResolvedValue({
      qrCode: 'mock-qr-code'
    });
    
    render(<PaymentForm onSubmit={mockCreatePayment} />);
    
    // Fill form and submit
    // Assert QR code is displayed
  });
});
```

### Backend Testing

**Go Testing Strategy**:

```go
// internal/services/payment_test.go
func TestPaymentService_CreatePayment(t *testing.T) {
    db := setupTestDB(t)
    service := NewPaymentService(db)
    
    t.Run("creates payment successfully", func(t *testing.T) {
        req := PaymentRequest{
            MunicipalityID: "test-municipality",
            Amount:         100.00,
            ServiceType:    "waste_management",
        }
        
        payment, err := service.CreatePayment(req)
        
        assert.NoError(t, err)
        assert.NotEmpty(t, payment.QRCode)
        assert.Equal(t, "pending", payment.Status)
    })
    
    t.Run("validates municipality exists", func(t *testing.T) {
        req := PaymentRequest{
            MunicipalityID: "non-existent",
            Amount:         100.00,
        }
        
        _, err := service.CreatePayment(req)
        
        assert.Error(t, err)
        assert.Contains(t, err.Error(), "municipality not found")
    })
}
```

### Database Testing

**Migration Testing**:
- Automated migration tests in CI/CD
- Data integrity validation after migrations
- Rollback testing for safe deployments
- Performance testing with realistic data volumes

### Integration Testing

**API Contract Testing**:
- OpenAPI specification validation
- Type safety verification between frontend and backend
- End-to-end payment flow testing
- Firebase notification integration testing

## Deployment Architecture

### Containerization Strategy

**Multi-stage Docker Builds**:

```dockerfile
# apps/backend/Dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
CMD ["./server"]
```

```dockerfile
# apps/frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
RUN npm ci --only=production
CMD ["npm", "start"]
```

### Environment Configuration

**Development Environment**:
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: municollect_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./apps/backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://dev:dev_password@postgres:5432/municollect_dev
      FIREBASE_CONFIG: ${FIREBASE_CONFIG}
    depends_on:
      - postgres

  frontend:
    build: ./apps/frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
    depends_on:
      - backend
```

### Production Deployment

**Render.com Integration**:
- Git-based deployment with automatic builds
- Environment variable management
- Health checks and monitoring
- Horizontal scaling capabilities

**VPS Deployment Option**:
- Docker Compose production configuration
- Nginx reverse proxy setup
- SSL certificate automation with Let's Encrypt
- Backup and monitoring solutions

This design provides a robust foundation for the monorepo migration while maintaining all existing functionality and improving the overall architecture for future scalability and maintainability.