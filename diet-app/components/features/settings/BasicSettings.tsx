'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';

interface BasicSettingsProps {
  dayResetTime: string;
  mealsPerDay: 2 | 3;
  onResetTimeChange: (time: string) => void;
  onMealsPerDayChange: (meals: 2 | 3) => void;
}

export function BasicSettings({
  dayResetTime,
  mealsPerDay,
  onResetTimeChange,
  onMealsPerDayChange
}: BasicSettingsProps) {
  const [localResetTime, setLocalResetTime] = useState(dayResetTime);
  const [localMealsPerDay, setLocalMealsPerDay] = useState(mealsPerDay);

  const handleResetTimeChange = (value: string) => {
    setLocalResetTime(value);
    onResetTimeChange(value);
  };

  const handleMealsPerDayChange = (value: 2 | 3) => {
    setLocalMealsPerDay(value);
    onMealsPerDayChange(value);
  };

  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">基本設定</h2>
      
      <div className="space-y-4">
        {/* リセット時間設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付切り替え時刻
          </label>
          <select
            value={localResetTime}
            onChange={(e) => handleResetTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                {i}:00
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            この時刻を過ぎると新しい日として記録されます
          </p>
        </div>

        {/* 食事回数設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            1日の食事回数
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleMealsPerDayChange(2)}
              className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                localMealsPerDay === 2
                  ? 'bg-primary-50 text-primary-700 border-primary-500 shadow-sm'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              2食
            </button>
            <button
              onClick={() => handleMealsPerDayChange(3)}
              className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                localMealsPerDay === 3
                  ? 'bg-primary-50 text-primary-700 border-primary-500 shadow-sm'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              3食
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {localMealsPerDay === 2 ? '朝食と夕食を記録します' : '朝食・昼食・夕食を記録します'}
          </p>
        </div>
      </div>
    </Card>
  );
}