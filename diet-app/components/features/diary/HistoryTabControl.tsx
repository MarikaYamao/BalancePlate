interface HistoryTabControlProps {
  historyTab: "meals" | "weight";
  setHistoryTab: (tab: "meals" | "weight") => void;
  daysToShow: number;
  setDaysToShow: (days: number) => void;
}

export function HistoryTabControl({
  historyTab,
  setHistoryTab,
  daysToShow,
  setDaysToShow,
}: HistoryTabControlProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">記録履歴</h2>

      <div className="space-y-4 mb-4">
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1 w-full max-w-xs">
            <button
              onClick={() => setHistoryTab("meals")}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
                historyTab === "meals"
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🍽️ 食事履歴
            </button>
            <button
              onClick={() => setHistoryTab("weight")}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
                historyTab === "weight"
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ⚖️ 体重推移
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600 font-medium">
            表示期間:
          </span>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 7, label: "7日" },
              { value: 14, label: "2週間" },
              { value: 30, label: "1ヶ月" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDaysToShow(option.value)}
                className={`px-3 py-2 text-sm rounded-md transition-colors font-medium ${
                  daysToShow === option.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}