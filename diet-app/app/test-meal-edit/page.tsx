'use client';

import { useState } from 'react';
import { mealLogRepository } from '@/lib/db/repositories';
import { getDateKey } from '@/lib/utils/dateUtils';

export default function TestMealEditPage() {
  const [result, setResult] = useState<string>('');

  const createTestMeal = async () => {
    try {
      const dateKey = getDateKey(new Date(), '04:00');
      const meal = await mealLogRepository.save({
        dateKey,
        mealType: 'breakfast',
        text: 'テスト朝食：パン、コーヒー、サラダ'
      });
      setResult(`食事を作成しました: ID=${meal.id}`);
    } catch (error) {
      setResult(`エラー: ${error}`);
    }
  };

  const testEditFlow = async () => {
    try {
      const dateKey = getDateKey(new Date(), '04:00');
      
      // 1. 新規作成
      const meal = await mealLogRepository.save({
        dateKey,
        mealType: 'lunch',
        text: '元のテキスト：ラーメン'
      });
      
      // 2. 編集
      await mealLogRepository.update(meal.id, {
        text: '編集後：チャーハンとラーメン'
      });
      
      // 3. 取得して確認
      const updated = await mealLogRepository.get(meal.id);
      
      setResult(`編集テスト成功！\n元: ラーメン\n編集後: ${updated?.text}`);
    } catch (error) {
      setResult(`エラー: ${error}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">食事編集機能テスト</h1>
      
      <div className="space-y-4">
        <button
          onClick={createTestMeal}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          テスト食事を作成
        </button>
        
        <button
          onClick={testEditFlow}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          編集フローをテスト
        </button>
        
        {result && (
          <div className="p-4 bg-gray-100 rounded whitespace-pre-wrap">
            {result}
          </div>
        )}
        
        <div className="mt-8">
          <a href="/record/meal" className="text-blue-600 hover:underline">
            → 実際の食事記録ページへ
          </a>
        </div>
      </div>
    </div>
  );
}