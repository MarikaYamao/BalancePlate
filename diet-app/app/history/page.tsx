'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MealDetailModal } from '@/components/features/meal/MealDetailModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { mealLogRepository } from '@/lib/db/repositories';
import { EncryptedDailyStateRepository } from '@/lib/db/repositories/encryptedDailyStateRepository';
import { initializeEncryptedDatabase } from '@/lib/db/encryptedDatabase';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import { conditionTagsInfo } from '@/lib/constants/conditionTags';
import type { MealLog, DailyState, MealType } from '@/types';

interface DayData {
  dateKey: string;
  date: Date;
  meals: MealLog[];
  dailyState?: DailyState;
}

export default function HistoryPage() {
  const { settings, isLoading: settingsLoading } = useUserSettings();
  const resetTime = settings?.dayResetTime || '04:00';
  
  const [historyData, setHistoryData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [daysToShow, setDaysToShow] = useState(7);

  useEffect(() => {
    if (settings) {
      loadHistoryData();
    }
  }, [settings, daysToShow]);

  const loadHistoryData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await initializeEncryptedDatabase();
      
      const mealRepository = mealLogRepository;
      const dailyStateRepository = new EncryptedDailyStateRepository();
      
      // 過去N日分のデータを取得
      const days: DayData[] = [];
      const today = new Date();
      
      for (let i = 0; i < daysToShow; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - i);
        
        // 日付キーを生成（リセット時間考慮）
        const dateKey = generateDateKey(targetDate, resetTime);
        
        // その日の食事記録を取得
        const meals = await mealRepository.getByDate(dateKey);
        
        // その日のコンディションを取得
        let dailyState: DailyState | undefined;
        try {
          const state = await dailyStateRepository.get(dateKey);
          dailyState = state || undefined;
        } catch (e) {
          // 見つからない場合は無視
        }
        
        if (meals.length > 0 || dailyState) {
          days.push({
            dateKey,
            date: targetDate,
            meals,
            dailyState
          });
        }
      }
      
      setHistoryData(days);
    } catch (err) {
      console.error('Failed to load history data:', err);
      setError('履歴データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDateKey = (date: Date, resetTime: string): string => {
    const resetHour = parseInt(resetTime.split(':')[0]);
    const adjustedDate = new Date(date);
    
    if (date.getHours() < resetHour) {
      adjustedDate.setDate(date.getDate() - 1);
    }
    
    return adjustedDate.toISOString().split('T')[0];
  };

  const handleMealClick = (meal: MealLog) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  };

  // ローカルストレージからフィードバックデータの存在確認
  const checkStoredFeedback = (dateKey: string, mealTime: Date): boolean => {
    try {
      const storedConsultations = localStorage.getItem(`ai-consultation-${dateKey}`);
      if (!storedConsultations) return false;
      
      const consultations = JSON.parse(storedConsultations);
      return consultations.some((c: any) => 
        Math.abs(new Date(c.timestamp).getTime() - new Date(mealTime).getTime()) < 4 * 60 * 60 * 1000 // 4時間以内
      );
    } catch (error) {
      return false;
    }
  };

  const mealTypeLabels = {
    breakfast: { label: '朝食', icon: '🌅' },
    lunch: { label: '昼食', icon: '☀️' },
    dinner: { label: '夕食', icon: '🌙' },
    snack: { label: '間食', icon: '🍪' }
  };

  if (settingsLoading || isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" message="履歴を読み込み中..." />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen p-4">
          <ErrorMessage 
            message={error} 
            onRetry={loadHistoryData}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen p-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">履歴</h1>
          
          {/* コントロール */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="small"
              >
                リスト表示
              </Button>
              <Button
                onClick={() => setViewMode('calendar')}
                variant={viewMode === 'calendar' ? 'primary' : 'outline'}
                size="small"
                disabled={true} // カレンダー表示は今後実装
              >
                カレンダー表示
              </Button>
            </div>
            
            <select
              value={daysToShow}
              onChange={(e) => setDaysToShow(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value={7}>過去7日</option>
              <option value={14}>過去2週間</option>
              <option value={30}>過去1ヶ月</option>
            </select>
          </div>
        </div>

        {/* 履歴リスト */}
        {historyData.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600 mb-2">まだ記録がありません</p>
              <p className="text-sm text-gray-500">食事やコンディションを記録すると、ここに履歴が表示されます</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {historyData.map((dayData) => (
              <Card key={dayData.dateKey} className="overflow-hidden">
                <div className="p-4">
                  {/* 日付ヘッダー */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                    <div className="text-lg font-semibold text-gray-800">
                      {dayData.date.toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {dayData.meals.length}件の食事記録
                    </div>
                  </div>

                  {/* コンディション */}
                  {dayData.dailyState?.conditionTags && dayData.dailyState.conditionTags.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">コンディション</div>
                      <div className="flex flex-wrap gap-2">
                        {dayData.dailyState.conditionTags.map((tagId) => {
                          const tagInfo = conditionTagsInfo.find(t => t.id === tagId);
                          if (!tagInfo) return null;
                          
                          return (
                            <span
                              key={tagId}
                              className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs flex items-center gap-1"
                            >
                              <span>{tagInfo.icon}</span>
                              <span>{tagInfo.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 食事記録 */}
                  {dayData.meals.length > 0 ? (
                    <div className="space-y-3">
                      {dayData.meals.map((meal) => {
                        const mealInfo = mealTypeLabels[meal.mealType];
                        
                        // AIフィードバックがあるかチェック
                        const hasFeedback = meal.aiAnalysis || checkStoredFeedback(meal.dateKey, meal.actualTime);
                        
                        return (
                          <button
                            key={meal.id}
                            onClick={() => handleMealClick(meal)}
                            className={`
                              w-full text-left p-3 border rounded-lg transition-colors
                              ${hasFeedback 
                                ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300' 
                                : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-lg mt-0.5">{mealInfo.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm text-gray-800">
                                    {mealInfo.label}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(meal.actualTime).toLocaleString('ja-JP', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {meal.followedPlan && (
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                      プラン準拠
                                    </span>
                                  )}
                                  {hasFeedback && (
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                                      💬 フィードバックあり
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {meal.text}
                                </p>
                                {meal.aiAnalysis && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    AI分析済み
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      この日は食事の記録がありません
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* モーダル */}
        <MealDetailModal
          isOpen={isModalOpen}
          mealLog={selectedMeal}
          onClose={handleModalClose}
        />
      </div>
    </MainLayout>
  );
}