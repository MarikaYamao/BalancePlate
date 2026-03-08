"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layouts/MainLayout";
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
import { TodayConditionSection } from "@/components/features/diary/TodayConditionSection";
import { QuickActionsSection } from "@/components/features/diary/QuickActionsSection";
import { HistoryTabControl } from "@/components/features/diary/HistoryTabControl";
import { MealHistoryList } from "@/components/features/diary/MealHistoryList";
import { getDateKey } from "@/lib/utils/dateUtils";
import type { MealLog, DailyState, WeightLog } from "@/types";

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
      const dateKey = getDateKey(today, resetTime);
      setTodayDateKey(dateKey);
    }
  }, [settings, resetTime]);

  // 履歴データの読み込み
  useEffect(() => {
    if (settings && todayDateKey) {
      loadHistoryData();
    }
  }, [settings, todayDateKey, daysToShow]);


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

        const dateKey = getDateKey(targetDate, resetTime);

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
      const { consultationStorage } = require("@/lib/ai/consultationStorage");
      const consultations = consultationStorage.getByDateKey(meal.dateKey);

      if (consultations.length > 0) {
        // 統合フィードバックがある場合はそれを優先
        const integratedFeedback = consultationStorage.findIntegrated(
          meal.dateKey,
        );
        if (integratedFeedback) {
          mealWithFeedback.aiResponse = integratedFeedback.response;
        } else {
          // 個別フィードバックがある場合
          const individualFeedback = consultationStorage.findNearestByTimestamp(
            meal.dateKey,
            new Date(meal.actualTime).getTime(),
            4,
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

  const handleConditionClick = (dailyState: DailyState, dateKey: string) => {
    setSelectedCondition({ dailyState, dateKey });
    setIsConditionModalOpen(true);
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

        <TodayConditionSection todayCondition={todayCondition || null} />

        <QuickActionsSection />

        <HistoryTabControl
          historyTab={historyTab}
          setHistoryTab={setHistoryTab}
          daysToShow={daysToShow}
          setDaysToShow={setDaysToShow}
        />

        {historyTab === "meals" ? (
          <MealHistoryList
            historyData={historyData}
            todayDateKey={todayDateKey}
            getIntegratedFeedback={getIntegratedFeedback}
            checkStoredFeedback={checkStoredFeedback}
            handleMealClick={handleMealClick}
            onConditionClick={handleConditionClick}
          />
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
