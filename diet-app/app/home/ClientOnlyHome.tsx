"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { ProgressHeader } from "@/components/features/home/ProgressHeader";
import { MainActionArea } from "@/components/features/home/MainActionArea";
import { UnifiedMealFeedbackModal } from "@/components/features/meal/UnifiedMealFeedbackModal";
import { ConditionModal } from "@/components/features/condition/ConditionModal";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { useMealLogs } from "@/lib/hooks/useMealLogs";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EncryptedDailyStateRepository } from "@/lib/db/repositories/encryptedDailyStateRepository";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { mealLogRepository } from "@/lib/db/repositories";
import { initializeEncryptedDatabase } from "@/lib/db/encryptedDatabase";
import {
  detectMissedMeals,
  shouldShowBulkInput,
  getRecordedMealTypes,
  getActualUnrecordedMeals,
} from "@/lib/utils/mealUtils";
import type { MealType, MealLog, ConditionTag, MealPlanDetail } from "@/types";

export default function ClientOnlyHome() {
  const { settings, isLoading, error } = useUserSettings();
  const resetTime = settings?.dayResetTime || "04:00";
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);

  // リアルタイムで食事記録を監視
  const { mealLogs: realTimeMealLogs } = useMealLogs();
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [missedMeals, setMissedMeals] = useState<MealType[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [unrecordedMealTypes, setUnrecordedMealTypes] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState<{
    mealType: MealType;
    mealText: string;
  } | null>(null);
  const [hasCondition, setHasCondition] = useState<boolean | null>(null); // nullで初期化（ローディング中）
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // AI提案のフック（LocalStorageから取得）
  const [suggestions, setSuggestions] = useState<any>(null);

  // AI提案を読み込む関数（LocalStorage → IndexedDB の順で最新のフィードバックを取得）
  const loadAISuggestions = async () => {
    try {
      // 今日の日付キーを取得
      const { getDateKey, getTodayKey } = await import("@/lib/utils/dateUtils");
      const { consultationStorage } =
        await import("@/lib/ai/consultationStorage");
      const { EncryptedDailyStateRepository } =
        await import("@/lib/db/repositories/encryptedDailyStateRepository");
      const dateKey = getDateKey(new Date(), resetTime);
      const todayKey = getTodayKey(resetTime);

      // 1. まずLocalStorageから今日のAI相談データを取得
      let consultations = consultationStorage.getByDateKey(dateKey);

      if (consultations.length > 0) {
        // responseが実際にあるデータを探す（isConditionFeedbackなど）
        const consultationWithResponse = consultations.find(
          (c: any) => c.response && c.response !== null
        );
        
        const latestConsultation = consultationWithResponse || consultations[consultations.length - 1];
        console.log("latestConsultation", latestConsultation);

        if (latestConsultation && latestConsultation.response) {
          try {
            // レスポンスをパース
            const parsedResponse =
              typeof latestConsultation.response === "string"
                ? JSON.parse(latestConsultation.response)
                : latestConsultation.response;

            // mealSuggestionsがある場合、MealSuggestions用の形式に変換
            if (parsedResponse.mealSuggestions) {
              const convertedMealPlans: any = {};

              Object.entries(parsedResponse.mealSuggestions).forEach(
                ([mealType, suggestions]: [string, any]) => {
                  // 未記録の食事のみ表示
                  if (unrecordedMealTypes.includes(mealType)) {
                    // 3プラン形式の場合はplanAを使用
                    if (suggestions.planA) {
                      convertedMealPlans[mealType] = {
                        menu: suggestions.planA.menu
                          .split("、")
                          .filter((item: string) => item.trim()),
                        reason:
                          suggestions.planA.description ||
                          suggestions.planA.title,
                        preparation:
                          suggestions.planA.preparation || "簡単調理",
                        canMakeNow:
                          suggestions.planA.canMakeNow !== undefined
                            ? suggestions.planA.canMakeNow
                            : true,
                        alternatives: suggestions.planB
                          ? [suggestions.planB.menu.split("、")[0]]
                          : [],
                        availableIngredients:
                          suggestions.planA.availableIngredients,
                        missingIngredients:
                          suggestions.planA.missingIngredients,
                      };
                    } else if (
                      typeof suggestions === "object" &&
                      suggestions.menu
                    ) {
                      // 直接フォーマットの場合
                      convertedMealPlans[mealType] = {
                        menu: Array.isArray(suggestions.menu)
                          ? suggestions.menu
                          : suggestions.menu
                              .split("、")
                              .filter((item: string) => item.trim()),
                        reason: suggestions.reason || suggestions.description,
                        preparation: suggestions.preparation || "簡単調理",
                        canMakeNow:
                          suggestions.canMakeNow !== undefined
                            ? suggestions.canMakeNow
                            : true,
                        alternatives: suggestions.alternatives || [],
                        availableIngredients: suggestions.availableIngredients,
                        missingIngredients: suggestions.missingIngredients,
                      };
                    } else if (typeof suggestions === "object") {
                      // convenience/simpleCooking/normalCooking形式の場合
                      // 3つのプランをチェックして、存在するものを採用
                      let selectedPlan = null;
                      let preparationType = "選択してください";

                      // 優先順位: normalCooking > simpleCooking > convenience
                      if (suggestions.normalCooking) {
                        selectedPlan = suggestions.normalCooking;
                        preparationType = "通常調理";
                      } else if (suggestions.simpleCooking) {
                        selectedPlan = suggestions.simpleCooking;
                        preparationType = "簡単調理";
                      } else if (suggestions.convenience) {
                        selectedPlan = suggestions.convenience;
                        preparationType = "コンビニ";
                      }

                      if (selectedPlan) {
                        convertedMealPlans[mealType] = {
                          menu: selectedPlan
                            .split("、")
                            .filter((item: string) => item.trim()),
                          reason:
                            parsedResponse.adjustmentRule ||
                            parsedResponse.todayGuideline ||
                            "今日のコンディションに合わせた提案",
                          preparation: preparationType,
                          canMakeNow: true,
                          alternatives: [],
                        };
                      }
                    }
                  }
                },
              );

              const suggestion = {
                feedback: {
                  overall:
                    parsedResponse.todayGuideline ||
                    parsedResponse.feedback?.overall ||
                    "",
                  encouragement: parsedResponse.feedback?.encouragement || "",
                },
                mealPlans: convertedMealPlans,
                nutritionAdvice: parsedResponse.nutritionAdvice,
              };

              setSuggestions(suggestion);
              return;
            }
          } catch (error) {
            console.error("AI提案データの解析エラー:", error);
          }
        }
      }

      // 2. LocalStorageになければ、過去のLocalStorageから最新のものを探す
      if (consultations.length === 0) {
        try {
          // 最新のAI提案を取得（日付に関係なく）
          const latestConsultation = consultationStorage.getLatest();
          if (latestConsultation) {
            consultations = [latestConsultation];
          }
        } catch (dbError) {
          console.error("最新AIデータ取得エラー:", dbError);
        }
      }

      // 3. 再度consultationsをチェック（IndexedDBから取得された可能性があるため）
      if (consultations.length > 0) {
        // responseが実際にあるデータを探す
        const consultationWithResponse = consultations.find(
          (c: any) => c.response && c.response !== null
        );
        
        const latestConsultation = consultationWithResponse || consultations[consultations.length - 1];

        if (latestConsultation && latestConsultation.response) {
          try {
            const parsedResponse =
              typeof latestConsultation.response === "string"
                ? JSON.parse(latestConsultation.response)
                : latestConsultation.response;

            if (parsedResponse.mealSuggestions) {
              const convertedMealPlans: any = {};

              Object.entries(parsedResponse.mealSuggestions).forEach(
                ([mealType, suggestions]: [string, any]) => {
                  if (unrecordedMealTypes.includes(mealType)) {
                    // 変換処理（既存と同じ）
                    if (suggestions.planA) {
                      convertedMealPlans[mealType] = {
                        menu: suggestions.planA.menu
                          .split("、")
                          .filter((item: string) => item.trim()),
                        reason:
                          suggestions.planA.description ||
                          suggestions.planA.title,
                        preparation:
                          suggestions.planA.preparation || "簡単調理",
                        canMakeNow:
                          suggestions.planA.canMakeNow !== undefined
                            ? suggestions.planA.canMakeNow
                            : true,
                        alternatives: suggestions.planB
                          ? [suggestions.planB.menu.split("、")[0]]
                          : [],
                        availableIngredients:
                          suggestions.planA.availableIngredients,
                        missingIngredients:
                          suggestions.planA.missingIngredients,
                      };
                    } else if (
                      typeof suggestions === "object" &&
                      suggestions.menu
                    ) {
                      convertedMealPlans[mealType] = {
                        menu: Array.isArray(suggestions.menu)
                          ? suggestions.menu
                          : suggestions.menu
                              .split("、")
                              .filter((item: string) => item.trim()),
                        reason: suggestions.reason || suggestions.description,
                        preparation: suggestions.preparation || "簡単調理",
                        canMakeNow:
                          suggestions.canMakeNow !== undefined
                            ? suggestions.canMakeNow
                            : true,
                        alternatives: suggestions.alternatives || [],
                        availableIngredients: suggestions.availableIngredients,
                        missingIngredients: suggestions.missingIngredients,
                      };
                    } else if (typeof suggestions === "object") {
                      const menuText =
                        suggestions.convenience ||
                        suggestions.simpleCooking ||
                        suggestions.normalCooking;
                      if (menuText) {
                        convertedMealPlans[mealType] = {
                          menu: menuText
                            .split("、")
                            .filter((item: string) => item.trim()),
                          reason:
                            parsedResponse.adjustmentRule ||
                            parsedResponse.todayGuideline,
                          preparation: suggestions.convenience
                            ? "コンビニ"
                            : suggestions.simpleCooking
                              ? "簡単調理"
                              : "通常調理",
                          canMakeNow: true,
                          alternatives: [],
                        };
                      }
                    }
                  }
                },
              );

              if (Object.keys(convertedMealPlans).length > 0) {
                const suggestion = {
                  feedback: {
                    overall:
                      parsedResponse.todayGuideline ||
                      parsedResponse.feedback?.overall ||
                      "",
                    encouragement: parsedResponse.feedback?.encouragement || "",
                  },
                  mealPlans: convertedMealPlans,
                  nutritionAdvice: parsedResponse.nutritionAdvice,
                };

                setSuggestions(suggestion);
                return;
              }
            }
          } catch (error) {
            console.error("AI提案データの解析エラー:", error);
          }
        }
      }

      // 4. 最終フォールバック - コンディション登録を促す
      // (フォールバック提案は表示せず、コンディション登録を優先する)

      setSuggestions(null);
    } catch (error) {
      console.error("AI提案データの読み込みエラー:", error);
      setSuggestions(null);
    }
  };

  // 初回読み込みとイベントリスナー
  useEffect(() => {
    loadAISuggestions();

    // カスタムイベントをリッスン
    const handleAIUpdate = () => {
      loadAISuggestions();
      loadMealData(); // 画面全体をリフレッシュ
    };

    window.addEventListener("ai-consultation-updated", handleAIUpdate);

    return () => {
      window.removeEventListener("ai-consultation-updated", handleAIUpdate);
    };
  }, [unrecordedMealTypes]);

  useEffect(() => {
    setMounted(true);
    if (settings) {
      loadMealData();
    }
  }, [settings, resetTime]);

  // リアルタイム食事記録の変更を監視して未記録食事タイプを更新
  useEffect(() => {
    if (realTimeMealLogs && settings?.mealsPerDay) {
      // スキップされた食事も含めて記録済みとして扱う
      // 後の食事が記録されている場合、前の食事は完了扱い
      const recordedTypes = getRecordedMealTypes(realTimeMealLogs);
      const actualUnrecorded = getActualUnrecordedMeals(recordedTypes, settings.mealsPerDay);

      setUnrecordedMealTypes(actualUnrecorded);
    }
  }, [realTimeMealLogs, settings?.mealsPerDay]);

  const loadMealData = async () => {
    setIsLoadingMeals(true);
    try {
      await initializeEncryptedDatabase();
      const todayMeals = await mealLogRepository.getToday(resetTime);
      setMealLogs(todayMeals);

      // コンディション登録状態をチェック
      const repository = new EncryptedDailyStateRepository();
      const todayState = await repository.getToday(resetTime);
      // todayStateがnullまたは未定義の場合の処理
      const hasConditionTags =
        todayState &&
        todayState.conditionTags &&
        todayState.conditionTags.length > 0;

      setHasCondition(hasConditionTags);

      // コンディション未登録の場合はモーダルを表示
      if (!hasConditionTags) {
        setShowConditionModal(true);
      }

      const currentTime = new Date();
      // スキップされた食事も含めて記録済みとして扱う
      const recordedTypes = getRecordedMealTypes(todayMeals);
      const missed = detectMissedMeals(
        currentTime,
        resetTime,
        recordedTypes,
        settings?.mealsPerDay || 3,
      );
      setMissedMeals(missed);

      // ユーザーのmealsPerDay設定に応じた未記録食事を取得
      // 後の食事が記録されている場合、前の食事は完了扱い
      const actualUnrecorded = getActualUnrecordedMeals(
        recordedTypes, 
        settings?.mealsPerDay || 3
      );
      setUnrecordedMealTypes(actualUnrecorded);

      // 食事設定に応じてバルク入力のしきい値を調整
      const bulkInputThreshold = settings?.mealsPerDay === 2 ? 2 : 2; // 2食でも3食でも2つ以上未記録で表示
      setShowBulkInput(
        shouldShowBulkInput(
          currentTime,
          resetTime,
          recordedTypes,
          bulkInputThreshold,
          settings?.mealsPerDay || 3,
        ),
      );
    } catch (error) {
      console.error("Failed to load meal data:", error);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  const handleBulkMealSubmit = async (meals: Record<MealType, string>) => {
    try {
      const mealEntries = Object.entries(meals).filter(([_, content]) =>
        content.trim(),
      );

      // 食事記録を保存し、保存されたデータを取得
      const promises = mealEntries.map(([mealType, content]) =>
        mealLogRepository.save(
          {
            mealType: mealType as MealType,
            text: content,
          },
          resetTime,
        ),
      );

      const savedMeals = await Promise.all(promises);
      await loadMealData(); // リロードしてUI更新
      setShowBulkInput(false);

      // 複数食事の統合フィードバックを表示（売りポイント）
      if (mealEntries.length > 0) {
        // 保存された食事データを使用してタイムスタンプを正確に取得
        const combinedMealText = mealEntries
          .map(([mealType, content]) => {
            const mealLabels = {
              breakfast: "朝食",
              lunch: "昼食",
              dinner: "夕食",
              snack: "間食",
            };
            return `【${mealLabels[mealType as MealType]}】${content}`;
          })
          .join("\n\n");

        // 代表として最後の食事タイプを使用（表示用）
        const [lastMealType] = mealEntries[mealEntries.length - 1];

        // 保存された食事データをフィードバックコンポーネントに渡すため、グローバルに保存
        (window as any).bulkSavedMeals = savedMeals;

        setShowFeedback({
          mealType: lastMealType as MealType,
          mealText: combinedMealText,
        });
      }
    } catch (error) {
      console.error("Failed to save bulk meals:", error);
    }
  };

  const handleBulkInputCancel = () => {
    setShowBulkInput(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" message="読み込み中..." />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen p-4">
          <ErrorMessage
            message="データの読み込みに失敗しました"
            onRetry={() => window.location.reload()}
          />
        </div>
      </MainLayout>
    );
  }

  // 今日の進捗状況を計算（2食/3食設定に対応）
  // スキップも含めて記録済みとして扱う
  const mealsPerDay = settings?.mealsPerDay || 3;
  const expectedMeals = mealsPerDay === 2 ? 2 : 3; // 2食設定なら朝夕、3食設定なら朝昼夕
  const recordedTypes = getRecordedMealTypes(mealLogs); // スキップも含む
  const recordedCount = recordedTypes.length;
  const todayProgress = {
    total: expectedMeals,
    completed: recordedCount,
    percentage: Math.round((recordedCount / expectedMeals) * 100),
  };

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* ヘッダー部分 - より魅力的に */}
        <ProgressHeader
          mealsPerDay={mealsPerDay}
          todayProgress={todayProgress}
        />

        {/* メインコンテンツ */}
        <main className="px-4 pb-6 -mt-2">
          <MainActionArea
            showBulkInput={showBulkInput}
            isLoadingMeals={isLoadingMeals}
            suggestions={suggestions}
            unrecordedMealTypes={unrecordedMealTypes}
            missedMeals={missedMeals}
            mealLogs={mealLogs}
            todayProgress={todayProgress}
            resetTime={resetTime}
            onBulkMealSubmit={handleBulkMealSubmit}
            onBulkInputCancel={handleBulkInputCancel}
          />
        </main>

        {/* 食後フィードバックモーダル */}
        {showFeedback && (
          <UnifiedMealFeedbackModal
            isOpen={true}
            mealType={showFeedback.mealType}
            mealText={showFeedback.mealText}
            onClose={() => setShowFeedback(null)}
          />
        )}

        {/* コンディション登録モーダル */}
        <ConditionModal
          isOpen={showConditionModal}
          onClose={undefined} // 強制モーダル（閉じるボタンなし）
          resetTime={resetTime}
          onSave={() => {
            setShowConditionModal(false);
            setHasCondition(true);
            // AI提案はConditionModal内で自動実行され、
            // カスタムイベント経由で画面が更新される
          }}
        />
      </div>
    </MainLayout>
  );
}
