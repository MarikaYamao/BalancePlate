import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/stores/useAppStore';
import { getDateKey } from '@/lib/utils/dateUtils';

// Date-based entity interface
interface DateKeyEntity {
  id: string;
  dateKey: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Repository interface for date-based operations
export interface DateKeyCRUDRepository<T extends DateKeyEntity, TInput> {
  save(input: TInput): Promise<T>;
  findByDateKey(dateKey: string): Promise<T[]>;
  findByDateRange(startDate: string, endDate: string): Promise<T[]>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  deleteByDateKey(dateKey: string): Promise<void>;
}

// Date-based CRUD hook configuration
export interface DateKeyCRUDConfig<T extends DateKeyEntity> {
  baseQueryKey: string;
  defaultDateKey?: string;
  resetTime?: string;
  staleTime?: number;
  cacheTime?: number;
  enableOptimisticUpdates?: boolean;
}

// Date-based CRUD hook return type
export interface DateKeyCRUDHookReturn<T extends DateKeyEntity, TInput> {
  // Query
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  
  // Date-specific queries
  getByDateRange: (startDate: string, endDate: string) => Promise<T[]>;
  
  // Mutations
  create: (input: TInput) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  clearDate: (dateKey: string) => Promise<void>;
  
  // Current date key
  currentDateKey: string;
  
  // Mutation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useDateKeyCRUD<T extends DateKeyEntity, TInput = Partial<T>>(
  repository: DateKeyCRUDRepository<T, TInput>,
  config: DateKeyCRUDConfig<T>
): DateKeyCRUDHookReturn<T, TInput> {
  const queryClient = useQueryClient();
  const setLastError = useAppStore((state) => state.setLastError);
  
  const {
    baseQueryKey,
    defaultDateKey,
    resetTime = '04:00',
    staleTime = 1000 * 60 * 3, // 3分デフォルト（より短く）
    cacheTime = 1000 * 60 * 30,
    enableOptimisticUpdates = true
  } = config;

  const currentDateKey = defaultDateKey || getDateKey(new Date(), resetTime);
  const queryKey = [baseQueryKey, currentDateKey];

  // Query for fetching entities by date key
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await repository.findByDateKey(currentDateKey);
      } catch (error) {
        console.error(`Failed to fetch ${baseQueryKey} for ${currentDateKey}:`, error);
        setLastError(error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    staleTime,
    gcTime: cacheTime,
  });

  // Function to get data by date range
  const getByDateRange = async (startDate: string, endDate: string): Promise<T[]> => {
    try {
      return await repository.findByDateRange(startDate, endDate);
    } catch (error) {
      console.error(`Failed to fetch ${baseQueryKey} for range ${startDate}-${endDate}:`, error);
      setLastError(error instanceof Error ? error.message : 'Date range query failed');
      throw error;
    }
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (input: TInput) => {
      return await repository.save(input);
    },
    onMutate: async (newData) => {
      if (!enableOptimisticUpdates) return;

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T[]>(queryKey) || [];
      
      const optimisticEntity = {
        ...newData,
        id: `temp-${Date.now()}`,
        dateKey: currentDateKey,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as T;
      
      queryClient.setQueryData<T[]>(queryKey, [...previousData, optimisticEntity]);
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error('Create mutation failed:', error);
      setLastError(error instanceof Error ? error.message : 'Creation failed');
      
      if (context?.previousData && enableOptimisticUpdates) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [baseQueryKey] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<T> }) => {
      return await repository.update(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      if (!enableOptimisticUpdates) return;

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T[]>(queryKey) || [];
      
      const optimisticData = previousData.map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      );
      
      queryClient.setQueryData<T[]>(queryKey, optimisticData);
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error('Update mutation failed:', error);
      setLastError(error instanceof Error ? error.message : 'Update failed');
      
      if (context?.previousData && enableOptimisticUpdates) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [baseQueryKey] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await repository.delete(id);
    },
    onMutate: async (id) => {
      if (!enableOptimisticUpdates) return;

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T[]>(queryKey) || [];
      
      const optimisticData = previousData.filter(item => item.id !== id);
      queryClient.setQueryData<T[]>(queryKey, optimisticData);
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error('Delete mutation failed:', error);
      setLastError(error instanceof Error ? error.message : 'Deletion failed');
      
      if (context?.previousData && enableOptimisticUpdates) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [baseQueryKey] });
    },
  });

  // Clear date mutation (delete all entries for a specific date)
  const clearDateMutation = useMutation({
    mutationFn: async (dateKey: string) => {
      return await repository.deleteByDateKey(dateKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [baseQueryKey] });
    },
    onError: (error) => {
      console.error('Clear date mutation failed:', error);
      setLastError(error instanceof Error ? error.message : 'Clear date failed');
    },
  });

  return {
    // Query results
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    // Date-specific functions
    getByDateRange,
    currentDateKey,
    
    // Mutation functions
    create: createMutation.mutateAsync,
    update: (id: string, updates: Partial<T>) => updateMutation.mutateAsync({ id, updates }),
    remove: deleteMutation.mutateAsync,
    clearDate: clearDateMutation.mutateAsync,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}