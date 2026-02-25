'use client';

import { TagSelector, type TagCategory } from '@/components/ui/TagSelector';
import { Card } from '@/components/ui/Card';
import type { LifestyleTag } from '@/types';
import { isLifestyleAvailable } from '@/lib/utils/genderUtils';

interface GenderAwareLifestyleSelectorProps {
  selected: LifestyleTag[];
  onChange: (tags: LifestyleTag[]) => void;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export function GenderAwareLifestyleSelector({
  selected,
  onChange,
  gender
}: GenderAwareLifestyleSelectorProps) {

  // 性別に基づいてカテゴリをフィルタリング
  const getFilteredCategories = (): TagCategory<LifestyleTag>[] => {
    const baseCategories: TagCategory<LifestyleTag>[] = [
      {
        category: '仕事・活動',
        description: '仕事の形態や活動レベルに関する特徴',
        tags: [
          { value: 'remote_work', label: '在宅ワーク', icon: '🏠', color: 'blue' },
          { value: 'desk_work', label: 'デスクワーク・座り仕事', icon: '💻', color: 'blue' },
          { value: 'standing_work', label: '立ち仕事', icon: '🚶', color: 'blue' },
          { value: 'physical_labor', label: '肉体労働', icon: '💪', color: 'blue' },
          { value: 'commute_walk', label: '通勤徒歩', icon: '🚶‍♂️', color: 'blue' },
          { value: 'night_shift', label: '夜勤', icon: '🌙', color: 'blue' },
          { value: 'shift_work', label: 'シフト勤務', icon: '🔄', color: 'blue' },
        ]
      },
      {
        category: '生活パターン',
        description: '日常生活のパターンや習慣',
        tags: [
          { value: 'regular_exercise', label: '運動習慣あり', icon: '🏃', color: 'success' },
          { value: 'irregular_schedule', label: '不規則な生活', icon: '⏰', color: 'warning' },
          { value: 'sleep_deprived', label: '睡眠不足', icon: '😴', color: 'warning' },
          { value: 'high_stress', label: '高ストレス', icon: '😰', color: 'warning' },
          { value: 'frequent_travel', label: '出張・旅行が多い', icon: '✈️', color: 'gray' },
          { value: 'frequent_dining_out', label: '外食が多い', icon: '🍽️', color: 'gray' },
          { value: 'prefer_cooking', label: '自炊派', icon: '👨‍🍳', color: 'gray' },
          { value: 'budget_conscious', label: '節約志向', icon: '💰', color: 'gray' },
        ]
      },
      {
        category: '医療・健康',
        description: '医療や健康管理に関する状況',
        tags: [
          { value: 'taking_medications', label: '投薬中', icon: '💊', color: 'danger' },
          { value: 'under_medical_treatment', label: '治療中', icon: '🏥', color: 'danger' },
        ]
      },
      {
        category: '喫煙・飲酒',
        description: '喫煙や飲酒の習慣',
        tags: [
          { value: 'smoker', label: '喫煙者', icon: '🚬', color: 'secondary' },
          { value: 'regular_drinker', label: '習慣的飲酒', icon: '🍺', color: 'secondary' },
          { value: 'social_drinker', label: '付き合い程度の飲酒', icon: '🥂', color: 'secondary' },
          { value: 'non_drinker', label: '飲酒しない', icon: '🚱', color: 'secondary' },
        ]
      },
    ];

    // 家族・ケアカテゴリ（性別によって内容が変わる）
    const familyCategory: TagCategory<LifestyleTag> = {
      category: '家族・ケア',
      description: '家族構成やケアに関する状況',
      tags: [
        { value: 'has_children', label: '育児あり', icon: '👶', color: 'purple' },
        { value: 'caregiving', label: '介護中', icon: '🩺', color: 'purple' },
      ]
    };

    // 性別が男性でない場合、妊娠・授乳タグを追加
    if (gender !== 'male') {
      familyCategory.tags.push(
        { value: 'pregnant', label: '妊娠中', icon: '🤰', color: 'purple' },
        { value: 'breastfeeding', label: '授乳中', icon: '🍼', color: 'purple' }
      );
    }

    // 女性ホルモン関連（性別が男性でない場合のみ）
    if (gender !== 'male') {
      baseCategories[2].tags.push(
        { value: 'taking_oral_contraceptives', label: 'ピル服用中', icon: '💊', color: 'purple' },
        { value: 'hormone_therapy', label: 'ホルモン治療中', icon: '💉', color: 'purple' }
      );
    } else {
      // 男性の場合はホルモン治療のみ追加（異なるコンテキスト）
      baseCategories[2].tags.push(
        { value: 'hormone_therapy', label: 'ホルモン治療中', icon: '💉', color: 'blue' }
      );
    }

    // カテゴリを順番に組み立て
    return [
      baseCategories[0], // 仕事・活動
      familyCategory,    // 家族・ケア
      baseCategories[1], // 生活パターン
      baseCategories[2], // 医療・健康
      baseCategories[3], // 喫煙・飲酒
    ];
  };

  // 性別が変更された際、利用できなくなったタグを選択から除外
  const handleFilteredChange = (tags: LifestyleTag[]) => {
    const filteredTags = tags.filter(tag => isLifestyleAvailable(tag, gender));
    onChange(filteredTags);
  };

  return (
    <Card className="mb-6 border-2 border-green-100 hover:border-green-200 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🌿</span>
        <h2 className="text-lg font-semibold text-gray-800">生活習慣</h2>
        {selected.length > 0 && (
          <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
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