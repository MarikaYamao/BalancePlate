'use client';

import { Card } from '@/components/ui/Card';
import type { LifestyleTag } from '@/types';

interface LifestyleSelectorProps {
  selected: LifestyleTag[];
  onChange: (tags: LifestyleTag[]) => void;
}

const LIFESTYLE_OPTIONS: {
  category: string;
  tags: { value: LifestyleTag; label: string }[]
}[] = [
  {
    category: '仕事・活動',
    tags: [
      { value: 'remote_work', label: '在宅ワーク' },
      { value: 'desk_work', label: 'デスクワーク・座り仕事' },
      { value: 'standing_work', label: '立ち仕事' },
      { value: 'physical_labor', label: '肉体労働' },
      { value: 'commute_walk', label: '通勤徒歩' },
      { value: 'night_shift', label: '夜勤' },
      { value: 'shift_work', label: 'シフト勤務' },
    ]
  },
  {
    category: '家族・ケア',
    tags: [
      { value: 'has_children', label: '育児あり' },
      { value: 'caregiving', label: '介護中' },
      { value: 'pregnant', label: '妊娠中' },
      { value: 'breastfeeding', label: '授乳中' },
    ]
  },
  {
    category: '生活パターン',
    tags: [
      { value: 'regular_exercise', label: '運動習慣あり' },
      { value: 'irregular_schedule', label: '不規則な生活' },
      { value: 'sleep_deprived', label: '睡眠不足' },
      { value: 'high_stress', label: '高ストレス' },
      { value: 'frequent_travel', label: '出張・旅行が多い' },
      { value: 'frequent_dining_out', label: '外食が多い' },
    ]
  },
  {
    category: '医療・健康',
    tags: [
      { value: 'taking_oral_contraceptives', label: 'ピル服用中' },
      { value: 'hormone_therapy', label: 'ホルモン治療中' },
      { value: 'taking_medications', label: '投薬中' },
      { value: 'under_medical_treatment', label: '治療中' },
    ]
  },
  {
    category: '喫煙・飲酒',
    tags: [
      { value: 'smoker', label: '喫煙者' },
      { value: 'regular_drinker', label: '習慣的飲酒' },
      { value: 'social_drinker', label: '付き合い程度の飲酒' },
      { value: 'non_drinker', label: '飲酒しない' },
    ]
  }
];

export function LifestyleSelector({
  selected,
  onChange
}: LifestyleSelectorProps) {
  const handleToggle = (tag: LifestyleTag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">生活習慣</h2>
      <p className="text-sm text-gray-600 mb-4">
        当てはまるものを選択してください（複数選択可）
      </p>
      
      <div className="space-y-4">
        {LIFESTYLE_OPTIONS.map((category) => (
          <div key={category.category}>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {category.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.tags.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => handleToggle(tag.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                    selected.includes(tag.value)
                      ? 'bg-primary-50 text-primary-700 border-2 border-primary-400 font-medium'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {selected.includes(tag.value) && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}