// Phase20: 買い出し提案関連の型定義

export type ShoppingSuggestionRequestType = 'weekly_planning' | 'specific_meal' | 'nutritional_gap';

export interface ShoppingSuggestionItem {
  name: string;
  category: string;
  priority: number; // 0-100
  nutritionalValue: number; // 1-10
  versatility: number; // 1-10, 汎用性スコア
  reason: string; // 推奨理由
}

export interface ShoppingSuggestionCategory {
  category: string;
  displayName: string;
  items: ShoppingSuggestionItem[];
  urgency: 'high' | 'medium' | 'low';
  urgencyLevel?: 1 | 2 | 3; // 1=低, 2=中, 3=高（🚨の個数）
}

export interface ShoppingSuggestionResponse {
  targetDays: number;
  suggestions: ShoppingSuggestionCategory[];
  nutritionalBalance: {
    protein: number;
    vegetables: number;
    carbohydrates: number;
    fats: number;
    vitamins: number;
  };
  priorities: {
    immediate: string[]; // すぐ買うべき
    thisWeek: string[];  // 今週中に
    optional: string[];   // あると良い
  };
  metadata: {
    generatedAt: string;
    requestType: ShoppingSuggestionRequestType;
    basedOnFridgeItems: number;
    goalMode: string;
  };
}

export interface ShoppingSuggestionRequest {
  userProfile: {
    bodyConstitution?: string[];
    lifestyle?: string[];
    favoriteFoods?: string[];
    dislikedFoods?: string[];
    mealsPerDay?: number;
    additionalNotes?: string;
    goalMode?: 'CUT' | 'MAINTAIN' | 'GAIN';
    constraints?: string[];
  };
  fridgeItems?: {
    name: string;
    category: string;
    available: boolean;
  }[];
  requestType?: ShoppingSuggestionRequestType;
  targetDays?: number;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  priority: number;
  purchased: boolean;
  purchasedAt?: Date;
  notes?: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  createdAt: Date;
  targetDate?: Date;
  items: ShoppingListItem[];
  completed: boolean;
  completedAt?: Date;
}