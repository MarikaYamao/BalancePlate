import type { ConditionTag } from '@/types';

export interface ConditionTagInfo {
  id: ConditionTag;
  label: string;
  icon: string;
  category: 'physical' | 'mental' | 'lifestyle';
  color: string;
}

export const conditionTagsInfo: ConditionTagInfo[] = [
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
    id: 'tired',
    label: '疲れている',
    icon: '😴',
    category: 'physical',
    color: 'gray'
  },
  {
    id: 'sleepy',
    label: '眠い',
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