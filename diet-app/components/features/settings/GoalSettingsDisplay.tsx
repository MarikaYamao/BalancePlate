'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Target, TrendingDown, TrendingUp, Activity, Calendar, Edit } from 'lucide-react';
import type { ReactElement } from 'react';

interface GoalSettingsDisplayProps {
  goalType?: string;
  currentWeight?: number;
  targetWeight?: number;
  goalPeriod?: string;
  goalMode?: 'CUT' | 'MAINTAIN' | 'GAIN';
  onEditClick: () => void;
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  health: '健康維持',
  weight_loss: '減量',
  weight_gain: '増量',
  muscle_gain: '筋肉増強',
  body_recomposition: '体型改善',
  energy_boost: '活力向上',
  better_sleep: '睡眠改善',
  stress_management: 'ストレス管理',
};

const GOAL_PERIOD_LABELS: Record<string, string> = {
  '1_month': '1ヶ月',
  '3_months': '3ヶ月',
  '6_months': '6ヶ月',
  '1_year': '1年',
  'no_limit': '期限なし',
};

const GOAL_MODE_INFO: Record<string, { label: string; icon: ReactElement; color: string }> = {
  CUT: { 
    label: '減量モード', 
    icon: <TrendingDown className="w-5 h-5" />,
    color: 'text-blue-600 bg-blue-50'
  },
  MAINTAIN: { 
    label: '維持モード', 
    icon: <Activity className="w-5 h-5" />,
    color: 'text-green-600 bg-green-50'
  },
  GAIN: { 
    label: '増量モード', 
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-orange-600 bg-orange-50'
  },
};

export function GoalSettingsDisplay({
  goalType,
  currentWeight,
  targetWeight,
  goalPeriod,
  goalMode,
  onEditClick
}: GoalSettingsDisplayProps) {
  const hasGoal = goalType || goalMode;
  
  if (!hasGoal) {
    return (
      <Card className="p-6 border-2 border-gray-200">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">目標が設定されていません</h3>
            <p className="text-sm text-gray-500 mt-2">
              目標を設定すると、AIがより適切な食事提案を行います
            </p>
          </div>
          <Button onClick={onEditClick} variant="primary">
            目標を設定
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">現在の目標</h3>
        </div>
        <Button
          size="small"
          variant="outline"
          onClick={onEditClick}
          className="flex items-center space-x-1"
        >
          <Edit className="w-4 h-4" />
          <span>変更</span>
        </Button>
      </div>

      <div className="space-y-4">
        {/* ゴールモード */}
        {goalMode && (
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 ${GOAL_MODE_INFO[goalMode].color}`}>
              {GOAL_MODE_INFO[goalMode].icon}
              <span className="font-medium">{GOAL_MODE_INFO[goalMode].label}</span>
            </div>
          </div>
        )}

        {/* 目標タイプと詳細 */}
        <div className="grid grid-cols-2 gap-4">
          {goalType && (
            <div>
              <span className="text-sm text-gray-500">目標タイプ</span>
              <p className="font-medium text-gray-900">
                {GOAL_TYPE_LABELS[goalType] || goalType}
              </p>
            </div>
          )}
          
          {currentWeight && (
            <div>
              <span className="text-sm text-gray-500">現在の体重</span>
              <p className="font-medium text-gray-900">{currentWeight} kg</p>
            </div>
          )}
          
          {targetWeight && (
            <div>
              <span className="text-sm text-gray-500">目標体重</span>
              <p className="font-medium text-gray-900">{targetWeight} kg</p>
            </div>
          )}
          
          {goalPeriod && (
            <div>
              <span className="text-sm text-gray-500">目標期間</span>
              <p className="font-medium text-gray-900">
                {GOAL_PERIOD_LABELS[goalPeriod] || goalPeriod}
              </p>
            </div>
          )}
        </div>

        {/* 差分表示 */}
        {currentWeight && targetWeight && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">目標まで</span>
              <span className={`text-lg font-bold ${
                targetWeight > currentWeight ? 'text-orange-600' : 'text-blue-600'
              }`}>
                {targetWeight > currentWeight ? '+' : ''}
                {(targetWeight - currentWeight).toFixed(1)} kg
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}