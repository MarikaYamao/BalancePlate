// Common types and utilities

// Common scoring types
export type ConditionScore = 1 | 2 | 3 | 4 | 5;

// Common metadata interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Date key utility type
export type DateKey = string; // "2024-01-15" format

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}