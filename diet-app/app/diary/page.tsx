"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MealDetailModal } from "@/components/features/meal/MealDetailModal";
import { ConditionFeedbackModal } from "@/components/features/condition/ConditionFeedbackModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { mealLogRepository, weightLogRepository } from "@/lib/db/repositories";
import { EncryptedDailyStateRepository } from "@/lib/db/repositories/encryptedDailyStateRepository";
import { initializeEncryptedDatabase } from "@/lib/db/encryptedDatabase";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { useDailyState } from "@/lib/hooks/useDailyState";
import { WeightChart } from "@/components/features/weight/WeightChart";
import { conditionTagsInfo } from "@/lib/constants/conditionTags";
import type { MealLog, DailyState, MealType, WeightLog } from "@/types";

interface DayData {
  dateKey: string;
  date: Date;
  meals: MealLog[];
  dailyState?: DailyState;
}

export default function DiaryPage() {
  const router = useRouter();
  const { settings, isLoading: settingsLoading } = useUserSettings();
  const resetTime = settings?.dayResetTime || "04:00";

  // 今日の状態
  const [todayDateKey, setTodayDateKey] = useState("");
  const { dailyState: todayCondition, isLoading: conditionLoading } =
    useDailyState(todayDateKey);

  // 履歴データ
  const [historyData, setHistoryData] = useState<DayData[]>([]);
  const [weightData, setWeightData] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<{
    dailyState: DailyState;
    dateKey: string;
  } | null>(null);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [daysToShow, setDaysToShow] = useState(7);
  const [historyTab, setHistoryTab] = useState<"meals" | "weight">("meals");

  // 今日の日付キーを生成
  useEffect(() => {
    if (settings) {
      const today = new Date();
      const dateKey = generateDateKey(today, resetTime);
      setTodayDateKey(dateKey);
    }
  }, [settings, resetTime]);

  // 履歴データの読み込み
  useEffect(() => {
    if (settings && todayDateKey) {
      loadHistoryData();
    }
  }, [settings, todayDateKey, daysToShow]);

  const generateDateKey = (date: Date, resetTime: string): string => {
    const resetHour = parseInt(resetTime.split(":")[0]);
    const adjustedDate = new Date(date);

    if (date.getHours() < resetHour) {
      adjustedDate.setDate(date.getDate() - 1);
    }

    return adjustedDate.toISOString().split("T")[0];
  };

  const loadHistoryData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await initializeEncryptedDatabase();

      const mealRepository = mealLogRepository;
      const dailyStateRepository = new EncryptedDailyStateRepository();

      // 過去N日分のデータを取得
      const days: DayData[] = [];
      const today = new Date();

      for (let i = 0; i < daysToShow; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - i);

        const dateKey = generateDateKey(targetDate, resetTime);

        // その日の食事記録を取得
        const meals = await mealRepository.getByDate(dateKey);

        // その日のコンディションを取得
        let dailyState: DailyState | undefined;
        try {
          const state = await dailyStateRepository.get(dateKey);
          dailyState = state || undefined;
        } catch (e) {
          // 見つからない場合は無視
        }

        if (meals.length > 0 || dailyState) {
          days.push({
            dateKey,
            date: targetDate,
            meals,
            dailyState,
          });
        }
      }

      // 体重データを取得
      const weights = await weightLogRepository.getRecent(daysToShow);

      setHistoryData(days);
      setWeightData(weights);
    } catch (err) {
      console.error("Failed to load history data:", err);
      setError("履歴データの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMealClick = (meal: MealLog) => {
    // 該当の食事のAIフィードバックを取得
    const mealWithFeedback = { ...meal };

    // ローカルストレージから該当食事のフィードバックを取得
    try {
      const storedConsultations = localStorage.getItem(
        `ai-consultation-${meal.dateKey}`,
      );
      if (storedConsultations) {
        const parsedData = JSON.parse(storedConsultations);

        // データが配列かどうかを確認し、配列でなければ配列にラップ
        const consultations = Array.isArray(parsedData)
          ? parsedData
          : [parsedData];

        // 統合フィードバックがある場合はそれを優先
        const integratedFeedback = consultations.find(
          (c: any) => c && c.isIntegratedFeedback === true,
        );
        if (integratedFeedback) {
          mealWithFeedback.aiResponse = integratedFeedback.response;
        } else {
          // 個別フィードバックがある場合
          const individualFeedback = consultations.find(
            (c: any) =>
              c &&
              !c.isIntegratedFeedback &&
              c.timestamp &&
              Math.abs(
                new Date(c.timestamp).getTime() -
                  new Date(meal.actualTime).getTime(),
              ) <
                4 * 60 * 60 * 1000,
          );
          if (individualFeedback) {
            mealWithFeedback.aiResponse = individualFeedback.response;
          }
        }
      }
    } catch (error) {
      console.error("Error loading AI feedback:", error);
    }

    setSelectedMeal(mealWithFeedback);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  };

  // 統合フィードバックデータの取得
  const getIntegratedFeedback = (dateKey: string): any | null => {
    try {
      const storedConsultations = localStorage.getItem(
        `ai-consultation-${dateKey}`,
      );
      if (!storedConsultations) return null;

      const consultations = JSON.parse(storedConsultations);
      const integratedFeedback = consultations.find(
        (c: any) => c.isIntegratedFeedback === true,
      );
      return integratedFeedback || null;
    } catch (error) {
      return null;
    }
  };

  // AIフィードバック存在確認
  const checkStoredFeedback = (dateKey: string, mealTime: Date): boolean => {
    try {
      const storedConsultations = localStorage.getItem(
        `ai-consultation-${dateKey}`,
      );
      if (!storedConsultations) return false;

      const consultations = JSON.parse(storedConsultations);
      return consultations.some(
        (c: any) =>
          !c.isIntegratedFeedback &&
          Math.abs(
            new Date(c.timestamp).getTime() - new Date(mealTime).getTime(),
          ) <
            4 * 60 * 60 * 1000,
      );
    } catch (error) {
      return false;
    }
  };

  const mealTypeLabels = {
    breakfast: { label: "朝食", icon: "🌅" },
    lunch: { label: "昼食", icon: "☀️" },
    dinner: { label: "夕食", icon: "🌙" },
    snack: { label: "間食", icon: "🍪" },
  };

  // 今日のクイックアクション
  const quickActions = [
    {
      title: "今日の食事を記録する",
      icon: "🍽️",
      path: "/record/meal",
      color: "bg-emerald-100 hover:bg-emerald-200 border-emerald-300",
      textColor: "text-emerald-800",
      iconColor: "bg-emerald-200",
      primary: true,
    },
    {
      title: "体重を記録する",
      icon: "⚖️",
      path: "/record/weight",
      color: "bg-violet-100 hover:bg-violet-200 border-violet-300",
      textColor: "text-violet-800",
      iconColor: "bg-violet-200",
    },
  ];

  if (settingsLoading || isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" message="ダイアリーを読み込み中..." />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen p-4">
          <ErrorMessage message={error} onRetry={loadHistoryData} />
        </div>
      </MainLayout>
    );
  }

  const isToday = (dateKey: string) => dateKey === todayDateKey;

  return (
    <MainLayout>
      <div className="min-h-screen p-4 pb-20">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            📖 ダイアリー
          </h1>
          <p className="text-sm text-gray-600">
            記録と振り返りをひとつの場所で
          </p>
        </div>

        {/* 今日のコンディション（未記録時のみ表示） */}
        {!todayCondition && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg">😊</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      今日のコンディション
                    </h3>
                    <p className="text-sm text-gray-600">
                      体調や気分を記録しませんか？
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/record/condition")}
                  variant="primary"
                  size="small"
                >
                  記録する
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 今日のクイックアクション */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            今日の記録
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => router.push(action.path)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 
                  ${action.color} ${action.textColor}
                  transform hover:scale-[1.03] active:scale-[0.97]
                  flex flex-col items-center gap-3 text-center
                  shadow-sm hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400
                `}
              >
                <div
                  className={`w-12 h-12 ${action.iconColor} rounded-full flex items-center justify-center text-2xl shadow-inner`}
                >
                  {action.icon}
                </div>
                <div className="font-semibold text-sm leading-tight">
                  {action.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 履歴セクション */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">記録履歴</h2>

          {/* タブとコントロール */}
          <div className="space-y-4 mb-4">
            {/* 履歴タブ */}
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-lg p-1 w-full max-w-xs">
                <button
                  onClick={() => setHistoryTab("meals")}
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
                    historyTab === "meals"
                      ? "bg-white text-gray-900 shadow-sm font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🍽️ 食事履歴
                </button>
                <button
                  onClick={() => setHistoryTab("weight")}
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
                    historyTab === "weight"
                      ? "bg-white text-gray-900 shadow-sm font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  ⚖️ 体重推移
                </button>
              </div>
            </div>

            {/* 期間選択 */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-600 font-medium">
                表示期間:
              </span>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { value: 7, label: "7日" },
                  { value: 14, label: "2週間" },
                  { value: 30, label: "1ヶ月" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDaysToShow(option.value)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors font-medium ${
                      daysToShow === option.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 履歴リスト */}
        {historyTab === "meals" ? (
          historyData.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-2">まだ記録がありません</p>
                <p className="text-sm text-gray-500">
                  食事やコンディションを記録すると、ここに履歴が表示されます
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {historyData.map((dayData) => (
                <Card key={dayData.dateKey} className="overflow-hidden">
                  <div className="p-4">
                    {/* 日付ヘッダー */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            isToday(dayData.dateKey)
                              ? "bg-gradient-to-br from-blue-100 to-blue-200"
                              : "bg-gradient-to-br from-gray-100 to-gray-200"
                          }`}
                        >
                          <div className="text-lg font-bold text-gray-800 text-center">
                            {dayData.date.toLocaleDateString("ja-JP", {
                              month: "short",
                              day: "numeric",
                            })}
                            <span className="text-xs text-gray-600 ml-1">
                              (
                              {dayData.date.toLocaleDateString("ja-JP", {
                                weekday: "short",
                              })}
                              )
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isToday(dayData.dateKey) && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              今日
                            </span>
                          )}
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            🍽️ {dayData.meals.length}食事
                          </span>
                          {(() => {
                            const integratedFeedback = getIntegratedFeedback(
                              dayData.dateKey,
                            );
                            return integratedFeedback ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                🤖 AI分析済み
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      {/* 今日からの日数表示 */}
                      {!isToday(dayData.dateKey) &&
                        (() => {
                          const today = new Date();
                          const diffDays = Math.floor(
                            (today.getTime() - dayData.date.getTime()) /
                              (1000 * 60 * 60 * 24),
                          );
                          return diffDays === 1 ? (
                            <span className="text-xs text-gray-500">昨日</span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {diffDays}日前
                            </span>
                          );
                        })()}
                    </div>

                    {/* コンディション */}
                    {dayData.dailyState?.conditionTags &&
                      dayData.dailyState.conditionTags.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-2">
                            コンディション
                          </div>
                          <button
                            onClick={() => {
                              setSelectedCondition({
                                dailyState: dayData.dailyState!,
                                dateKey: dayData.dateKey,
                              });
                              setIsConditionModalOpen(true);
                            }}
                            className="w-full text-left group"
                          >
                            <div className="flex flex-wrap gap-2 p-2 -m-2 rounded-lg transition-colors hover:bg-gray-50">
                              {dayData.dailyState.conditionTags.map((tagId) => {
                                const tagInfo = conditionTagsInfo.find(
                                  (t) => t.id === tagId,
                              );
                              if (!tagInfo) return null;

                              return (
                                <span
                                  key={tagId}
                                  className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs flex items-center gap-1"
                                >
                                  <span>{tagInfo.icon}</span>
                                  <span>{tagInfo.label}</span>
                                </span>
                                );
                              })}
                            </div>
                          </button>
                        </div>
                      )}

                    {/* 統合フィードバック */}
                    {(() => {
                      const integratedFeedback = getIntegratedFeedback(
                        dayData.dateKey,
                      );
                      return integratedFeedback ? (
                        <div className="mb-6">
                          <div className="relative p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-lg">🤖</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-gray-800">
                                    AIによる総合分析
                                  </h3>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                    ✨ おすすめ
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                  今日の食事バランスと体調を総合評価
                                </p>
                              </div>
                            </div>

                            <div className="text-sm text-gray-700 mb-3 pl-13">
                              {integratedFeedback.response?.substring(0, 120) +
                                "..."}
                            </div>

                            <button
                              onClick={() => {
                                if (dayData.meals.length > 0) {
                                  handleMealClick({
                                    ...dayData.meals[0],
                                    aiResponse: integratedFeedback.response,
                                  } as any);
                                }
                              }}
                              className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                              フィードバックを読む 📖
                            </button>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* 食事記録 */}
                    {dayData.meals.length > 0 ? (
                      <div className="space-y-3">
                        {dayData.meals.map((meal) => {
                          const mealInfo = mealTypeLabels[meal.mealType];
                          const hasFeedback =
                            meal.aiAnalysis ||
                            checkStoredFeedback(meal.dateKey, meal.actualTime);

                          return (
                            <button
                              key={meal.id}
                              onClick={() => handleMealClick(meal)}
                              className={`
                              w-full text-left p-3 border rounded-lg transition-colors
                              ${
                                hasFeedback
                                  ? "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300"
                                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                              }
                            `}
                            >
                              <div className="flex items-start gap-3">
                                <div className="text-lg mt-0.5">
                                  {mealInfo.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-gray-800">
                                      {mealInfo.label}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(meal.actualTime).toLocaleString(
                                        "ja-JP",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        },
                                      )}
                                    </span>
                                    {meal.followedPlan && (
                                      <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                        プラン準拠
                                      </span>
                                    )}
                                    {hasFeedback && (
                                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                                        💬 フィードバックあり
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 line-clamp-2">
                                    {meal.text}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        この日は食事の記録がありません
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <WeightChart weightLogs={weightData} daysToShow={daysToShow} />
        )}

        {/* モーダル */}
        <MealDetailModal
          isOpen={isModalOpen}
          mealLog={selectedMeal}
          onClose={handleModalClose}
        />
        
        {/* コンディションフィードバックモーダル */}
        {selectedCondition && (
          <ConditionFeedbackModal
            isOpen={isConditionModalOpen}
            onClose={() => {
              setIsConditionModalOpen(false);
              setSelectedCondition(null);
            }}
            dailyState={selectedCondition.dailyState}
            dateKey={selectedCondition.dateKey}
          />
        )}
      </div>
    </MainLayout>
  );
}
