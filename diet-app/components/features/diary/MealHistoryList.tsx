import { Card } from "@/components/ui/Card";
import { MealLog, DailyState } from "@/types";
import { DayHeader } from "./DayHeader";
import { ConditionTagsSection } from "./ConditionTagsSection";
import { MealRecordItem } from "./MealRecordItem";

interface DayData {
  dateKey: string;
  date: Date;
  meals: MealLog[];
  dailyState?: DailyState;
}

interface MealHistoryListProps {
  historyData: DayData[];
  todayDateKey: string;
  getIntegratedFeedback: (dateKey: string) => any | null;
  checkStoredFeedback: (dateKey: string, mealTime: Date) => boolean;
  handleMealClick: (meal: MealLog) => void;
  onConditionClick: (dailyState: DailyState, dateKey: string) => void;
}

export function MealHistoryList({
  historyData,
  todayDateKey,
  getIntegratedFeedback,
  checkStoredFeedback,
  handleMealClick,
  onConditionClick,
}: MealHistoryListProps) {
  if (historyData.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-600 mb-2">まだ記録がありません</p>
          <p className="text-sm text-gray-500">
            食事やコンディションを記録すると、ここに履歴が表示されます
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {historyData.map((dayData) => {
        const isToday = dayData.dateKey === todayDateKey;
        const integratedFeedback = getIntegratedFeedback(dayData.dateKey);

        return (
          <Card key={dayData.dateKey} className="overflow-hidden">
            <DayHeader
              date={dayData.date}
              dateKey={dayData.dateKey}
              isToday={isToday}
              mealsCount={dayData.meals.length}
              hasIntegratedFeedback={!!integratedFeedback}
            />

            {dayData.dailyState && (
              <ConditionTagsSection
                dailyState={dayData.dailyState}
                dateKey={dayData.dateKey}
                onOpenModal={onConditionClick}
              />
            )}

            {dayData.meals.length > 0 ? (
              <div className="space-y-3">
                {dayData.meals.map((meal) => {
                  const hasFeedback =
                    !!meal.aiAnalysis ||
                    checkStoredFeedback(meal.dateKey, meal.actualTime);

                  return (
                    <MealRecordItem
                      key={meal.id}
                      meal={meal}
                      hasFeedback={hasFeedback}
                      onClick={handleMealClick}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                この日は食事の記録がありません
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}