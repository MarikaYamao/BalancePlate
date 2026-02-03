'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FoodPlanCard } from './FoodPlanCard';
import { aiClient, AIError } from '@/lib/ai/client';
import { FoodPlanParser } from '@/lib/ai/parser';
import { foodPlanRepository } from '@/lib/db/repositories';
import type { FoodPlan } from '@/types';
import type { AIPromptContext } from '@/lib/ai/prompts';

interface FoodPlanGeneratorProps {
  dateKey: string;
  context: Omit<AIPromptContext, 'requestType'>;
  onPlanSelected?: (plan: FoodPlan) => void;
  existingPlans?: FoodPlan[];
}

export function FoodPlanGenerator({
  dateKey,
  context,
  onPlanSelected,
  existingPlans = [],
}: FoodPlanGeneratorProps) {
  const [plans, setPlans] = useState<FoodPlan[]>(existingPlans);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(
    existingPlans.find(p => p.selected)?.planType || null
  );

  const generatePlans = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError('');

    try {
      // AI応答を取得
      const response = await aiClient.getMorningPlan(context);
      
      // 応答をパース
      const parsedPlans = FoodPlanParser.parseAIResponse(response.response, dateKey);
      
      if (parsedPlans.length === 0) {
        throw new Error('プランの生成に失敗しました');
      }

      // 既存のプランを削除してから新しいプランを保存
      await foodPlanRepository.deleteByDate(dateKey);
      await foodPlanRepository.saveMultiple(parsedPlans.map(plan => ({
        dateKey: plan.dateKey,
        planType: plan.planType,
        planName: plan.planName,
        description: plan.description,
        meals: plan.meals,
      })));

      setPlans(parsedPlans);
      console.log('Plans generated and saved:', parsedPlans);
      
    } catch (err) {
      console.error('Plan generation error:', err);
      
      if (err instanceof AIError) {
        if (err.status === 429) {
          setError('リクエストが多すぎます。しばらく待ってから再試行してください。');
        } else if (err.status === 503) {
          setError('AI機能が一時的に利用できません。しばらくしてから再試行してください。');
        } else {
          setError(`エラーが発生しました: ${err.message}`);
        }
      } else {
        setError('プランの生成に失敗しました。ネットワーク接続を確認してください。');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const selectPlan = async (planType: 'A' | 'B' | 'C') => {
    if (isSelecting === planType) return;

    setIsSelecting(planType);
    setError('');

    try {
      // データベースで選択状態を更新
      await foodPlanRepository.selectPlan(dateKey, planType);
      
      // ローカル状態を更新
      const updatedPlans = plans.map(plan => ({
        ...plan,
        selected: plan.planType === planType,
        selectedAt: plan.planType === planType ? new Date() : plan.selectedAt,
      }));
      
      setPlans(updatedPlans);
      setSelectedPlanType(planType);

      // 選択されたプランを親コンポーネントに通知
      const selectedPlan = updatedPlans.find(p => p.planType === planType);
      if (selectedPlan && onPlanSelected) {
        onPlanSelected(selectedPlan);
      }

      console.log(`Plan ${planType} selected`);
      
    } catch (err) {
      console.error('Plan selection error:', err);
      setError('プランの選択に失敗しました');
    } finally {
      setIsSelecting(null);
    }
  };

  const hasValidPlans = plans.length === 3;
  const hasSelectedPlan = selectedPlanType !== null;

  return (
    <div className="space-y-4">
      {/* 生成ボタン */}
      {!hasValidPlans && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            今日の食事プラン
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            あなたの体質と今日のコンディションに合わせて、3つのプランを提案します。
          </p>
          <Button
            onClick={generatePlans}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                プラン生成中...
              </div>
            ) : (
              '食事プランを生成'
            )}
          </Button>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </Card>
      )}

      {/* プラン一覧 */}
      {hasValidPlans && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              今日の食事プラン
            </h2>
            <Button
              onClick={generatePlans}
              disabled={isGenerating}
              variant="secondary"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  生成中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  再生成
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {plans.map((plan) => (
              <FoodPlanCard
                key={plan.planType}
                plan={plan}
                onSelect={() => selectPlan(plan.planType)}
                isSelected={plan.selected}
                isLoading={isSelecting === plan.planType}
              />
            ))}
          </div>

          {hasSelectedPlan && (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  プラン{selectedPlanType}を選択しました！今日はこのプランで頑張りましょう。
                </span>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}