import { MealLog } from "@/types";
import { MEAL_TYPE_INFO } from "@/lib/constants/mealTypes";

interface MealRecordItemProps {
  meal: MealLog;
  hasFeedback: boolean;
  onClick: (meal: MealLog) => void;
}

export function MealRecordItem({ meal, hasFeedback, onClick }: MealRecordItemProps) {
  const mealInfo = MEAL_TYPE_INFO[meal.mealType];

  return (
    <button
      onClick={() => onClick(meal)}
      className={`
        w-full text-left p-3 border rounded-lg transition-colors
        ${
          hasFeedback
            ? "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300"
            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className="text-lg mt-0.5">{mealInfo.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-800">
              {mealInfo.label}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(meal.actualTime).toLocaleString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {meal.followedPlan && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                プラン準拠
              </span>
            )}
            {hasFeedback && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                💬 フィードバックあり
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{meal.text}</p>
        </div>
      </div>
    </button>
  );
}