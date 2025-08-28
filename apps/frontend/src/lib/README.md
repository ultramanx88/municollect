# API Client and Service Layer

This directory contains the type-safe API client and service layer for the MuniCollect frontend application.

## Overview

The API client provides a robust, type-safe interface to the Go backend with features including:

- **Type Safety**: Full TypeScript integration with shared types from `@municollect/shared`
- **Authentication**: Automatic JWT token management and refresh
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Retry Logic**: Automatic retries for network failures and server errors
- **React Integration**: Custom hooks for easy React component integration

## Architecture

```
lib/
├── api-client.ts          # Core API client with authentication
├── error-handler.ts       # Global error handling utilities
├── services/              # Service layer for different domains
│   ├── auth.service.ts    # Authentication operations
│   ├── user.service.ts    # User management
│   ├── municipality.service.ts # Municipality operations
│   ├── payment.service.ts # Payment processing
│   ├── qr.service.ts      # QR code operations
│   ├── notification.service.ts # Notifications
│   └── index.ts           # Service exports
└── examples/              # Usage examples (can be removed)
```

## Quick Start

### Basic API Usage

```typescript
import { apiClient } from './lib/api-client';
import { authService, paymentService } from './lib/services';

// Direct API client usage
const user = await apiClient.get('/api/users/profile');

// Service layer usage (recommended)
const authResponse = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});
```

### React Hooks Usage

```typescript
import { useLogin, useUserProfile, usePaymentHistory } from './hooks';

function MyComponent() {
  const { execute: login, loading, error } = useLogin();
  const { data: profile } = useUserProfile({ enabled: true });
  const { data: payments } = usePaymentHistory();

  // Component logic here
}
```

## API Client Features

### Authentication

The API client automatically handles JWT tokens:

```typescript
// Tokens are automatically stored and attached to requests
await authService.login({ email, password });

// Automatic token refresh when expired
await apiClient.get('/api/protected-endpoint');

// Manual token management
apiClient.setTokens(accessToken, refreshToken, expiresAt);
apiClient.clearTokens();
```

### Error Handling

Comprehensive error handling with different error types:

```typescript
import { ApiError, NetworkError, ValidationError } from './lib/api-client';

try {
  await paymentService.initiatePayment(paymentData);
} catch (error) {
  if (error instanceof ApiError) {
    console.log('API Error:', error.status, error.code);
  } else if (error instanceof NetworkError) {
    console.log('Network Error:', error.message);
  }
}
```

### Retry Logic

Automatic retries for transient failures:

```typescript
// Configurable retry behavior
await apiClient.request('/api/endpoint', {
  retries: 3,
  retryDelay: 1000
});
```

## Services

### Authentication Service

```typescript
import { authService } from './lib/services';

// Register new user
await authService.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Login
await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Logout
await authService.logout();

// Check authentication status
const isAuth = authService.isAuthenticated();
```

### Payment Service

```typescript
import { paymentService } from './lib/services';

// Initiate payment
const payment = await paymentService.initiatePayment({
  municipalityId: 'municipality-id',
  serviceType: 'waste_management',
  amount: 50.00,
  currency: 'USD',
  userDetails: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  }
});

// Get payment history
const history = await paymentService.getPaymentHistory({
  limit: 20,
  offset: 0,
  status: 'completed'
});
```

### Municipality Service

```typescript
import { municipalityService } from './lib/services';

// Get all municipalities
const municipalities = await municipalityService.getMunicipalities();

// Get specific municipality
const municipality = await municipalityService.getMunicipalityById('id');
```

## React Hooks

### Authentication Hooks

```typescript
import { useLogin, useRegister, useLogout } from './hooks';

function LoginForm() {
  const { execute: login, loading, error } = useLogin();

  const handleSubmit = async (data) => {
    try {
      await login(data);
      // Handle success
    } catch (error) {
      // Error already handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div>{error}</div>}
    </form>
  );
}
```

### Data Fetching Hooks

```typescript
import { useUserProfile, usePaymentHistory } from './hooks';

function Dashboard() {
  // Automatic data fetching
  const { data: profile, loading, error } = useUserProfile({ enabled: true });
  
  // With refetch interval
  const { data: payments } = usePaymentHistory(
    { limit: 10 },
    { enabled: true, refetchInterval: 30000 }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome, {profile?.user.firstName}</h1>
      {/* Render payments */}
    </div>
  );
}
```

### Mutation Hooks

```typescript
import { useInitiatePayment, useUpdateProfile } from './hooks';

function PaymentForm() {
  const { execute: initiatePayment, loading, data } = useInitiatePayment();

  const handlePayment = async (paymentData) => {
    try {
      const result = await initiatePayment(paymentData);
      // Handle success - result contains payment details
    } catch (error) {
      // Error handled automatically
    }
  };

  return (
    <form onSubmit={handlePayment}>
      {/* Payment form */}
      {data && (
        <div>
          Payment initiated! QR Code: {data.qrCode}
        </div>
      )}
    </form>
  );
}
```

## Error Handling

### Global Error Handler

```typescript
import { errorHandler, handleError } from './lib/error-handler';

// Configure global error handling
errorHandler.configure({
  showToast: true,
  logError: true,
  redirectOnAuth: true
});

// Handle errors manually
try {
  await someApiCall();
} catch (error) {
  handleError(error, 'Payment processing');
}
```

### Error Boundary

```typescript
import { createErrorBoundary } from './lib/error-handler';

const ErrorBoundary = createErrorBoundary(({ error }) => (
  <div>Something went wrong: {error.message}</div>
));

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### API Client Configuration

```typescript
import { ApiClient } from './lib/api-client';

// Custom API client instance
const customClient = new ApiClient('https://api.example.com', customTokenManager);
```

## Type Safety

All services and hooks are fully typed using shared interfaces:

```typescript
import { 
  PaymentRequest, 
  PaymentResponse, 
  User, 
  Municipality 
} from '@municollect/shared';

// TypeScript will enforce correct types
const paymentData: PaymentRequest = {
  municipalityId: 'id',
  serviceType: 'waste_management', // Only valid service types allowed
  amount: 50.00,
  currency: 'USD', // Only valid currencies allowed
  userDetails: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  }
};
```

## Best Practices

1. **Use Service Layer**: Prefer services over direct API client usage
2. **Use React Hooks**: Use provided hooks for React components
3. **Handle Errors**: Always handle errors appropriately
4. **Type Safety**: Leverage TypeScript for type safety
5. **Error Boundaries**: Use error boundaries for React error handling
6. **Loading States**: Always show loading states for better UX

## Testing

```typescript
// Mock services for testing
jest.mock('./lib/services', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn()
  }
}));
```

## Migration from Firebase

When migrating existing Firebase code:

1. Replace Firebase Auth calls with `authService`
2. Replace Firestore queries with appropriate service calls
3. Update components to use new hooks
4. Update error handling to use new error system

```typescript
// Before (Firebase)
const user = await signInWithEmailAndPassword(auth, email, password);

// After (New API)
const authResponse = await authService.login({ email, password });
```