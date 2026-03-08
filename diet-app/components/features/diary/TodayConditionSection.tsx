import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DailyState } from "@/types";
import { useRouter } from "next/navigation";

interface TodayConditionSectionProps {
  todayCondition: DailyState | null;
}

export function TodayConditionSection({ todayCondition }: TodayConditionSectionProps) {
  const router = useRouter();

  if (todayCondition) return null;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">😊</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">
                今日のコンディション
              </h3>
              <p className="text-sm text-gray-600">
                体調や気分を記録しませんか？
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/record/condition")}
            variant="primary"
            size="small"
          >
            記録する
          </Button>
        </div>
      </div>
    </Card>
  );
}