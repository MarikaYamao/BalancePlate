"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { AIFeedbackDisplay } from "./AIFeedbackDisplay";
import { FoodSuggestionDisplay } from "./FoodSuggestionDisplay";
import { conditionTagsInfo } from "@/lib/constants/conditionTags";
import type { ConditionTag } from "@/types";

interface PostConditionFeedbackProps {
  conditionTags: ConditionTag[];
  freeMemo?: string;
  dateKey: string;
  onClose: () => void;
}

interface FoodSuggestion {
  characteristics: string[];
  recommendations: {
    category: string;
    items: string[];
  }[];
  avoid?: string[];
}

export function PostConditionFeedback({
  conditionTags,
  freeMemo,
  dateKey,
  onClose,
}: PostConditionFeedbackProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [foodSuggestions, setFoodSuggestions] = useState<FoodSuggestion | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateFeedback();
  }, []);

  const generateFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/condition-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateKey,
          conditionTags,
          note: freeMemo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
        setFoodSuggestions(data.foodSuggestions);

        // フィードバックを保存
        localStorage.setItem(
          `condition-feedback-${dateKey}`,
          JSON.stringify({
            feedback: data.feedback,
            foodSuggestions: data.foodSuggestions,
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

        {/* 推奨食事 */}
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
