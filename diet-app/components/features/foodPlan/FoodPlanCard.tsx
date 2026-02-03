'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { FoodPlan } from '@/types';

interface FoodPlanCardProps {
  plan: FoodPlan;
  onSelect: () => void;
  isSelected: boolean;
  isLoading?: boolean;
}

export function FoodPlanCard({ 
  plan, 
  onSelect, 
  isSelected, 
  isLoading = false 
}: FoodPlanCardProps) {
  const getPlanTypeLabel = (type: string) => {
    const labels = {
      'A': 'プランA',
      'B': 'プランB', 
      'C': 'プランC',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getMealTypeIcon = (mealType: string) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍿',
    };
    return icons[mealType as keyof typeof icons] || '🍽️';
  };

  const getMealTypeLabel = (mealType: string) => {
    const labels = {
      breakfast: '朝食',
      lunch: '昼食',
      dinner: '夕食',
      snack: '間食',
    };
    return labels[mealType as keyof typeof labels] || mealType;
  };

  return (
    <Card className={`transition-all ${
      isSelected 
        ? 'border-2 border-primary-500 bg-primary-50 shadow-md' 
        : 'border border-gray-200 hover:shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isSelected 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {getPlanTypeLabel(plan.planType)}
          </span>
          {isSelected && (
            <div className="flex items-center text-primary-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">選択中</span>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 mb-2">{plan.planName}</h3>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {plan.description}
      </p>

      {/* 食事内容 */}
      <div className="space-y-3 mb-4">
        {plan.meals.map((meal, index) => (
          <div key={index} className="border-l-2 border-gray-100 pl-3">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">{getMealTypeIcon(meal.mealType)}</span>
              <span className="text-sm font-medium text-gray-700">
                {getMealTypeLabel(meal.mealType)}
              </span>
            </div>
            
            {meal.mainItems.length > 0 && (
              <div className="text-xs text-gray-600 mb-1">
                {meal.mainItems.join('、')}
              </div>
            )}
            
            {meal.sideItems.length > 0 && (
              <div className="text-xs text-gray-500">
                副菜: {meal.sideItems.join('、')}
              </div>
            )}

            {meal.notes && (
              <div className="text-xs text-blue-600 mt-1">
                💡 {meal.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 選択ボタン */}
      <Button
        onClick={onSelect}
        disabled={isLoading || isSelected}
        variant={isSelected ? 'secondary' : 'primary'}
        className="w-full"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            選択中...
          </div>
        ) : isSelected ? (
          '選択済み'
        ) : (
          'このプランを選ぶ'
        )}
      </Button>
    </Card>
  );
}