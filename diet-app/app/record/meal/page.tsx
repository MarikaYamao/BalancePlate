'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type MealType, type MealLog } from '@/types';
import { mealLogRepository, encryptedUserSettingsRepository } from '@/lib/db/repositories';
import { MealTypeSelector } from '@/components/features/meal/MealTypeSelector';
import { MealTextInput } from '@/components/features/meal/MealTextInput';
import { MealHistory } from '@/components/features/meal/MealHistory';
import { DateDisplay } from '@/components/features/home/DateDisplay';
import { getDateKey } from '@/lib/utils/dateUtils';

export default function MealRecordPage() {
  const router = useRouter();
  const [resetTime, setResetTime] = useState('04:00');
  const [selectedType, setSelectedType] = useState<MealType | null>(null);
  const [mealText, setMealText] = useState('');
  const [recordedTypes, setRecordedTypes] = useState<MealType[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [todayKey, setTodayKey] = useState('');
  const [editingMeal, setEditingMeal] = useState<{ id: string; type: MealType; text: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // 設定を読み込み
      const settings = await encryptedUserSettingsRepository.get();
      const userResetTime = settings?.dayResetTime || '04:00';
      setResetTime(userResetTime);
      
      // 今日のdateKeyを計算
      const dateKey = getDateKey(new Date(), userResetTime);
      setTodayKey(dateKey);
      
      // 今日の記録済みタイプを取得
      const todayMeals = await mealLogRepository.getByDate(dateKey);
      const types = todayMeals.map(m => m.mealType);
      setRecordedTypes(types);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedType && !editingMeal) {
      setError('食事タイプを選択してください');
      return;
    }

    if (!mealText.trim()) {
      setError('食事内容を入力してください');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingMeal) {
        // 編集モード
        await mealLogRepository.update(editingMeal.id, {
          text: mealText.trim()
        });
        setSuccessMessage('食事記録を更新しました！');
        setEditingMeal(null);
      } else {
        // 新規作成モード
        await mealLogRepository.save({
          dateKey: todayKey,
          mealType: selectedType!,
          text: mealText.trim()
        });
        setSuccessMessage('食事記録を保存しました！');
      }
      
      // フォームをリセット
      setSelectedType(null);
      setMealText('');
      
      // 記録済みタイプを更新
      await loadInitialData();

      // 2秒後に成功メッセージを消す
      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to save meal:', err);
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedType(null);
    setMealText('');
    setError(null);
    setSuccessMessage(null);
    setEditingMeal(null);
  };

  const handleEdit = (meal: MealLog) => {
    setEditingMeal({ id: meal.id, type: meal.mealType, text: meal.text });
    setSelectedType(meal.mealType);
    setMealText(meal.text);
    setActiveTab('record');
    setSuccessMessage(null);
    setError(null);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-2xl mx-auto p-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/home')}
            className="text-gray-600 hover:text-gray-800 mb-4 inline-flex items-center"
          >
            ← ホームに戻る
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">食事記録</h1>
          <DateDisplay resetTime={resetTime} />
        </div>

        {/* タブ切り替え */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('record')}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-colors
              ${activeTab === 'record' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            🍽️ 記録する
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-colors
              ${activeTab === 'history' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            📋 今日の食事
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
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            {/* 編集モード表示 */}
            {editingMeal && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm font-medium text-yellow-800">
                  編集モード: {editingMeal.type === 'breakfast' ? '朝食' : 
                            editingMeal.type === 'lunch' ? '昼食' : 
                            editingMeal.type === 'dinner' ? '夕食' : '間食'}を編集中
                </div>
              </div>
            )}

            {/* 食事タイプ選択 */}
            <div>
              <h2 className="text-lg font-medium mb-4">
                {editingMeal ? '食事タイプ（編集中）' : '1. 食事タイプを選択'}
              </h2>
              <MealTypeSelector
                selectedType={selectedType}
                onSelect={setSelectedType}
                recordedTypes={editingMeal ? [] : recordedTypes}
                disabled={saving || !!editingMeal}
              />
            </div>

            {/* 食事内容入力 */}
            {(selectedType || editingMeal) && (
              <div className="animate-fadeIn">
                <h2 className="text-lg font-medium mb-4">
                  {editingMeal ? '食事内容を編集' : '2. 食事内容を入力'}
                </h2>
                <MealTextInput
                  value={mealText}
                  onChange={setMealText}
                  disabled={saving}
                />
              </div>
            )}

            {/* アクションボタン */}
            {(selectedType || editingMeal) && (
              <div className="flex gap-3 animate-fadeIn">
                <button
                  onClick={handleSave}
                  disabled={saving || !mealText.trim()}
                  className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? '保存中...' : editingMeal ? '更新する' : '保存する'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  {editingMeal ? 'キャンセル' : 'リセット'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">今日の食事記録</h2>
            <MealHistory 
              dateKey={todayKey}
              onEdit={handleEdit}
              onDelete={() => loadInitialData()}
            />
          </div>
        )}

        {/* ヒント */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 ヒント：食事記録を続けることで、食生活のパターンが見えてきます。
            無理のない範囲で記録を続けましょう。
          </p>
        </div>
      </div>
    </div>
  );
}