"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MealLog } from "@/types";
import { useRouter } from "next/navigation";
import { MealDetailHeader } from "./MealDetailHeader";
import { MealContentSection } from "./MealContentSection";
import { MealAnalysisSection } from "./MealAnalysisSection";
import { AIFeedbackSection } from "./AIFeedbackSection";
import { Button } from "@/components/ui/Button";

interface MealDetailModalProps {
  isOpen: boolean;
  mealLog: MealLog | null;
  recordedMealType?: string; // 現在記録した食事のタイプ（フィードバック表示制御用）
  onClose: () => void;
}

export function MealDetailModal({
  isOpen,
  mealLog,
  recordedMealType,
  onClose,
}: MealDetailModalProps) {
  const router = useRouter();
  const [loadedAIResponse, setLoadedAIResponse] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // AI相談データを読み込む
  useEffect(() => {
    if (isOpen && mealLog) {
      // mealLog.aiResponseがある場合はそれを優先的に使用
      if ((mealLog as any).aiResponse) {
        const response = (mealLog as any).aiResponse;
        let processedResponse: string | null = null;

        // 文字列の場合
        if (typeof response === "string") {
          // JSON文字列かどうかを判定
          const isJsonString =
            response.trim().startsWith("{") && response.trim().endsWith("}");

          if (isJsonString) {
            // JSONをパースして構造化されたフィードバックに変換
            try {
              let parsed = JSON.parse(response);

              // 二重エンコードのチェック
              if (typeof parsed === "string" && parsed.trim().startsWith("{")) {
                try {
                  parsed = JSON.parse(parsed);
                } catch {
                  // 二度目のパース失敗
                }
              }

              // 構造化データの場合
              if (
                typeof parsed === "object" &&
                (parsed.feedback ||
                  parsed.nutritionAdvice ||
                  parsed.mealSuggestions ||
                  parsed.todayGuideline)
              ) {
                setLoadedAIResponse(parsed);
                return;
              } else {
                // 構造化されていないJSON
                processedResponse = response;
              }
            } catch {
              // パースエラーの場合はそのまま使用
              processedResponse = response;
            }
          } else {
            // JSONでない通常のテキスト
            processedResponse = response;
          }
        }
        // オブジェクトの場合
        else if (typeof response === "object" && response !== null) {
          if (
            response.feedback ||
            response.nutritionAdvice ||
            response.mealSuggestions ||
            response.todayGuideline
          ) {
            setLoadedAIResponse(response);
            return;
          } else {
            processedResponse = JSON.stringify(response, null, 2);
          }
        }
        // その他
        else {
          processedResponse = String(response);
        }

        setLoadedAIResponse(processedResponse);
      } else {
        // aiResponseがない場合のみローカルストレージから読み込み
        loadAIConsultation();
      }
    }
  }, [isOpen, mealLog]);

  const loadAIConsultation = async () => {
    if (!mealLog) return;

    setLoadingAI(true);
    try {
      // TODO: 実際のAI相談データを取得するAPIを実装
      // 現在はローカルストレージからフォールバックとして検索
      const storedConsultations = localStorage.getItem(
        `ai-consultation-${mealLog.dateKey}`,
      );
      if (storedConsultations) {
        const parsedData = JSON.parse(storedConsultations);
        // データが配列かどうかを確認し、配列でなければ配列にラップ
        const consultations = Array.isArray(parsedData)
          ? parsedData
          : [parsedData];

        // 食事時刻に最も近いコンサルテーションを選択
        const relevantConsultation = consultations.find(
          (c: any) =>
            c &&
            c.timestamp &&
            Math.abs(
              new Date(c.timestamp).getTime() -
                new Date(mealLog.actualTime).getTime(),
            ) <
              4 * 60 * 60 * 1000, // 4時間以内
        );
        if (relevantConsultation && relevantConsultation.response) {
          let responseText = "";

          try {
            // まずJSONとしてパースを試行（文字列の場合）
            const parsed =
              typeof relevantConsultation.response === "string"
                ? JSON.parse(relevantConsultation.response)
                : relevantConsultation.response;

            // 構造化されたフィードバックかどうかをチェック
            if (
              parsed.feedback ||
              parsed.nutritionAdvice ||
              parsed.mealSuggestions ||
              parsed.todayGuideline
            ) {
              setLoadedAIResponse(parsed);
              return;
            } else {
              // 構造化されていない場合は文字列として扱う
              responseText =
                typeof relevantConsultation.response === "string"
                  ? relevantConsultation.response
                  : JSON.stringify(relevantConsultation.response, null, 2);
            }
          } catch {
            // JSONパースに失敗した場合、通常のテキストとして扱う
            responseText =
              typeof relevantConsultation.response === "string"
                ? relevantConsultation.response
                : JSON.stringify(relevantConsultation.response, null, 2);
          }

          setLoadedAIResponse(responseText);
        }
      }
    } catch (error) {
      console.error("Failed to load AI consultation:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mealLog) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-gray-900/30 flex items-start justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="meal-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <div className="p-6 pt-8">
          <MealDetailHeader mealLog={mealLog} onClose={onClose} />
          <MealContentSection mealLog={mealLog} />
          <MealAnalysisSection mealLog={mealLog} />
          <AIFeedbackSection
            loadingAI={loadingAI}
            loadedAIResponse={loadedAIResponse}
            recordedMealType={recordedMealType}
          />
          <Button onClick={onClose} variant="outline" className="flex-1 w-full">
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );

  // Portalを使ってbody直下にレンダリング
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}
