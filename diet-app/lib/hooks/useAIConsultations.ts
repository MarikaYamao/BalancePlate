import { useState, useEffect } from 'react';
import { initializeEncryptedDatabase } from '@/lib/db/encryptedDatabase';
import { getTodayKey } from '@/lib/utils/dateUtils';
import type { AIConsultationResponse, AIConsultation } from '@/types';

export function useAIConsultations(resetTime: string = '04:00') {
  const [latestConsultation, setLatestConsultation] = useState<AIConsultationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLatestConsultation();
  }, [resetTime]);

  const loadLatestConsultation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await initializeEncryptedDatabase();
      
      // 今日の最新のAI相談データを取得
      // 実際のDBから取得する場合のロジック（今は仮実装）
      const todayKey = getTodayKey(resetTime);
      
      // TODO: 実際のリポジトリから取得
      // const consultation = await aiConsultationRepository.getLatestByDate(todayKey);
      // setLatestConsultation(consultation?.response || null);
      
      // 現在は仮のデータを返す（実装時に削除）
      setLatestConsultation(null);
      
    } catch (err) {
      console.error('Failed to load AI consultations:', err);
      setError('AI提案の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConsultation = async (response: AIConsultationResponse, context: string) => {
    try {
      await initializeEncryptedDatabase();
      
      const todayKey = getTodayKey(resetTime);
      const consultation: Omit<AIConsultation, 'id' | 'createdAt' | 'updatedAt'> = {
        dateKey: todayKey,
        type: 'condition', // または適切なタイプ
        request: { context },
        response,
        // TODO: 実際のリクエスト情報を含める
      };
      
      // TODO: 実際のリポジトリに保存
      // await aiConsultationRepository.create(consultation);
      
      // 最新データを更新
      setLatestConsultation(response);
      
    } catch (err) {
      console.error('Failed to save consultation:', err);
      throw err;
    }
  };

  return {
    latestConsultation,
    isLoading,
    error,
    saveConsultation,
    refetch: loadLatestConsultation
  };
}

// AI相談データをリアルタイムで監視するためのユーティリティ
export function useMealSuggestions(
  unrecordedMealTypes: string[],
  resetTime: string = '04:00'
) {
  const { latestConsultation, isLoading } = useAIConsultations(resetTime);
  const [suggestions, setSuggestions] = useState<AIConsultationResponse | null>(null);

  useEffect(() => {
    if (!latestConsultation || unrecordedMealTypes.length === 0) {
      setSuggestions(null);
      return;
    }

    // 未記録の食事に対応する提案があるかチェック
    const hasRelevantSuggestions = unrecordedMealTypes.some(mealType => 
      latestConsultation.mealPlans[mealType as keyof typeof latestConsultation.mealPlans]
    );

    if (hasRelevantSuggestions) {
      setSuggestions(latestConsultation);
    } else {
      setSuggestions(null);
    }
  }, [latestConsultation, unrecordedMealTypes]);

  return {
    suggestions,
    isLoading
  };
}