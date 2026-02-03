'use client';

import { Card } from '@/components/ui/Card';
import type { BodyConstitutionTag } from '@/types';

interface BodyConstitutionSelectorProps {
  selected: BodyConstitutionTag[];
  onChange: (tags: BodyConstitutionTag[]) => void;
}

const BODY_CONSTITUTION_OPTIONS: { 
  category: string; 
  tags: { value: BodyConstitutionTag; label: string }[] 
}[] = [
  {
    category: '循環・代謝',
    tags: [
      { value: 'edema_prone', label: 'むくみやすい' },
      { value: 'cold_sensitivity', label: '冷えやすい' },
      { value: 'low_blood_pressure', label: '低血圧' },
      { value: 'anemic', label: '貧血気味' },
    ]
  },
  {
    category: '消化器系',
    tags: [
      { value: 'weak_stomach', label: '胃腸が弱い' },
      { value: 'constipation_prone', label: '便秘しやすい' },
      { value: 'diarrhea_prone', label: '下痢しやすい' },
      { value: 'bloating_prone', label: 'お腹が張りやすい' },
      { value: 'acid_reflux', label: '逆流性食道炎・胃酸過多' },
    ]
  },
  {
    category: '筋骨格系',
    tags: [
      { value: 'weak_joints', label: '関節が弱い' },
      { value: 'muscle_cramps', label: 'つりやすい' },
      { value: 'back_pain', label: '腰痛持ち' },
    ]
  },
  {
    category: '食事関連',
    tags: [
      { value: 'postprandial_sleepiness', label: '食後に眠くなりやすい' },
      { value: 'stress_eating', label: 'ストレスで食が乱れやすい' },
      { value: 'binge_eating', label: '過食傾向' },
      { value: 'low_appetite', label: '食欲不振' },
      { value: 'fast_eater', label: '早食い' },
      { value: 'late_night_snacking', label: '夜食べの習慣' },
    ]
  },
  {
    category: 'アレルギー・不耐性',
    tags: [
      { value: 'lactose_intolerant', label: '乳糖不耐症' },
      { value: 'gluten_sensitive', label: 'グルテン過敏症' },
      { value: 'food_allergies', label: '食物アレルギーあり' },
    ]
  },
  {
    category: 'その他',
    tags: [
      { value: 'prone_to_headaches', label: '頭痛持ち' },
      { value: 'skin_problems', label: '肌荒れしやすい' },
      { value: 'sleep_issues', label: '睡眠障害' },
    ]
  }
];

export function BodyConstitutionSelector({
  selected,
  onChange
}: BodyConstitutionSelectorProps) {
  const handleToggle = (tag: BodyConstitutionTag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">体質・身体の傾向</h2>
      <p className="text-sm text-gray-600 mb-4">
        当てはまるものを選択してください（複数選択可）
      </p>
      
      <div className="space-y-4">
        {BODY_CONSTITUTION_OPTIONS.map((category) => (
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