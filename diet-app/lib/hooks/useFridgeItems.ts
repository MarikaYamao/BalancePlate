import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fridgeItemRepository } from '@/lib/db/repositories';
import type { FridgeItem, FridgeItemCategory } from '@/types';

// React Query のキー定数
const FRIDGE_ITEMS_KEYS = {
  all: ['fridgeItems'] as const,
  lists: () => [...FRIDGE_ITEMS_KEYS.all, 'list'] as const,
  list: (filters?: string) => [...FRIDGE_ITEMS_KEYS.lists(), { filters }] as const,
  details: () => [...FRIDGE_ITEMS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FRIDGE_ITEMS_KEYS.details(), id] as const,
  expiringSoon: (days: number) => [...FRIDGE_ITEMS_KEYS.all, 'expiringSoon', days] as const,
  byCategory: (category: FridgeItemCategory) => [...FRIDGE_ITEMS_KEYS.all, 'byCategory', category] as const,
  counts: () => [...FRIDGE_ITEMS_KEYS.all, 'counts'] as const,
  search: (query: string) => [...FRIDGE_ITEMS_KEYS.all, 'search', query] as const,
};

/**
 * 全冷蔵庫アイテムを取得するフック
 */
export function useFridgeItems() {
  return useQuery({
    queryKey: FRIDGE_ITEMS_KEYS.lists(),
    queryFn: () => fridgeItemRepository.getFridgeItems(),
    staleTime: 5 * 60 * 1000, // 5分
  });
}

/**
 * カテゴリ別冷蔵庫アイテムを取得するフック
 */
export function useFridgeItemsByCategory(category: FridgeItemCategory) {
  return useQuery({
    queryKey: FRIDGE_ITEMS_KEYS.byCategory(category),
    queryFn: () => fridgeItemRepository.getFridgeItemsByCategory(category),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 手持ちありのアイテムを取得するフック
 */
export function useAvailableFridgeItems() {
  return useQuery({
    queryKey: [...FRIDGE_ITEMS_KEYS.all, 'available'],
    queryFn: () => fridgeItemRepository.getAvailableFridgeItems(),
    staleTime: 5 * 60 * 1000, // 5分
  });
}

/**
 * 特定のアイテムを取得するフック
 */
export function useFridgeItem(id: string) {
  return useQuery({
    queryKey: FRIDGE_ITEMS_KEYS.detail(id),
    queryFn: () => fridgeItemRepository.getFridgeItemById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * カテゴリ別アイテム数を取得するフック
 */
export function useFridgeItemCounts() {
  return useQuery({
    queryKey: FRIDGE_ITEMS_KEYS.counts(),
    queryFn: () => fridgeItemRepository.getFridgeItemCountByCategory(),
    staleTime: 10 * 60 * 1000, // 10分
  });
}

/**
 * アイテム名で検索するフック
 */
export function useSearchFridgeItems(query: string) {
  return useQuery({
    queryKey: FRIDGE_ITEMS_KEYS.search(query),
    queryFn: () => fridgeItemRepository.searchFridgeItemsByName(query),
    enabled: query.trim().length >= 2, // 2文字以上で検索
    staleTime: 2 * 60 * 1000, // 2分
  });
}

/**
 * 冷蔵庫アイテムを作成するフック
 */
export function useCreateFridgeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      category,
      ...options
    }: {
      name: string;
      category: FridgeItemCategory;
    } & Partial<Omit<FridgeItem, 'id' | 'name' | 'category' | 'createdAt' | 'updatedAt'>>) => {
      return await fridgeItemRepository.createFridgeItem(name, category, options);
    },
    onSuccess: (newItem) => {
      // 全リストを無効化
      queryClient.invalidateQueries({ queryKey: FRIDGE_ITEMS_KEYS.all });
      
      // 新しいアイテムをキャッシュに追加
      queryClient.setQueryData(FRIDGE_ITEMS_KEYS.detail(newItem.id), newItem);
    },
    onError: (error) => {
      console.error('Failed to create fridge item:', error);
    },
  });
}

/**
 * 冷蔵庫アイテムを更新するフック
 */
export function useUpdateFridgeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
    } & Partial<Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>>) => {
      return await fridgeItemRepository.updateFridgeItem(id, updates);
    },
    onSuccess: (updatedItem, variables) => {
      if (updatedItem) {
        // 詳細キャッシュを更新
        queryClient.setQueryData(FRIDGE_ITEMS_KEYS.detail(variables.id), updatedItem);
        
        // 関連するクエリを無効化
        queryClient.invalidateQueries({ queryKey: FRIDGE_ITEMS_KEYS.lists() });
        queryClient.invalidateQueries({ queryKey: FRIDGE_ITEMS_KEYS.byCategory(updatedItem.category) });
        queryClient.invalidateQueries({ queryKey: FRIDGE_ITEMS_KEYS.counts() });
      }
    },
    onError: (error) => {
      console.error('Failed to update fridge item:', error);
    },
  });
}

/**
 * 冷蔵庫アイテムを削除するフック
 */
export function useDeleteFridgeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await fridgeItemRepository.deleteFridgeItem(id);
    },
    onSuccess: (success, id) => {
      if (success) {
        // 詳細キャッシュから削除
        queryClient.removeQueries({ queryKey: FRIDGE_ITEMS_KEYS.detail(id) });
        
        // 関連するクエリを無効化
        queryClient.invalidateQueries({ queryKey: FRIDGE_ITEMS_KEYS.all });
      }
    },
    onError: (error) => {
      console.error('Failed to delete fridge item:', error);
    },
  });
}

/**
 * 冷蔵庫アイテムを物理削除するフック（管理用）
 */
export function usePermanentlyDeleteFridgeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await fridgeItemRepository.permanentlyDeleteFridgeItem(id);
    },
    onSuccess: (success, id) => {
      if (success) {
        // 詳細キャッシュから削除
        queryClient.removeQueries({ queryKey: FRIDGE_ITEMS_KEYS.detail(id) });
        
        // 全てのクエリを無効化
        queryClient.invalidateQueries({ queryKey: FRIDGE_ITEMS_KEYS.all });
      }
    },
    onError: (error) => {
      console.error('Failed to permanently delete fridge item:', error);
    },
  });
}

/**
 * 全データクリア（テスト用）
 */
export function useClearFridgeItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fridgeItemRepository.clearAllFridgeItems(),
    onSuccess: () => {
      // 全てのキャッシュをクリア
      queryClient.invalidateQueries({ queryKey: FRIDGE_ITEMS_KEYS.all });
    },
  });
}