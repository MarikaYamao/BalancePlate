import { useState, useCallback } from 'react';
import { useAvailableFridgeItems } from './useFridgeItems';
import { useUserSettings } from './useUserSettings';
import type { ShoppingSuggestionRequest, ShoppingSuggestionResponse } from '@/types';

export function useShoppingSuggestions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ShoppingSuggestionResponse | null>(null);

  const { data: fridgeItems } = useAvailableFridgeItems();
  const { settings } = useUserSettings();

  const generateSuggestions = useCallback(async ({
    targetDays = 7,
    requestType = 'weekly_planning'
  }: {
    targetDays?: number;
    requestType?: 'weekly_planning' | 'specific_meal' | 'nutritional_gap';
  } = {}) => {
    if (!settings) {
      throw new Error('User settings not loaded');
    }

    setIsLoading(true);
    setError(null);

    try {
      // 冷蔵庫食材情報を準備
      const fridgeItemsData = fridgeItems?.map(item => ({
        name: item.name,
        category: item.category,
        available: item.available
      })) || [];

      const requestBody: ShoppingSuggestionRequest = {
        userProfile: {
          bodyConstitution: settings.bodyConstitution || [],
          lifestyle: settings.lifestyle || [],
          favoriteFoods: settings.favoriteFoods || [],
          dislikedFoods: settings.dislikedFoods || [],
          mealsPerDay: settings.mealsPerDay || 3,
          additionalNotes: settings.additionalNotes || '',
          goalMode: settings.goalMode,
          constraints: settings.constraints || []
        },
        fridgeItems: fridgeItemsData,
        requestType,
        targetDays
      };

      const response = await fetch('/api/shopping/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      const suggestionsData = result.suggestions;

      setSuggestions(suggestionsData);
      return suggestionsData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Shopping suggestions error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fridgeItems, settings]);

  const clearSuggestions = useCallback(() => {
    setSuggestions(null);
    setError(null);
  }, []);

  return {
    generateSuggestions,
    clearSuggestions,
    suggestions,
    isLoading,
    error,
    hasValidSettings: !!settings
  };
}