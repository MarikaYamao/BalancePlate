'use client';

import { type MealType } from '@/types';
import { useEffect, useState } from 'react';
import { encryptedUserSettingsRepository } from '@/lib/db/repositories';

interface MealTypeSelectorProps {
  selectedType: MealType | null;
  onSelect: (type: MealType) => void;
  recordedTypes?: MealType[];
  disabled?: boolean;
}

const mealTypeInfo: Record<MealType, { label: string; icon: string; description: string }> = {
  breakfast: {
    label: '朝食',
    icon: '🌅',
    description: '一日のスタート'
  },
  lunch: {
    label: '昼食',
    icon: '☀️',
    description: 'エネルギー補給'
  },
  dinner: {
    label: '夕食',
    icon: '🌙',
    description: '一日の締めくくり'
  },
  snack: {
    label: '間食',
    icon: '🍿',
    description: 'おやつ・軽食'
  }
};

export function MealTypeSelector({ 
  selectedType, 
  onSelect, 
  recordedTypes = [],
  disabled = false 
}: MealTypeSelectorProps) {
  const [mealsPerDay, setMealsPerDay] = useState<2 | 3>(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await encryptedUserSettingsRepository.get();
        if (settings) {
          setMealsPerDay(settings.mealsPerDay);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 2食の場合は昼食を非表示
  const availableMealTypes: MealType[] = mealsPerDay === 2 
    ? ['breakfast', 'dinner', 'snack']
    : ['breakfast', 'lunch', 'dinner', 'snack'];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        食事タイプを選択してください（{mealsPerDay}食/日モード）
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {availableMealTypes.map((type) => {
          const info = mealTypeInfo[type];
          const isRecorded = recordedTypes.includes(type);
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              onClick={() => !disabled && !isRecorded && onSelect(type)}
              disabled={disabled || isRecorded}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-green-500 bg-green-50' 
                  : isRecorded
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
                    : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              {isRecorded && (
                <span className="absolute top-2 right-2 text-green-600">
                  ✓
                </span>
              )}
              
              <div className="text-2xl mb-1">{info.icon}</div>
              <div className="font-medium text-gray-900">{info.label}</div>
              {isRecorded && (
                <div className="text-xs text-green-600 mt-1">記録済み</div>
              )}
            </button>
          );
        })}
      </div>

      {selectedType && (
        <div className="p-3 bg-blue-50 rounded-lg text-sm">
          <span className="font-medium">{mealTypeInfo[selectedType].icon} {mealTypeInfo[selectedType].label}</span>
          を記録します
        </div>
      )}
    </div>
  );
}