// Meal logging and nutrition related types

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutrientEstimate {
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface MealLog {
  id: string; // UUID
  
  // 日付・タイミング
  dateKey: string; // リセット時間基準の日付
  mealType: MealType;
  actualTime: Date; // 実際の食事時刻
  
  // 記録内容
  text: string; // 食事内容（自由記述）
  followedPlan?: boolean; // プランに従ったか
  planId?: string; // 従ったプランのID
  
  // AI分析結果（非同期で追加）
  aiAnalysis?: {
    estimatedNutrients?: NutrientEstimate;
    suggestions?: string[];
    analyzedAt: Date;
  };
  
  // AIフィードバック（ダイナミックに追加）
  aiResponse?: string;
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface FoodPlan {
  dateKey: string; // 日付（PRIMARY KEYの一部）
  planType: 'A' | 'B' | 'C'; // プランタイプ（PRIMARY KEYの一部）
  planName: string; // "しっかり整えるプラン" など
  description: string; // プランの説明
  
  // 選択状態
  selected: boolean;
  selectedAt?: Date;
  
  // 食事提案内容
  meals: FoodPlanMealSuggestion[];
  
  // メタデータ
  createdAt: Date;
  expiresAt: Date; // プランの有効期限
}

export interface FoodPlanMealSuggestion {
  mealType: MealType;
  mainItems: string[]; // メイン料理
  sideItems: string[]; // 副菜
  notes?: string; // 注意点や理由
  alternatives?: string[]; // 代替案
}

// AI meal planning related types
export interface MealPlanDetail {
  menu: string[];            // メニュー項目
  preparation: string;       // 準備方法（簡単/手軽など）
  alternatives: string[];    // 代替案
  reason: string;           // この提案の理由
  timing?: string;          // 推奨時間
  // Phase19: 食材利用可能性情報
  availableIngredients?: string[];   // 利用可能な食材
  missingIngredients?: string[];     // 不足している食材
  canMakeNow?: boolean;              // 今すぐ作れるかどうか
}

export interface MealSuggestion {
  mealType: MealType;
  plan: MealPlanDetail;
  source: 'ai_consultation' | 'predefined';
  timestamp: string;
}