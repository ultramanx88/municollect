# MuniCollect Monorepo

This is a Turborepo-based monorepo for the MuniCollect municipal payment system.

## Structure

```
municollect-monorepo/
├── apps/
│   ├── backend/          # Go + Fiber API Server
│   └── frontend/         # Next.js Application
├── packages/
│   └── shared/           # Shared TypeScript Types
├── turbo.json           # Turborepo configuration
└── package.json         # Root package configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Go 1.21+
- PostgreSQL (for backend development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build shared packages:
```bash
npm run shared:build
```

### Development

Run all applications in development mode:
```bash
npm run dev
```

Run specific applications:
```bash
# Frontend only
npm run frontend:dev

# Backend only
npm run backend:dev
```

### Building

Build all applications:
```bash
npm run build
```

### Available Scripts

- `npm run build` - Build all packages and applications
- `npm run dev` - Start all applications in development mode
- `npm run lint` - Run linting across all packages
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests across all packages
- `npm run clean` - Clean build artifacts

## Packages

### @municollect/shared

Contains shared TypeScript types, interfaces, and validation schemas used by both frontend and backend applications.

### frontend

Next.js application with PWA capabilities for municipal payment processing.

### backend

Go + Fiber API server with PostgreSQL database integration.

## Turborepo Features

This monorepo uses Turborepo for:
- **Parallel execution**: Run tasks across multiple packages simultaneously
- **Smart caching**: Cache build outputs and skip unnecessary rebuilds
- **Dependency management**: Automatically handle package dependencies
- **Pipeline optimization**: Optimize task execution order

## Workspace Dependencies

The monorepo uses npm workspaces to manage dependencies:
- Shared dependencies are hoisted to the root
- Package-specific dependencies remain in their respective packages
- Internal packages reference each other using `workspace:*` protocol