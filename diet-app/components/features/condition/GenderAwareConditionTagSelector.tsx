'use client';

import { TagSelector, type TagCategory } from '@/components/ui/TagSelector';
import type { ConditionTag } from '@/types';
import { conditionTagsInfo } from '@/lib/constants/conditionTags';
import { isConditionTagAvailable } from '@/lib/utils/genderUtils';

interface GenderAwareConditionTagSelectorProps {
  selectedTags: ConditionTag[];
  onTagsChange: (tags: ConditionTag[]) => void;
  maxSelection?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

// 性別に基づいてタグをフィルタリングし、カテゴリに変換
const convertToTagCategories = (gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'): TagCategory<ConditionTag>[] => {
  // カテゴリごとにタグをグループ化
  const categoryMap = new Map<string, { name: string; tags: typeof conditionTagsInfo }>();
  
  // カテゴリの表示名マッピング
  const categoryNameMap: Record<string, string> = {
    physical: '身体的コンディション',
    mental: 'メンタル・ストレス',
    lifestyle: 'ライフスタイル・予定'
  };

  // 性別に基づいてフィルタリング
  const filteredTags = conditionTagsInfo.filter(tag => 
    isConditionTagAvailable(tag.id, gender)
  );

  filteredTags.forEach(tag => {
    const categoryKey = tag.category;
    const categoryName = categoryNameMap[categoryKey] || categoryKey;
    
    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, { name: categoryName, tags: [] });
    }
    categoryMap.get(categoryKey)!.tags.push(tag);
  });

  // TagCategory 形式に変換
  return Array.from(categoryMap.entries()).map(([key, { name, tags }]) => ({
    category: name,
    tags: tags.map(tag => ({
      value: tag.id,
      label: tag.label,
      icon: tag.icon,
      color: tag.color as any
    }))
  })).filter(category => category.tags.length > 0); // 空のカテゴリを除外
};

export function GenderAwareConditionTagSelector({
  selectedTags,
  onTagsChange,
  maxSelection = 5,
  gender
}: GenderAwareConditionTagSelectorProps) {
  
  // 性別が変更された際、利用できなくなったタグを選択から除外
  const handleFilteredChange = (tags: ConditionTag[]) => {
    const filteredTags = tags.filter(tag => isConditionTagAvailable(tag, gender));
    onTagsChange(filteredTags);
  };

  const categories = convertToTagCategories(gender);

  return (
    <div className="space-y-4">
      {/* タイトルと説明 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          今日のコンディション
        </h3>
        <p className="text-sm text-gray-600">
          今の体調や気分を選択してください（最大{maxSelection}個まで）
        </p>
      </div>

      {/* タグセレクター */}
      <TagSelector<ConditionTag>
        categories={categories}
        selectedTags={selectedTags}
        onTagsChange={handleFilteredChange}
        multiSelect={true}
        maxSelection={maxSelection}
        maxSelectionMessage={`最大${maxSelection}個まで選択できます`}
        columns={2}
        size="md"
        variant="default"
      />

      {/* 選択状況の表示 */}
      {selectedTags.length > 0 && (
        <div className="text-sm text-gray-600">
          選択中: {selectedTags.length} / {maxSelection}
        </div>
      )}
    </div>
  );
}