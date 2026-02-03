'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { aiClient, AIError } from '@/lib/ai/client';

export default function TestAIPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const testMorningPlan = async () => {
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await aiClient.getMorningPlan({
        userProfile: {
          age: 30,
          height: 165,
          currentWeight: 60,
          activityLevel: 'light',
          bodyConstitution: ['weak_stomach', 'cold_sensitivity'],
          lifestyle: ['desk_work', 'sleep_deprived'],
          mealsPerDay: 3,
          additionalNotes: 'コーヒーが好きです',
        },
        todayCondition: {
          conditionTags: ['tired', 'stressed'],
          freeMemo: '今日は疲れています',
        },
        goals: {
          goalType: 'weight_loss',
          targetWeight: 55,
          dailyCalorieTarget: 1500,
        },
        previousDayData: {
          meals: [
            { type: '朝食', content: 'パンとコーヒー' },
            { type: '昼食', content: 'サラダとスープ' },
            { type: '夕食', content: '魚と野菜炒め' },
          ],
          weight: 60.5,
        },
      });

      setResponse(result.response);
    } catch (err) {
      if (err instanceof AIError) {
        setError(`エラー (${err.status}): ${err.message}`);
      } else {
        setError('予期せぬエラーが発生しました');
      }
      console.error('AI Test Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testSimpleRequest = async () => {
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await aiClient.getGeneralConsultation({
        userProfile: {
          bodyConstitution: [],
          lifestyle: [],
          mealsPerDay: 3,
        },
        todayCondition: {
          conditionTags: [],
          freeMemo: 'ダイエットのコツを教えて',
        },
      });

      setResponse(result.response);
    } catch (err) {
      if (err instanceof AIError) {
        setError(`エラー (${err.status}): ${err.message}`);
      } else {
        setError('予期せぬエラーが発生しました');
      }
      console.error('AI Test Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">AI機能テスト</h1>
        
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">テスト実行</h2>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={testMorningPlan}
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? 'テスト中...' : '朝の食事プラン取得'}
            </Button>
            <Button
              onClick={testSimpleRequest}
              disabled={isLoading}
              variant="soft"
            >
              {isLoading ? 'テスト中...' : 'シンプルな相談'}
            </Button>
          </div>
          
          <p className="text-sm text-gray-600">
            ※ OPENAI_API_KEYが設定されている場合のみ動作します
          </p>
        </Card>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <h3 className="font-semibold text-red-800 mb-2">エラー</h3>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {response && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-2">AI応答</h3>
            <div className="whitespace-pre-wrap text-gray-700 text-sm">
              {response}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}