import type { ConditionTag } from '@/types';

export interface ConditionTagInfo {
  id: ConditionTag;
  label: string;
  icon: string;
  category: 'physical' | 'mental' | 'lifestyle';
  color: string;
}

export const conditionTagsInfo: ConditionTagInfo[] = [
  // 一般的なコンディション
  {
    id: 'normal',
    label: '普通・特になし',
    icon: '😊',
    category: 'physical',
    color: 'green'
  },
  
  // 身体的コンディション
  {
    id: 'period_before',
    label: '生理前',
    icon: '🌙',
    category: 'physical',
    color: 'purple'
  },
  {
    id: 'period_during',
    label: '生理中',
    icon: '💧',
    category: 'physical',
    color: 'red'
  },
  {
    id: 'period_after',
    label: '生理後',
    icon: '✨',
    category: 'physical',
    color: 'blue'
  },
  {
    id: 'tired_medium',
    label: '疲れている',
    icon: '😴',
    category: 'physical',
    color: 'gray'
  },
  {
    id: 'sleep_bad',
    label: '眠い・寝不足',
    icon: '😪',
    category: 'physical',
    color: 'indigo'
  },
  {
    id: 'stomach_weak',
    label: '胃腸が弱っている',
    icon: '🤢',
    category: 'physical',
    color: 'yellow'
  },
  
  // 精神的コンディション
  {
    id: 'stressed',
    label: 'ストレスあり',
    icon: '😣',
    category: 'mental',
    color: 'orange'
  },
  {
    id: 'craving_sweet',
    label: '甘いものが欲しい',
    icon: '🍰',
    category: 'mental',
    color: 'pink'
  },
  
  // ライフスタイル
  {
    id: 'drinking_planned',
    label: '飲酒予定',
    icon: '🍺',
    category: 'lifestyle',
    color: 'amber'
  },
  {
    id: 'hangover',
    label: '二日酔い',
    icon: '🤕',
    category: 'lifestyle',
    color: 'green'
  },
  
  // フェーズ21: GAINモード専用検知タグ
  {
    id: 'low_total_intake',
    label: '食事量が少ない',
    icon: '🍽️',
    category: 'physical',
    color: 'orange'
  },
  {
    id: 'low_meal_frequency',
    label: '食事回数が少ない',
    icon: '⏰',
    category: 'physical',
    color: 'orange'
  },
  {
    id: 'early_fullness',
    label: 'すぐ満腹になる',
    icon: '🤰',
    category: 'physical',
    color: 'blue'
  },
  {
    id: 'need_liquid_calories',
    label: '固形物が辛い',
    icon: '🥤',
    category: 'physical',
    color: 'cyan'
  },
  {
    id: 'post_workout',
    label: '運動後',
    icon: '💪',
    category: 'physical',
    color: 'emerald'
  },
  
  // 制約レイヤー用
  {
    id: 'morning_sickness',
    label: 'つわり',
    icon: '🤢',
    category: 'physical',
    color: 'yellow'
  },
  {
    id: 'hormone_fluctuation',
    label: 'ホルモン変動',
    icon: '🌊',
    category: 'physical',
    color: 'purple'
  },
  {
    id: 'medical_restriction',
    label: '医療的制限',
    icon: '🏥',
    category: 'physical',
    color: 'red'
  }
];

export const conditionCategories = {
  physical: {
    label: '身体',
    color: 'blue'
  },
  mental: {
    label: '気分',
    color: 'purple'
  },
  lifestyle: {
    label: '予定',
    color: 'green'
  }
};