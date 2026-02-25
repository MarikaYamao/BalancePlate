'use client';

import { TagSelector, type TagCategory } from '@/components/ui/TagSelector';
import { Card } from '@/components/ui/Card';
import type { BodyConstitutionTag } from '@/types';
import { isBodyConstitutionAvailable } from '@/lib/utils/genderUtils';

interface GenderAwareBodyConstitutionSelectorProps {
  selected: BodyConstitutionTag[];
  onChange: (tags: BodyConstitutionTag[]) => void;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export function GenderAwareBodyConstitutionSelector({
  selected,
  onChange,
  gender
}: GenderAwareBodyConstitutionSelectorProps) {
  
  // 性別に基づいてカテゴリをフィルタリング
  const getFilteredCategories = (): TagCategory<BodyConstitutionTag>[] => {
    const baseCategories: TagCategory<BodyConstitutionTag>[] = [
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
    ];

    // 女性特有のカテゴリ（性別が男性でない場合のみ追加）
    const femaleCategory: TagCategory<BodyConstitutionTag> = {
      category: '女性特有',
      description: '女性特有の体質や症状',
      tags: [
        { value: 'pms_severe', label: 'PMS強め', color: 'purple' },
        { value: 'irregular_periods', label: '生理不順', color: 'purple' },
        { value: 'heavy_periods', label: '生理が重い', color: 'purple' },
        { value: 'menopause', label: '更年期', color: 'purple' },
      ]
    };

    // 特別な配慮が必要な状況（性別に関係なく女性特有項目を含む）
    const specialCareCategory: TagCategory<BodyConstitutionTag> = {
      category: '特別な配慮が必要な状況',
      description: '医療的配慮や特別な栄養管理が必要な状況',
      tags: gender === 'male' 
        ? [
            { value: 'medical_diet', label: '医師から食事指導を受けている', icon: '⚕️', color: 'danger' },
            { value: 'hormone_ftm', label: 'ホルモン療法中（FTM）', icon: '💊', color: 'warning' },
          ]
        : [
            { value: 'pregnancy', label: '妊娠中', icon: '🤰', color: 'danger' },
            { value: 'breastfeeding', label: '授乳中', icon: '🍼', color: 'warning' },
            { value: 'hormone_mtf', label: 'ホルモン療法中（MTF）', icon: '💊', color: 'warning' },
            { value: 'medical_diet', label: '医師から食事指導を受けている', icon: '⚕️', color: 'danger' },
          ]
    };

    const otherCategory: TagCategory<BodyConstitutionTag> = {
      category: 'その他',
      description: 'その他の体質や健康に関する特徴',
      tags: [
        { value: 'prone_to_headaches', label: '頭痛持ち', color: 'secondary' },
        { value: 'skin_problems', label: '肌荒れしやすい', color: 'secondary' },
        { value: 'sleep_issues', label: '睡眠障害', color: 'secondary' },
        { value: 'sensitive_to_caffeine', label: 'カフェインに敏感', color: 'secondary' },
        { value: 'water_retention', label: '水分を溜めやすい', color: 'secondary' },
      ]
    };

    // 性別が男性の場合は女性特有カテゴリを除外
    if (gender === 'male') {
      return [...baseCategories, specialCareCategory, otherCategory];
    }

    // それ以外の場合はすべてのカテゴリを含める
    return [...baseCategories, femaleCategory, specialCareCategory, otherCategory];
  };

  // 性別が変更された際、利用できなくなったタグを選択から除外
  const handleFilteredChange = (tags: BodyConstitutionTag[]) => {
    const filteredTags = tags.filter(tag => isBodyConstitutionAvailable(tag, gender));
    onChange(filteredTags);
  };

  return (
    <Card className="mb-6 border-2 border-blue-100 hover:border-blue-200 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🧘</span>
        <h2 className="text-lg font-semibold text-gray-800">体質・身体の傾向</h2>
        {selected.length > 0 && (
          <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            {selected.length}件選択中
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4">
        当てはまるものを選んでください（複数選択可）
      </p>
      <TagSelector
        categories={getFilteredCategories()}
        selectedTags={selected}
        onTagsChange={handleFilteredChange}
      />
    </Card>
  );
}