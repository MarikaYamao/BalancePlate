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
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [editingMeal, setEditingMeal] = useState<{ id: string; type: MealType; text: string } | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ mealType: MealType; mealText: string } | null>(null);
  const [showMealDetail, setShowMealDetail] = useState<{ meal: any; aiResponse?: any } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Zustand store
  const { tempMealText: mealText, setTempMealText: setMealText, clearTempMealText } = useAppStore();
  
  // TanStack Query hooks
  const { settings, isLoading: settingsLoading } = useUserSettings();
  const resetTime = settings?.dayResetTime || '04:00';
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

  // URLパラメータからの初期化
  useEffect(() => {
    const typeParam = searchParams.get('type') as MealType | null;
    const suggestionParam = searchParams.get('suggestion');
    const editParam = searchParams.get('edit');
    
    if (typeParam && ['breakfast', 'lunch', 'dinner', 'snack'].includes(typeParam)) {
      setSelectedType(typeParam);
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
    setActiveTab('record');
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
    <div className={`min-h-screen ${currentMealInfo ? `bg-gradient-to-b ${currentMealInfo.color}` : 'bg-gradient-to-b from-green-50 to-white'}`}>
      <div className="max-w-2xl mx-auto p-4">
        {/* ヘッダー - より魅力的に */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/home')}
            className="text-gray-600 hover:text-gray-800 mb-4 inline-flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </button>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {currentMealInfo && (
                  <span className="text-3xl">{currentMealInfo.icon}</span>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {editingMeal ? `${editingMeal.type === 'breakfast' ? '朝食' : 
                                   editingMeal.type === 'lunch' ? '昼食' : 
                                   editingMeal.type === 'dinner' ? '夕食' : '間食'}を編集中` :
                     currentMealInfo ? `${currentMealInfo.label}を記録` : 
                     '食事を記録'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    何を食べましたか？
                  </p>
                </div>
              </div>
              
              {/* 今日の記録状況 */}
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">今日の記録</div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-green-600">{todayMealCount}</span>
                  <span className="text-sm text-gray-600">食</span>
                </div>
              </div>
            </div>
            
            {/* AI機能の価値訴求 */}
            <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center gap-2">
              <span className="text-sm">🤖</span>
              <p className="text-xs text-blue-700">
                記録するとAIがあなたの食事バランスを分析してフィードバックします
              </p>
            </div>
          </div>
        </div>

        {/* タブ切り替えをより控えめに */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('record')}
            className={`
              flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'record' 
                ? 'bg-white shadow-sm border-2 border-green-500 text-green-700' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-2 border-transparent'
              }
            `}
          >
            ✏️ 新規記録
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`
              flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'history' 
                ? 'bg-white shadow-sm border-2 border-green-500 text-green-700' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-2 border-transparent'
              }
            `}
          >
            📋 今日の一覧
          </button>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* 成功メッセージ */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg animate-fadeIn">
            {successMessage}
          </div>
        )}

        {/* コンテンツ */}
        {activeTab === 'record' ? (
          <div className="space-y-4">
            {/* URLパラメータで食事タイプが指定されている場合、即座に入力フォームを表示 */}
            {!selectedType && !editingMeal ? (
              /* ステップ1: 食事タイプ選択 - より視覚的に */
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-800 mb-1">
                    どの食事を記録しますか？
                  </h2>
                  <p className="text-sm text-gray-600">記録したい食事のタイミングを選んでください</p>
                </div>
                
                {/* 視覚的な食事タイプセレクター */}
                <div className="grid grid-cols-2 gap-3">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                    const info = mealTypeInfo[type as keyof typeof mealTypeInfo];
                    const isRecorded = recordedTypes.includes(type as any);
                    
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type as any)}
                        disabled={isRecorded}
                        className={`
                          p-4 rounded-xl border-2 transition-all text-left
                          ${isRecorded 
                            ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed' 
                            : 'bg-white border-gray-200 hover:border-green-400 hover:shadow-md cursor-pointer'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{info.icon}</span>
                          <div>
                            <div className="font-medium text-gray-800">
                              {info.label}
                            </div>
                          </div>
                        </div>
                        {isRecorded && (
                          <div className="mt-2 text-xs text-green-600 font-medium">
                            ✓ 記録済み
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ステップ2: 食事内容入力 - 一つの画面に統合 */
              <div className="bg-white rounded-xl shadow-sm p-6">
                {editingMeal && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800">
                      ✏️ 編集モード
                    </div>
                  </div>
                )}
                
                {/* 選択した食事タイプの表示 */}
                {currentMealInfo && !editingMeal && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{currentMealInfo.icon}</span>
                        <div>
                          <span className="font-medium text-green-800">{currentMealInfo.label}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedType(null)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        変更
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">
                      何を食べましたか？
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      できるだけ詳しく記録すると、より精度の高いAI分析が受けられます
                    </p>
                    
                    <MealTextInput
                      value={mealText}
                      onChange={setMealText}
                      disabled={saving}
                    />
                    
                    {/* 入力のヒント */}
                    {!mealText && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                          💡 記録例：玄米100g、鮭の塩焼き、味噌汁、ほうれん草のお浸し
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* アクションボタン - より明確に */}
            {(selectedType || editingMeal) && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="space-y-3">
                  {/* メインアクション */}
                  <button
                    onClick={handleSave}
                    disabled={saving || !mealText.trim()}
                    className={`
                      w-full py-3 px-6 rounded-lg font-medium transition-all
                      ${!mealText.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : saving
                        ? 'bg-gray-300 text-gray-500 cursor-wait'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
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
                      <span className="flex items-center justify-center gap-2">
                        {editingMeal ? '📝 更新してAI分析を受ける' : '🤖 保存してAI分析を受ける'}
                      </span>
                    )}
                  </button>
                  
                  {/* サブアクション */}
                  <button
                    onClick={handleReset}
                    disabled={saving}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                  >
                    {editingMeal ? 'キャンセル' : '入力をクリア'}
                  </button>
                </div>
                
                {/* モチベーションメッセージ */}
                {mealText.trim() && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-center text-gray-500">
                      ✨ 記録するとAIがあなたの食事を分析します
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">今日の食事記録</h2>
            <MealHistory 
              dateKey={todayKey}
              onEdit={handleEdit}
              onDelete={() => {/* データは自動更新される */}}
              onShowDetail={handleShowMealDetail}
            />
          </div>
        )}

      </div>

      {/* 食後フィードバックモーダル */}
      {showFeedback && (
        <PostMealFeedback
          mealType={showFeedback.mealType}
          mealText={showFeedback.mealText}
          onClose={() => setShowFeedback(null)}
        />
      )}

      {/* 食事詳細モーダル */}
      {showMealDetail && (
        <MealDetailModal
          isOpen={true}
          mealLog={showMealDetail.meal}
          aiResponse={showMealDetail.aiResponse}
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