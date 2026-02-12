'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConditionTagSelector } from '@/components/features/condition/ConditionTagSelector';
import { FreeMemoInput } from '@/components/features/condition/FreeMemoInput';
import { getDateKey, formatDateFromKey } from '@/lib/utils/dateUtils';
import { useDailyState } from '@/lib/hooks/useDailyState';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import type { ConditionTag } from '@/types';

export default function ClientOnlyConditionRecord() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<ConditionTag[]>([]);
  const [freeMemo, setFreeMemo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // TanStack Query hooks
  const { settings, isLoading: settingsLoading } = useUserSettings();
  const resetTime = settings?.dayResetTime || '04:00';
  const todayKey = getDateKey(new Date(), resetTime);
  const displayDate = formatDateFromKey(todayKey);
  
  const { 
    dailyState,
    isLoading: stateLoading,
    updateDailyState,
    isUpdating 
  } = useDailyState(todayKey);
  
  const isLoading = settingsLoading || stateLoading;
  const isSaving = isUpdating;

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 既存データが読み込まれたらフォームに反映
  useEffect(() => {
    if (dailyState) {
      setSelectedTags(dailyState.conditionTags || []);
      setFreeMemo(dailyState.freeMemo || '');
    }
  }, [dailyState]);

  const handleSave = () => {
    setError(null);
    setSuccessMessage(null);
    
    updateDailyState(
      {
        ...dailyState,
        dateKey: todayKey,
        conditionTags: selectedTags,
        freeMemo: freeMemo,
        actualDate: new Date(),
        createdAt: dailyState?.createdAt || new Date(),
        updatedAt: new Date()
      },
      {
        onSuccess: () => {
          setSuccessMessage('保存しました！');
          // 2秒後にホーム画面に戻る
          setTimeout(() => {
            router.push('/home');
          }, 2000);
        },
        onError: (err) => {
          setError('保存に失敗しました。もう一度お試しください。');
        }
      }
    );
  };

  const handleSkip = () => {
    router.push('/home');
  };

  const handleReset = () => {
    setSelectedTags([]);
    setFreeMemo('');
  };

  // SSRハイドレーション問題を避けるため、マウント前は何もレンダリングしない
  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen pb-safe">
        {/* ヘッダー */}
        <header className="bg-gradient-to-b from-pink-100 to-pink-50 pb-4">
          <div className="pt-safe-area-top px-4 pt-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800">コンディション記録</h1>
              <div className="w-10"></div>
            </div>
            <p className="text-center text-lg text-gray-700 font-medium">
              {displayDate || '読み込み中...'}
            </p>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="px-4 py-6 space-y-6">
          {/* 既存データの通知 */}
          {dailyState && (
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    今日のコンディションは既に記録済みです
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    更新する場合は、内容を変更して保存してください
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* エラーメッセージ */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </Card>
          )}

          {/* 成功メッセージ */}
          {successMessage && (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </Card>
          )}

          {/* コンディション選択 */}
          <Card>
            <ConditionTagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              maxSelection={5}
            />
          </Card>

          {/* フリーメモ */}
          <Card>
            <FreeMemoInput
              value={freeMemo}
              onChange={setFreeMemo}
            />
          </Card>

          {/* アクションボタン */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleSave}
              disabled={isSaving || (selectedTags.length === 0 && freeMemo.trim() === '')}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  保存中...
                </span>
              ) : (
                '保存する'
              )}
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="medium"
                fullWidth
                onClick={handleReset}
                disabled={isSaving}
              >
                リセット
              </Button>
              <Button
                variant="ghost"
                size="medium"
                fullWidth
                onClick={handleSkip}
                disabled={isSaving}
              >
                スキップ
              </Button>
            </div>
          </div>

          {/* ヒント */}
          <div className="bg-pink-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">💡 ヒント</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 毎日の記録が、より良い食事提案につながります</li>
              <li>• 体調の変化を把握することで、パターンが見えてきます</li>
              <li>• 無理のない範囲で、続けることが大切です</li>
            </ul>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}