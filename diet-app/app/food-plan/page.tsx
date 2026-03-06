'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FoodPlanGenerator } from '@/components/features/foodPlan/FoodPlanGenerator';
import { Card } from '@/components/ui/Card';
import { 
  userSettingsRepository, 
  dailyStateRepository, 
  foodPlanRepository,
  mealLogRepository 
} from '@/lib/db/repositories';
import { getDateKey } from '@/lib/utils/dateUtils';
import type { 
  UserSettings, 
  DailyState, 
  FoodPlan, 
  MealLog 
} from '@/types';
import type { AIPromptContext } from '@/lib/ai/prompts';

export default function FoodPlanPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dateKey, setDateKey] = useState('');
  const [context, setContext] = useState<AIPromptContext | null>(null);
  const [existingPlans, setExistingPlans] = useState<FoodPlan[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // 現在の日付キーを取得
      const settings = await userSettingsRepository.get();
      const resetTime = settings?.dayResetTime || '04:00';
      const currentDateKey = getDateKey(new Date(), resetTime);
      setDateKey(currentDateKey);

      // 必要なデータを並行取得
      const [
        userSettings,
        dailyState,
        plans,
        yesterdayMeals,
        todayMeals
      ] = await Promise.all([
        userSettingsRepository.get(),
        dailyStateRepository.get(currentDateKey),
        foodPlanRepository.getByDate(currentDateKey),
        getYesterdayMeals(currentDateKey, resetTime),
        mealLogRepository.getByDate(currentDateKey)
      ]);

      // ユーザー設定が存在しない場合
      if (!userSettings) {
        setError('設定が見つかりません。先に設定を完了してください。');
        return;
      }

      // AIプロンプト用のコンテキストを構築
      const aiContext: AIPromptContext = {
        userProfile: {
          bodyConstitution: userSettings.bodyConstitution || [],
          lifestyle: userSettings.lifestyle || [],
          mealsPerDay: userSettings.mealsPerDay,
          additionalNotes: userSettings.additionalNotes,
        },
        todayCondition: {
          conditionTags: dailyState?.conditionTags || [],
          freeMemo: dailyState?.freeMemo,
        },
        previousDayData: yesterdayMeals.length > 0 ? {
          meals: yesterdayMeals.map(meal => ({
            type: getMealTypeLabel(meal.mealType),
            content: meal.text
          }))
        } : undefined,
        todayMeals: todayMeals.map(meal => ({
          type: meal.mealType,
          content: meal.text
        })),
        requestType: 'morning_plan'
      };

      console.log('Food Plan Page - todayMeals raw:', todayMeals);
      console.log('Food Plan Page - aiContext.todayMeals:', aiContext.todayMeals);

      setContext(aiContext);
      setExistingPlans(plans);

    } catch (err) {
      console.error('Failed to load food plan data:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getYesterdayMeals = async (currentDateKey: string, resetTime: string): Promise<MealLog[]> => {
    try {
      // 前日の日付キーを計算
      const currentDate = new Date(currentDateKey + 'T' + resetTime);
      const yesterdayDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayKey = getDateKey(yesterdayDate, resetTime);
      
      return await mealLogRepository.getByDate(yesterdayKey);
    } catch (error) {
      console.error('Failed to get yesterday meals:', error);
      return [];
    }
  };

  const getMealTypeLabel = (mealType: string): string => {
    const labels = {
      breakfast: '朝食',
      lunch: '昼食',
      dinner: '夕食',
      snack: '間食',
    };
    return labels[mealType as keyof typeof labels] || mealType;
  };

  const handlePlanSelected = (plan: FoodPlan) => {
    console.log('Plan selected:', plan);
    // 選択されたプランで状態を更新
    setExistingPlans(prev => 
      prev.map(p => ({ 
        ...p, 
        selected: p.planType === plan.planType,
        selectedAt: p.planType === plan.planType ? new Date() : p.selectedAt
      }))
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">データを読み込み中...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen p-4">
          <Card className="border-red-200 bg-red-50">
            <h1 className="text-xl font-semibold text-red-800 mb-2">エラー</h1>
            <p className="text-red-700 mb-4">{error}</p>
            {error.includes('設定') && (
              <a
                href="/settings"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                設定画面へ
              </a>
            )}
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!context) {
    return (
      <MainLayout>
        <div className="min-h-screen p-4 flex items-center justify-center">
          <p className="text-gray-600">コンテキストの準備中...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen p-4 pb-24">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AI食事提案</h1>
        <p className="text-gray-600 mb-6">
          あなたの体質と今日のコンディションに合わせた食事プランを提案します
        </p>
        
        <FoodPlanGenerator
          dateKey={dateKey}
          context={context}
          onPlanSelected={handlePlanSelected}
          existingPlans={existingPlans}
        />
      </div>
    </MainLayout>
  );
}