"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { type MealType } from "@/types";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { usePostMealFeedback } from "@/lib/hooks/usePostMealFeedback";

interface PostMealFeedbackProps {
  mealType: MealType;
  mealText: string;
  onClose: () => void;
}

export function PostMealFeedback({
  mealType,
  mealText,
  onClose,
}: PostMealFeedbackProps) {
  const router = useRouter();
  const { settings } = useUserSettings();
  const { feedback, loading, error, generateFeedback } = usePostMealFeedback();

  useEffect(() => {
    generateFeedback(mealType, mealText);
  }, [mealType, mealText, generateFeedback]);


  const getMealTypeLabel = (type: MealType): string => {
    const labels = {
      breakfast: "朝食",
      lunch: "昼食",
      dinner: "夕食",
      snack: "間食",
    };
    return labels[type];
  };

  const renderStructuredFeedback = (responseText: string) => {
    try {
      const data = JSON.parse(responseText);
      return (
        <div className="space-y-4">
          {/* 今日のガイドライン */}
          {data.todayGuideline && (
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">💡 今日のポイント</h4>
              <p className="text-gray-600">{data.todayGuideline}</p>
            </div>
          )}

          {/* フィードバック */}
          {data.feedback && (
            <div className="space-y-3">
              {data.feedback.overall && (
                <div className="border-l-4 border-gray-300 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">✨ 全体評価</h4>
                  <p className="text-gray-600">{data.feedback.overall}</p>
                </div>
              )}

              {data.feedback.positive && (
                <div className="border-l-4 border-gray-300 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">🌟 良い点</h4>
                  <p className="text-gray-600">{data.feedback.positive}</p>
                </div>
              )}

              {data.feedback.suggestions && data.feedback.suggestions.length > 0 && (
                <div className="border-l-4 border-gray-300 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">💪 改善提案</h4>
                  <ul className="text-gray-600 space-y-1">
                    {data.feedback.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.feedback.encouragement && (
                <div className="border-l-4 border-gray-300 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">🌸 応援メッセージ</h4>
                  <p className="text-gray-600">{data.feedback.encouragement}</p>
                </div>
              )}
            </div>
          )}

          {/* 栄養アドバイス */}
          {data.nutritionAdvice && (
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-800 mb-3">🥗 栄養のポイント</h4>
              <div className="text-gray-600 space-y-2">
                {data.nutritionAdvice.focus && data.nutritionAdvice.focus.length > 0 && (
                  <div>
                    <span className="font-medium">意識したい栄養素:</span>
                    <span className="ml-2">{data.nutritionAdvice.focus.join(', ')}</span>
                  </div>
                )}
                {data.nutritionAdvice.avoid && data.nutritionAdvice.avoid.length > 0 && (
                  <div>
                    <span className="font-medium">控えたいもの:</span>
                    <span className="ml-2">{data.nutritionAdvice.avoid.join(', ')}</span>
                  </div>
                )}
                {data.nutritionAdvice.hydration && (
                  <div>
                    <span className="font-medium">水分補給:</span>
                    <span className="ml-2">{data.nutritionAdvice.hydration}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 次の食事プラン */}
          {data.mealSuggestions && Object.keys(data.mealSuggestions).length > 0 && (
            <div className="space-y-4">
              {Object.entries(data.mealSuggestions).map(([mealType, suggestions]: [string, any]) => {
                const mealTypeLabel = mealType === 'breakfast' ? '朝食' : 
                                     mealType === 'lunch' ? '昼食' : 
                                     mealType === 'dinner' ? '夕食' : 
                                     mealType === 'tomorrow' ? '明日に向けて' : 
                                     mealType;
                
                // 明日に向けてのアドバイスは別形式で表示
                if (mealType === 'tomorrow') {
                  return (
                    <div key={mealType} className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">🌅 {mealTypeLabel}</h4>
                      <div className="text-gray-600 space-y-1">
                        {suggestions.focus && (
                          <div><span className="font-medium">重視点:</span> {suggestions.focus}</div>
                        )}
                        {suggestions.timing && (
                          <div><span className="font-medium">タイミング:</span> {suggestions.timing}</div>
                        )}
                      </div>
                    </div>
                  );
                }
                
                // 通常の食事提案（A/B/Cプラン）
                return (
                  <div key={mealType} className="bg-teal-50 border-l-4 border-teal-400 p-4 rounded">
                    <h4 className="font-semibold text-teal-800 mb-3">🍽️ {mealTypeLabel}の提案（3プラン）</h4>
                    <div className="grid gap-3">
                      {/* Plan A */}
                      {suggestions.planA && (
                        <div className="bg-white p-3 rounded-lg border border-teal-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-teal-600 text-white px-2 py-0.5 rounded text-xs font-bold">A</span>
                                <span className="font-semibold text-teal-900">{suggestions.planA.title}</span>
                              </div>
                              <p className="text-teal-800 text-sm mb-1">{suggestions.planA.menu}</p>
                              <p className="text-teal-600 text-xs">{suggestions.planA.description}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Plan B */}
                      {suggestions.planB && (
                        <div className="bg-white p-3 rounded-lg border border-teal-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold">B</span>
                                <span className="font-semibold text-teal-900">{suggestions.planB.title}</span>
                              </div>
                              <p className="text-teal-800 text-sm mb-1">{suggestions.planB.menu}</p>
                              <p className="text-teal-600 text-xs">{suggestions.planB.description}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Plan C */}
                      {suggestions.planC && (
                        <div className="bg-white p-3 rounded-lg border border-teal-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-gray-500 text-white px-2 py-0.5 rounded text-xs font-bold">C</span>
                                <span className="font-semibold text-teal-900">{suggestions.planC.title}</span>
                              </div>
                              <p className="text-teal-800 text-sm mb-1">{suggestions.planC.menu}</p>
                              <p className="text-teal-600 text-xs">{suggestions.planC.description}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 明日に向けたアドバイス（consultation時のみ） */}
          {data.tomorrowAdvice && (
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-800 mb-3">🌅 明日に向けて</h4>
              <div className="text-gray-600 space-y-2">
                {data.tomorrowAdvice.focus && (
                  <div>
                    <span className="font-medium">重点:</span>
                    <span className="ml-2">{data.tomorrowAdvice.focus}</span>
                  </div>
                )}
                {data.tomorrowAdvice.preparation && (
                  <div>
                    <span className="font-medium">準備:</span>
                    <span className="ml-2">{data.tomorrowAdvice.preparation}</span>
                  </div>
                )}
                {data.tomorrowAdvice.mindset && (
                  <div className="bg-gray-100 rounded p-2 mt-2">
                    <span className="text-gray-700 text-sm font-medium">{data.tomorrowAdvice.mindset}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.warn('Failed to parse JSON feedback:', error);
      // JSONの解析に失敗した場合のフォールバック（従来のテキスト表示）
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <h4 className="font-semibold text-red-800 mb-2">⚠️ データ形式エラー</h4>
          <p className="text-red-700 text-sm mb-2">
            フィードバックの形式に問題があります。管理者にお知らせください。
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-red-600 text-sm">詳細情報</summary>
            <pre className="text-xs bg-red-100 p-2 mt-2 rounded overflow-auto max-h-40">
              {responseText}
            </pre>
          </details>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className={`${mealType === 'dinner' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white p-6`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-2">
                {mealType === 'dinner' ? '🌙 今日も1日お疲れ様でした' :
                 mealText.includes("【") ? '🍽️ 今日の食事フィードバック' :
                 `🍽️ ${getMealTypeLabel(mealType)}のフィードバック`}
              </h2>
              <p className="text-white/90 text-sm">
                {mealType === 'dinner' ? '夕食の記録と今日の振り返り' :
                 mealText.includes("【") ? '複数食事の統合分析' :
                 `記録内容: ${mealText.length > 50 ? `${mealText.substring(0, 50)}...` : mealText}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-white/70 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {loading && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="text-center text-gray-500 text-sm">
                あなたの体質と今日のコンディションを分析してフィードバックを作成中...
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 text-lg mb-4">⚠️ エラー</div>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => generateFeedback(mealType, mealText)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                再試行
              </button>
            </div>
          )}

          {feedback && (
            <div className="space-y-6">
              {/* AIアシスタントアイコンとヘッダー */}
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${mealType === 'dinner' ? 'bg-gradient-to-r from-indigo-400 to-purple-500' : 'bg-gradient-to-r from-green-400 to-green-500'} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-lg">{mealType === 'dinner' ? '🌙' : '🤖'}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">
                    {mealType === 'dinner' ? '今日の振り返り' : 'AIアシスタント'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {mealType === 'dinner' 
                      ? '1日の食事を振り返って、明日に向けたアドバイス'
                      : 'あなたの体質と今日のコンディションを考慮したアドバイス'}
                  </p>
                </div>
              </div>

              {/* フィードバック内容 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  {renderStructuredFeedback(feedback.response)}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // 2食設定の場合の処理
                    const mealsPerDay = settings?.mealsPerDay || 3;
                    
                    if (mealType === 'breakfast') {
                      // 朝食後：2食なら夕食へ、3食なら昼食へ
                      const nextMeal = mealsPerDay === 2 ? 'dinner' : 'lunch';
                      router.push(`/record/meal?type=${nextMeal}`);
                    } else if (mealType === 'lunch') {
                      // 昼食後：夕食へ
                      router.push('/record/meal?type=dinner');
                    } else if (mealType === 'dinner') {
                      // 夕食後：ホーム画面へ
                      router.push('/home');
                    } else {
                      // 間食後：今日の記録へ
                      router.push('/record/meal?tab=history');
                    }
                    onClose();
                  }}
                  className={`flex-1 py-3 px-6 ${
                    mealType === 'dinner' 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white rounded-lg transition-colors font-medium`}
                >
                  {mealType === 'breakfast' ? 
                    (settings?.mealsPerDay === 2 ? '夕食を記録する' : '昼食を記録する') : 
                   mealType === 'lunch' ? '夕食を記録する' : 
                   mealType === 'dinner' ? '今日はゆっくり休みましょう' :
                   '今日の記録を見る'}
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
