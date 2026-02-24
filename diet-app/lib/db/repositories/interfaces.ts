/**
 * Repository interface definitions for type-safe database operations
 */

// Base repository interface
export interface Repository<T, TInput = Partial<T>> {
  save(input: TInput): Promise<T>;
  findById(id: string): Promise<T | undefined>;
  findAll(): Promise<T[]>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
}

// Extended repository interface for entities with date keys
export interface DateKeyRepository<T, TInput = Partial<T>> extends Repository<T, TInput> {
  findByDateKey(dateKey: string): Promise<T[]>;
  findByDateRange(startDate: string, endDate: string): Promise<T[]>;
  deleteByDateKey(dateKey: string): Promise<void>;
}

// Repository interface for encrypted entities
export interface EncryptedRepository<T, TInput = Partial<T>> {
  save(input: TInput): Promise<T>;
  findById(id: string): Promise<T | undefined>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
}

// Query builder interface for complex queries
export interface QueryBuilder<T> {
  where(field: keyof T, operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'like', value: any): QueryBuilder<T>;
  orderBy(field: keyof T, direction?: 'asc' | 'desc'): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  execute(): Promise<T[]>;
  first(): Promise<T | undefined>;
  count(): Promise<number>;
}

// Advanced repository interface with query capabilities
export interface AdvancedRepository<T, TInput = Partial<T>> extends Repository<T, TInput> {
  query(): QueryBuilder<T>;
  findBy(criteria: Partial<T>): Promise<T[]>;
  findOneBy(criteria: Partial<T>): Promise<T | undefined>;
  exists(id: string): Promise<boolean>;
  count(criteria?: Partial<T>): Promise<number>;
}

// Batch operations interface
export interface BatchRepository<T, TInput = Partial<T>> {
  saveMany(inputs: TInput[]): Promise<T[]>;
  updateMany(updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]>;
  deleteMany(ids: string[]): Promise<void>;
}

// Repository with soft delete capabilities
export interface SoftDeleteRepository<T extends { deletedAt?: Date }> {
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  findAllIncludingDeleted(): Promise<T[]>;
  findDeleted(): Promise<T[]>;
  permanentDelete(id: string): Promise<void>;
}

// Validation interface for repositories
export interface ValidatedRepository {
  validateRequired<T>(data: T, fields: (keyof T)[]): void;
  validateDateKey(dateKey: string): void;
  validateUuid(id: string): void;
}

// Error handling interface
export interface ErrorHandledRepository {
  handleError(operation: string, error: unknown): never;
}

// Composite interface for full-featured repositories
export interface FullRepository<T extends { id: string; deletedAt?: Date }, TInput = Partial<T>> 
  extends AdvancedRepository<T, TInput>, 
          BatchRepository<T, TInput>, 
          SoftDeleteRepository<T>,
          ValidatedRepository,
          ErrorHandledRepository {
}

// Specialized interfaces for specific entity types
export interface MealLogRepositoryInterface extends DateKeyRepository<import('@/types').MealLog, import('./mealLogRepository').MealLogInput> {
  findByMealType(mealType: import('@/types').MealType): Promise<import('@/types').MealLog[]>;
  findTodaysMeals(resetTime?: string): Promise<import('@/types').MealLog[]>;
  updateAnalysis(id: string, analysis: import('./mealLogRepository').MealAnalysis): Promise<import('@/types').MealLog>;
}

export interface WeightLogRepositoryInterface extends DateKeyRepository<import('@/types').WeightLog, import('@/types').WeightLog> {
  findLatest(): Promise<import('@/types').WeightLog | undefined>;
  findByTimingToday(timing: 'morning' | 'night' | 'other', resetTime?: string): Promise<import('@/types').WeightLog | undefined>;
  getWeightTrend(days: number): Promise<import('@/types').WeightLog[]>;
}

export interface UserSettingsRepositoryInterface extends EncryptedRepository<import('@/types').UserSettings, Partial<import('@/types').UserSettings>> {
  findFirst(): Promise<import('@/types').UserSettings | undefined>;
  updateProfile(profile: Partial<import('@/types').UserProfile>): Promise<import('@/types').UserSettings>;
}

export interface DailyStateRepositoryInterface extends EncryptedRepository<import('@/types').DailyState, Partial<import('@/types').DailyState>> {
  findByDateKey(dateKey: string): Promise<import('@/types').DailyState | undefined>;
  findRecent(days: number): Promise<import('@/types').DailyState[]>;
}

export interface FridgeItemRepositoryInterface extends Repository<import('@/types').FridgeItem, Partial<import('@/types').FridgeItem>> {
  findAvailable(): Promise<import('@/types').FridgeItem[]>;
  findByCategory(category: import('@/types').FridgeItemCategory): Promise<import('@/types').FridgeItem[]>;
  toggleAvailability(id: string): Promise<import('@/types').FridgeItem>;
}