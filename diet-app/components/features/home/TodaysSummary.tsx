'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { getTodayKey } from '@/lib/utils/dateUtils';
import { EncryptedDailyStateRepository } from '@/lib/db/repositories/encryptedDailyStateRepository';
import { mealLogRepository } from '@/lib/db/repositories';
import { initializeEncryptedDatabase } from '@/lib/db/encryptedDatabase';
import { conditionTagsInfo } from '@/lib/constants/conditionTags';
import type { DailyState, MealLog } from '@/types';

interface TodaysSummaryProps {
  resetTime?: string;
}

export function TodaysSummary({ resetTime = '04:00' }: TodaysSummaryProps) {
  const [todayState, setTodayState] = useState<DailyState | null>(null);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadTodayData();
  }, [resetTime]);

  const loadTodayData = async () => {
    try {
      // データベースの初期化
      await initializeEncryptedDatabase();
      
      // 今日のコンディションデータを取得
      const repository = new EncryptedDailyStateRepository();
      const today = await repository.getToday(resetTime);
      setTodayState(today);
      
      // 今日の食事データを取得
      const todayMeals = await mealLogRepository.getToday(resetTime);
      setMeals(todayMeals);
    } catch (error) {
      console.error('Failed to load today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mealTypes = {
    breakfast: { label: '朝食', icon: '🌅' },
    lunch: { label: '昼食', icon: '☀️' },
    dinner: { label: '夕食', icon: '🌙' },
    snack: { label: '間食', icon: '🍪' }
  };

  const recordedMeals = meals.map(meal => meal.mealType);
  const hasBreakfast = recordedMeals.includes('breakfast');
  const hasLunch = recordedMeals.includes('lunch');
  const hasDinner = recordedMeals.includes('dinner');

  // SSRの場合またはローディング中はスケルトンを表示
  if (!mounted || loading) {
    return (
      <div className="px-4">
        <Card>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4">
      <Card>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">今日のサマリー</h3>
        
        {/* コンディション */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">コンディション</div>
          {todayState?.conditionTags && todayState.conditionTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {todayState.conditionTags.map((tagId) => {
                const tagInfo = conditionTagsInfo.find(t => t.id === tagId);
                if (!tagInfo) return null;
                
                return (
                  <span
                    key={tagId}
                    className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{tagInfo.icon}</span>
                    <span>{tagInfo.label}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">まだ記録されていません</div>
          )}
        </div>

        {/* 食事記録状況 */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">食事記録</div>
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`
                text-center p-2 rounded-lg border-2
                ${hasBreakfast 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'}
              `}
            >
              <div className="text-lg mb-1">{mealTypes.breakfast.icon}</div>
              <div className="text-xs">{mealTypes.breakfast.label}</div>
              {hasBreakfast && (
                <div className="text-green-600 text-xs mt-1">✓</div>
              )}
            </div>
            
            <div
              className={`
                text-center p-2 rounded-lg border-2
                ${hasLunch 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'}
              `}
            >
              <div className="text-lg mb-1">{mealTypes.lunch.icon}</div>
              <div className="text-xs">{mealTypes.lunch.label}</div>
              {hasLunch && (
                <div className="text-green-600 text-xs mt-1">✓</div>
              )}
            </div>
            
            <div
              className={`
                text-center p-2 rounded-lg border-2
                ${hasDinner 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'}
              `}
            >
              <div className="text-lg mb-1">{mealTypes.dinner.icon}</div>
              <div className="text-xs">{mealTypes.dinner.label}</div>
              {hasDinner && (
                <div className="text-green-600 text-xs mt-1">✓</div>
              )}
            </div>
          </div>
        </div>

        {/* 励ましメッセージ */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-700">
            {meals.length === 0 
              ? '今日も一日頑張りましょう！' 
              : `${meals.length}回の食事を記録済み！素晴らしいです！`}
          </p>
        </div>
      </Card>
    </div>
  );
}