"use client";

import { useEffect, useState } from "react";
import { MealLog, AIConsultationResponse } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

interface MealDetailModalProps {
  isOpen: boolean;
  mealLog: MealLog | null;
  onClose: () => void;
}

export function MealDetailModal({
  isOpen,
  mealLog,
  onClose,
}: MealDetailModalProps) {
  const router = useRouter();
  const [loadedAIResponse, setLoadedAIResponse] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // AI相談データを読み込む
  useEffect(() => {
    if (isOpen && mealLog) {
      loadAIConsultation();
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
              responseText = formatStructuredFeedback(parsed);
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

  const formatStructuredFeedback = (data: any): string => {
    let result = "";

    // 総合フィードバック
    if (data.feedback?.overall) {
      result += `### 総合フィードバック\n${data.feedback.overall}\n\n`;
    }

    // 今日のガイドライン
    if (data.todayGuideline) {
      result += `### 🎯 今日のガイドライン\n${data.todayGuideline}\n\n`;
    }

    // 良いポイント
    if (data.feedback?.positive && data.feedback.positive.length > 0) {
      result += `#### ✨ 良いポイント\n`;
      data.feedback.positive.forEach((item: string) => {
        result += `- ${item}\n`;
      });
      result += "\n";
    }

    // 改善提案
    if (data.feedback?.suggestions && data.feedback.suggestions.length > 0) {
      result += `#### 💡 改善提案\n`;
      data.feedback.suggestions.forEach((item: string) => {
        result += `- ${item}\n`;
      });
      result += "\n";
    }

    // 栄養アドバイス
    if (data.nutritionAdvice?.focus && data.nutritionAdvice.focus.length > 0) {
      result += `#### 🥗 意識したい栄養素\n`;
      data.nutritionAdvice.focus.forEach((item: string) => {
        result += `- ${item}\n`;
      });
      result += "\n";
    }

    if (data.nutritionAdvice?.avoid && data.nutritionAdvice.avoid.length > 0) {
      result += `#### ⚠️ 控えめにしたいもの\n`;
      data.nutritionAdvice.avoid.forEach((item: string) => {
        result += `- ${item}\n`;
      });
      result += "\n";
    }

    if (data.nutritionAdvice?.hydration) {
      result += `#### 💧 水分補給\n${data.nutritionAdvice.hydration}\n\n`;
    }

    // 食事提案
    if (data.mealSuggestions) {
      result += `### 🍽️ おすすめメニュー\n`;

      const mealTypeNames: Record<string, string> = {
        breakfast: "朝食",
        lunch: "昼食",
        dinner: "夕食",
        snack: "間食",
      };

      Object.entries(data.mealSuggestions).forEach(
        ([mealType, suggestions]: [string, any]) => {
          const mealName = mealTypeNames[mealType] || mealType;
          result += `\n#### ${mealName}\n`;

          if (suggestions.convenience) {
            result += `**簡単:** ${suggestions.convenience}\n`;
          }
          if (suggestions.simpleCooking) {
            result += `**軽い調理:** ${suggestions.simpleCooking}\n`;
          }
          if (suggestions.normalCooking) {
            result += `**しっかり調理:** ${suggestions.normalCooking}\n`;
          }
        },
      );
      result += "\n";
    }

    // 励ましメッセージ
    if (data.feedback?.encouragement) {
      result += `💪 ${data.feedback.encouragement}\n`;
    }

    return result;
  };

  if (!isOpen || !mealLog) return null;

  const handleEdit = () => {
    onClose();
    router.push(`/record/meal?edit=${mealLog.id}`);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const mealTypeLabels = {
    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    snack: "間食",
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/30 flex items-center justify-center p-4 pb-24 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="meal-modal-title"
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <h2
              id="meal-modal-title"
              className="text-xl font-semibold text-gray-800"
            >
              {mealTypeLabels[mealLog.mealType]}の詳細
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="モーダルを閉じる"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 食事内容 */}
          <Card className="p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">
                    {new Date(mealLog.actualTime).toLocaleString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {mealLog.followedPlan && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      プラン準拠
                    </span>
                  )}
                </div>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {mealLog.text}
                </p>
              </div>
            </div>
          </Card>

          {/* AI分析結果 */}
          {mealLog.aiAnalysis && (
            <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">栄養分析</h3>
              {mealLog.aiAnalysis.estimatedNutrients && (
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  {mealLog.aiAnalysis.estimatedNutrients.calories && (
                    <div>
                      カロリー: {mealLog.aiAnalysis.estimatedNutrients.calories}
                      kcal
                    </div>
                  )}
                  {mealLog.aiAnalysis.estimatedNutrients.protein && (
                    <div>
                      タンパク質:{" "}
                      {mealLog.aiAnalysis.estimatedNutrients.protein}g
                    </div>
                  )}
                  {mealLog.aiAnalysis.estimatedNutrients.carbs && (
                    <div>
                      炭水化物: {mealLog.aiAnalysis.estimatedNutrients.carbs}g
                    </div>
                  )}
                  {mealLog.aiAnalysis.estimatedNutrients.fat && (
                    <div>
                      脂質: {mealLog.aiAnalysis.estimatedNutrients.fat}g
                    </div>
                  )}
                </div>
              )}
              {mealLog.aiAnalysis.suggestions &&
                mealLog.aiAnalysis.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      アドバイス
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {mealLog.aiAnalysis.suggestions.map(
                        (suggestion, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
            </Card>
          )}

          {/* AIフィードバック */}
          {loadingAI && (
            <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-sm text-blue-800">
                  AIフィードバックを読み込んでいます...
                </span>
              </div>
            </Card>
          )}
          {loadedAIResponse && (
            <div className="mb-6">
              {/* AIフィードバック */}
              <Card className="p-4 bg-green-50 border-green-200">
                <h3 className="font-medium text-green-900 mb-2">
                  🤖 AIフィードバック
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
                    {loadedAIResponse.split("\n").map((line, index) => {
                      // ### で始まる行（h3見出し）
                      if (line.startsWith("### ")) {
                        return (
                          <h3
                            key={index}
                            className="font-bold text-gray-800 mt-4 mb-2 text-lg"
                          >
                            {line.substring(4)}
                          </h3>
                        );
                      }
                      // #### で始まる行（h4見出し）
                      else if (line.startsWith("#### ")) {
                        return (
                          <h4
                            key={index}
                            className="font-semibold text-gray-700 mt-3 mb-1 text-base"
                          >
                            {line.substring(5)}
                          </h4>
                        );
                      }
                      // **太字**の処理
                      else if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <h4
                            key={index}
                            className="font-bold text-gray-800 mt-4 mb-2 text-base"
                          >
                            {line.replace(/\*\*/g, "")}
                          </h4>
                        );
                      }
                      // - で始まるリストアイテム
                      else if (line.startsWith("- ")) {
                        // リスト内の**太字**も処理
                        const content = line.substring(2);
                        const processedContent = content.replace(
                          /\*\*([^*]+)\*\*/g,
                          "<strong>$1</strong>",
                        );
                        return (
                          <li
                            key={index}
                            className="text-gray-700 mb-1 ml-4 list-none"
                            dangerouslySetInnerHTML={{
                              __html: processedContent,
                            }}
                          />
                        );
                      }
                      // 絵文字付きポイント
                      else if (
                        line.startsWith("✨") ||
                        line.startsWith("🌱") ||
                        line.startsWith("💪") ||
                        line.startsWith("🌙") ||
                        line.startsWith("💡")
                      ) {
                        return (
                          <p
                            key={index}
                            className="text-gray-700 mb-2 font-medium"
                          >
                            {line}
                          </p>
                        );
                      }
                      // 空行は無視
                      else if (line.trim() === "") {
                        return null;
                      }
                      // 通常の文（太字のインライン処理）
                      else {
                        // **text** を <strong>text</strong> に変換
                        const processedLine = line.replace(
                          /\*\*([^*]+)\*\*/g,
                          "<strong>$1</strong>",
                        );
                        return (
                          <p
                            key={index}
                            className="text-gray-700 mb-2"
                            dangerouslySetInnerHTML={{ __html: processedLine }}
                          />
                        );
                      }
                    })}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button onClick={handleEdit} variant="primary" className="flex-1">
              編集する
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
