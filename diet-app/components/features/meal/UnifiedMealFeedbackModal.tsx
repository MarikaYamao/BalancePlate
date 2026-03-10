"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type MealType } from "@/types";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { usePostMealFeedback } from "@/lib/hooks/usePostMealFeedback";
import { MealDetailModal } from "./MealDetailModal";

interface UnifiedMealFeedbackModalProps {
  isOpen: boolean;
  mealType: MealType;
  mealText: string;
  onClose: () => void;
}

export function UnifiedMealFeedbackModal({
  isOpen,
  mealType,
  mealText,
  onClose,
}: UnifiedMealFeedbackModalProps) {
  const router = useRouter();
  const { settings } = useUserSettings();
  const { feedback, loading, error, generateFeedback } = usePostMealFeedback();
  const [mockMealLog, setMockMealLog] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (isOpen && !hasInitialized) {
      // React.StrictModeの影響を回避するため、AbortControllerを使用
      const abortController = new AbortController();
      
      // 少し遅延を入れて、StrictModeの2回目の呼び出しをキャンセル
      const timeoutId = setTimeout(() => {
        if (!abortController.signal.aborted) {
          generateFeedback(mealType, mealText);
          setHasInitialized(true);
        }
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        abortController.abort();
      };
    }
    
    // モーダルが閉じられたら、次回のためにフラグをリセット
    if (!isOpen && hasInitialized) {
      setHasInitialized(false);
    }
  }, [isOpen, mealType, mealText]); // generateFeedbackとhasInitializedを依存配列から除外

  // フィードバックが取得できたら、MealDetailModal用のMockMealLogを作成
  useEffect(() => {
    if (feedback && !loading && !error) {
      const now = new Date();
      const mockLog = {
        id: `temp-${Date.now()}`,
        mealType,
        text: mealText,
        actualTime: now.toISOString(),
        dateKey: now.toISOString().split('T')[0],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        aiResponse: feedback.response || JSON.stringify(feedback), // フィードバックデータをaiResponseとして設定
      };
      setMockMealLog(mockLog);
    }
  }, [feedback, loading, error, mealType, mealText]);

  // ローディング中や未準備の場合は独自のUIを表示
  if (!isOpen) return null;
  
  if (loading || error || !mockMealLog) {
    return (
      <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* ヘッダー */}
          <div className={`${mealType === 'dinner' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white p-6`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  {mealType === 'dinner' ? '🌙 今日も1日お疲れ様でした' :
                   mealText.includes("【") ? '🍽️ 今日の食事フィードバック' :
                   `🍽️ ${getMealTypeLabel(mealType)}のフィードバック`}
                </h2>
                <p className="text-white/90 text-sm">
                  {mealType === 'dinner' ? '夕食の記録と今日の振り返り' :
                   mealText.includes("【") ? '複数食事の統合分析' :
                   `記録内容: ${mealText.length > 50 ? `${mealText.substring(0, 50)}...` : mealText}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-white/70 text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
            {loading && (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="text-center text-gray-500 text-sm">
                  あなたの体質と今日のコンディションを分析してフィードバックを作成中...
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg mb-4">⚠️ エラー</div>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => generateFeedback(mealType, mealText)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  再試行
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // フィードバックデータが揃ったらMealDetailModalを使用
  return (
    <MealDetailModal
      isOpen={isOpen}
      mealLog={mockMealLog}
      recordedMealType={mealType}
      onClose={() => {
        // 記録後のアクションロジック（元のPostMealFeedbackから移植）
        const mealsPerDay = settings?.mealsPerDay || 3;
        
        if (mealType === 'breakfast') {
          // 朝食後：2食なら夕食へ、3食なら昼食へ
          const nextMeal = mealsPerDay === 2 ? 'dinner' : 'lunch';
          router.push(`/record/meal?type=${nextMeal}`);
        } else if (mealType === 'lunch') {
          // 昼食後：夕食へ
          router.push('/record/meal?type=dinner');
        } else if (mealType === 'dinner') {
          // 夕食後：ホーム画面へ
          router.push('/home');
        } else {
          // 間食後：今日の記録へ
          router.push('/record/meal?tab=history');
        }
        onClose();
      }}
    />
  );
}

const getMealTypeLabel = (type: MealType): string => {
  const labels = {
    breakfast: "朝食",
    lunch: "昼食", 
    dinner: "夕食",
    snack: "間食",
  };
  return labels[type];
};