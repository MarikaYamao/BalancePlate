import { MealLog } from "@/types";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from "@/lib/constants/mealTypes";

interface MealDetailHeaderProps {
  mealLog: MealLog;
  onClose: () => void;
}

export function MealDetailHeader({ mealLog, onClose }: MealDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
          <span className="text-lg">
            {MEAL_TYPE_ICONS[mealLog.mealType]}
          </span>
        </div>
        <div>
          <h2
            id="meal-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {MEAL_TYPE_LABELS[mealLog.mealType]}
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
  );
}