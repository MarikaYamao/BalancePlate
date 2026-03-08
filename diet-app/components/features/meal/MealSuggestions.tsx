import { getMealTimeRange } from "@/lib/utils/mealUtils";

interface MealSuggestionsProps {
  mealSuggestions: any;
  recordedMealType?: string;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
  tomorrow: "明日に向けて",
};

export function MealSuggestions({ mealSuggestions, recordedMealType }: MealSuggestionsProps) {
  if (!mealSuggestions) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-purple-600">🍽️</span>
        <h4 className="text-base font-semibold text-gray-900">
          おすすめメニュー
        </h4>
      </div>
      <div className="space-y-3">
        {Object.entries(mealSuggestions)
          .filter(([suggestionMealType]) => {
            if (recordedMealType) {
              if (recordedMealType === 'dinner') return false;
              if (recordedMealType === 'breakfast' && suggestionMealType === 'breakfast') return false;
              if (recordedMealType === 'lunch' && (suggestionMealType === 'breakfast' || suggestionMealType === 'lunch')) return false;
            }
            
            const currentHour = new Date().getHours();
            const { end } = getMealTimeRange(suggestionMealType as any);
            
            let adjustedHour = currentHour;
            if (currentHour >= 0 && currentHour < 4) {
              adjustedHour = currentHour + 24;
            }
            
            if (adjustedHour > end) {
              return false;
            }
            
            return true;
          })
          .map(([mealType, suggestions]: [string, any]) => {
            const mealLabel = mealTypeLabels[mealType] || mealType;
            
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
  );
}