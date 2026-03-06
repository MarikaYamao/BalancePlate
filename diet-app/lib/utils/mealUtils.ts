import type { MealType, MealLog } from '@/types';

/**
 * 食事がスキップされたかどうかを判定
 */
export function isMealSkipped(mealLog: MealLog): boolean {
  return mealLog.text.trim() === '';
}

/**
 * スキップされた食事も含めて実際に記録されている食事タイプを取得
 */
export function getRecordedMealTypes(mealLogs: MealLog[]): MealType[] {
  return mealLogs.map(meal => meal.mealType);
}

/**
 * 内容のある（スキップでない）食事タイプを取得
 */
export function getContentfulMealTypes(mealLogs: MealLog[]): MealType[] {
  return mealLogs.filter(meal => !isMealSkipped(meal)).map(meal => meal.mealType);
}

export function detectMissedMeals(
  currentTime: Date, 
  resetTime: string, 
  recordedMealTypes: MealType[],
  mealsPerDay: 2 | 3 = 3
): MealType[] {
  const missedMeals: MealType[] = [];
  const currentHour = currentTime.getHours();
  
  // リセット時間を考慮した時間判定
  const resetHour = parseInt(resetTime.split(':')[0]);
  let adjustedHour = currentHour;
  
  // リセット時間が朝4時の場合、深夜0-4時は前日扱いにしない
  if (resetHour <= 4 && currentHour >= 0 && currentHour < resetHour) {
    adjustedHour = currentHour + 24;
  }
  
  // 朝食時間帯を過ぎていて未入力 (6-11時)
  if (adjustedHour >= 11 && !recordedMealTypes.includes('breakfast')) {
    missedMeals.push('breakfast');
  }
  
  // 昼食時間帯を過ぎていて未入力 (12-16時) - 3食設定の場合のみ
  if (mealsPerDay === 3 && adjustedHour >= 16 && !recordedMealTypes.includes('lunch')) {
    missedMeals.push('lunch');
  }
  
  // 夕食時間帯を過ぎていて未入力 (18-23時)
  if (adjustedHour >= 23 && !recordedMealTypes.includes('dinner')) {
    missedMeals.push('dinner');
  }
  
  return missedMeals;
}

export function getMealTimeRange(mealType: MealType): { start: number; end: number } {
  switch (mealType) {
    case 'breakfast':
      return { start: 6, end: 11 };
    case 'lunch':
      return { start: 11, end: 16 };
    case 'dinner':
      return { start: 17, end: 23 };
    case 'snack':
      return { start: 0, end: 23 }; // 間食は任意の時間
  }
}

export function getMealDisplayTime(mealType: MealType): string {
  const range = getMealTimeRange(mealType);
  if (mealType === 'snack') {
    return '適宜';
  }
  return `${range.start}:00-${range.end}:00`;
}

export function shouldShowBulkInput(
  currentTime: Date,
  resetTime: string,
  recordedMealTypes: MealType[],
  minMissedMeals: number = 2,
  mealsPerDay: 2 | 3 = 3
): boolean {
  const missedMeals = detectMissedMeals(currentTime, resetTime, recordedMealTypes, mealsPerDay);
  return missedMeals.length >= minMissedMeals;
}