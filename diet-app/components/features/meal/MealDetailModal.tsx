'use client';

import { useEffect, useState } from 'react';
import { MealLog, AIConsultationResponse } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

interface MealDetailModalProps {
  isOpen: boolean;
  mealLog: MealLog | null;
  aiResponse?: AIConsultationResponse;
  onClose: () => void;
}

export function MealDetailModal({ 
  isOpen, 
  mealLog, 
  aiResponse, 
  onClose 
}: MealDetailModalProps) {
  const router = useRouter();
  const [loadedAIResponse, setLoadedAIResponse] = useState<AIConsultationResponse | null>(aiResponse || null);
  const [loadingAI, setLoadingAI] = useState(false);

  // AI相談データを読み込む
  useEffect(() => {
    if (isOpen && mealLog && !aiResponse) {
      loadAIConsultation();
    }
  }, [isOpen, mealLog, aiResponse]);

  const loadAIConsultation = async () => {
    if (!mealLog) return;
    
    setLoadingAI(true);
    try {
      // TODO: 実際のAI相談データを取得するAPIを実装
      // 現在はローカルストレージからフォールバックとして検索
      const storedConsultations = localStorage.getItem(`ai-consultation-${mealLog.dateKey}`);
      if (storedConsultations) {
        const consultations = JSON.parse(storedConsultations);
        // 食事時刻に最も近いコンサルテーションを選択
        const relevantConsultation = consultations.find((c: any) => 
          Math.abs(new Date(c.timestamp).getTime() - new Date(mealLog.actualTime).getTime()) < 4 * 60 * 60 * 1000 // 4時間以内
        );
        if (relevantConsultation && relevantConsultation.response) {
          setLoadedAIResponse(relevantConsultation.response);
        }
      }
    } catch (error) {
      console.error('Failed to load AI consultation:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '間食',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="meal-modal-title"
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <h2 id="meal-modal-title" className="text-xl font-semibold text-gray-800">
              {mealTypeLabels[mealLog.mealType]}の詳細
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="モーダルを閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    {new Date(mealLog.actualTime).toLocaleString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
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
                    <div>カロリー: {mealLog.aiAnalysis.estimatedNutrients.calories}kcal</div>
                  )}
                  {mealLog.aiAnalysis.estimatedNutrients.protein && (
                    <div>タンパク質: {mealLog.aiAnalysis.estimatedNutrients.protein}g</div>
                  )}
                  {mealLog.aiAnalysis.estimatedNutrients.carbs && (
                    <div>炭水化物: {mealLog.aiAnalysis.estimatedNutrients.carbs}g</div>
                  )}
                  {mealLog.aiAnalysis.estimatedNutrients.fat && (
                    <div>脂質: {mealLog.aiAnalysis.estimatedNutrients.fat}g</div>
                  )}
                </div>
              )}
              {mealLog.aiAnalysis.suggestions && mealLog.aiAnalysis.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">アドバイス</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {mealLog.aiAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
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
                <span className="text-sm text-blue-800">AIフィードバックを読み込んでいます...</span>
              </div>
            </Card>
          )}
          {(loadedAIResponse || aiResponse) && (
            <div className="space-y-4 mb-6">
              {/* 総合評価 */}
              <Card className="p-4 bg-green-50 border-green-200">
                <h3 className="font-medium text-green-900 mb-2">今日の総合評価</h3>
                <p className="text-sm text-green-800">{(loadedAIResponse || aiResponse)?.feedback.overall}</p>
              </Card>

              {/* 良かった点 */}
              {(loadedAIResponse || aiResponse)?.feedback.positive && (loadedAIResponse || aiResponse)!.feedback.positive.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">良かった点</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {(loadedAIResponse || aiResponse)!.feedback.positive.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* 改善提案 */}
              {(loadedAIResponse || aiResponse)?.feedback.suggestions && (loadedAIResponse || aiResponse)!.feedback.suggestions.length > 0 && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <h3 className="font-medium text-yellow-900 mb-2">改善のヒント</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {(loadedAIResponse || aiResponse)!.feedback.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">💡</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* 励ましメッセージ */}
              {(loadedAIResponse || aiResponse)?.feedback.encouragement && (
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <p className="text-sm text-purple-800 text-center font-medium">
                    {(loadedAIResponse || aiResponse)!.feedback.encouragement}
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button
              onClick={handleEdit}
              variant="primary"
              className="flex-1"
            >
              編集する
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}