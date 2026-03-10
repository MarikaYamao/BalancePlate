"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type MealType } from "@/types";
import { MealTextInput } from "@/components/features/meal/MealTextInput";
import { MealHistory } from "@/components/features/meal/MealHistory";
import { UnifiedMealFeedbackModal } from "@/components/features/meal/UnifiedMealFeedbackModal";
import { MealDetailModal } from "@/components/features/meal/MealDetailModal";
import { getDateKey } from "@/lib/utils/dateUtils";
import { useMealLogs } from "@/lib/hooks/useMealLogs";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { useAppStore } from "@/lib/stores/useAppStore";
import {
  getRecordedMealTypes,
  getActualUnrecordedMeals,
} from "@/lib/utils/mealUtils";

function MealRecordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<MealType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [editingMeal, setEditingMeal] = useState<{
    id: string;
    type: MealType;
    text: string;
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState<{
    mealType: MealType;
    mealText: string;
  } | null>(null);
  const [showMealDetail, setShowMealDetail] = useState<{
    meal: any;
    aiResponse?: any;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Zustand store
  const {
    tempMealText: mealText,
    setTempMealText: setMealText,
    clearTempMealText,
  } = useAppStore();

  // TanStack Query hooks
  const { settings, isLoading: settingsLoading } = useUserSettings();
  const resetTime = settings?.dayResetTime || "04:00";
  const mealsPerDay = settings?.mealsPerDay || 3;
  const [todayKey, setTodayKey] = useState("");

  const {
    mealLogs,
    isLoading: mealsLoading,
    createMealLog,
    updateMealLog,
    deleteMealLog,
    isCreating,
    isUpdating,
    isDeleting,
  } = useMealLogs(todayKey);

  // 実際に記録されたタイプ + 暗黙的に完了とみなすタイプ
  const actualRecordedTypes = getRecordedMealTypes(mealLogs);
  const loading = settingsLoading || mealsLoading || !mounted;
  const saving = isCreating || isUpdating;

  // クライアントサイドでのみ日付を初期化
  useEffect(() => {
    setMounted(true);
    setTodayKey(getDateKey(new Date(), resetTime));
  }, [resetTime]);

  // 未入力の食事タイプを自動選択
  useEffect(() => {
    if (!mounted || mealsLoading || editingMeal) {
      return;
    }

    // URLパラメータでタイプが指定されている場合はスキップ
    const typeParam = searchParams.get("type");
    if (typeParam) {
      return;
    }

    // 既に選択されている場合はスキップ
    if (selectedType) {
      return;
    }

    // 新しいロジックで実際に記録が必要な食事タイプを取得
    const actualUnrecorded = getActualUnrecordedMeals(
      actualRecordedTypes,
      mealsPerDay,
    );

    // 間食も選択肢に含める
    const allUnrecorded = [...actualUnrecorded, "snack"].filter(
      (type) => !actualRecordedTypes.includes(type as MealType),
    );

    // 未記録の最初の食事タイプを選択
    const nextMealType = allUnrecorded[0];
    if (nextMealType) {
      setSelectedType(nextMealType as MealType);
    }
  }, [
    mounted,
    mealsLoading,
    actualRecordedTypes,
    mealsPerDay,
    editingMeal,
    searchParams,
    // selectedTypeは依存配列から除外（無限ループ防止）
  ]);

  // URLパラメータからの初期化
  useEffect(() => {
    const typeParam = searchParams.get("type") as MealType | null;
    const suggestionParam = searchParams.get("suggestion");
    const editParam = searchParams.get("edit");
    const tabParam = searchParams.get("tab");

    if (
      typeParam &&
      ["breakfast", "lunch", "dinner", "snack"].includes(typeParam) &&
      typeParam !== selectedType // 同じ値の場合は更新しない
    ) {
      setSelectedType(typeParam);
    }

    if (suggestionParam && suggestionParam !== mealText) {
      setMealText(suggestionParam);
    }

    if (editParam && mealLogs) {
      const mealToEdit = mealLogs.find((m) => m.id === editParam);
      if (mealToEdit && !editingMeal) {
        // 編集中でない場合のみ
        handleEdit(mealToEdit);
      }
    }

    if (tabParam === "history" && !showHistory) {
      setShowHistory(true);
    }
  }, [
    searchParams,
    mealLogs,
    selectedType,
    mealText,
    editingMeal,
    showHistory,
  ]);

  useEffect(() => {
    // クリーンアップ: コンポーネントアンマウント時に一時テキストをクリア
    return () => {
      if (mealText && !editingMeal) {
        // 編集中でない場合のみクリア
        clearTempMealText();
      }
    };
  }, []);

  const handleSave = () => {
    if (!selectedType && !editingMeal) {
      setError("食事タイプを選択してください");
      return;
    }

    if (!mealText.trim()) {
      setError("食事内容を入力してください");
      return;
    }

    setError(null);

    if (editingMeal) {
      // 編集モード
      updateMealLog(
        { id: editingMeal.id, updates: { text: mealText.trim() } },
        {
          onSuccess: () => {
            setSuccessMessage("食事記録を更新しました！");
            setEditingMeal(null);
            clearTempMealText();
            setSelectedType(null);
          },
          onError: () => {
            setError("食事記録の更新に失敗しました");
          },
        },
      );
    } else {
      // 新規作成モード
      createMealLog(
        {
          dateKey: todayKey,
          mealType: selectedType!,
          text: mealText.trim(),
          actualTime: new Date(),
        },
        {
          onSuccess: () => {
            setSuccessMessage("食事記録を保存しました！");

            // すべての食事でフィードバックを表示（売りポイントなので）
            setShowFeedback({
              mealType: selectedType!,
              mealText: mealText.trim(),
            });

            // フォームをリセット
            clearTempMealText();
            setSelectedType(null);
          },
          onError: () => {
            setError("食事記録の保存に失敗しました");
          },
        },
      );
    }
  };

  const handleReset = () => {
    setSelectedType(null);
    clearTempMealText();
    setError(null);
    setSuccessMessage(null);
    setEditingMeal(null);
  };

  const handleEdit = (meal: any) => {
    setEditingMeal({ id: meal.id, type: meal.mealType, text: meal.text });
    setSelectedType(meal.mealType);
    setMealText(meal.text);
    setShowHistory(false);
    setSuccessMessage(null);
    setError(null);
  };

  // 成功メッセージの自動消去
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // 食事タイプのラベルとアイコン
  const mealTypeInfo = {
    breakfast: {
      label: "朝食",
      icon: "🌅",
      color: "from-yellow-100 to-orange-100",
    },
    lunch: { label: "昼食", icon: "☀️", color: "from-blue-100 to-cyan-100" },
    dinner: { label: "夕食", icon: "🌙", color: "from-purple-100 to-pink-100" },
    snack: { label: "間食", icon: "🍪", color: "from-gray-100 to-gray-100" },
  };

  const todayMealCount = mealLogs.length;

  const onClickBack = () => {
    if (editingMeal) {
      // 編集モードまたは入力中の場合は、状態をリセット
      setEditingMeal(null);
      setSelectedType(null);
      clearTempMealText();
      setError(null);
      setSuccessMessage(null);
    } else {
      // 何も編集していない場合はホームに戻る
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4">
        {/* シンプルなヘッダー */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClickBack}
              className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1.5 text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {editingMeal ? "キャンセル" : "戻る"}
            </button>

            <span className="text-xs text-gray-500">
              今日 {todayMealCount}食
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {editingMeal ? "食事を編集" : "食事を記録"}
          </h1>
        </div>

        {/* エラー・成功メッセージ */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-lg">
            {successMessage}
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="space-y-6">
          {/* 食事タイプ選択 - セグメントコントロール */}
          {!editingMeal && (
            <div className="flex gap-2 p-1">
              {["breakfast", "lunch", "dinner", "snack"]
                .filter((type) => !(mealsPerDay === 2 && type === "lunch"))
                .map((type) => {
                  const info = mealTypeInfo[type as keyof typeof mealTypeInfo];
                  const isActuallyRecorded = mealLogs.some(
                    (m) => m.mealType === type,
                  );
                  // 削除後は暗黙的完了扱いにしない
                  const isImplicitlyCompleted = false;
                  const isSelected = selectedType === type;

                  return (
                    <button
                      key={type}
                      onClick={() => {
                        // クリック時に最新のmealLogsから記録済みかを確認
                        const currentlyRecorded = mealLogs.some(
                          (m) => m.mealType === type,
                        );

                        if (currentlyRecorded) {
                          // 実際に記録済みの場合は編集モードに
                          const existingMeal = mealLogs.find(
                            (m) => m.mealType === type,
                          );
                          if (existingMeal) {
                            handleEdit(existingMeal);
                          }
                        } else {
                          // 未記録の場合は通常の選択
                          setSelectedType(isSelected ? null : (type as any));
                        }
                      }}
                      className={`
                        flex-1 py-2.5 px-2 rounded-lg font-medium text-sm transition-all
                        ${
                          isSelected
                            ? "bg-teal-600 text-white"
                            : isActuallyRecorded
                              ? "text-green-600 bg-green-50 hover:bg-green-100"
                              : "text-gray-700 bg-gray-100 hover:bg-white"
                        }
                      `}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-base">{info.icon}</span>
                        <span>{info.label}</span>
                        {isActuallyRecorded && (
                          <span className="text-xs text-green-600">✓</span>
                        )}
                        {isImplicitlyCompleted && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          )}

          {/* 入力フィールド - 主役 */}
          {(selectedType || editingMeal) && (
            <div className="space-y-4">
              {editingMeal && (
                <div className="inline-flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                  <span>✏️</span>
                  <span>編集中</span>
                </div>
              )}

              <MealTextInput
                value={mealText}
                onChange={setMealText}
                disabled={saving}
                placeholder="例: 玄米ご飯、鮭の塩焼き、味噌汁"
              />
            </div>
          )}

          {/* CTAボタン - 下部固定 */}
          {(selectedType || editingMeal) && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
              <div className="max-w-xl mx-auto space-y-3">
                <button
                  onClick={handleSave}
                  disabled={
                    saving ||
                    !mealText.trim() ||
                    (!selectedType && !editingMeal)
                  }
                  className={`
                    w-full py-4 px-6 rounded-2xl font-medium transition-all
                    ${
                      !mealText.trim() || (!selectedType && !editingMeal)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : saving
                          ? "bg-gray-300 text-gray-500 cursor-wait"
                          : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                    }
                  `}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      保存中...
                    </span>
                  ) : editingMeal ? (
                    "更新する"
                  ) : (
                    "この内容で記録する"
                  )}
                </button>

                <div className="flex items-center justify-center gap-6">
                  {editingMeal && (
                    <button
                      onClick={handleReset}
                      disabled={saving}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 今日の一覧表示 */}
          {!editingMeal && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                今日の食事
              </h2>
              <MealHistory
                dateKey={todayKey}
                mealLogs={mealLogs}
                onEdit={handleEdit}
                onDelete={(meal) => {
                  // TanStack QueryのdeleteMealLogを使用
                  deleteMealLog(meal.id, {
                    onSuccess: () => {
                      // 削除後に編集モードをクリア
                      setEditingMeal(null);
                      setSelectedType(null);
                      clearTempMealText();
                    },
                  });
                }}
                isDeleting={isDeleting}
              />
            </div>
          )}
        </div>
      </div>

      {/* 食後フィードバックモーダル */}
      {showFeedback && (
        <UnifiedMealFeedbackModal
          isOpen={true}
          mealType={showFeedback.mealType}
          mealText={showFeedback.mealText}
          onClose={() => {
            setShowFeedback(null);
            // 朝食・昼食の場合は次の食事記録へ遷移、夕食・間食の場合は履歴を表示
            if (
              showFeedback.mealType === "breakfast" ||
              (showFeedback.mealType === "lunch" && mealsPerDay === 3)
            ) {
              // 次の食事タイプを決定（2食設定の場合は朝食→夕食）
              const nextMealType =
                showFeedback.mealType === "breakfast"
                  ? mealsPerDay === 2
                    ? "dinner"
                    : "lunch"
                  : "dinner";
              // 次の食事が記録されていない場合のみ遷移
              if (!actualRecordedTypes.includes(nextMealType as MealType)) {
                setSelectedType(nextMealType as MealType);
                setShowHistory(false);
              } else {
                // すでに記録されている場合は履歴を表示
                setShowHistory(true);
              }
            } else {
              // 夕食・間食の場合は履歴を表示
              setShowHistory(true);
            }
          }}
        />
      )}

      {/* 食事詳細モーダル */}
      {showMealDetail && (
        <MealDetailModal
          isOpen={true}
          mealLog={showMealDetail.meal}
          onClose={() => setShowMealDetail(null)}
        />
      )}
    </div>
  );
}

export default function MealRecordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-green-50 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <MealRecordPageContent />
    </Suspense>
  );
}
