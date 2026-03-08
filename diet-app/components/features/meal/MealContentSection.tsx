import { MealLog } from "@/types";

interface MealContentSectionProps {
  mealLog: MealLog;
}

export function MealContentSection({ mealLog }: MealContentSectionProps) {
  return (
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
  );
}