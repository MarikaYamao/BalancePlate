import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyStateRepository } from '@/lib/db/repositories/dailyStateRepository';
import { DailyState } from '@/types';
import { getDateKey } from '@/lib/utils/dateUtils';
import { useAppStore } from '@/lib/stores/useAppStore';

const repository = new DailyStateRepository();

export function useDailyState(dateKey?: string) {
  const queryClient = useQueryClient();
  const setLastError = useAppStore((state) => state.setLastError);
  const targetDateKey = dateKey || getDateKey(new Date(), '04:00');
  
  const query = useQuery({
    queryKey: ['dailyState', targetDateKey],
    queryFn: async () => {
      try {
        const state = await repository.get(targetDateKey);
        return state;
      } catch (error) {
        console.error('Failed to fetch daily state:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });

  const updateMutation = useMutation({
    mutationFn: async (state: DailyState) => {
      return await repository.upsert({
        dateKey: state.dateKey,
        conditionTags: state.conditionTags,
        freeMemo: state.freeMemo,
        activityMemo: state.activityMemo
      });
    },
    onMutate: async (newState) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: ['dailyState', targetDateKey] });
      const previousState = queryClient.getQueryData(['dailyState', targetDateKey]);
      queryClient.setQueryData(['dailyState', targetDateKey], newState);
      return { previousState };
    },
    onError: (err, newState, context) => {
      // エラー時はロールバック
      if (context?.previousState) {
        queryClient.setQueryData(['dailyState', targetDateKey], context.previousState);
      }
      setLastError('コンディションの保存に失敗しました');
    },
    onSuccess: () => {
      // 成功時はホーム画面のサマリーも更新
      queryClient.invalidateQueries({ queryKey: ['todaySummary'] });
    },
  });

  return {
    dailyState: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateDailyState: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useDailyStateList(startDate: Date, endDate: Date) {
  const setLastError = useAppStore((state) => state.setLastError);
  
  return useQuery({
    queryKey: ['dailyStateList', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      try {
        const startKey = getDateKey(startDate, '04:00');
        const endKey = getDateKey(endDate, '04:00');
        const states = await repository.getByDateRange(startKey, endKey);
        return states;
      } catch (error) {
        setLastError('履歴の読み込みに失敗しました');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}