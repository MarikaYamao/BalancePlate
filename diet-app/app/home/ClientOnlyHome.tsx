'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { DateDisplay } from '@/components/features/home/DateDisplay';
import { QuickActions } from '@/components/features/home/QuickActions';
import { TodaysSummary } from '@/components/features/home/TodaysSummary';
import { BulkMealInput } from '@/components/features/meal/BulkMealInput';
import { MealSuggestions } from '@/components/features/home/MealSuggestions';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { mealLogRepository } from '@/lib/db/repositories';
import { initializeEncryptedDatabase } from '@/lib/db/encryptedDatabase';
import { detectMissedMeals, shouldShowBulkInput } from '@/lib/utils/mealUtils';
import { useMealSuggestions } from '@/lib/hooks/useAIConsultations';
import type { MealType, MealLog } from '@/types';

export default function ClientOnlyHome() {
  const { settings, isLoading, error } = useUserSettings();
  const resetTime = settings?.dayResetTime || '04:00';
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [missedMeals, setMissedMeals] = useState<MealType[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [unrecordedMealTypes, setUnrecordedMealTypes] = useState<string[]>([]);
  
  // AI提案のフック
  const { suggestions } = useMealSuggestions(unrecordedMealTypes, resetTime);

  useEffect(() => {
    if (settings) {
      loadMealData();
    }
  }, [settings, resetTime]);

  const loadMealData = async () => {
    setIsLoadingMeals(true);
    try {
      await initializeEncryptedDatabase();
      const todayMeals = await mealLogRepository.getToday(resetTime);
      setMealLogs(todayMeals);
      
      const currentTime = new Date();
      const recordedTypes = todayMeals.map(meal => meal.mealType);
      const missed = detectMissedMeals(currentTime, resetTime, recordedTypes);
      setMissedMeals(missed);
      
      // すべてのメインの食事タイプから未記録のものを取得
      const allMealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];
      const unrecorded = allMealTypes.filter(type => !recordedTypes.includes(type));
      setUnrecordedMealTypes(unrecorded);
      
      // 2つ以上の食事が未記録の場合にバルク入力を表示
      setShowBulkInput(shouldShowBulkInput(currentTime, resetTime, recordedTypes, 2));
    } catch (error) {
      console.error('Failed to load meal data:', error);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  const handleBulkMealSubmit = async (meals: Record<MealType, string>) => {
    try {
      const promises = Object.entries(meals)
        .filter(([_, content]) => content.trim())
        .map(([mealType, content]) => 
          mealLogRepository.save({
            mealType: mealType as MealType,
            text: content
          }, resetTime)
        );
      
      await Promise.all(promises);
      await loadMealData(); // リロードしてUI更新
      setShowBulkInput(false);
    } catch (error) {
      console.error('Failed to save bulk meals:', error);
    }
  };

  const handleBulkInputCancel = () => {
    setShowBulkInput(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" message="読み込み中..." />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen p-4">
          <ErrorMessage 
            message="データの読み込みに失敗しました" 
            onRetry={() => window.location.reload()}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* ヘッダー部分 */}
        <header className="bg-gradient-to-b from-pink-100 to-pink-50 pb-4">
          <DateDisplay resetTime={resetTime} />
        </header>

        {/* メインコンテンツ */}
        <main className="pb-6">
          {/* 今日のサマリー */}
          <section className="mb-6">
            <TodaysSummary resetTime={resetTime} />
          </section>

          {/* 複数食事の一括入力 */}
          {showBulkInput && !isLoadingMeals && (
            <section className="mb-6">
              <BulkMealInput
                missedMeals={missedMeals}
                onSubmit={handleBulkMealSubmit}
                onCancel={handleBulkInputCancel}
              />
            </section>
          )}

          {/* AI食事提案 */}
          {!showBulkInput && suggestions && unrecordedMealTypes.length > 0 && (
            <section className="mb-6">
              <MealSuggestions
                suggestions={suggestions}
                unrecordedMeals={unrecordedMealTypes as MealType[]}
                resetTime={resetTime}
              />
            </section>
          )}

          {/* クイックアクション */}
          <section>
            <QuickActions />
          </section>
        </main>
      </div>
    </MainLayout>
  );
}