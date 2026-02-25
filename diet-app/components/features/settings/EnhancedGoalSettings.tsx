'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Target, Heart, Dumbbell, Scale, TrendingUp, TrendingDown, Activity, Shield } from 'lucide-react';
import type { GoalMode } from '@/types';

export type GoalType = 
  | 'health' // 健康維持
  | 'weight_loss' // 減量
  | 'weight_gain' // 増量
  | 'muscle_gain' // 筋肉増強
  | 'body_recomposition' // 体型改善
  | 'energy_boost' // 活力向上
  | 'better_sleep' // 睡眠改善
  | 'stress_management'; // ストレス管理

// 従来の詳細な目標タイプオプション
const detailedGoalOptions: Array<{
  id: GoalType;
  label: string;
  description: string;
  icon: React.ReactNode;
  relatedMode: GoalMode;
}> = [
  {
    id: 'weight_loss',
    label: '減量',
    description: '体重・体脂肪を減らす',
    icon: <TrendingDown className="w-4 h-4" />,
    relatedMode: 'CUT'
  },
  {
    id: 'weight_gain',
    label: '増量',
    description: '健康的に体重を増やす',
    icon: <TrendingUp className="w-4 h-4" />,
    relatedMode: 'GAIN'
  },
  {
    id: 'muscle_gain',
    label: '筋肉増強',
    description: '筋肉量を増やす',
    icon: <Dumbbell className="w-4 h-4" />,
    relatedMode: 'GAIN'
  },
  {
    id: 'body_recomposition',
    label: '体型改善',
    description: '筋肉増・脂肪減を同時に',
    icon: <Scale className="w-4 h-4" />,
    relatedMode: 'MAINTAIN'
  },
  {
    id: 'health',
    label: '健康維持',
    description: '健康的な生活を継続',
    icon: <Heart className="w-4 h-4" />,
    relatedMode: 'MAINTAIN'
  },
  {
    id: 'energy_boost',
    label: '活力向上',
    description: 'エネルギーレベルを上げる',
    icon: <Activity className="w-4 h-4" />,
    relatedMode: 'MAINTAIN'
  },
  {
    id: 'better_sleep',
    label: '睡眠改善',
    description: '睡眠の質を向上させる',
    icon: <Target className="w-4 h-4" />,
    relatedMode: 'MAINTAIN'
  },
  {
    id: 'stress_management',
    label: 'ストレス管理',
    description: 'ストレス対処を改善',
    icon: <Shield className="w-4 h-4" />,
    relatedMode: 'MAINTAIN'
  }
];

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
  onGoalTypeChange: (type: GoalType) => void;
  onCurrentWeightChange: (weight: number | undefined) => void;
  onTargetWeightChange: (weight: number | undefined) => void;
  onGoalPeriodChange: (period: GoalPeriod) => void;
  onGoalModeChange?: (mode: GoalMode) => void;
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
  onGoalTypeChange,
  onCurrentWeightChange,
  onTargetWeightChange,
  onGoalPeriodChange,
  onGoalModeChange,
}: EnhancedGoalSettingsProps) {
  // 初期値として、既にgoalModeがCUTまたはGAINの場合は体重入力を表示
  const [showWeightInput, setShowWeightInput] = useState(
    goalMode === 'CUT' || goalMode === 'GAIN' || !!currentWeight || !!targetWeight
  );
  
  const selectedMode = goalModeOptions.find(m => m.id === goalMode);

  const handleGoalModeSelect = (mode: GoalMode) => {
    if (onGoalModeChange) {
      onGoalModeChange(mode);
    }
    
    // モードに基づいてデフォルトのGoalTypeを設定
    switch (mode) {
      case 'CUT':
        // 既存の目標タイプがCUTモードに関連しない場合のみ変更
        const currentGoalForCut = detailedGoalOptions.find(opt => opt.id === goalType && opt.relatedMode === 'CUT');
        if (!currentGoalForCut) {
          onGoalTypeChange('weight_loss');
        }
        setShowWeightInput(true);
        break;
      case 'MAINTAIN':
        const currentGoalForMaintain = detailedGoalOptions.find(opt => opt.id === goalType && opt.relatedMode === 'MAINTAIN');
        if (!currentGoalForMaintain) {
          onGoalTypeChange('health');
        }
        setShowWeightInput(false);
        onCurrentWeightChange(undefined);
        onTargetWeightChange(undefined);
        break;
      case 'GAIN':
        const currentGoalForGain = detailedGoalOptions.find(opt => opt.id === goalType && opt.relatedMode === 'GAIN');
        if (!currentGoalForGain) {
          onGoalTypeChange('weight_gain');
        }
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
      {/* 統合された目標選択 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          あなたの目標を選択してください
        </h3>
        
        {/* 減量関連の目標 */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
            減量・引き締め
          </h4>
          <div className="grid gap-2">
            <button
              onClick={() => {
                onGoalTypeChange('weight_loss');
                if (onGoalModeChange) onGoalModeChange('CUT');
                setShowWeightInput(true);
              }}
              className={`
                w-full p-3 rounded-lg border transition-all text-left
                ${goalType === 'weight_loss'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <TrendingDown className={`w-5 h-5 mt-0.5 ${goalType === 'weight_loss' ? 'text-teal-600' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">減量・ダイエット</h5>
                  <p className="text-xs text-gray-600 mt-0.5">体重・体脂肪を健康的に減らす</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 増量関連の目標 */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
            増量・筋力アップ
          </h4>
          <div className="grid gap-2">
            <button
              onClick={() => {
                onGoalTypeChange('weight_gain');
                if (onGoalModeChange) onGoalModeChange('GAIN');
                setShowWeightInput(true);
              }}
              className={`
                w-full p-3 rounded-lg border transition-all text-left
                ${goalType === 'weight_gain'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <TrendingUp className={`w-5 h-5 mt-0.5 ${goalType === 'weight_gain' ? 'text-teal-600' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">増量</h5>
                  <p className="text-xs text-gray-600 mt-0.5">健康的に体重を増やす</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {
                onGoalTypeChange('muscle_gain');
                if (onGoalModeChange) onGoalModeChange('GAIN');
                setShowWeightInput(true);
              }}
              className={`
                w-full p-3 rounded-lg border transition-all text-left
                ${goalType === 'muscle_gain'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Dumbbell className={`w-5 h-5 mt-0.5 ${goalType === 'muscle_gain' ? 'text-teal-600' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">筋肉増強</h5>
                  <p className="text-xs text-gray-600 mt-0.5">筋肉量を増やして強くなる</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 維持・改善関連の目標 */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
            維持・体質改善
          </h4>
          <div className="grid gap-2">
            <button
              onClick={() => {
                onGoalTypeChange('health');
                if (onGoalModeChange) onGoalModeChange('MAINTAIN');
                setShowWeightInput(false);
                onCurrentWeightChange(undefined);
                onTargetWeightChange(undefined);
              }}
              className={`
                w-full p-3 rounded-lg border transition-all text-left
                ${goalType === 'health'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Heart className={`w-5 h-5 mt-0.5 ${goalType === 'health' ? 'text-teal-600' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">健康維持</h5>
                  <p className="text-xs text-gray-600 mt-0.5">健康的な生活を継続する</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {
                onGoalTypeChange('body_recomposition');
                if (onGoalModeChange) onGoalModeChange('MAINTAIN');
                setShowWeightInput(true);
              }}
              className={`
                w-full p-3 rounded-lg border transition-all text-left
                ${goalType === 'body_recomposition'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Scale className={`w-5 h-5 mt-0.5 ${goalType === 'body_recomposition' ? 'text-teal-600' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">体型改善</h5>
                  <p className="text-xs text-gray-600 mt-0.5">筋肉を増やし脂肪を減らす</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {
                onGoalTypeChange('energy_boost');
                if (onGoalModeChange) onGoalModeChange('MAINTAIN');
                setShowWeightInput(false);
                onCurrentWeightChange(undefined);
                onTargetWeightChange(undefined);
              }}
              className={`
                w-full p-3 rounded-lg border transition-all text-left
                ${goalType === 'energy_boost'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Activity className={`w-5 h-5 mt-0.5 ${goalType === 'energy_boost' ? 'text-teal-600' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">活力向上</h5>
                  <p className="text-xs text-gray-600 mt-0.5">日々のエネルギーレベルを上げる</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {
                onGoalTypeChange('better_sleep');
                if (onGoalModeChange) onGoalModeChange('MAINTAIN');
                setShowWeightInput(false);
                onCurrentWeightChange(undefined);
                onTargetWeightChange(undefined);
              }}
              className={`
                w-full p-3 rounded-lg border transition-all text-left
                ${goalType === 'better_sleep'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Target className={`w-5 h-5 mt-0.5 ${goalType === 'better_sleep' ? 'text-teal-600' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">睡眠改善</h5>
                  <p className="text-xs text-gray-600 mt-0.5">睡眠の質を向上させる</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {
                onGoalTypeChange('stress_management');
                if (onGoalModeChange) onGoalModeChange('MAINTAIN');
                setShowWeightInput(false);
                onCurrentWeightChange(undefined);
                onTargetWeightChange(undefined);
              }}
              className={`
                w-full p-3 rounded-lg border transition-all text-left
                ${goalType === 'stress_management'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Shield className={`w-5 h-5 mt-0.5 ${goalType === 'stress_management' ? 'text-teal-600' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">ストレス管理</h5>
                  <p className="text-xs text-gray-600 mt-0.5">ストレスに対処して心身を整える</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 体重入力 */}
      {showWeightInput && (
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
    </div>
  );
}