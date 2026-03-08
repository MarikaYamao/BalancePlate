import { useRouter } from "next/navigation";

const quickActions = [
  {
    title: "今日の食事を記録する",
    icon: "🍽️",
    path: "/record/meal",
    color: "bg-emerald-100 hover:bg-emerald-200 border-emerald-300",
    textColor: "text-emerald-800",
    iconColor: "bg-emerald-200",
    primary: true,
  },
  {
    title: "体重を記録する",
    icon: "⚖️",
    path: "/record/weight",
    color: "bg-violet-100 hover:bg-violet-200 border-violet-300",
    textColor: "text-violet-800",
    iconColor: "bg-violet-200",
  },
];

export function QuickActionsSection() {
  const router = useRouter();

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        今日の記録
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.title}
            onClick={() => router.push(action.path)}
            className={`
              p-4 rounded-xl border-2 transition-all duration-200 
              ${action.color} ${action.textColor}
              transform hover:scale-[1.03] active:scale-[0.97]
              flex flex-col items-center gap-3 text-center
              shadow-sm hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400
            `}
          >
            <div
              className={`w-12 h-12 ${action.iconColor} rounded-full flex items-center justify-center text-2xl shadow-inner`}
            >
              {action.icon}
            </div>
            <div className="font-semibold text-sm leading-tight">
              {action.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}