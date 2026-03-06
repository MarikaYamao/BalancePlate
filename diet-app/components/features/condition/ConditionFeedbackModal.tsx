"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { AIFeedbackDisplay } from "./AIFeedbackDisplay";
import { FoodSuggestionDisplay } from "./FoodSuggestionDisplay";
import { conditionTagsInfo } from "@/lib/constants/conditionTags";
import type { DailyState, ConditionTag } from "@/types";

interface ConditionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyState: DailyState;
  dateKey: string;
}

interface MealPlan {
  planA: {
    title: string;
    menu: string;
    description: string;
  };
  planB: {
    title: string;
    menu: string;
    description: string;
  };
  planC: {
    title: string;
    menu: string;
    description: string;
  };
}

export function ConditionFeedbackModal({
  isOpen,
  onClose,
  dailyState,
  dateKey,
}: ConditionFeedbackModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [foodSuggestions, setFoodSuggestions] = useState<any | null>(null);
  const [mealPlans, setMealPlans] = useState<{ [key: string]: MealPlan } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dailyState) {
      loadStoredFeedback();
    }
  }, [isOpen, dailyState, dateKey]);

  const loadStoredFeedback = () => {
    // ローカルストレージからコンディションフィードバックを取得
    try {
      const storedFeedback = localStorage.getItem(
        `condition-feedback-${dateKey}`,
      );
      if (storedFeedback) {
        const data = JSON.parse(storedFeedback);
        setFeedback(data.feedback);
        setFoodSuggestions(data.foodSuggestions);
        setMealPlans(data.mealPlans);
      } else {
        generateFeedback();
      }
    } catch (error) {
      generateFeedback();
    }
  };

  const generateFeedback = async () => {
    setIsLoading(true);
    try {
      // コンディションタグに基づいてフィードバックを生成
      const response = await fetch("/api/ai/condition-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateKey,
          conditionTags: dailyState.conditionTags,
          note: dailyState.freeMemo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
        setFoodSuggestions(data.foodSuggestions);
        setMealPlans(data.mealPlans);

        // フィードバックを保存
        localStorage.setItem(
          `condition-feedback-${dateKey}`,
          JSON.stringify({
            feedback: data.feedback,
            foodSuggestions: data.foodSuggestions,
            mealPlans: data.mealPlans,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    } catch (error) {
      console.error("フィードバック生成エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConditionSummary = () => {
    const tags = dailyState.conditionTags || [];
    const categories = {
      physical: [] as string[],
      mental: [] as string[],
      other: [] as string[],
    };

    tags.forEach((tagId) => {
      const tagInfo = conditionTagsInfo.find((t) => t.id === tagId);
      if (tagInfo) {
        if (tagInfo.id.includes("tired") || tagInfo.id.includes("sleep")) {
          categories.physical.push(tagInfo.label);
        } else if (
          tagInfo.id.includes("stress") ||
          tagInfo.id.includes("irritable")
        ) {
          categories.mental.push(tagInfo.label);
        } else {
          categories.other.push(tagInfo.label);
        }
      }
    });

    return categories;
  };

  const categories = getConditionSummary();
  const formattedDate = new Date(dateKey).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="コンディション分析"
      size="lg"
    >
      <div className="space-y-4">
        {/* 日付 */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📅</span>
          <span>{formattedDate}</span>
        </div>

        {/* コンディションタグ表示 */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800">
            記録されたコンディション
          </h3>

          {/* 身体的な状態 */}
          {categories.physical.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-1">身体的な状態</div>
              <div className="flex flex-wrap gap-2">
                {categories.physical.map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 精神的な状態 */}
          {categories.mental.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-1">精神的な状態</div>
              <div className="flex flex-wrap gap-2">
                {categories.mental.map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* その他 */}
          {categories.other.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-1">その他</div>
              <div className="flex flex-wrap gap-2">
                {categories.other.map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* メモ */}
        {dailyState.freeMemo && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">📝 メモ</div>
            <div className="text-gray-800 text-sm">{dailyState.freeMemo}</div>
          </div>
        )}

        {/* AIフィードバック */}
        <div className="pt-4 border-t">
          <AIFeedbackDisplay 
            feedback={feedback} 
            isLoading={isLoading}
            onGenerateFeedback={generateFeedback}
          />
        </div>

        {/* 3プラン形式の食事提案（食事記録後と同じ形式） */}
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
      </div>
    </Modal>
  );
}
