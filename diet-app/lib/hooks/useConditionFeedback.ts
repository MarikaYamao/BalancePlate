import { useState, useCallback } from "react";
import type { ConditionTag } from "@/types";

interface FoodSuggestion {
  characteristics: string[];
  recommendations: {
    category: string;
    items: string[];
  }[];
  avoid?: string[];
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

interface ConditionFeedbackParams {
  dateKey: string;
  conditionTags: ConditionTag[];
  note?: string;
}

interface UseConditionFeedbackResult {
  feedback: string | null;
  foodSuggestions: FoodSuggestion | null;
  mealPlans: { [key: string]: MealPlan } | null;
  isLoading: boolean;
  error: string | null;
  generateFeedback: (params: ConditionFeedbackParams) => Promise<void>;
}

export function useConditionFeedback(): UseConditionFeedbackResult {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [foodSuggestions, setFoodSuggestions] = useState<FoodSuggestion | null>(null);
  const [mealPlans, setMealPlans] = useState<{ [key: string]: MealPlan } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFeedback = useCallback(async (params: ConditionFeedbackParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/condition-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateKey: params.dateKey,
          conditionTags: params.conditionTags,
          note: params.note,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
        setFoodSuggestions(data.foodSuggestions);
        setMealPlans(data.mealPlans);

        // フィードバックを保存
        localStorage.setItem(
          `condition-feedback-${params.dateKey}`,
          JSON.stringify({
            feedback: data.feedback,
            foodSuggestions: data.foodSuggestions,
            mealPlans: data.mealPlans,
            timestamp: new Date().toISOString(),
          }),
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          details: errorData.details
        });
        throw new Error(errorData.error || `フィードバックの生成に失敗しました (${response.status})`);
      }
    } catch (err) {
      console.error("フィードバック生成エラー:", err);
      setError(
        err instanceof Error ? err.message : "予期せぬエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    feedback,
    foodSuggestions,
    mealPlans,
    isLoading,
    error,
    generateFeedback,
  };
}