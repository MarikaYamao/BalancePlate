'use client';

import { useState, useEffect } from 'react';
import { type MealType } from '@/types';

interface PostMealFeedbackProps {
  mealType: MealType;
  mealText: string;
  onClose: () => void;
}

interface FeedbackData {
  response: string;
  requestType: string;
  timestamp: string;
}

export function PostMealFeedback({ mealType, mealText, onClose }: PostMealFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateFeedback();
  }, [mealType, mealText]);

  const generateFeedback = async () => {
    try {
      setLoading(true);
      setError(null);

      // ユーザー設定とコンディションの取得
      const { encryptedUserSettingsRepository, encryptedDailyStateRepository } = await import('@/lib/db/repositories');
      const { getDateKey } = await import('@/lib/utils/dateUtils');
      
      // 設定とコンディションを取得
      let settings = await encryptedUserSettingsRepository.get();
      
      // 設定が存在しない場合はデフォルト値を作成
      if (!settings) {
        const defaultSettings = {
          id: 'default-user',
          dayResetTime: '04:00',
          mealsPerDay: 3 as const,
          bodyConstitution: [],
          lifestyle: [],
          onboardingCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await encryptedUserSettingsRepository.save(defaultSettings);
        settings = defaultSettings;
      }
      
      const dateKey = getDateKey(new Date(), settings.dayResetTime);
      const dailyState = await encryptedDailyStateRepository.get(dateKey);
      
      // 今日の食事データ取得
      const { mealLogRepository } = await import('@/lib/db/repositories');
      const todayMeals = await mealLogRepository.getByDate(dateKey);
      
      // 前日のデータ取得
      const previousDateKey = getPreviousDateKey(dateKey);
      const previousMeals = await mealLogRepository.getByDate(previousDateKey);
      
      // リクエストタイプを決定
      const requestType = mealType === 'breakfast' ? 'after_breakfast' : 
                          mealType === 'lunch' ? 'after_lunch' : 
                          'consultation'; // 夕食や間食は一般的な相談として扱う
      
      // 今日の食事データを整形（現在記録した食事も含む）
      const todayMealData = [
        ...todayMeals.map(meal => ({
          type: meal.mealType,
          content: meal.text,
        })),
        // 現在記録した食事を追加
        {
          type: mealType,
          content: mealText,
        }
      ];
      
      // AIにリクエスト送信
      const requestBody = {
        userProfile: {
          age: settings.profile?.birthYear ? new Date().getFullYear() - settings.profile.birthYear : undefined,
          height: settings.profile?.height,
          currentWeight: settings.profile?.currentWeight,
          activityLevel: settings.profile?.activityLevel,
          bodyConstitution: settings.bodyConstitution,
          lifestyle: settings.lifestyle,
          mealsPerDay: settings.mealsPerDay,
          additionalNotes: settings.additionalNotes,
        },
        todayCondition: {
          conditionTags: dailyState?.conditionTags || [],
          freeMemo: dailyState?.freeMemo || '',
        },
        previousDayData: {
          meals: todayMealData,  // 今日の食事データ（現在の食事を含む）
        },
        requestType,
      };

      const response = await fetch('/api/ai/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('一時的にアクセスが集中しています。しばらく待ってから再試行してください。');
        }
        throw new Error('フィードバックの取得に失敗しました');
      }

      const data = await response.json();
      setFeedback(data);
      
      // AI相談データをローカルストレージに保存（履歴で表示するため）
      try {
        const dateKey = getDateKey(new Date(), settings!.dayResetTime);
        const currentTime = new Date();
        const existingData = localStorage.getItem(`ai-consultation-${dateKey}`);
        const consultations = existingData ? JSON.parse(existingData) : [];
        
        // 複数食事の場合は各食事に対してフィードバックを関連付け
        if (mealText.includes('【')) {
          // 複数食事の統合フィードバックの場合
          const bulkSavedMeals = (window as any).bulkSavedMeals;
          const mealSections = mealText.split('\n\n').filter(section => section.includes('【'));
          
          mealSections.forEach((section, index) => {
            // 日本語文字に対応したパターンに修正
            const mealTypeMatch = section.match(/【([^】]+)】/);
            
            if (mealTypeMatch) {
              const sectionMealLabel = mealTypeMatch[1]; // 朝食、昼食、夕食
              
              // 日本語ラベルを英語のMealTypeに変換
              const mealTypeMappings: Record<string, string> = {
                '朝食': 'breakfast',
                '昼食': 'lunch', 
                '夕食': 'dinner',
                '間食': 'snack'
              };
              const sectionMealType = mealTypeMappings[sectionMealLabel] || sectionMealLabel;
              
              // 実際に保存された食事記録のタイムスタンプを使用
              let actualTimestamp = currentTime.toISOString();
              if (bulkSavedMeals && bulkSavedMeals[index] && bulkSavedMeals[index].actualTime) {
                // actualTimeがDate型の場合とISO文字列の場合に対応
                const mealActualTime = bulkSavedMeals[index].actualTime;
                actualTimestamp = mealActualTime instanceof Date 
                  ? mealActualTime.toISOString() 
                  : new Date(mealActualTime).toISOString();
              }
              
              const consultationData = {
                timestamp: actualTimestamp,
                mealType: sectionMealType,
                mealText: section,
                response: data.response || null,
                requestType,
                isIntegratedFeedback: true
              };
              
              consultations.push(consultationData);
            }
          });
          
          // グローバル変数をクリーンアップ
          delete (window as any).bulkSavedMeals;
        } else {
          // 単一食事の場合
          const consultationData = {
            timestamp: currentTime.toISOString(),
            mealType,
            mealText,
            response: data.response || null,
            requestType
          };
          consultations.push(consultationData);
        }
        
        localStorage.setItem(`ai-consultation-${dateKey}`, JSON.stringify(consultations));
        
      } catch (storageError) {
        console.warn('Failed to save consultation data:', storageError);
      }
    } catch (err) {
      console.error('Feedback generation failed:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getPreviousDateKey = (currentDateKey: string): string => {
    const currentDate = new Date(currentDateKey);
    currentDate.setDate(currentDate.getDate() - 1);
    return currentDate.toISOString().split('T')[0];
  };

  const getMealTypeLabel = (type: MealType): string => {
    const labels = {
      breakfast: '朝食',
      lunch: '昼食',
      dinner: '夕食',
      snack: '間食'
    };
    return labels[type];
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-2">
                🍽️ {mealText.includes('【') ? '今日の食事フィードバック' : `${getMealTypeLabel(mealType)}のフィードバック`}
              </h2>
              <p className="text-green-100 text-sm">
                {mealText.includes('【') ? '複数食事の統合分析' : `記録内容: ${mealText.length > 50 ? `${mealText.substring(0, 50)}...` : mealText}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-100 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="text-center text-gray-500 text-sm">
                あなたの体質と今日のコンディションを分析してフィードバックを作成中...
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 text-lg mb-4">⚠️ エラー</div>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={generateFeedback}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                再試行
              </button>
            </div>
          )}

          {feedback && (
            <div className="space-y-6">
              {/* AIアシスタントアイコンとヘッダー */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">AIアシスタント</h3>
                  <p className="text-xs text-gray-500">
                    あなたの体質と今日のコンディションを考慮したアドバイス
                  </p>
                </div>
              </div>

              {/* フィードバック内容 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  {feedback.response.split('\n').map((line, index) => {
                    // ### で始まる行（h3見出し）
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={index} className="font-bold text-gray-800 mt-4 mb-2 text-lg">
                          {line.substring(4)}
                        </h3>
                      );
                    }
                    // #### で始まる行（h4見出し）
                    else if (line.startsWith('#### ')) {
                      return (
                        <h4 key={index} className="font-semibold text-gray-700 mt-3 mb-1 text-base">
                          {line.substring(5)}
                        </h4>
                      );
                    }
                    // **太字**の処理
                    else if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h4 key={index} className="font-bold text-gray-800 mt-4 mb-2 text-base">
                          {line.replace(/\*\*/g, '')}
                        </h4>
                      );
                    }
                    // - で始まるリストアイテム
                    else if (line.startsWith('- ')) {
                      // リスト内の**太字**も処理
                      const content = line.substring(2);
                      const processedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                      return (
                        <li key={index} className="text-gray-700 mb-1 ml-4 list-disc"
                          dangerouslySetInnerHTML={{ __html: processedContent }}
                        />
                      );
                    }
                    // 絵文字付きポイント
                    else if (line.startsWith('✨') || line.startsWith('🌱') || line.startsWith('💪') || line.startsWith('🌙') || line.startsWith('💡')) {
                      return (
                        <p key={index} className="text-gray-700 mb-2 font-medium">
                          {line}
                        </p>
                      );
                    }
                    // 空行
                    else if (line.trim() === '') {
                      return <br key={index} />;
                    }
                    // 通常の文（太字のインライン処理）
                    else {
                      // **text** を <strong>text</strong> に変換
                      const processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                      return (
                        <p key={index} className="text-gray-700 mb-2"
                          dangerouslySetInnerHTML={{ __html: processedLine }}
                        />
                      );
                    }
                  })}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  フィードバックを確認しました
                </button>
                <button
                  onClick={generateFeedback}
                  className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  更新
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}