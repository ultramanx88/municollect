# User Management Endpoints Test Guide

This document provides manual testing instructions for the user management endpoints.

## Prerequisites

1. Start the backend server: `go run ./cmd/server`
2. Ensure PostgreSQL is running and connected
3. Have a valid JWT token for authentication

## Test Cases

### 1. Get User Profile

```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "resident",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": 1640995200
}
```

### 2. Update User Profile

```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1987654321"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1987654321",
    "role": "resident",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  "timestamp": 1640995200
}
```

### 3. Get User Municipalities

```bash
curl -X GET http://localhost:8080/api/users/municipalities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "municipality-uuid",
      "name": "Test Municipality",
      "code": "TEST",
      "contactEmail": "contact@testmunicipality.gov",
      "contactPhone": "+1234567890",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "timestamp": 1640995200
}
```

### 4. Associate User with Municipality

```bash
curl -X POST http://localhost:8080/api/users/municipalities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "municipalityId": "municipality-uuid"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Municipality associated successfully",
  "timestamp": 1640995200
}
```

### 5. Remove Municipality Association

```bash
curl -X DELETE http://localhost:8080/api/users/municipalities/municipality-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Municipality association removed successfully",
  "timestamp": 1640995200
}
```

## Error Cases to Test

### 1. Unauthorized Access (No Token)

```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Content-Type: application/json"
```

**Expected Response:** 401 Unauthorized

### 2. Invalid Email Format

```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "invalid-email",
    "phone": "+1987654321"
  }'
```

**Expected Response:** 400 Bad Request with validation error

### 3. Email Already Taken

```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "existing@example.com",
    "phone": "+1987654321"
  }'
```

**Expected Response:** 409 Conflict

### 4. Municipality Not Found

```bash
curl -X POST http://localhost:8080/api/users/municipalities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "municipalityId": "non-existent-uuid"
  }'
```

**Expected Response:** 404 Not Found

## Authentication Setup

To get a JWT token for testing:

1. Register a new user:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890"
  }'
```

2. Login to get tokens:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Use the `accessToken` from the login response in the `Authorization: Bearer` header for subsequent requests.