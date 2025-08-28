// Common utility types used across the application

export type Timestamp = Date | string | number;

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  limit: number;
  offset: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: FilterParams;
  sort?: SortParams;
}

// Environment configuration types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export interface AppConfig {
  port: number;
  environment: 'development' | 'staging' | 'production';
  database: DatabaseConfig;
  firebase: FirebaseConfig;
  jwtSecret: string;
  corsOrigins: string[];
}

// HTTP response types
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: number;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: number;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;