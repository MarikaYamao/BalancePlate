// Generic CRUD hooks for type-safe database operations
export { useCRUD } from './useCRUD';
export { useDateKeyCRUD } from './useDateKeyCRUD';

// Re-export types for convenience
export type {
  CRUDHookReturn,
  CRUDConfig,
  CRUDRepository
} from './useCRUD';

export type {
  DateKeyCRUDHookReturn,
  DateKeyCRUDConfig,
  DateKeyCRUDRepository
} from './useDateKeyCRUD';