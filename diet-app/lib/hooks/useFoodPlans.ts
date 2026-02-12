import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FoodPlanRepository } from '@/lib/db/repositories/foodPlanRepository';
import { FoodPlan } from '@/types';
import { getDateKey } from '@/lib/utils/dateUtils';
import { useAppStore } from '@/lib/stores/useAppStore';

const repository = new FoodPlanRepository();

export function useFoodPlans(dateKey?: string) {
  const queryClient = useQueryClient();
  const setLastError = useAppStore((state) => state.setLastError);
  const targetDateKey = dateKey || getDateKey(new Date(), '04:00');
  
  const query = useQuery({
    queryKey: ['foodPlans', targetDateKey],
    queryFn: async () => {
      try {
        const plans = await repository.getByDate(targetDateKey);
        return plans;
      } catch (error) {
        console.error('Failed to fetch food plans:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10分間キャッシュ
  });

  const savePlansMutation = useMutation({
    mutationFn: async (plans: FoodPlan[]) => {
      const planInputs = plans.map(plan => ({
        dateKey: plan.dateKey,
        planType: plan.planType,
        planName: plan.planName,
        description: plan.description,
        meals: plan.meals
      }));
      return await repository.saveMultiple(planInputs);
    },
    onMutate: async (newPlans) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: ['foodPlans', targetDateKey] });
      const previousPlans = queryClient.getQueryData(['foodPlans', targetDateKey]);
      queryClient.setQueryData(['foodPlans', targetDateKey], newPlans);
      return { previousPlans };
    },
    onError: (err, newPlans, context) => {
      // エラー時はロールバック
      if (context?.previousPlans) {
        queryClient.setQueryData(['foodPlans', targetDateKey], context.previousPlans);
      }
      setLastError('食事プランの保存に失敗しました');
    },
  });

  const selectPlanMutation = useMutation({
    mutationFn: async (planType: 'A' | 'B' | 'C') => {
      return await repository.selectPlan(targetDateKey, planType);
    },
    onMutate: async (planType) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: ['foodPlans', targetDateKey] });
      const previousPlans = queryClient.getQueryData<FoodPlan[]>(['foodPlans', targetDateKey]) || [];
      
      const updatedPlans = previousPlans.map(plan => ({
        ...plan,
        selected: plan.planType === planType,
        selectedAt: plan.planType === planType ? new Date() : plan.selectedAt
      }));
      
      queryClient.setQueryData(['foodPlans', targetDateKey], updatedPlans);
      return { previousPlans };
    },
    onError: (err, planType, context) => {
      // エラー時はロールバック
      if (context?.previousPlans) {
        queryClient.setQueryData(['foodPlans', targetDateKey], context.previousPlans);
      }
      setLastError('プランの選択に失敗しました');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaySummary'] });
    },
  });

  return {
    foodPlans: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    savePlans: savePlansMutation.mutate,
    selectPlan: selectPlanMutation.mutate,
    isSaving: savePlansMutation.isPending,
    isSelecting: selectPlanMutation.isPending,
  };
}

export function useSelectedPlan(dateKey?: string) {
  const targetDateKey = dateKey || getDateKey(new Date(), '04:00');
  
  return useQuery({
    queryKey: ['selectedPlan', targetDateKey],
    queryFn: async () => {
      try {
        const plan = await repository.getSelectedPlan(targetDateKey);
        return plan;
      } catch (error) {
        console.error('Failed to fetch selected plan:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}