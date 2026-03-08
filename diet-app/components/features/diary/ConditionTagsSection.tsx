import { DailyState } from "@/types";
import { conditionTagsInfo } from "@/lib/constants/conditionTags";

interface ConditionTagsSectionProps {
  dailyState: DailyState;
  dateKey: string;
  onOpenModal: (dailyState: DailyState, dateKey: string) => void;
}

export function ConditionTagsSection({
  dailyState,
  dateKey,
  onOpenModal,
}: ConditionTagsSectionProps) {
  if (!dailyState?.conditionTags || dailyState.conditionTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="text-sm text-gray-600 mb-2">コンディション</div>
      <button
        onClick={() => onOpenModal(dailyState, dateKey)}
        className="w-full text-left group"
      >
        <div className="flex flex-wrap gap-2 transition-all hover:opacity-80 cursor-pointer">
          {dailyState.conditionTags.map((tagId) => {
            const tagInfo = conditionTagsInfo.find((t) => t.id === tagId);
            if (!tagInfo) return null;

            return (
              <span
                key={tagId}
                className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs flex items-center gap-1"
              >
                <span>{tagInfo.icon}</span>
                <span>{tagInfo.label}</span>
              </span>
            );
          })}
          <span className="ml-auto text-xs text-gray-500 group-hover:text-gray-700">
            フィードバックを見る
          </span>
        </div>
      </button>
    </div>
  );
}