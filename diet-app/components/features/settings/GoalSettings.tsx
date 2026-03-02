'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Target, Heart, Dumbbell, Scale, TrendingUp, TrendingDown, Activity, Shield, AlertTriangle } from 'lucide-react';
import type { GoalMode, ConstraintType } from '@/types';

export type GoalType = 
  | 'health' // 健康維持
  | 'weight_loss' // 減量
  | 'weight_gain' // 増量
  | 'muscle_gain' // 筋肉増強
  | 'body_recomposition' // 体型改善
  | 'energy_boost' // 活力向上
  | 'better_sleep' // 睡眠改善
  | 'stress_management'; // ストレス管理

export type GoalPeriod = 
  | '1_month'
  | '3_months'
  | '6_months'
  | '1_year'
  | 'no_limit';

interface GoalSettingsProps {
  goalType?: GoalType;
  currentWeight?: number;
  targetWeight?: number;
  goalPeriod?: GoalPeriod;
  goalMode?: GoalMode;
  constraints?: ConstraintType[];
  onGoalTypeChange: (type: GoalType) => void;
  onCurrentWeightChange: (weight: number | undefined) => void;
  onTargetWeightChange: (weight: number | undefined) => void;
  onGoalPeriodChange: (period: GoalPeriod) => void;
  onGoalModeChange?: (mode: GoalMode) => void;
  onConstraintsChange?: (constraints: ConstraintType[]) => void;
}

// Phase21: 3つのシンプルモード
const goalModeOptions: Array<{
  id: GoalMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
}> = [
  {
    id: 'CUT',
    label: '体重を減らしたい（CUT）',
    description: '脂肪を落とし、むくみや過食を抑える',
    icon: <TrendingDown className="w-5 h-5" />,
    examples: ['むくみを改善したい', '食べ過ぎを抑えたい', '体脂肪を落としたい']
  },
  {
    id: 'MAINTAIN',
    label: '今の状態を維持したい（MAINTAIN）',
    description: '体重レンジを維持し、体調の波を小さく',
    icon: <Activity className="w-5 h-5" />,
    examples: ['体調を安定させたい', 'リバウンドを防ぎたい', '現状維持が目標']
  },
  {
    id: 'GAIN',
    label: '体重を増やしたい（GAIN）',
    description: '健康的に体重（筋肉/脂肪）を増やす',
    icon: <TrendingUp className="w-5 h-5" />,
    examples: ['筋肉をつけたい', '食事量を増やしたい', 'やせ型から抜け出したい']
  }
];

// 制約オプション
const constraintOptions: Array<{
  id: ConstraintType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'pregnancy',
    label: '妊娠中',
    description: '安全な栄養摂取を最優先',
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 'breastfeeding',
    label: '授乳中',
    description: '母乳に配慮した食事提案',
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 'hormone_ftm',
    label: 'ホルモン療法中（FTM）',
    description: 'ホルモン変動を考慮した提案',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'hormone_mtf',
    label: 'ホルモン療法中（MTF）',
    description: 'ホルモン変動を考慮した提案',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'medical',
    label: '医師から食事指導を受けている',
    description: '医療的制約を考慮',
    icon: <AlertTriangle className="w-5 h-5" />
  }
];

const goalOptions: Array<{
  id: GoalType;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresWeight: boolean;
  weightOptions?: 'loss' | 'gain' | 'both';
}> = [
  {
    id: 'health',
    label: '健康維持・向上',
    description: '体調を整え、健康的な生活を送る',
    icon: <Heart className="w-5 h-5" />,
    requiresWeight: false,
  },
  {
    id: 'weight_loss',
    label: '減量・ダイエット',
    description: '健康的に体重を減らす',
    icon: <TrendingDown className="w-5 h-5" />,
    requiresWeight: true,
    weightOptions: 'loss',
  },
  {
    id: 'weight_gain',
    label: '増量・体重増加',
    description: '健康的に体重を増やす',
    icon: <TrendingUp className="w-5 h-5" />,
    requiresWeight: true,
    weightOptions: 'gain',
  },
  {
    id: 'muscle_gain',
    label: '筋肉をつける',
    description: '筋肉量を増やし、引き締まった体を作る',
    icon: <Dumbbell className="w-5 h-5" />,
    requiresWeight: true,
    weightOptions: 'both',
  },
  {
    id: 'body_recomposition',
    label: '体型改善',
    description: '脂肪を減らし筋肉を増やす',
    icon: <Scale className="w-5 h-5" />,
    requiresWeight: true,
    weightOptions: 'both',
  },
  {
    id: 'energy_boost',
    label: '活力・エネルギー向上',
    description: '日々の活動に必要なエネルギーを高める',
    icon: <Activity className="w-5 h-5" />,
    requiresWeight: false,
  },
  {
    id: 'better_sleep',
    label: '睡眠の質改善',
    description: '食事から睡眠の質を向上させる',
    icon: <Activity className="w-5 h-5" />,
    requiresWeight: false,
  },
  {
    id: 'stress_management',
    label: 'ストレス対策',
    description: '食事でストレスに対処する',
    icon: <Activity className="w-5 h-5" />,
    requiresWeight: false,
  },
];

const periodOptions: Array<{ id: GoalPeriod; label: string }> = [
  { id: '1_month', label: '1ヶ月' },
  { id: '3_months', label: '3ヶ月' },
  { id: '6_months', label: '6ヶ月' },
  { id: '1_year', label: '1年' },
  { id: 'no_limit', label: '期限なし' },
];

export function GoalSettings({
  goalType,
  currentWeight,
  targetWeight,
  goalPeriod = 'no_limit',
  onGoalTypeChange,
  onCurrentWeightChange,
  onTargetWeightChange,
  onGoalPeriodChange,
}: GoalSettingsProps) {
  const selectedGoal = goalOptions.find(g => g.id === goalType);
  const [showWeightInput, setShowWeightInput] = useState(
    selectedGoal?.requiresWeight || false
  );
  
  // goalTypeが変更された時にshowWeightInputを更新
  useEffect(() => {
    if (goalType) {
      const goal = goalOptions.find(g => g.id === goalType);
      setShowWeightInput(goal?.requiresWeight || false);
    }
  }, [goalType]);
  
  const handleGoalSelect = (type: GoalType) => {
    onGoalTypeChange(type);
    const goal = goalOptions.find(g => g.id === type);
    if (goal?.requiresWeight) {
      setShowWeightInput(true);
    } else {
      setShowWeightInput(false);
      onCurrentWeightChange(undefined);
      onTargetWeightChange(undefined);
    }
  };

  const calculateRecommendedTarget = () => {
    if (!currentWeight || !selectedGoal) return '';
    
    switch (selectedGoal.weightOptions) {
      case 'loss':
        // 健康的な減量: 月2-4kg程度
        return `推奨: ${(currentWeight - 3).toFixed(1)}kg～${(currentWeight - 6).toFixed(1)}kg`;
      case 'gain':
        // 健康的な増量: 月1-2kg程度
        return `推奨: ${(currentWeight + 2).toFixed(1)}kg～${(currentWeight + 4).toFixed(1)}kg`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 目標選択 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          あなたの目標を選択してください
        </h3>
        <div className="grid gap-3">
          {goalOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleGoalSelect(option.id)}
              className={`
                w-full p-4 rounded-xl border-2 transition-all text-left
                ${goalType === option.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${goalType === option.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 体重入力（目標に応じて表示） */}
      {showWeightInput && selectedGoal?.requiresWeight && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            体重情報を入力してください
          </h3>
          
          <div className="space-y-4">
            {/* 現在の体重 */}
            <div>
              <label className="text-sm text-gray-600 font-medium">
                現在の体重
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="200"
                  value={currentWeight || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                    onCurrentWeightChange(value);
                  }}
                  placeholder="例: 65.5"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-gray-600">kg</span>
              </div>
            </div>

            {/* 目標体重 */}
            {(selectedGoal.weightOptions === 'loss' || selectedGoal.weightOptions === 'gain') && (
              <div>
                <label className="text-sm text-gray-600 font-medium">
                  目標体重
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="200"
                    value={targetWeight || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                      onTargetWeightChange(value);
                    }}
                    placeholder="例: 60.0"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-gray-600">kg</span>
                </div>
                {currentWeight && (
                  <p className="text-xs text-blue-600 mt-1">
                    {calculateRecommendedTarget()}
                  </p>
                )}
              </div>
            )}

            {/* 差分表示 */}
            {currentWeight && targetWeight && (selectedGoal.weightOptions === 'loss' || selectedGoal.weightOptions === 'gain') && (
              <div className="p-3 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">目標まで</span>
                  <span className="font-semibold text-teal-600">
                    {Math.abs(targetWeight - currentWeight).toFixed(1)} kg
                    {targetWeight < currentWeight ? ' 減量' : ' 増量'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 期間設定 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          目標期間
        </h3>
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((period) => (
            <button
              key={period.id}
              onClick={() => onGoalPeriodChange(period.id)}
              className={`
                px-4 py-2 rounded-lg border transition-all
                ${goalPeriod === period.id
                  ? 'border-teal-500 bg-teal-500 text-white'
                  : 'border-gray-300 hover:border-teal-400 text-gray-700'
                }
              `}
            >
              {period.label}
            </button>
          ))}
        </div>
        
        {goalPeriod !== 'no_limit' && currentWeight && targetWeight && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {(() => {
                const diff = Math.abs(targetWeight - currentWeight);
                const months = goalPeriod === '1_month' ? 1 
                  : goalPeriod === '3_months' ? 3
                  : goalPeriod === '6_months' ? 6
                  : 12;
                const perMonth = (diff / months).toFixed(1);
                
                // 健康的なペース判定
                const isHealthy = selectedGoal?.weightOptions === 'loss' 
                  ? parseFloat(perMonth) <= 4
                  : parseFloat(perMonth) <= 2;
                
                return isHealthy
                  ? `月あたり${perMonth}kgのペース - 健康的な目標です！`
                  : `月あたり${perMonth}kgのペース - 少し急すぎるかもしれません`;
              })()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}