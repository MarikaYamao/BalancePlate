"use client";

interface FoodSuggestion {
  characteristics: string[];
  recommendations: {
    category: string;
    items: string[];
  }[];
  avoid?: string[];
}

interface FoodSuggestionDisplayProps {
  foodSuggestions: FoodSuggestion | null;
}

export function FoodSuggestionDisplay({ foodSuggestions }: FoodSuggestionDisplayProps) {
  if (!foodSuggestions) return null;

  return (
    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🍽️</span>
        <h3 className="font-medium text-emerald-800">
          今日おすすめの食事
        </h3>
      </div>

      {/* 食事の特徴 */}
      {foodSuggestions.characteristics && (
        <div className="flex flex-wrap gap-2 mb-3">
          {foodSuggestions.characteristics.map((char, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
            >
              {char}
            </span>
          ))}
        </div>
      )}

      {/* 具体的な食材・メニュー */}
      {foodSuggestions.recommendations && (
        <div className="space-y-2">
          {foodSuggestions.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">▸</span>
              <div className="flex-1">
                <span className="text-sm text-gray-800 font-medium">
                  {rec.category}：
                </span>
                <span className="text-sm text-gray-700">
                  {rec.items.join("、")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 避けるべき食品 */}
      {foodSuggestions.avoid && foodSuggestions.avoid.length > 0 && (
        <div className="mt-3 pt-3 border-t border-emerald-200">
          <div className="text-xs text-red-700 font-medium mb-1">
            ⚠️ 控えめにした方が良いもの
          </div>
          <div className="text-xs text-gray-600">
            {foodSuggestions.avoid.join("、")}
          </div>
        </div>
      )}
    </div>
  );
}