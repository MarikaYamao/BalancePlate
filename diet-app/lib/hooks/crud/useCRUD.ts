import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useAppStore } from '@/lib/stores/useAppStore';

// Base entity interface
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Repository interface for CRUD operations
export interface CRUDRepository<T extends BaseEntity, TInput> {
  save(input: TInput): Promise<T>;
  findById(id: string): Promise<T | undefined>;
  findAll(): Promise<T[]>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// CRUD hook configuration
export interface CRUDConfig<T extends BaseEntity> {
  queryKey: string[];
  staleTime?: number;
  cacheTime?: number;
  enableOptimisticUpdates?: boolean;
}

// CRUD hook return type
export interface CRUDHookReturn<T extends BaseEntity, TInput> {
  // Query
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  
  // Mutations
  create: (input: TInput) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  
  // Mutation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useCRUD<T extends BaseEntity, TInput = Partial<T>>(
  repository: CRUDRepository<T, TInput>,
  config: CRUDConfig<T>
): CRUDHookReturn<T, TInput> {
  const queryClient = useQueryClient();
  const setLastError = useAppStore((state) => state.setLastError);
  
  const {
    queryKey,
    staleTime = 1000 * 60 * 5, // 5分デフォルト
    cacheTime = 1000 * 60 * 30, // 30分デフォルト
    enableOptimisticUpdates = true
  } = config;

  // Query for fetching all entities
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await repository.findAll();
      } catch (error) {
        console.error(`Failed to fetch ${queryKey.join('-')}:`, error);
        setLastError(error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    staleTime,
    gcTime: cacheTime,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (input: TInput) => {
      return await repository.save(input);
    },
    onMutate: async (newData) => {
      if (!enableOptimisticUpdates) return;

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T[]>(queryKey) || [];
      
      // Generate optimistic entity
      const optimisticEntity = {
        ...newData,
        id: `temp-${Date.now()}`,
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
      queryClient.invalidateQueries({ queryKey });
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
      queryClient.invalidateQueries({ queryKey });
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
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    // Query results
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    // Mutation functions
    create: createMutation.mutateAsync,
    update: (id: string, updates: Partial<T>) => updateMutation.mutateAsync({ id, updates }),
    remove: deleteMutation.mutateAsync,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}