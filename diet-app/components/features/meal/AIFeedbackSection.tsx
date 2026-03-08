import { MealSuggestions } from "./MealSuggestions";

interface AIFeedbackSectionProps {
  loadingAI: boolean;
  loadedAIResponse: any;
  recordedMealType?: string;
}

export function AIFeedbackSection({ 
  loadingAI, 
  loadedAIResponse, 
  recordedMealType 
}: AIFeedbackSectionProps) {
  const formatStructuredFeedback = (data: any): React.ReactNode => {
    return (
      <div className="space-y-6">
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

        {data.mealSuggestions && (
          <MealSuggestions 
            mealSuggestions={data.mealSuggestions} 
            recordedMealType={recordedMealType}
          />
        )}
      </div>
    );
  };

  if (loadingAI) {
    return (
      <div className="mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-800">
              AIフィードバックを読み込んでいます...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!loadedAIResponse) return null;

  return (
    <div className="mb-6">
      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          AIフィードバック
        </h3>
        {typeof loadedAIResponse === "object" ? (
          formatStructuredFeedback(loadedAIResponse)
        ) : (
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
  );
}