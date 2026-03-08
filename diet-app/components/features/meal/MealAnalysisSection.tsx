import { MealLog } from "@/types";
import { Card } from "@/components/ui/Card";

interface MealAnalysisSectionProps {
  mealLog: MealLog;
}

export function MealAnalysisSection({ mealLog }: MealAnalysisSectionProps) {
  if (!mealLog.aiAnalysis) return null;

  return (
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
  );
}