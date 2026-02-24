import type { MealType } from '@/types';

// Meal type configurations
export interface MealTypeConfig {
  value: MealType;
  label: string;
  icon: string;
  timeRange: string;
  displayOrder: number;
  defaultEnabled: boolean;
}

export const MEAL_TYPE_CONFIGS: Record<MealType, MealTypeConfig> = {
  breakfast: {
    value: 'breakfast',
    label: '朝食',
    icon: '🌅',
    timeRange: '6:00-10:00',
    displayOrder: 1,
    defaultEnabled: true
  },
  lunch: {
    value: 'lunch',
    label: '昼食',
    icon: '☀️',
    timeRange: '11:30-14:00',
    displayOrder: 2,
    defaultEnabled: true
  },
  dinner: {
    value: 'dinner',
    label: '夕食',
    icon: '🌙',
    timeRange: '17:00-21:00',
    displayOrder: 3,
    defaultEnabled: true
  },
  snack: {
    value: 'snack',
    label: '間食',
    icon: '🍪',
    timeRange: '随時',
    displayOrder: 4,
    defaultEnabled: false
  }
};

export const MEAL_TYPE_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_EXAMPLES: Record<MealType, string[]> = {
  breakfast: [
    '白米、味噌汁、焼き鮭、ほうれん草のお浸し',
    'トースト、卵料理、オレンジジュース',
    'おにぎり、お茶、ヨーグルト',
    'パンケーキ、フルーツ、コーヒー',
    'グラノーラ、ヨーグルト、バナナ'
  ],
  lunch: [
    'パスタ（カルボナーラ）、サラダ、スープ',
    'そば、天ぷら、お茶',
    'サンドイッチ、コーヒー、ヨーグルト',
    'カレーライス、福神漬け',
    'ラーメン、餃子、チャーハン'
  ],
  dinner: [
    '白米、味噌汁、焼き魚、野菜炒め',
    'ステーキ、サラダ、スープ、パン',
    'お寿司、味噌汁、茶碗蒸し',
    '鍋物、白米、お茶',
    'パスタ、サラダ、ワイン'
  ],
  snack: [
    'りんご1個',
    'ヨーグルト1個',
    'ナッツ少量',
    'チョコレート3粒',
    'お茶とクッキー2枚'
  ]
};

export const QUICK_MEAL_ACTIONS = [
  { label: 'コンビニ', value: 'コンビニ弁当', icon: '🏪' },
  { label: '外食', value: '外食：', icon: '🍽️' },
  { label: '自炊', value: '自炊：', icon: '👩‍🍳' },
  { label: 'デリバリー', value: 'デリバリー：', icon: '🛵' },
  { label: '冷凍食品', value: '冷凍食品：', icon: '🥶' },
  { label: '惣菜', value: '惣菜：', icon: '🥘' }
];