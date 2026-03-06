import { useState, useCallback } from "react";

interface AIConsultationParams {
  userProfile?: any;
  todayCondition?: any;
  previousDayData?: any;
  todayMeals?: any[];
  requestType: string;
  consultationText?: string;
  fridgeItems?: any[];
}

interface AIConsultationResult {
  response: string;
  requestType: string;
  timestamp: string;
}

interface UseAIConsultationResult {
  data: AIConsultationResult | null;
  isLoading: boolean;
  error: string | null;
  sendConsultation: (params: AIConsultationParams) => Promise<AIConsultationResult>;
}

export function useAIConsultation(): UseAIConsultationResult {
  const [data, setData] = useState<AIConsultationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendConsultation = useCallback(async (params: AIConsultationParams): Promise<AIConsultationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
        return result;
      } else {
        if (response.status === 429) {
          throw new Error(
            "一時的にアクセスが集中しています。しばらく待ってから再試行してください。",
          );
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `AI相談に失敗しました (${response.status})`);
      }
    } catch (err) {
      console.error("AI consultation failed:", err);
      const errorMessage = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    sendConsultation,
  };
}