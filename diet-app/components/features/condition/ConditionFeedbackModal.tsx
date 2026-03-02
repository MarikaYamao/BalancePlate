"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { conditionTagsInfo } from "@/lib/constants/conditionTags";
import type { DailyState, ConditionTag } from "@/types";

interface ConditionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyState: DailyState;
  dateKey: string;
}

export function ConditionFeedbackModal({
  isOpen,
  onClose,
  dailyState,
  dateKey,
}: ConditionFeedbackModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dailyState) {
      loadStoredFeedback();
    }
  }, [isOpen, dailyState, dateKey]);

  const loadStoredFeedback = () => {
    // ローカルストレージからコンディションフィードバックを取得
    try {
      const storedFeedback = localStorage.getItem(
        `condition-feedback-${dateKey}`
      );
      if (storedFeedback) {
        setFeedback(JSON.parse(storedFeedback).feedback);
      } else {
        generateFeedback();
      }
    } catch (error) {
      generateFeedback();
    }
  };

  const generateFeedback = async () => {
    setIsLoading(true);
    try {
      // コンディションタグに基づいてフィードバックを生成
      const response = await fetch("/api/ai/condition-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateKey,
          conditionTags: dailyState.conditionTags,
          note: dailyState.freeMemo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
        
        // フィードバックを保存
        localStorage.setItem(
          `condition-feedback-${dateKey}`,
          JSON.stringify({
            feedback: data.feedback,
            timestamp: new Date().toISOString(),
          })
        );
      }
    } catch (error) {
      console.error("フィードバック生成エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConditionSummary = () => {
    const tags = dailyState.conditionTags || [];
    const categories = {
      physical: [] as string[],
      mental: [] as string[],
      other: [] as string[],
    };

    tags.forEach((tagId) => {
      const tagInfo = conditionTagsInfo.find((t) => t.id === tagId);
      if (tagInfo) {
        if (tagInfo.id.includes("tired") || tagInfo.id.includes("sleep")) {
          categories.physical.push(tagInfo.label);
        } else if (tagInfo.id.includes("stress") || tagInfo.id.includes("irritable")) {
          categories.mental.push(tagInfo.label);
        } else {
          categories.other.push(tagInfo.label);
        }
      }
    });

    return categories;
  };

  const categories = getConditionSummary();
  const formattedDate = new Date(dateKey).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="コンディション分析"
      size="lg"
    >
      <div className="space-y-4">
        {/* 日付 */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📅</span>
          <span>{formattedDate}</span>
        </div>

        {/* コンディションタグ表示 */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800">記録されたコンディション</h3>
          
          {/* 身体的な状態 */}
          {categories.physical.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-1">身体的な状態</div>
              <div className="flex flex-wrap gap-2">
                {categories.physical.map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 精神的な状態 */}
          {categories.mental.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-1">精神的な状態</div>
              <div className="flex flex-wrap gap-2">
                {categories.mental.map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* その他 */}
          {categories.other.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-1">その他</div>
              <div className="flex flex-wrap gap-2">
                {categories.other.map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* メモ */}
        {dailyState.freeMemo && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">📝 メモ</div>
            <div className="text-gray-800 text-sm">{dailyState.freeMemo}</div>
          </div>
        )}

        {/* AIフィードバック */}
        <div className="pt-4 border-t">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <span>🤖</span>
            <span>AIからのアドバイス</span>
          </h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : feedback ? (
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-lg">
              <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {feedback}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <button
                onClick={generateFeedback}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                アドバイスを生成
              </button>
            </div>
          )}
        </div>

        {/* 推奨アクション */}
        {feedback && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">
              💡 今日のおすすめ
            </div>
            <ul className="space-y-1 text-sm text-blue-700">
              {categories.physical.includes("疲れ") && (
                <li>• 消化の良い食事を心がけましょう</li>
              )}
              {categories.physical.includes("睡眠不足") && (
                <li>• カフェインを控えめにしましょう</li>
              )}
              {categories.mental.includes("ストレス") && (
                <li>• リラックスできる時間を作りましょう</li>
              )}
              {(categories.physical.length === 0 && categories.mental.length === 0) && (
                <li>• 良い調子を維持できています！</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}