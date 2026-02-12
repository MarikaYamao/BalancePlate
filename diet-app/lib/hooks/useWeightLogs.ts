import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WeightLogRepository } from '@/lib/db/repositories/weightLogRepository';
import { WeightLog } from '@/types';
import { useAppStore } from '@/lib/stores/useAppStore';
import { getDateKey } from '@/lib/utils/dateUtils';

const repository = new WeightLogRepository();

export function useWeightLogs(days: number = 30) {
  const queryClient = useQueryClient();
  const setLastError = useAppStore((state) => state.setLastError);
  
  const query = useQuery({
    queryKey: ['weightLogs', days],
    queryFn: async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startKey = getDateKey(startDate, '04:00');
        const endKey = getDateKey(endDate, '04:00');
        const logs = await repository.getByDateRange(startKey, endKey);
        return logs;
      } catch (error) {
        console.error('Failed to fetch weight logs:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10分間キャッシュ
  });

  const createMutation = useMutation({
    mutationFn: async (log: Omit<WeightLog, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await repository.save({
        weight: log.weight,
        note: log.note,
        measurementTiming: log.measurementTiming
      });
    },
    onMutate: async (newLog) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: ['weightLogs'] });
      const previousLogs = queryClient.getQueryData<WeightLog[]>(['weightLogs', days]) || [];
      
      const optimisticLog: WeightLog = {
        ...newLog,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedLogs = [...previousLogs, optimisticLog].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      queryClient.setQueryData(['weightLogs', days], updatedLogs);
      return { previousLogs };
    },
    onError: (err, newLog, context) => {
      // エラー時はロールバック
      if (context?.previousLogs) {
        queryClient.setQueryData(['weightLogs', days], context.previousLogs);
      }
      setLastError('体重記録の保存に失敗しました');
    },
    onSuccess: () => {
      // 成功時は体重データを再取得
      queryClient.invalidateQueries({ queryKey: ['weightLogs'] });
      queryClient.invalidateQueries({ queryKey: ['todaySummary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await repository.delete(id);
    },
    onMutate: async (id) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: ['weightLogs'] });
      const previousLogs = queryClient.getQueryData<WeightLog[]>(['weightLogs', days]) || [];
      
      const filteredLogs = previousLogs.filter(log => log.id !== id);
      queryClient.setQueryData(['weightLogs', days], filteredLogs);
      return { previousLogs };
    },
    onError: (err, id, context) => {
      // エラー時はロールバック
      if (context?.previousLogs) {
        queryClient.setQueryData(['weightLogs', days], context.previousLogs);
      }
      setLastError('体重記録の削除に失敗しました');
    },
  });

  return {
    weightLogs: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createWeightLog: createMutation.mutate,
    deleteWeightLog: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useLatestWeight() {
  const setLastError = useAppStore((state) => state.setLastError);
  
  return useQuery({
    queryKey: ['latestWeight'],
    queryFn: async () => {
      try {
        const todayKey = getDateKey(new Date(), '04:00');
        const weight = await repository.getLatestByDate(todayKey);
        return weight;
      } catch (error) {
        console.error('Failed to fetch latest weight:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}