// AI consultation and response related types

import { ConditionTag } from './condition';
import { MealType, MealPlanDetail } from './meal';
import { UserSettings } from './user';
import { DailyState } from './condition';
import { MealLog } from './meal';

export interface AIConsultationResponse {
  // フィードバック部分
  feedback: {
    overall: string;           // 総合評価
    positive: string[];        // 良かった点
    suggestions: string[];     // 改善提案
    encouragement: string;     // 励ましメッセージ
  };
  
  // 食事提案部分
  mealPlans: {
    breakfast?: MealPlanDetail;
    lunch?: MealPlanDetail;
    dinner?: MealPlanDetail;
    snack?: MealPlanDetail;
  };
  
  // 栄養アドバイス
  nutritionAdvice: {
    focus: string[];          // 重視すべき栄養素
    avoid: string[];          // 控えめにすべきもの
    hydration: string;        // 水分摂取アドバイス
  };
  
  // メタデータ
  metadata: {
    generatedAt: string;
    conditionTags: ConditionTag[];
    context: 'morning' | 'meal' | 'evening';
  };
}

export interface AIConsultation {
  id: string;                // UUID
  dateKey: string;          // "2024-01-15" 形式
  type: 'condition' | 'meal' | 'combined';
  
  // リクエスト情報
  request: {
    userSettings?: UserSettings;
    dailyState?: DailyState;
    mealLog?: MealLog;
    context: string;
  };
  
  // AIレスポンス（構造化データ）
  response: AIConsultationResponse;
  
  // 従来のテキスト形式（移行期間中のフォールバック）
  legacyResponse?: string;
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
}