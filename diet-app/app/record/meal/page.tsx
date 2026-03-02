'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type MealType } from '@/types';
import { MealTypeSelector } from '@/components/features/meal/MealTypeSelector';
import { MealTextInput } from '@/components/features/meal/MealTextInput';
import { MealHistory } from '@/components/features/meal/MealHistory';
import { PostMealFeedback } from '@/components/features/meal/PostMealFeedback';
import { MealDetailModal } from '@/components/features/meal/MealDetailModal';
import { getDateKey } from '@/lib/utils/dateUtils';
import { useMealLogs } from '@/lib/hooks/useMealLogs';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import { useAppStore } from '@/lib/stores/useAppStore';

function MealRecordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<MealType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [editingMeal, setEditingMeal] = useState<{ id: string; type: MealType; text: string } | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ mealType: MealType; mealText: string } | null>(null);
  const [showMealDetail, setShowMealDetail] = useState<{ meal: any; aiResponse?: any } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Zustand store
  const { tempMealText: mealText, setTempMealText: setMealText, clearTempMealText } = useAppStore();
  
  // TanStack Query hooks
  const { settings, isLoading: settingsLoading } = useUserSettings();
  const resetTime = settings?.dayResetTime || '04:00';
  const mealsPerDay = settings?.mealsPerDay || 3;
  const [todayKey, setTodayKey] = useState('');
  
  const { 
    mealLogs, 
    isLoading: mealsLoading, 
    createMealLog, 
    updateMealLog,
    isCreating,
    isUpdating 
  } = useMealLogs(todayKey);
  
  const recordedTypes = mealLogs.map(m => m.mealType);
  const loading = settingsLoading || mealsLoading || !mounted;
  const saving = isCreating || isUpdating;

  // クライアントサイドでのみ日付を初期化
  useEffect(() => {
    setMounted(true);
    setTodayKey(getDateKey(new Date(), resetTime));
  }, [resetTime]);

  // 未入力の食事タイプを自動選択
  useEffect(() => {
    if (!mounted || mealsLoading || editingMeal || selectedType) return;

    // URLパラメータでタイプが指定されている場合はスキップ
    const typeParam = searchParams.get('type');
    if (typeParam) return;

    // 2食設定の場合の食事タイプリスト
    const availableMealTypes = mealsPerDay === 2 
      ? ['breakfast', 'dinner', 'snack'] as MealType[]
      : ['breakfast', 'lunch', 'dinner', 'snack'] as MealType[];

    // 未記録の最初の食事タイプを選択
    const nextMealType = availableMealTypes.find(type => !recordedTypes.includes(type));
    if (nextMealType) {
      setSelectedType(nextMealType);
    }
  }, [mounted, mealsLoading, recordedTypes, mealsPerDay, editingMeal, searchParams]);

  // URLパラメータからの初期化
  useEffect(() => {
    const typeParam = searchParams.get('type') as MealType | null;
    const suggestionParam = searchParams.get('suggestion');
    const editParam = searchParams.get('edit');
    const tabParam = searchParams.get('tab');
    
    if (typeParam && ['breakfast', 'lunch', 'dinner', 'snack'].includes(typeParam)) {
      setSelectedType(typeParam);
    } else if (!typeParam && !editParam) {
      // URLパラメータがない場合は自動選択を有効化
      setSelectedType(null);
    }
    
    if (suggestionParam) {
      setMealText(suggestionParam);
    }

    if (editParam && mealLogs) {
      const mealToEdit = mealLogs.find(m => m.id === editParam);
      if (mealToEdit) {
        handleEdit(mealToEdit);
      }
    }

    if (tabParam === 'history') {
      setShowHistory(true);
    }
  }, [searchParams, mealLogs, setMealText]);

  useEffect(() => {
    // クリーンアップ: コンポーネントアンマウント時に一時テキストをクリア
    return () => {
      if (mealText && !editingMeal) {
        // 編集中でない場合のみクリア
        clearTempMealText();
      }
    };
  }, []);

  const handleSave = () => {
    if (!selectedType && !editingMeal) {
      setError('食事タイプを選択してください');
      return;
    }

    if (!mealText.trim()) {
      setError('食事内容を入力してください');
      return;
    }

    setError(null);

    if (editingMeal) {
      // 編集モード
      updateMealLog(
        { id: editingMeal.id, updates: { text: mealText.trim() } },
        {
          onSuccess: () => {
            setSuccessMessage('食事記録を更新しました！');
            setEditingMeal(null);
            clearTempMealText();
            setSelectedType(null);
          },
          onError: () => {
            setError('食事記録の更新に失敗しました');
          }
        }
      );
    } else {
      // 新規作成モード
      createMealLog(
        {
          dateKey: todayKey,
          mealType: selectedType!,
          text: mealText.trim(),
          actualTime: new Date()
        },
        {
          onSuccess: () => {
            setSuccessMessage('食事記録を保存しました！');
            
            // すべての食事でフィードバックを表示（売りポイントなので）
            setShowFeedback({
              mealType: selectedType!,
              mealText: mealText.trim()
            });
            
            // フォームをリセット
            clearTempMealText();
            setSelectedType(null);
          },
          onError: () => {
            setError('食事記録の保存に失敗しました');
          }
        }
      );
    }
  };

  const handleReset = () => {
    setSelectedType(null);
    clearTempMealText();
    setError(null);
    setSuccessMessage(null);
    setEditingMeal(null);
  };

  const handleEdit = (meal: any) => {
    setEditingMeal({ id: meal.id, type: meal.mealType, text: meal.text });
    setSelectedType(meal.mealType);
    setMealText(meal.text);
    setShowHistory(false);
    setSuccessMessage(null);
    setError(null);
  };

  const handleShowMealDetail = (meal: any, aiResponse?: any) => {
    setShowMealDetail({ meal, aiResponse });
  };
  
  // 成功メッセージの自動消去
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // 食事タイプのラベルとアイコン
  const mealTypeInfo = {
    breakfast: { label: '朝食', icon: '🌅', color: 'from-yellow-100 to-orange-100' },
    lunch: { label: '昼食', icon: '☀️', color: 'from-blue-100 to-cyan-100' },
    dinner: { label: '夕食', icon: '🌙', color: 'from-purple-100 to-pink-100' },
    snack: { label: '間食', icon: '🍪', color: 'from-gray-100 to-gray-100' }
  };

  const currentMealInfo = selectedType ? mealTypeInfo[selectedType] : null;
  const todayMealCount = mealLogs.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4">
        {/* シンプルなヘッダー */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/home')}
              className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1.5 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              戻る
            </button>
            
            <span className="text-xs text-gray-500">今日 {todayMealCount}食</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {editingMeal ? '食事を編集' : '食事を記録'}
          </h1>
        </div>


        {/* エラー・成功メッセージ */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-lg">
            {successMessage}
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="space-y-6">
          {/* 食事タイプ選択 - セグメントコントロール */}
          {!editingMeal && (
            <div className="flex gap-1 p-1 bg-gray-50 rounded-xl">
              {['breakfast', 'lunch', 'dinner', 'snack']
                .filter((type) => !(mealsPerDay === 2 && type === 'lunch'))
                .map((type) => {
                  const info = mealTypeInfo[type as keyof typeof mealTypeInfo];
                  const isRecorded = recordedTypes.includes(type as any);
                  const isSelected = selectedType === type;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(isSelected ? null : type as any)}
                      disabled={isRecorded}
                      className={`
                        flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all
                        ${isSelected
                          ? 'bg-teal-600 text-white'
                          : isRecorded
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-white'
                        }
                      `}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-base">{info.icon}</span>
                        <span>{info.label}</span>
                        {isRecorded && <span className="text-xs">✓</span>}
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
          
          {/* 入力フィールド - 主役 */}
          {(selectedType || editingMeal) && (
            <div className="space-y-4">
              {editingMeal && (
                <div className="inline-flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                  <span>✏️</span>
                  <span>編集中</span>
                </div>
              )}
              
              <MealTextInput
                value={mealText}
                onChange={setMealText}
                disabled={saving}
                placeholder="例: 玄米ご飯、鮭の塩焼き、味噌汁"
              />
            </div>
          )}

          
          {/* CTAボタン - 下部固定 */}
          {(selectedType || editingMeal) && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
              <div className="max-w-xl mx-auto space-y-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !mealText.trim() || !selectedType && !editingMeal}
                  className={`
                    w-full py-4 px-6 rounded-2xl font-medium transition-all
                    ${!mealText.trim() || (!selectedType && !editingMeal)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : saving
                      ? 'bg-gray-300 text-gray-500 cursor-wait'
                      : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                    }
                  `}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      保存中...
                    </span>
                  ) : (
                    editingMeal ? '更新する' : 'この内容で記録する'
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-6">
                  {editingMeal && (
                    <button
                      onClick={handleReset}
                      disabled={saving}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      キャンセル
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    今日の一覧を見る
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* 今日の一覧表示 */}
          {showHistory && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">今日の食事</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  新規記録
                </button>
              </div>
              <MealHistory 
                dateKey={todayKey}
                onEdit={handleEdit}
                onDelete={() => {}}
                onShowDetail={handleShowMealDetail}
              />
            </div>
          )}
        </div>

      </div>

      {/* 食後フィードバックモーダル */}
      {showFeedback && (
        <PostMealFeedback
          mealType={showFeedback.mealType}
          mealText={showFeedback.mealText}
          onClose={() => {
            setShowFeedback(null);
            // 朝食・昼食の場合は次の食事記録へ遷移、夕食・間食の場合は履歴を表示
            if (showFeedback.mealType === 'breakfast' || (showFeedback.mealType === 'lunch' && mealsPerDay === 3)) {
              // 次の食事タイプを決定（2食設定の場合は朝食→夕食）
              const nextMealType = showFeedback.mealType === 'breakfast' 
                ? (mealsPerDay === 2 ? 'dinner' : 'lunch')
                : 'dinner';
              // 次の食事が記録されていない場合のみ遷移
              if (!recordedTypes.includes(nextMealType as MealType)) {
                setSelectedType(nextMealType as MealType);
                setShowHistory(false);
              } else {
                // すでに記録されている場合は履歴を表示
                setShowHistory(true);
              }
            } else {
              // 夕食・間食の場合は履歴を表示
              setShowHistory(true);
            }
          }}
        />
      )}

      {/* 食事詳細モーダル */}
      {showMealDetail && (
        <MealDetailModal
          isOpen={true}
          mealLog={showMealDetail.meal}
          onClose={() => setShowMealDetail(null)}
        />
      )}
    </div>
  );
}

export default function MealRecordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <MealRecordPageContent />
    </Suspense>
  );
}