// Phase20: 買い出し提案API
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ShoppingSuggestionRequestSchema = z.object({
  userProfile: z.object({
    bodyConstitution: z.array(z.string()).optional(),
    lifestyle: z.array(z.string()).optional(),
    favoriteFoods: z.array(z.string()).optional(),
    dislikedFoods: z.array(z.string()).optional(),
    mealsPerDay: z.number().optional(),
    additionalNotes: z.string().optional(),
    goalMode: z.enum(['CUT', 'MAINTAIN', 'GAIN']).optional(),
    constraints: z.array(z.string()).optional(),
  }),
  fridgeItems: z.array(z.object({
    name: z.string(),
    category: z.string(),
    available: z.boolean(),
  })).optional(),
  requestType: z.enum(['weekly_planning', 'specific_meal', 'nutritional_gap']).default('weekly_planning'),
  targetDays: z.number().min(1).max(14).default(7), // 何日分の計画か
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ShoppingSuggestionRequestSchema.parse(body);

    // Phase20: 買い出し提案ロジック
    const suggestionResult = await generateShoppingSuggestions(validatedData);

    return NextResponse.json({
      success: true,
      suggestions: suggestionResult,
    });

  } catch (error) {
    console.error('Shopping suggestion error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate shopping suggestions' 
      },
      { status: 500 }
    );
  }
}

async function generateShoppingSuggestions(data: z.infer<typeof ShoppingSuggestionRequestSchema>) {
  const { userProfile, fridgeItems = [], targetDays, requestType } = data;

  // 現在の冷蔵庫状況を分析
  const availableItems = fridgeItems.filter(item => item.available);
  const missingCategories = analyzeMissingCategories(fridgeItems);
  
  // ユーザーの好き嫌いを考慮
  const favoriteItems = userProfile.favoriteFoods || [];
  const dislikedItems = userProfile.dislikedFoods || [];
  
  // 栄養バランスを考慮した基本食材リスト
  const baseIngredients = getBaseIngredients(userProfile.goalMode, userProfile.bodyConstitution);
  
  // 買い出し提案を生成
  const suggestions = generateSuggestionsByCategory({
    baseIngredients,
    availableItems,
    missingCategories,
    favoriteItems,
    dislikedItems,
    targetDays,
    goalMode: userProfile.goalMode,
    constraints: userProfile.constraints || []
  });

  return {
    targetDays,
    suggestions,
    nutritionalBalance: analyzeNutritionalBalance(suggestions),
    priorities: calculatePriorities(suggestions, userProfile.goalMode),
    metadata: {
      generatedAt: new Date().toISOString(),
      requestType,
      basedOnFridgeItems: availableItems.length,
      goalMode: userProfile.goalMode || 'MAINTAIN'
    }
  };
}

function analyzeMissingCategories(fridgeItems: any[]) {
  const categories = ['protein', 'vegetables', 'grains', 'dairy', 'fats', 'seasonings', 'fruits'];
  const availableCategories = new Set(
    fridgeItems.filter(item => item.available).map(item => item.category)
  );
  
  return categories.filter(category => !availableCategories.has(category));
}

function getBaseIngredients(goalMode?: string, bodyConstitution?: string[]) {
  const baseSet = {
    protein: ['卵', '鶏胸肉', '豆腐', '納豆', '鮭'],
    vegetables: ['ほうれん草', 'ブロッコリー', '玉ねぎ', '人参', 'キャベツ'],
    grains: ['玄米', 'オートミール', '全粒粉パン'],
    dairy: ['牛乳', 'ヨーグルト', 'チーズ'],
    fats: ['オリーブオイル', 'アボカド', 'ナッツ'],
    seasonings: ['塩', '醤油', '味噌', 'ガーリック', '生姜'],
    fruits: ['バナナ', 'りんご', 'ベリー類']
  };

  // ゴールモード別調整
  if (goalMode === 'CUT') {
    // 減量モードはヘルシー食材優先
    baseSet.protein = ['鶏胸肉', '白身魚', '豆腐', '卵白', 'ギリシャヨーグルト'];
    baseSet.vegetables.push('レタス', 'きゅうり', 'セロリ');
  } else if (goalMode === 'GAIN') {
    // 増量モードは栄養価の高い食材追加
    baseSet.protein.push('牛肉', 'マグロ', 'プロテインパウダー');
    baseSet.fats.push('ピーナッツバター', '胡麻', 'MCTオイル');
    baseSet.grains.push('白米', 'パスタ', 'ベーグル');
  }

  // 体質別調整
  if (bodyConstitution?.includes('cold_constitution')) {
    baseSet.seasonings.push('唐辛子', 'シナモン', '山椒');
    baseSet.vegetables = baseSet.vegetables.filter(v => !['きゅうり', 'レタス'].includes(v));
  }

  return baseSet;
}

function generateSuggestionsByCategory(params: {
  baseIngredients: any;
  availableItems: any[];
  missingCategories: string[];
  favoriteItems: string[];
  dislikedItems: string[];
  targetDays: number;
  goalMode?: string;
  constraints: string[];
}) {
  const {
    baseIngredients,
    availableItems,
    missingCategories,
    favoriteItems,
    dislikedItems,
    targetDays,
    goalMode,
    constraints
  } = params;

  const suggestions: any[] = [];
  const availableItemNames = new Set(availableItems.map(item => item.name));

  Object.entries(baseIngredients).forEach(([category, items]) => {
    const categoryItems = (items as string[])
      .filter(item => !availableItemNames.has(item)) // 既に持っているものは除外
      .filter(item => !dislikedItems.includes(item)) // 嫌いな食材は除外
      .map(item => ({
        name: item,
        category,
        priority: calculateItemPriority(item, favoriteItems, missingCategories, category, goalMode),
        nutritionalValue: getNutritionalValue(item),
        versatility: getVersatilityScore(item), // 汎用性スコア
        reason: getRecommendationReason(item, goalMode, category)
      }));

    if (categoryItems.length > 0) {
      const urgency = missingCategories.includes(category) ? 'high' : 'medium';
      const urgencyLevel = calculateUrgencyLevel(category, missingCategories, goalMode);
      
      suggestions.push({
        category: category,
        displayName: getCategoryDisplayName(category),
        items: categoryItems.sort((a, b) => b.priority - a.priority).slice(0, 5), // 上位5件
        urgency: urgency,
        urgencyLevel: urgencyLevel // 1-3の数値
      });
    }
  });

  return suggestions;
}

function calculateItemPriority(
  item: string, 
  favoriteItems: string[], 
  missingCategories: string[], 
  category: string,
  goalMode?: string
): number {
  let priority = 50; // ベーススコア

  // 好きな食材ボーナス
  if (favoriteItems.includes(item)) priority += 30;

  // 不足カテゴリのボーナス
  if (missingCategories.includes(category)) priority += 20;

  // ゴールモード別ボーナス
  if (goalMode === 'CUT' && ['鶏胸肉', '白身魚', 'ほうれん草'].includes(item)) priority += 15;
  if (goalMode === 'GAIN' && ['牛肉', 'アボカド', 'ナッツ'].includes(item)) priority += 15;

  // 基本的な栄養価値
  const nutritionalScore = getNutritionalValue(item);
  priority += nutritionalScore * 10;

  // 汎用性（色んな料理に使える）
  const versatilityScore = getVersatilityScore(item);
  priority += versatilityScore * 5;

  return Math.min(100, Math.max(0, priority));
}


function getNutritionalValue(item: string): number {
  const nutritionMap: { [key: string]: number } = {
    '卵': 9, '鶏胸肉': 9, '鮭': 9, '豆腐': 7, '納豆': 8,
    'ほうれん草': 8, 'ブロッコリー': 9, '人参': 6,
    '玄米': 7, 'オートミール': 8, 'アボカド': 8
  };
  return nutritionMap[item] || 5; // 1-10スケール
}

function getVersatilityScore(item: string): number {
  const versatilityMap: { [key: string]: number } = {
    '卵': 10, '玉ねぎ': 9, 'オリーブオイル': 9, '鶏胸肉': 8,
    '豆腐': 7, 'ほうれん草': 6, 'ブロッコリー': 5
  };
  return versatilityMap[item] || 5; // 1-10スケール
}


function getRecommendationReason(item: string, goalMode?: string, category?: string): string {
  if (goalMode === 'CUT' && category === 'protein') {
    return '高タンパク低脂質で減量をサポート';
  }
  if (goalMode === 'GAIN' && category === 'fats') {
    return '良質な脂質で健康的な増量をサポート';
  }
  if (category === 'vegetables') {
    return 'ビタミン・ミネラルが豊富で体調管理に最適';
  }
  return '栄養バランスの良い基本食材';
}

function getCategoryDisplayName(category: string): string {
  const displayNames: { [key: string]: string } = {
    protein: 'タンパク質',
    vegetables: '野菜',
    grains: '主食・穀物',
    dairy: '乳製品',
    fats: '良質な脂質',
    seasonings: '調味料',
    fruits: 'フルーツ'
  };
  return displayNames[category] || category;
}


function analyzeNutritionalBalance(suggestions: any[]) {
  const balance = {
    protein: 0,
    vegetables: 0,
    carbohydrates: 0,
    fats: 0,
    vitamins: 0
  };

  suggestions.forEach(category => {
    category.items.forEach((item: any) => {
      const nutrition = item.nutritionalValue;
      switch (category.category) {
        case 'protein':
          balance.protein += nutrition;
          break;
        case 'vegetables':
          balance.vegetables += nutrition;
          balance.vitamins += nutrition;
          break;
        case 'grains':
          balance.carbohydrates += nutrition;
          break;
        case 'fats':
          balance.fats += nutrition;
          break;
      }
    });
  });

  return balance;
}

function calculateUrgencyLevel(category: string, missingCategories: string[], goalMode?: string): 1 | 2 | 3 {
  // タンパク質と野菜は最優先
  if (['protein', 'vegetables'].includes(category) && missingCategories.includes(category)) {
    return 3; // 🚨🚨🚨
  }
  
  // 不足カテゴリは高優先度
  if (missingCategories.includes(category)) {
    return 2; // 🚨🚨
  }
  
  // ゴールモードに応じた重要カテゴリ
  if (goalMode === 'CUT' && category === 'protein') {
    return 2; // 🚨🚨
  }
  if (goalMode === 'GAIN' && ['protein', 'fats', 'grains'].includes(category)) {
    return 2; // 🚨🚨
  }
  
  // その他は低優先度
  return 1; // 🚨
}

function calculatePriorities(suggestions: any[], goalMode?: string) {
  const priorities = {
    immediate: [] as string[], // すぐ買うべき
    thisWeek: [] as string[], // 今週中に
    optional: [] as string[]   // あると良い
  };

  suggestions.forEach(category => {
    if (category.urgency === 'high' || category.urgencyLevel === 3) {
      priorities.immediate.push(category.displayName);
    } else {
      category.items.forEach((item: any) => {
        if (item.priority > 80) {
          priorities.thisWeek.push(item.name);
        } else if (item.priority > 60) {
          priorities.optional.push(item.name);
        }
      });
    }
  });

  return priorities;
}