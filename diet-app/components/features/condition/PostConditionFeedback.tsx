"use client";

import { useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { AIFeedbackDisplay } from "./AIFeedbackDisplay";
import { FoodSuggestionDisplay } from "./FoodSuggestionDisplay";
import { conditionTagsInfo } from "@/lib/constants/conditionTags";
import { useConditionFeedback } from "@/lib/hooks/useConditionFeedback";
import type { ConditionTag } from "@/types";

interface PostConditionFeedbackProps {
  conditionTags: ConditionTag[];
  freeMemo?: string;
  dateKey: string;
  onClose: () => void;
}

export function PostConditionFeedback({
  conditionTags,
  freeMemo,
  dateKey,
  onClose,
}: PostConditionFeedbackProps) {
  const { feedback, foodSuggestions, mealPlans, isLoading, error, generateFeedback } = useConditionFeedback();

  useEffect(() => {
    generateFeedback({ dateKey, conditionTags, note: freeMemo });
  }, [dateKey, conditionTags, freeMemo, generateFeedback]);

  const getConditionSummary = () => {
    const tags = conditionTags || [];
    const tagLabels = tags
      .map((tagId) => {
        const tagInfo = conditionTagsInfo.find((t) => t.id === tagId);
        return tagInfo?.label || "";
      })
      .filter(Boolean);
    return tagLabels;
  };

  const tagLabels = getConditionSummary();

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="lg">
      <div className="space-y-4">
        {/* ヘッダー */}
        <div className="text-center">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-xl font-bold text-gray-800">
            コンディションを記録しました
          </h2>
        </div>

        {/* 記録内容サマリー */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {tagLabels.map((label, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm shadow-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* AIからのアドバイス */}
        <AIFeedbackDisplay 
          feedback={feedback} 
          isLoading={isLoading} 
        />

        {/* 3プラン形式の食事提案 */}
        {mealPlans && Object.keys(mealPlans).length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🍽️</span>
              <h3 className="font-medium text-teal-800">今日の食事プラン（3プラン）</h3>
            </div>
            {Object.entries(mealPlans).map(([mealType, plans]) => {
              const mealTypeLabel = mealType === 'breakfast' ? '朝食' : 
                                   mealType === 'lunch' ? '昼食' : 
                                   mealType === 'dinner' ? '夕食' : 
                                   mealType;
              return (
                <div key={mealType} className="bg-teal-50 border-l-4 border-teal-400 p-4 rounded">
                  <h4 className="font-semibold text-teal-800 mb-3">🍴 {mealTypeLabel}の提案</h4>
                  <div className="grid gap-3">
                    {/* Plan A */}
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-teal-600 text-white px-2 py-0.5 rounded text-xs font-bold">A</span>
                            <span className="font-semibold text-teal-900">{plans.planA.title}</span>
                          </div>
                          <p className="text-teal-800 text-sm mb-1">{plans.planA.menu}</p>
                          <p className="text-teal-600 text-xs">{plans.planA.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Plan B */}
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold">B</span>
                            <span className="font-semibold text-teal-900">{plans.planB.title}</span>
                          </div>
                          <p className="text-teal-800 text-sm mb-1">{plans.planB.menu}</p>
                          <p className="text-teal-600 text-xs">{plans.planB.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Plan C */}
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-gray-500 text-white px-2 py-0.5 rounded text-xs font-bold">C</span>
                            <span className="font-semibold text-teal-900">{plans.planC.title}</span>
                          </div>
                          <p className="text-teal-800 text-sm mb-1">{plans.planC.menu}</p>
                          <p className="text-teal-600 text-xs">{plans.planC.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 推奨食材（詳細） */}
        <FoodSuggestionDisplay foodSuggestions={foodSuggestions} />

        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              window.location.href = "/record/meal";
            }}
            className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            食事を記録する
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </Modal>
  );
}
