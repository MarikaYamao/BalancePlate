import { useState, useCallback } from 'react';
import { useAvailableFridgeItems } from './useFridgeItems';
import { useUserSettings } from './useUserSettings';
import { getTodayKey } from '@/lib/utils/dateUtils';
import type { ConditionTag, GoalMode, ConstraintType } from '@/types';

// Phase19: 食材を考慮したAI提案フック
export function useEnhancedAISuggestions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { data: fridgeItems, isLoading: fridgeLoading } = useAvailableFridgeItems();
  const { settings } = useUserSettings();

  const generateSuggestionsWithFridge = useCallback(async ({
    conditionTags,
    freeMemo = '',
    resetTime = '04:00'
  }: {
    conditionTags: ConditionTag[];
    freeMemo?: string;
    resetTime?: string;
  }) => {
    if (!settings) {
      throw new Error('User settings not loaded');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Phase19: 冷蔵庫食材情報を準備
      const fridgeItemsData = fridgeItems?.map(item => ({
        name: item.name,
        category: item.category,
        available: item.available
      })) || [];

      console.log('🥬 冷蔵庫食材情報:', fridgeItemsData);

      // AI提案APIリクエスト用のデータを構築
      const requestBody = {
        userProfile: {
          bodyConstitution: settings.bodyConstitution || [],
          lifestyle: settings.lifestyle || [],
          favoriteFoods: settings.favoriteFoods || [],
          dislikedFoods: settings.dislikedFoods || [],
          mealsPerDay: settings.mealsPerDay || 3,
          additionalNotes: settings.additionalNotes || '',
          // Phase21: 新しいゴール設定
          goalMode: settings.goalMode,
          constraints: settings.constraints
        },
        goals: settings.profile ? {
          goalType: settings.profile.goalType || 'health_improvement',
          targetWeight: settings.profile.targetWeight,
        } : undefined,
        todayCondition: {
          conditionTags,
          freeMemo,
        },
        requestType: 'morning_plan' as const,
        // Phase19: 冷蔵庫食材情報を追加
        fridgeItems: fridgeItemsData
      };

      console.log('📤 AI提案リクエスト:', requestBody);

      // APIリクエスト実行
      const response = await fetch('/api/ai/consultation', {
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
      
      // レスポンスのパースとバリデーション
      let parsedResponse;
      try {
        // JSON形式の応答をパース
        if (typeof result.response === 'string') {
          // レスポンスがJSON文字列として返される場合
          const cleanedResponse = result.response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          parsedResponse = JSON.parse(cleanedResponse);
        } else {
          parsedResponse = result.response;
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('Raw response:', result.response);
        
        // パースエラーの場合はフォールバック応答を生成
        parsedResponse = generateFallbackResponse(conditionTags, fridgeItemsData);
      }

      // Phase19: 食材情報を追加でメタデータに含める
      const enhancedResponse = {
        ...parsedResponse,
        metadata: {
          ...parsedResponse.metadata,
          fridgeItemsUsed: fridgeItemsData.filter(item => item.available).length,
          generatedAt: new Date().toISOString(),
        }
      };

      // LocalStorageに保存（既存のパターンに合わせる）
      const todayKey = getTodayKey(resetTime);
      const dateKey = todayKey;
      
      const { consultationStorage } = await import("@/lib/ai/consultationStorage");
      const consultationData = {
        timestamp: new Date().toISOString(),
        dateKey,
        type: 'morning_plan',
        request: requestBody,
        response: enhancedResponse,
        includesFridgeItems: fridgeItemsData.length > 0
      };
      consultationStorage.save(dateKey, consultationData);
      consultationStorage.saveLatest(enhancedResponse);

      // カスタムイベントを発行してUIを更新
      window.dispatchEvent(new CustomEvent('ai-consultation-updated'));

      return enhancedResponse;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Enhanced AI suggestions error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fridgeItems, settings]);

  return {
    generateSuggestionsWithFridge,
    isLoading: isLoading || fridgeLoading,
    error,
    hasAvailableIngredients: fridgeItems && fridgeItems.length > 0
  };
}

// フォールバック応答生成関数
function generateFallbackResponse(conditionTags: ConditionTag[], fridgeItems: any[]) {
  const availableItems = fridgeItems.filter(item => item.available);
  const hasIngredients = availableItems.length > 0;

  return {
    todayGuideline: hasIngredients 
      ? `手持ち食材（${availableItems.map(i => i.name).slice(0, 3).join('、')}など）を活用した食事プランを提案します`
      : "体調に合わせたバランスの良い食事を心がけましょう",
    mealSuggestions: {
      breakfast: {
        convenience: hasIngredients ? `${availableItems[0]?.name || '卵'}を使った朝食` : "バランス朝食",
        simpleCooking: hasIngredients ? `${availableItems[0]?.name || '卵'}料理` : "簡単朝食",
        normalCooking: hasIngredients ? `${availableItems.slice(0,2).map(i => i.name).join('と') || '卵'}の和食` : "しっかり朝食"
      },
      lunch: {
        convenience: "コンビニ弁当",
        simpleCooking: "簡単パスタ",
        normalCooking: "定食"
      },
      dinner: {
        convenience: "コンビニ惣菜",
        simpleCooking: "炒め物",
        normalCooking: "和定食"
      }
    },
    avoidToday: [],
    adjustmentRule: hasIngredients 
      ? "手持ち食材を優先的に使用します" 
      : "バランスの良い食事を心がけます",
    feedback: {
      overall: "今日も健康的な食事を楽しみましょう",
      positive: ["コンディションを記録しました"],
      suggestions: hasIngredients ? ["手持ち食材を活用しましょう"] : ["バランス良く食べましょう"],
      encouragement: "今日も一日頑張りましょう！"
    },
    mealPlans: {
      breakfast: {
        menu: hasIngredients 
          ? [`${availableItems[0]?.name || '卵'}料理`, "ご飯", "味噌汁"]
          : ["和定食", "ご飯", "味噌汁"],
        preparation: "簡単" as const,
        alternatives: ["パン", "シリアル"],
        reason: hasIngredients ? "手持ち食材を活用" : "栄養バランス重視",
        calories: 400,
        timing: "8:00頃",
        // Phase19: 食材利用可能性情報
        availableIngredients: hasIngredients ? availableItems.map(i => i.name) : [],
        missingIngredients: hasIngredients ? [] : ["卵", "米", "味噌"],
        canMakeNow: hasIngredients
      }
    },
    nutritionAdvice: {
      focus: ["タンパク質", "ビタミン"],
      avoid: ["過度な塩分"],
      hydration: "十分な水分補給を"
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      conditionTags,
      context: 'morning' as const,
      fridgeItemsUsed: availableItems.length,
      fallback: true
    }
  };
}