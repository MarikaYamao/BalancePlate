'use client';

import { TextInput, type QuickAction } from '@/components/ui/TextInput';

interface MealInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  label?: string;
  required?: boolean;
  variant?: 'default' | 'bordered' | 'focused';
}

const defaultMealExamples = [
  '白米、味噌汁、焼き鮭、ほうれん草のお浸し',
  'パスタ（カルボナーラ）、サラダ、スープ',
  'そば、天ぷら、お茶',
  'サンドイッチ、コーヒー、ヨーグルト',
  'おにぎり2個、唐揚げ、お茶',
  'チキンサラダ、スムージー',
  'カレーライス、福神漬け',
  'お寿司、味噌汁、茶碗蒸し',
  'トースト、卵料理、オレンジジュース',
  'ラーメン、餃子、チャーハン'
];

const defaultQuickActions: QuickAction[] = [
  { label: 'コンビニ', value: 'コンビニ弁当', icon: '🏪' },
  { label: '外食', value: '外食：', icon: '🍽️' },
  { label: '自炊', value: '自炊：', icon: '👩‍🍳' },
  { label: 'デリバリー', value: 'デリバリー：', icon: '🛵' },
];

export function MealInput({ 
  value, 
  onChange, 
  placeholder = '食べたものを入力してください',
  disabled = false,
  maxLength = 1000,
  label = '食事内容',
  required = false,
  variant = 'bordered'
}: MealInputProps) {
  return (
    <TextInput
      value={value}
      onChange={onChange}
      type="textarea"
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      rows={4}
      label={label}
      required={required}
      helpText="具体的に記録するとAIがより正確なアドバイスを提供できます"
      showCharCount={true}
      examples={defaultMealExamples}
      quickActions={defaultQuickActions}
      variant={variant}
      icon="🍽️"
    />
  );
}