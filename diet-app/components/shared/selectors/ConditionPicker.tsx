'use client';

import { TagSelector, type TagCategory } from '@/components/ui/TagSelector';
import type { ConditionTag } from '@/types';
import { conditionTagsInfo } from '@/lib/constants/conditionTags';

interface ConditionPickerProps {
  selectedTags: ConditionTag[];
  onTagsChange: (tags: ConditionTag[]) => void;
  maxSelection?: number;
  title?: string;
  description?: string;
  variant?: 'default' | 'compact' | 'card';
  columns?: 1 | 2 | 3 | 4;
}

// 既存の定数データを TagSelector 用の形式に変換
const convertToTagCategories = (): TagCategory<ConditionTag>[] => {
  const categoryMap = new Map<string, { name: string; tags: typeof conditionTagsInfo }>();
  
  const categoryNameMap: Record<string, string> = {
    physical: '身体的コンディション',
    mental: 'メンタル・ストレス',
    lifestyle: 'ライフスタイル・予定'
  };

  conditionTagsInfo.forEach(tag => {
    const categoryKey = tag.category;
    const categoryName = categoryNameMap[categoryKey] || categoryKey;
    
    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, { name: categoryName, tags: [] });
    }
    categoryMap.get(categoryKey)!.tags.push(tag);
  });

  return Array.from(categoryMap.entries()).map(([key, { name, tags }]) => ({
    category: name,
    tags: tags.map(tag => ({
      value: tag.id,
      label: tag.label,
      icon: tag.icon,
      color: tag.color as any
    }))
  }));
};

const CONDITION_TAG_CATEGORIES = convertToTagCategories();

export function ConditionPicker({
  selectedTags,
  onTagsChange,
  maxSelection = 5,
  title = '今日のコンディション',
  description,
  variant = 'default',
  columns = 2
}: ConditionPickerProps) {
  const defaultDescription = `今の体調や気分を選択してください（最大${maxSelection}個まで）`;
  
  return (
    <TagSelector<ConditionTag>
      title={title}
      description={description || defaultDescription}
      categories={CONDITION_TAG_CATEGORIES}
      selectedTags={selectedTags}
      onTagsChange={onTagsChange}
      multiSelect={true}
      maxSelection={maxSelection}
      maxSelectionMessage={`最大${maxSelection}個まで選択できます`}
      columns={columns}
      size="md"
      variant={variant}
    />
  );
}