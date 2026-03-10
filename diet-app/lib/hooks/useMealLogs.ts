import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MealLogRepository } from '@/lib/db/repositories/mealLogRepository';
import { MealLog, MealType } from '@/types';
import { getDateKey } from '@/lib/utils/dateUtils';
import { useAppStore } from '@/lib/stores/useAppStore';

const repository = new MealLogRepository();

export function useMealLogs(dateKey?: string) {
  const queryClient = useQueryClient();
  const setLastError = useAppStore((state) => state.setLastError);
  const targetDateKey = dateKey || getDateKey(new Date(), '04:00');
  
  const query = useQuery({
    queryKey: ['mealLogs', targetDateKey],
    queryFn: async () => {
      try {
        const logs = await repository.getByDate(targetDateKey);
        return logs;
      } catch (error) {
        console.error('Failed to fetch meal logs:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 3, // 3分間キャッシュ
  });

  const createMutation = useMutation({
    mutationFn: async (log: Omit<MealLog, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await repository.save({
        dateKey: log.dateKey,
        mealType: log.mealType,
        text: log.text,
        followedPlan: log.followedPlan,
        planId: log.planId
      });
    },
    onMutate: async (newLog) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: ['mealLogs', targetDateKey] });
      const previousLogs = queryClient.getQueryData<MealLog[]>(['mealLogs', targetDateKey]) || [];
      
      const optimisticLog: MealLog = {
        ...newLog,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      queryClient.setQueryData(['mealLogs', targetDateKey], [...previousLogs, optimisticLog]);
      return { previousLogs };
    },
    onError: (err, newLog, context) => {
      // エラー時はロールバック
      if (context?.previousLogs) {
        queryClient.setQueryData(['mealLogs', targetDateKey], context.previousLogs);
      }
      setLastError('食事記録の保存に失敗しました');
    },
    onSuccess: () => {
      // 成功時は該当日のデータを再取得
      queryClient.invalidateQueries({ queryKey: ['mealLogs', targetDateKey] });
      queryClient.invalidateQueries({ queryKey: ['todaySummary'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MealLog> }) => {
      return await repository.update(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: ['mealLogs', targetDateKey] });
      const previousLogs = queryClient.getQueryData<MealLog[]>(['mealLogs', targetDateKey]) || [];
      
      const updatedLogs = previousLogs.map(log => 
        log.id === id ? { ...log, ...updates, updatedAt: new Date() } : log
      );
      
      queryClient.setQueryData(['mealLogs', targetDateKey], updatedLogs);
      return { previousLogs };
    },
    onError: (err, variables, context) => {
      // エラー時はロールバック
      if (context?.previousLogs) {
        queryClient.setQueryData(['mealLogs', targetDateKey], context.previousLogs);
      }
      setLastError('食事記録の更新に失敗しました');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealLogs', targetDateKey] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await repository.delete(id);
    },
    onMutate: async (id) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: ['mealLogs', targetDateKey] });
      const previousLogs = queryClient.getQueryData<MealLog[]>(['mealLogs', targetDateKey]) || [];
      
      const filteredLogs = previousLogs.filter(log => log.id !== id);
      queryClient.setQueryData(['mealLogs', targetDateKey], filteredLogs);
      return { previousLogs };
    },
    onError: (err, id, context) => {
      // エラー時はロールバック
      if (context?.previousLogs) {
        queryClient.setQueryData(['mealLogs', targetDateKey], context.previousLogs);
      }
      setLastError('食事記録の削除に失敗しました');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealLogs', targetDateKey] });
      queryClient.invalidateQueries({ queryKey: ['todaySummary'] });
    },
  });

  return {
    mealLogs: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createMealLog: createMutation.mutate,
    updateMealLog: updateMutation.mutate,
    deleteMealLog: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useMealHistory(days: number = 7) {
  const setLastError = useAppStore((state) => state.setLastError);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return useQuery({
    queryKey: ['mealHistory', days],
    queryFn: async () => {
      try {
        const startKey = getDateKey(startDate, '04:00');
        const endKey = getDateKey(endDate, '04:00');
        const logs = await repository.getByDateRange(startKey, endKey);
        return logs;
      } catch (error) {
        setLastError('食事履歴の読み込みに失敗しました');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}