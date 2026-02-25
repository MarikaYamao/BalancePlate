'use client';

import { Card } from '@/components/ui/Card';

interface AIFeedbackDisplayProps {
  feedbackText: string;
}

export function AIFeedbackDisplay({ feedbackText }: AIFeedbackDisplayProps) {
  // JSONかどうかチェック
  let feedbackData: any = null;
  
  try {
    feedbackData = JSON.parse(feedbackText);
  } catch {
    // JSONでない場合はそのまま表示
  }
  
  if (feedbackData && typeof feedbackData === 'object') {
    return (
      <div className="space-y-4">
        {/* 総合フィードバック */}
        {feedbackData.feedback && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              🤖 AIからのフィードバック
            </h3>
            <div className="space-y-3">
              {feedbackData.feedback.overall && (
                <p className="text-blue-800 font-medium">{feedbackData.feedback.overall}</p>
              )}
              
              {feedbackData.feedback.positive && feedbackData.feedback.positive.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-1 flex items-center gap-1">
                    ✨ 良いポイント
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    {feedbackData.feedback.positive.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {feedbackData.feedback.suggestions && feedbackData.feedback.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-700 mb-1 flex items-center gap-1">
                    💡 改善提案
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {feedbackData.feedback.suggestions.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {feedbackData.feedback.encouragement && (
                <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
                  <p className="text-blue-800 text-sm font-medium">
                    💪 {feedbackData.feedback.encouragement}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
        
        {/* 栄養アドバイス */}
        {feedbackData.nutritionAdvice && (
          <Card className="p-4 bg-green-50 border-green-200">
            <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
              🥗 栄養アドバイス
            </h3>
            <div className="space-y-3">
              {feedbackData.nutritionAdvice.focus && feedbackData.nutritionAdvice.focus.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-1">意識したい栄養素</h4>
                  <div className="flex flex-wrap gap-2">
                    {feedbackData.nutritionAdvice.focus.map((nutrient: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">
                        {nutrient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {feedbackData.nutritionAdvice.avoid && feedbackData.nutritionAdvice.avoid.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-700 mb-1">控えめにしたいもの</h4>
                  <div className="flex flex-wrap gap-2">
                    {feedbackData.nutritionAdvice.avoid.map((item: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {feedbackData.nutritionAdvice.hydration && (
                <div className="bg-white/50 rounded-lg p-3 border border-green-200">
                  <p className="text-green-800 text-sm">
                    💧 {feedbackData.nutritionAdvice.hydration}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
        
        {/* 今日のガイドライン */}
        {feedbackData.todayGuideline && (
          <Card className="p-4 bg-purple-50 border-purple-200">
            <h3 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
              🎯 今日のガイドライン
            </h3>
            <p className="text-purple-800 text-sm">{feedbackData.todayGuideline}</p>
          </Card>
        )}
        
        {/* 食事提案 */}
        {feedbackData.mealSuggestions && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <h3 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
              🍽️ おすすめメニュー
            </h3>
            <div className="space-y-3">
              {Object.entries(feedbackData.mealSuggestions).map(([mealType, suggestions]: [string, any]) => (
                <div key={mealType}>
                  <h4 className="font-medium text-yellow-800 mb-2">
                    {mealType === 'breakfast' ? '朝食' : 
                     mealType === 'lunch' ? '昼食' : 
                     mealType === 'dinner' ? '夕食' : mealType}
                  </h4>
                  <div className="grid gap-2 text-sm">
                    {suggestions.convenience && (
                      <div className="bg-white/50 rounded p-2">
                        <span className="font-medium text-yellow-700">簡単:</span> {suggestions.convenience}
                      </div>
                    )}
                    {suggestions.simpleCooking && (
                      <div className="bg-white/50 rounded p-2">
                        <span className="font-medium text-yellow-700">軽い調理:</span> {suggestions.simpleCooking}
                      </div>
                    )}
                    {suggestions.normalCooking && (
                      <div className="bg-white/50 rounded p-2">
                        <span className="font-medium text-yellow-700">しっかり調理:</span> {suggestions.normalCooking}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // JSONでない場合の従来の表示方法
  return (
    <Card className="p-4 bg-green-50 border-green-200">
      <h3 className="font-medium text-green-900 mb-2">🤖 AIフィードバック</h3>
      <div className="text-sm text-green-800">
        <div className="prose prose-sm max-w-none">
          {feedbackText?.split('\n').map((line: string, index: number) => {
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
    </Card>
  );
}