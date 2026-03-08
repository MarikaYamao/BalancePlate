interface DayHeaderProps {
  date: Date;
  dateKey: string;
  isToday: boolean;
  mealsCount: number;
  hasIntegratedFeedback: boolean;
}

export function DayHeader({
  date,
  dateKey,
  isToday,
  mealsCount,
  hasIntegratedFeedback,
}: DayHeaderProps) {
  const getDaysDiff = () => {
    if (isToday) return null;
    
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays === 1) return "昨日";
    return `${diffDays}日前`;
  };

  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg px-3 py-2 ${
            isToday
              ? "bg-gradient-to-br from-blue-100 to-blue-200"
              : "bg-gradient-to-br from-gray-100 to-gray-200"
          }`}
        >
          <div className="text-lg font-bold text-blue-900 text-center">
            {date.toLocaleDateString("ja-JP", {
              month: "short",
              day: "numeric",
            })}
            <span className="text-xs text-blue-900 ml-1">
              (
              {date.toLocaleDateString("ja-JP", {
                weekday: "short",
              })}
              )
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isToday && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              今日
            </span>
          )}
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            🍽️ {mealsCount}食事
          </span>
          {hasIntegratedFeedback && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              🤖 AI分析済み
            </span>
          )}
        </div>
      </div>

      {!isToday && (
        <span className="text-xs text-gray-400">
          {getDaysDiff()}
        </span>
      )}
    </div>
  );
}