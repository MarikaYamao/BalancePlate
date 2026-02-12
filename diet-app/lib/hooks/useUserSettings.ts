import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserSettingsRepository } from '@/lib/db/repositories/userSettingsRepository';
import { UserSettings } from '@/types';
import { useAppStore } from '@/lib/stores/useAppStore';

const repository = new UserSettingsRepository();

export function useUserSettings() {
  const queryClient = useQueryClient();
  const setLastError = useAppStore((state) => state.setLastError);
  
  const query = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      try {
        const settings = await repository.get();
        return settings;
      } catch (error) {
        setLastError('設定の読み込みに失敗しました');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10分間キャッシュ
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: UserSettings) => {
      return await repository.save(settings);
    },
    onMutate: async (newSettings) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: ['userSettings'] });
      const previousSettings = queryClient.getQueryData(['userSettings']);
      queryClient.setQueryData(['userSettings'], newSettings);
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      // エラー時はロールバック
      if (context?.previousSettings) {
        queryClient.setQueryData(['userSettings'], context.previousSettings);
      }
      setLastError('設定の保存に失敗しました');
    },
    onSuccess: () => {
      // 成功時は関連するクエリを無効化
      queryClient.invalidateQueries({ queryKey: ['dailyState'] });
      queryClient.invalidateQueries({ queryKey: ['mealLogs'] });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}