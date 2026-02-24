'use client';

import { TagSelector, type TagCategory } from '@/components/ui/TagSelector';
import type { BodyConstitutionTag } from '@/types';

interface BodyConstitutionPickerProps {
  selectedTags: BodyConstitutionTag[];
  onTagsChange: (tags: BodyConstitutionTag[]) => void;
  title?: string;
  description?: string;
  variant?: 'default' | 'compact' | 'card';
  columns?: 1 | 2 | 3 | 4;
}

const BODY_CONSTITUTION_CATEGORIES: TagCategory<BodyConstitutionTag>[] = [
  {
    category: '健康状態',
    description: '一般的な健康状態や体調に関する特徴',
    tags: [
      { value: 'healthy', label: '特に問題なし', icon: '✨', color: 'success' },
      { value: 'good_digestion', label: '消化が良い', icon: '👍', color: 'success' },
      { value: 'high_metabolism', label: '代謝が良い', icon: '🔥', color: 'success' },
      { value: 'good_stamina', label: '体力がある', icon: '💪', color: 'success' },
      { value: 'good_sleep', label: '睡眠の質が良い', icon: '😴', color: 'success' },
    ]
  },
  {
    category: '循環・代謝',
    description: '血液循環や代謝に関する体質',
    tags: [
      { value: 'edema_prone', label: 'むくみやすい', color: 'blue' },
      { value: 'cold_sensitivity', label: '冷えやすい', color: 'blue' },
      { value: 'low_blood_pressure', label: '低血圧', color: 'blue' },
      { value: 'anemic', label: '貧血気味', color: 'blue' },
      { value: 'poor_circulation', label: '血行不良', color: 'blue' },
    ]
  },
  {
    category: '消化器系',
    description: '胃腸の調子や消化機能に関する特徴',
    tags: [
      { value: 'weak_stomach', label: '胃腸が弱い', color: 'warning' },
      { value: 'constipation_prone', label: '便秘しやすい', color: 'warning' },
      { value: 'diarrhea_prone', label: '下痢しやすい', color: 'warning' },
      { value: 'bloating_prone', label: 'お腹が張りやすい', color: 'warning' },
      { value: 'acid_reflux', label: '逆流性食道炎・胃酸過多', color: 'warning' },
    ]
  },
  {
    category: '筋骨格系',
    description: '筋肉や骨格、関節に関する特徴',
    tags: [
      { value: 'weak_joints', label: '関節が弱い', color: 'purple' },
      { value: 'muscle_cramps', label: 'つりやすい', color: 'purple' },
      { value: 'back_pain', label: '腰痛持ち', color: 'purple' },
    ]
  },
  {
    category: '食事関連',
    description: '食事のパターンや食行動に関する特徴',
    tags: [
      { value: 'postprandial_sleepiness', label: '食後に眠くなりやすい', color: 'gray' },
      { value: 'stress_eating', label: 'ストレスで食が乱れやすい', color: 'gray' },
      { value: 'binge_eating', label: '過食傾向', color: 'gray' },
      { value: 'low_appetite', label: '食欲不振', color: 'gray' },
      { value: 'fast_eater', label: '早食い', color: 'gray' },
      { value: 'late_night_snacking', label: '夜食べの習慣', color: 'gray' },
    ]
  },
  {
    category: 'アレルギー・不耐性',
    description: '食物アレルギーや不耐性に関する特徴',
    tags: [
      { value: 'lactose_intolerant', label: '乳糖不耐症', color: 'danger' },
      { value: 'gluten_sensitive', label: 'グルテン過敏症', color: 'danger' },
      { value: 'food_allergies', label: '食物アレルギーあり', color: 'danger' },
    ]
  },
  {
    category: 'その他',
    description: 'その他の体質や健康に関する特徴',
    tags: [
      { value: 'prone_to_headaches', label: '頭痛持ち', color: 'secondary' },
      { value: 'skin_problems', label: '肌荒れしやすい', color: 'secondary' },
      { value: 'sleep_issues', label: '睡眠障害', color: 'secondary' },
      { value: 'sensitive_to_caffeine', label: 'カフェインに敏感', color: 'secondary' },
      { value: 'water_retention', label: '水分を溜めやすい', color: 'secondary' },
    ]
  }
];

export function BodyConstitutionPicker({
  selectedTags,
  onTagsChange,
  title = '体質・身体の傾向',
  description = '当てはまるものを選択してください（複数選択可）',
  variant = 'default',
  columns = 2
}: BodyConstitutionPickerProps) {
  return (
    <TagSelector<BodyConstitutionTag>
      title={title}
      description={description}
      categories={BODY_CONSTITUTION_CATEGORIES}
      selectedTags={selectedTags}
      onTagsChange={onTagsChange}
      multiSelect={true}
      columns={columns}
      size="md"
      variant={variant}
    />
  );
}