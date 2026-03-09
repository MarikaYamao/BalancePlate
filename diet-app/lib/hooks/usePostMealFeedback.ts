import { useState, useCallback } from "react";
import { MEAL_TYPE_LABELS } from "@/lib/constants/mealTypes";
import { type MealType } from "@/types";

interface FeedbackData {
  response: string;
  requestType: string;
  timestamp: string;
}

interface UsePostMealFeedbackResult {
  feedback: FeedbackData | null;
  loading: boolean;
  error: string | null;
  generateFeedback: (mealType: MealType, mealText: string) => Promise<void>;
}

export function usePostMealFeedback(): UsePostMealFeedbackResult {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateFeedback = useCallback(
    async (mealType: MealType, mealText: string) => {
      try {
        setLoading(true);
        setError(null);

        // ユーザー設定とコンディションの取得
        const { userSettingsRepository, dailyStateRepository } =
          await import("@/lib/db/repositories");
        const { getDateKey } = await import("@/lib/utils/dateUtils");

        // 設定とコンディションを取得
        let settings = await userSettingsRepository.get();

        // 設定が存在しない場合はデフォルト値を作成
        if (!settings) {
          const defaultSettings = {
            dayResetTime: "04:00",
            mealsPerDay: 3 as const,
            bodyConstitution: [],
            lifestyle: [],
            onboardingCompleted: false,
          };
          settings = await userSettingsRepository.save(defaultSettings);
        }

        const dateKey = getDateKey(new Date(), settings.dayResetTime);
        const dailyState = await dailyStateRepository.get(dateKey);

        // 今日の食事データ取得（スキップ記録も含む）
        const { mealLogRepository } = await import("@/lib/db/repositories");
        const todayMeals = await mealLogRepository.getByDate(dateKey);

        // 前日のデータ取得
        const getPreviousDateKey = (currentDateKey: string): string => {
          const currentDate = new Date(currentDateKey);
          currentDate.setDate(currentDate.getDate() - 1);
          return currentDate.toISOString().split("T")[0];
        };

        const previousDateKey = getPreviousDateKey(dateKey);
        const previousMeals =
          await mealLogRepository.getByDate(previousDateKey);

        // リクエストタイプを決定
        const requestType =
          mealType === "breakfast"
            ? "after_breakfast"
            : mealType === "lunch"
              ? "after_lunch"
              : "consultation"; // 夕食や間食は一般的な相談として扱う

        // 今日の食事データを整形（現在記録した食事も含む）
        const todayMealData = [
          ...todayMeals.map((meal) => ({
            type: meal.mealType,
            content: meal.text,
          })),
          // 現在記録した食事を追加
          {
            type: mealType,
            content: mealText,
          },
        ];

        // AIにリクエスト送信
        // 現在時刻を追加
        const currentTime = new Date();

        const requestBody = {
          userProfile: {
            age: settings.profile?.birthYear
              ? new Date().getFullYear() - settings.profile.birthYear
              : undefined,
            height: settings.profile?.height,
            currentWeight: settings.profile?.currentWeight,
            activityLevel: settings.profile?.activityLevel,
            bodyConstitution: settings.bodyConstitution,
            lifestyle: settings.lifestyle,
            mealsPerDay: settings.mealsPerDay,
            additionalNotes: settings.additionalNotes,
          },
          todayCondition: {
            conditionTags: dailyState?.conditionTags || [],
            freeMemo: dailyState?.freeMemo || "",
          },
          previousDayData: {
            meals: previousMeals.map((meal) => ({
              type: meal.mealType,
              content: meal.text,
            })),
          },
          todayMeals: todayMealData, // 今日の食事データ（現在の食事を含む）
          currentTime: currentTime.toISOString(), // 現在時刻を追加
          requestType,
        };

        const response = await fetch("/api/ai/consultation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "一時的にアクセスが集中しています。しばらく待ってから再試行してください。",
            );
          }
          throw new Error("フィードバックの取得に失敗しました");
        }

        const data = await response.json();
        console.log("generateFeedback", data);
        setFeedback(data);

        // AI相談データをローカルストレージに保存（履歴で表示するため）
        try {
          const { consultationStorage } =
            await import("@/lib/ai/consultationStorage");
          const dateKey = getDateKey(new Date(), settings!.dayResetTime);
          const currentTime = new Date();
          const consultations = consultationStorage.getByDateKey(dateKey);

          // 複数食事の場合は各食事に対してフィードバックを関連付け
          if (mealText.includes("【")) {
            // 複数食事の統合フィードバックの場合
            const bulkSavedMeals = (window as any).bulkSavedMeals;
            const mealSections = mealText
              .split("\n\n")
              .filter((section) => section.includes("【"));

            mealSections.forEach((section, index) => {
              // 日本語文字に対応したパターンに修正
              const mealTypeMatch = section.match(/【([^】]+)】/);

              if (mealTypeMatch) {
                const sectionMealLabel = mealTypeMatch[1]; // 朝食、昼食、夕食

                // 日本語ラベルを英語のMealTypeに変換
                // MEAL_TYPE_LABELSの逆引き辞書を作成
                const reverseMealTypeLabels = Object.entries(MEAL_TYPE_LABELS).reduce(
                  (acc, [key, value]) => {
                    acc[value] = key;
                    return acc;
                  },
                  {} as Record<string, string>,
                );
                const sectionMealType =
                  reverseMealTypeLabels[sectionMealLabel] || sectionMealLabel;

                // 実際に保存された食事記録のタイムスタンプを使用
                let actualTimestamp = currentTime.toISOString();
                if (
                  bulkSavedMeals &&
                  bulkSavedMeals[index] &&
                  bulkSavedMeals[index].actualTime
                ) {
                  // actualTimeがDate型の場合とISO文字列の場合に対応
                  const mealActualTime = bulkSavedMeals[index].actualTime;
                  actualTimestamp =
                    mealActualTime instanceof Date
                      ? mealActualTime.toISOString()
                      : new Date(mealActualTime).toISOString();
                }

                const consultationData = {
                  timestamp: actualTimestamp,
                  mealType: sectionMealType,
                  mealText: section,
                  response: data.response || null,
                  requestType,
                  isIntegratedFeedback: true,
                  dateKey,
                };

                // 統合フィードバックとして保存
                consultationStorage.save(dateKey, consultationData);
              }
            });

            // グローバル変数をクリーンアップ
            delete (window as any).bulkSavedMeals;
          } else {
            // 単一食事の場合
            const consultationData = {
              timestamp: currentTime.toISOString(),
              mealType,
              mealText,
              response: data.response || null,
              requestType,
              dateKey,
            };
            consultationStorage.save(dateKey, consultationData);
          }
        } catch (storageError) {
          console.warn("Failed to save consultation data:", storageError);
        }
      } catch (err) {
        console.error("Feedback generation failed:", err);
        setError(
          err instanceof Error ? err.message : "予期せぬエラーが発生しました",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    feedback,
    loading,
    error,
    generateFeedback,
  };
}
