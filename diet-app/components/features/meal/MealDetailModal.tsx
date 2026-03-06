"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MealLog, AIConsultationResponse } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { getMealTimeRange } from "@/lib/utils/mealUtils";

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

  const formatStructuredFeedback = (data: any): React.ReactNode => {
    return (
      <div className="space-y-6">
        {/* 今日のガイドライン（主役） */}
        {data.todayGuideline && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600">🎯</span>
              <h4 className="text-base font-semibold text-gray-900">
                今日のガイドライン
              </h4>
            </div>
            <p className="text-gray-900 font-medium text-base leading-relaxed">
              {data.todayGuideline}
            </p>
          </div>
        )}

        {/* 総合フィードバック（最大2行） */}
        {data.feedback?.overall && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600">🤖</span>
              <h4 className="text-base font-semibold text-gray-900">
                総合フィードバック
              </h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {data.feedback.overall}
            </p>
            <div className="mt-3 border-t border-gray-100"></div>
          </div>
        )}

        {/* 改善提案（最大2つ） */}
        {data.feedback?.suggestions && data.feedback.suggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-600">💡</span>
              <h4 className="text-base font-semibold text-gray-900">
                改善提案
              </h4>
            </div>
            <ul className="space-y-1">
              {data.feedback.suggestions
                .slice(0, 2)
                .map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
            </ul>
            <div className="mt-3 border-t border-gray-100"></div>
          </div>
        )}

        {/* 意識したい栄養素（チップ形式） */}
        {data.nutritionAdvice?.focus &&
          data.nutritionAdvice.focus.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">🍽</span>
                <h4 className="text-base font-semibold text-gray-900">
                  意識したい栄養素
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.nutritionAdvice.focus.map(
                  (nutrient: string, index: number) => {
                    // 栄養素名を抽出（「鉄分」「タンパク質」など）
                    const cleanNutrient = nutrient
                      .replace(/[：:].*/g, "")
                      .trim();
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full"
                      >
                        {cleanNutrient}
                      </span>
                    );
                  },
                )}
              </div>
            </div>
          )}

        {/* 控えめにしたいもの */}
        {data.nutritionAdvice?.avoid &&
          data.nutritionAdvice.avoid.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-600">⚠️</span>
                <h4 className="text-base font-semibold text-gray-900">
                  控えめに
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.nutritionAdvice.avoid.map(
                  (item: string, index: number) => {
                    const cleanItem = item.replace(/[：:].*/g, "").trim();
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-orange-700 bg-orange-50 rounded-full"
                      >
                        {cleanItem}
                      </span>
                    );
                  },
                )}
              </div>
            </div>
          )}

        {/* 水分補給 */}
        {data.nutritionAdvice?.hydration && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600">💧</span>
              <h4 className="text-base font-semibold text-gray-900">
                水分補給
              </h4>
            </div>
            <p className="text-sm text-gray-600">
              {data.nutritionAdvice.hydration}
            </p>
          </div>
        )}

        {/* 食事提案 */}
        {data.mealSuggestions && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-purple-600">🍽️</span>
              <h4 className="text-base font-semibold text-gray-900">
                おすすめメニュー
              </h4>
            </div>
            <div className="space-y-3">
              {Object.entries(data.mealSuggestions)
                .filter(([suggestionMealType]) => {
                  // recordedMealTypeが指定されている場合のフィルタリング（フィードバック表示時）
                  if (recordedMealType) {
                    // 夕食記録後は食事プラン提案を表示しない
                    if (recordedMealType === 'dinner') return false;
                    
                    // 朝食記録後は朝食プランを表示しない
                    if (recordedMealType === 'breakfast' && suggestionMealType === 'breakfast') return false;
                    
                    // 昼食記録後は朝食・昼食プランを表示しない  
                    if (recordedMealType === 'lunch' && (suggestionMealType === 'breakfast' || suggestionMealType === 'lunch')) return false;
                  }
                  
                  // 時間ベースのフィルタリング: 時間帯を過ぎた食事のプランは表示しない
                  const currentHour = new Date().getHours();
                  const { end } = getMealTimeRange(suggestionMealType as any);
                  
                  // リセット時間を考慮（4:00と仮定）
                  let adjustedHour = currentHour;
                  if (currentHour >= 0 && currentHour < 4) {
                    adjustedHour = currentHour + 24;
                  }
                  
                  // 食事の時間帯を過ぎている場合は除外
                  if (adjustedHour > end) {
                    return false;
                  }
                  
                  return true;
                })
                .map(([mealType, suggestions]: [string, any]) => {
                  const mealTypeLabels: Record<string, string> = {
                    breakfast: "朝食",
                    lunch: "昼食",
                    dinner: "夕食",
                    snack: "間食",
                    tomorrow: "明日に向けて",
                  };
                  const mealLabel = mealTypeLabels[mealType] || mealType;
                  
                  // 明日に向けてのアドバイス
                  if (mealType === 'tomorrow' && suggestions.focus) {
                    return (
                      <div key={mealType} className="bg-gray-50 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-gray-800 mb-2">
                          🌅 {mealLabel}
                        </h5>
                        <div className="text-sm text-gray-600">
                          {suggestions.focus && <p>重視点: {suggestions.focus}</p>}
                          {suggestions.timing && <p>タイミング: {suggestions.timing}</p>}
                        </div>
                      </div>
                    );
                  }
                  
                  // A/B/Cプラン形式の場合
                  if (suggestions.planA || suggestions.planB || suggestions.planC) {
                    return (
                      <div key={mealType} className="bg-teal-50 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-teal-800 mb-2">
                          🍴 {mealLabel}の提案
                        </h5>
                        <div className="space-y-2">
                          {suggestions.planA && (
                            <div className="bg-white p-2 rounded border border-teal-200">
                              <div className="flex items-start gap-2">
                                <span className="bg-teal-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">A</span>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-teal-900">{suggestions.planA.title}</div>
                                  <div className="text-xs text-gray-700 mt-0.5">{suggestions.planA.menu}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{suggestions.planA.description}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          {suggestions.planB && (
                            <div className="bg-white p-2 rounded border border-teal-200">
                              <div className="flex items-start gap-2">
                                <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">B</span>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-teal-900">{suggestions.planB.title}</div>
                                  <div className="text-xs text-gray-700 mt-0.5">{suggestions.planB.menu}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{suggestions.planB.description}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          {suggestions.planC && (
                            <div className="bg-white p-2 rounded border border-teal-200">
                              <div className="flex items-start gap-2">
                                <span className="bg-gray-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">C</span>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-teal-900">{suggestions.planC.title}</div>
                                  <div className="text-xs text-gray-700 mt-0.5">{suggestions.planC.menu}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{suggestions.planC.description}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  // 旧形式のフォールバック（convenience, simpleCooking, normalCooking）
                  return (
                    <div key={mealType} className="bg-gray-50 rounded-lg p-3">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">
                        {mealLabel}
                      </h5>
                      <div className="space-y-1 text-sm text-gray-600">
                        {suggestions.convenience && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>
                              <span className="font-medium">簡単:</span> {suggestions.convenience}
                            </span>
                          </div>
                        )}
                        {suggestions.simpleCooking && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>
                              <span className="font-medium">軽い調理:</span> {suggestions.simpleCooking}
                            </span>
                          </div>
                        )}
                        {suggestions.normalCooking && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>
                              <span className="font-medium">しっかり調理:</span> {suggestions.normalCooking}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    );
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
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                <span className="text-lg">
                  {mealTypeLabels[mealLog.mealType] === "朝食"
                    ? "🌅"
                    : mealTypeLabels[mealLog.mealType] === "昼食"
                      ? "☀️"
                      : mealTypeLabels[mealLog.mealType] === "夕食"
                        ? "🌙"
                        : "🍪"}
                </span>
              </div>
              <div>
                <h2
                  id="meal-modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {mealTypeLabels[mealLog.mealType]}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(mealLog.actualTime).toLocaleString("ja-JP", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="モーダルを閉じる"
            >
              <svg
                className="w-5 h-5"
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
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {mealLog.followedPlan && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-lg font-medium mb-3">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    プラン準拠
                  </span>
                )}
                <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                  {mealLog.text}
                </p>
              </div>
            </div>
          </div>

          {/* AI分析結果 */}
          {mealLog.aiAnalysis && (
            <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">栄養分析</h3>
              {mealLog.aiAnalysis.estimatedNutrients && (
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
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
              {/* AIフィードバック - 再設計版 */}
              <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  AIフィードバック
                </h3>
                {typeof loadedAIResponse === "object" ? (
                  formatStructuredFeedback(loadedAIResponse)
                ) : (
                  // 文字列の場合は簡潔に表示
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {typeof loadedAIResponse === "string" &&
                      loadedAIResponse
                        .split("\n")
                        .slice(0, 5)
                        .map((line, index) => {
                          if (line.trim() === "") return null;
                          return (
                            <p key={index} className="mb-2">
                              {line}
                            </p>
                          );
                        })}
                  </div>
                )}
              </div>
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

  // Portalを使ってbody直下にレンダリング
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}
