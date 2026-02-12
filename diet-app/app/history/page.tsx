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

  // 統合フィードバックデータの取得
  const getIntegratedFeedback = (dateKey: string): any | null => {
    try {
      const storedConsultations = localStorage.getItem(`ai-consultation-${dateKey}`);
      if (!storedConsultations) return null;
      
      const consultations = JSON.parse(storedConsultations);
      // 統合フィードバック（isIntegratedFeedback: true）を探す
      const integratedFeedback = consultations.find((c: any) => c.isIntegratedFeedback === true);
      return integratedFeedback || null;
    } catch (error) {
      return null;
    }
  };

  // ローカルストレージからフィードバックデータの存在確認
  const checkStoredFeedback = (dateKey: string, mealTime: Date): boolean => {
    try {
      const storedConsultations = localStorage.getItem(`ai-consultation-${dateKey}`);
      if (!storedConsultations) return false;
      
      const consultations = JSON.parse(storedConsultations);
      return consultations.some((c: any) => 
        !c.isIntegratedFeedback && // 統合フィードバック以外
        Math.abs(new Date(c.timestamp).getTime() - new Date(mealTime).getTime()) < 4 * 60 * 60 * 1000
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">食事履歴</h1>
            
            {/* 期間選択を目立たせる */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">表示期間:</span>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { value: 7, label: '7日' },
                  { value: 14, label: '2週間' },
                  { value: 30, label: '1ヶ月' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDaysToShow(option.value)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      daysToShow === option.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* サマリー情報 */}
          {historyData.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{historyData.length}</div>
                    <div className="text-xs text-gray-600">記録日数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {historyData.reduce((sum, day) => sum + day.meals.length, 0)}
                    </div>
                    <div className="text-xs text-gray-600">食事記録</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {historyData.filter(day => getIntegratedFeedback(day.dateKey)).length}
                    </div>
                    <div className="text-xs text-gray-600">AI分析</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">継続率</div>
                  <div className="text-xl font-bold text-purple-600">
                    {Math.round((historyData.length / daysToShow) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}
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
                  {/* 日付ヘッダー - より目立つように */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg px-3 py-2">
                        <div className="text-lg font-bold text-gray-800">
                          {dayData.date.toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-600">
                          {dayData.date.toLocaleDateString('ja-JP', { weekday: 'short' })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          🍽️ {dayData.meals.length}食事
                        </span>
                        {(() => {
                          const integratedFeedback = getIntegratedFeedback(dayData.dateKey);
                          return integratedFeedback ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              🤖 AI分析済み
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    
                    {/* 今日からの日数表示 */}
                    {(() => {
                      const today = new Date();
                      const diffDays = Math.floor((today.getTime() - dayData.date.getTime()) / (1000 * 60 * 60 * 24));
                      return diffDays === 0 ? (
                        <span className="text-xs text-purple-600 font-medium">今日</span>
                      ) : diffDays === 1 ? (
                        <span className="text-xs text-gray-500">昨日</span>
                      ) : (
                        <span className="text-xs text-gray-400">{diffDays}日前</span>
                      );
                    })()}
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

                  {/* 統合フィードバックカード - より目立つように */}
                  {(() => {
                    const integratedFeedback = getIntegratedFeedback(dayData.dateKey);
                    return integratedFeedback ? (
                      <div className="mb-6">
                        <div className="relative p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          </div>
                          
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-lg">🤖</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-800">AIによる総合分析</h3>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                  ✨ おすすめ
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                今日の食事バランスと体調を総合評価
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-700 mb-3 pl-13">
                            {integratedFeedback.response?.substring(0, 120) + '...'}
                          </div>
                          
                          <button
                            onClick={() => {
                              // 統合フィードバックの詳細を表示
                              if (dayData.meals.length > 0) {
                                handleMealClick({
                                  ...dayData.meals[0],
                                  aiResponse: integratedFeedback.response
                                } as any);
                              }
                            }}
                            className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            フィードバックを読む 📖
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })()}

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