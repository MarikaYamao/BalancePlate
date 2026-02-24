'use client';

import { useState } from 'react';
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

interface EnhancedGoalSettingsProps {
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
  priority: string[];
}> = [
  {
    id: 'CUT',
    label: '体重を減らしたい（CUT）',
    description: '脂肪を落とし、むくみや過食を抑える',
    icon: <TrendingDown className="w-5 h-5" />,
    examples: ['むくみを改善したい', '食べ過ぎを抑えたい', '体脂肪を落としたい'],
    priority: ['過食抑制', '塩分・むくみ対策', 'タンパク質確保', '習慣維持']
  },
  {
    id: 'MAINTAIN',
    label: '今の状態を維持したい（MAINTAIN）',
    description: '体重レンジを維持し、体調の波を小さく',
    icon: <Activity className="w-5 h-5" />,
    examples: ['体調を安定させたい', 'リバウンドを防ぎたい', '現状維持が目標'],
    priority: ['平準化（乱高下を防ぐ）', '睡眠・ストレス時の暴走防止', '最低限のタンパク質']
  },
  {
    id: 'GAIN',
    label: '体重を増やしたい（GAIN）',
    description: '健康的に体重（筋肉/脂肪）を増やす',
    icon: <TrendingUp className="w-5 h-5" />,
    examples: ['筋肉をつけたい', '食事量を増やしたい', 'やせ型から抜け出したい'],
    priority: ['総摂取量確保', 'タンパク質摂取', '消化・食欲サポート', '分割摂取']
  }
];

// 制約オプション
const constraintOptions: Array<{
  id: ConstraintType;
  label: string;
  description: string;
  icon: React.ReactNode;
  warningLevel: 'info' | 'warning' | 'critical';
}> = [
  {
    id: 'pregnancy',
    label: '妊娠中',
    description: '安全な栄養摂取を最優先します',
    icon: <Heart className="w-5 h-5" />,
    warningLevel: 'critical'
  },
  {
    id: 'breastfeeding',
    label: '授乳中',
    description: '母乳に配慮した食事提案を行います',
    icon: <Heart className="w-5 h-5" />,
    warningLevel: 'warning'
  },
  {
    id: 'hormone_ftm',
    label: 'ホルモン療法中（FTM）',
    description: 'ホルモン変動を考慮した提案を行います',
    icon: <Shield className="w-5 h-5" />,
    warningLevel: 'info'
  },
  {
    id: 'hormone_mtf',
    label: 'ホルモン療法中（MTF）',
    description: 'ホルモン変動を考慮した提案を行います',
    icon: <Shield className="w-5 h-5" />,
    warningLevel: 'info'
  },
  {
    id: 'medical',
    label: '医師から食事指導を受けている',
    description: '医療的制約を考慮します',
    icon: <AlertTriangle className="w-5 h-5" />,
    warningLevel: 'critical'
  }
];

const periodOptions: Array<{ id: GoalPeriod; label: string }> = [
  { id: '1_month', label: '1ヶ月' },
  { id: '3_months', label: '3ヶ月' },
  { id: '6_months', label: '6ヶ月' },
  { id: '1_year', label: '1年' },
  { id: 'no_limit', label: '期限なし' },
];

export function EnhancedGoalSettings({
  goalType,
  currentWeight,
  targetWeight,
  goalPeriod = 'no_limit',
  goalMode,
  constraints = [],
  onGoalTypeChange,
  onCurrentWeightChange,
  onTargetWeightChange,
  onGoalPeriodChange,
  onGoalModeChange,
  onConstraintsChange,
}: EnhancedGoalSettingsProps) {
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);
  
  const selectedMode = goalModeOptions.find(m => m.id === goalMode);
  
  const handleConstraintToggle = (constraintType: ConstraintType) => {
    if (!onConstraintsChange) return;
    
    const newConstraints = constraints.includes(constraintType)
      ? constraints.filter(c => c !== constraintType)
      : [...constraints, constraintType];
    
    onConstraintsChange(newConstraints);
  };

  const handleGoalModeSelect = (mode: GoalMode) => {
    if (onGoalModeChange) {
      onGoalModeChange(mode);
    }
    
    // モードに基づいて従来のGoalTypeも設定
    switch (mode) {
      case 'CUT':
        onGoalTypeChange('weight_loss');
        setShowWeightInput(true);
        break;
      case 'MAINTAIN':
        onGoalTypeChange('health');
        setShowWeightInput(false);
        onCurrentWeightChange(undefined);
        onTargetWeightChange(undefined);
        break;
      case 'GAIN':
        onGoalTypeChange('weight_gain');
        setShowWeightInput(true);
        break;
    }
  };

  const calculateRecommendedTarget = () => {
    if (!currentWeight || !goalMode) return '';
    
    switch (goalMode) {
      case 'CUT':
        // 健康的な減量: 月2-4kg程度
        return `推奨: ${(currentWeight - 3).toFixed(1)}kg～${(currentWeight - 6).toFixed(1)}kg`;
      case 'GAIN':
        // 健康的な増量: 月1-2kg程度
        return `推奨: ${(currentWeight + 2).toFixed(1)}kg～${(currentWeight + 4).toFixed(1)}kg`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase21: シンプルモード選択 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          あなたの目標を教えてください
        </h3>
        <div className="grid gap-3">
          {goalModeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleGoalModeSelect(option.id)}
              className={`
                w-full p-4 rounded-xl border-2 transition-all text-left
                ${goalMode === option.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${goalMode === option.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}
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
                  {goalMode === option.id && (
                    <div className="mt-2">
                      <p className="text-xs text-teal-700 font-medium mb-1">優先順位:</p>
                      <div className="flex flex-wrap gap-1">
                        {option.priority.map((priority, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded"
                          >
                            {index + 1}. {priority}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {goalMode !== option.id && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {option.examples.map((example, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 体重入力（CUT/GAINモードの場合） */}
      {showWeightInput && (goalMode === 'CUT' || goalMode === 'GAIN') && (
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

            {/* 差分表示 */}
            {currentWeight && targetWeight && (
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
      </div>
      
      {/* Phase21: 制約条件の設定 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            特別な配慮が必要な状況（任意）
          </h3>
          <button
            onClick={() => setShowConstraints(!showConstraints)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showConstraints ? '隠す' : '設定'}
          </button>
        </div>
        
        {showConstraints && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="mb-3">
              <div className="flex items-start gap-2 text-sm text-blue-800">
                <Shield className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-medium">プライバシー保護</p>
                  <p className="text-blue-600 mt-1">
                    この情報は提案の精度向上のためのみに使用します。医師の指示がある場合は、それを最優先してください。
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {constraintOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleConstraintToggle(option.id)}
                  className={`
                    w-full p-3 rounded-lg border transition-all text-left
                    ${constraints.includes(option.id)
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      ${constraints.includes(option.id) 
                        ? 'bg-blue-500 text-white' 
                        : option.warningLevel === 'critical' 
                          ? 'bg-red-100 text-red-600'
                          : option.warningLevel === 'warning'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-600'
                      }
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
                    {constraints.includes(option.id) && (
                      <div className="text-blue-500">
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {constraints.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">注意事項</p>
                    <p className="text-yellow-700 mt-1">
                      体調に異変を感じた場合は、アプリの提案に関係なく医療機関を受診してください。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}