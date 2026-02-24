'use client';

import { ReactNode, memo } from 'react';

// 基本的なタグ情報の型
export interface TagOption<T = string> {
  value: T;
  label: ReactNode;
  description?: string;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray' | 'purple' | 'blue' | 'red';
}

// カテゴリ化されたタグのグループ
export interface TagCategory<T = string> {
  category: string;
  description?: string;
  tags: TagOption<T>[];
  color?: string;
}

interface TagSelectorProps<T = string> {
  // データ
  tags?: TagOption<T>[]; // フラットなタグリスト
  categories?: TagCategory<T>[]; // カテゴリ化されたタグ
  
  // 状態
  selectedTags: T[];
  onTagsChange: (tags: T[]) => void;
  
  // 設定
  multiSelect?: boolean; // 複数選択可能か（デフォルト: true）
  maxSelection?: number; // 最大選択数
  columns?: 1 | 2 | 3 | 4; // カラム数（デフォルト: 2）
  
  // ラベル
  title?: string;
  description?: string;
  maxSelectionMessage?: string; // 最大数到達時のメッセージ
  
  // スタイリング
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'card';
}

export const TagSelector = memo(function TagSelector<T = string>({
  tags = [],
  categories = [],
  selectedTags,
  onTagsChange,
  multiSelect = true,
  maxSelection,
  columns = 2,
  title,
  description,
  maxSelectionMessage = '選択上限に達しました',
  size = 'md',
  variant = 'default'
}: TagSelectorProps<T>) {
  
  const handleTagToggle = (tagValue: T) => {
    if (selectedTags.includes(tagValue)) {
      // タグを削除
      onTagsChange(selectedTags.filter(tag => tag !== tagValue));
    } else {
      if (multiSelect) {
        // 複数選択モード
        if (maxSelection && selectedTags.length >= maxSelection) {
          return; // 最大数に達している場合は何もしない
        }
        onTagsChange([...selectedTags, tagValue]);
      } else {
        // 単一選択モード
        onTagsChange([tagValue]);
      }
    }
  };

  const getTagColorClasses = (color: string = 'primary', isSelected: boolean) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; hover: string }> = {
      primary: {
        bg: isSelected ? 'bg-primary-100' : 'bg-white',
        border: isSelected ? 'border-primary-400' : 'border-gray-300',
        text: isSelected ? 'text-primary-700' : 'text-gray-700',
        hover: 'hover:bg-primary-50 hover:border-primary-300'
      },
      secondary: {
        bg: isSelected ? 'bg-gray-100' : 'bg-white',
        border: isSelected ? 'border-gray-400' : 'border-gray-300',
        text: isSelected ? 'text-gray-700' : 'text-gray-600',
        hover: 'hover:bg-gray-50 hover:border-gray-400'
      },
      success: {
        bg: isSelected ? 'bg-green-100' : 'bg-white',
        border: isSelected ? 'border-green-400' : 'border-gray-300',
        text: isSelected ? 'text-green-700' : 'text-gray-700',
        hover: 'hover:bg-green-50 hover:border-green-300'
      },
      warning: {
        bg: isSelected ? 'bg-yellow-100' : 'bg-white',
        border: isSelected ? 'border-yellow-400' : 'border-gray-300',
        text: isSelected ? 'text-yellow-700' : 'text-gray-700',
        hover: 'hover:bg-yellow-50 hover:border-yellow-300'
      },
      danger: {
        bg: isSelected ? 'bg-red-100' : 'bg-white',
        border: isSelected ? 'border-red-400' : 'border-gray-300',
        text: isSelected ? 'text-red-700' : 'text-gray-700',
        hover: 'hover:bg-red-50 hover:border-red-300'
      },
      purple: {
        bg: isSelected ? 'bg-purple-100' : 'bg-white',
        border: isSelected ? 'border-purple-400' : 'border-gray-300',
        text: isSelected ? 'text-purple-700' : 'text-gray-700',
        hover: 'hover:bg-purple-50 hover:border-purple-300'
      },
      blue: {
        bg: isSelected ? 'bg-blue-100' : 'bg-white',
        border: isSelected ? 'border-blue-400' : 'border-gray-300',
        text: isSelected ? 'text-blue-700' : 'text-gray-700',
        hover: 'hover:bg-blue-50 hover:border-blue-300'
      },
      red: {
        bg: isSelected ? 'bg-red-100' : 'bg-white',
        border: isSelected ? 'border-red-400' : 'border-gray-300',
        text: isSelected ? 'text-red-700' : 'text-gray-700',
        hover: 'hover:bg-red-50 hover:border-red-300'
      },
      gray: {
        bg: isSelected ? 'bg-gray-100' : 'bg-white',
        border: isSelected ? 'border-gray-400' : 'border-gray-300',
        text: isSelected ? 'text-gray-700' : 'text-gray-600',
        hover: 'hover:bg-gray-50 hover:border-gray-400'
      }
    };
    
    return colorMap[color] || colorMap.primary;
  };

  const getSizeClasses = () => {
    const sizeMap = {
      sm: 'text-sm px-2 py-1',
      md: 'text-sm px-3 py-2',
      lg: 'text-base px-4 py-3'
    };
    return sizeMap[size];
  };

  const getColumnsClass = () => {
    const columnMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    };
    return columnMap[columns];
  };

  const renderTag = (tagOption: TagOption<T>) => {
    const isSelected = selectedTags.includes(tagOption.value);
    const isDisabled = Boolean(maxSelection && selectedTags.length >= maxSelection && !isSelected);
    const colorClasses = getTagColorClasses(tagOption.color, isSelected);
    const sizeClasses = getSizeClasses();

    return (
      <button
        key={String(tagOption.value)}
        onClick={() => !isDisabled && handleTagToggle(tagOption.value)}
        disabled={isDisabled}
        className={`
          border rounded-lg transition-all duration-200 text-left
          ${colorClasses.bg} ${colorClasses.border} ${colorClasses.text}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : `cursor-pointer ${colorClasses.hover}`}
          ${sizeClasses}
          ${variant === 'card' ? 'shadow-sm' : ''}
        `}
        title={tagOption.description}
      >
        <div className="flex items-center gap-2">
          {tagOption.icon && <span>{tagOption.icon}</span>}
          <span className="flex-1">{tagOption.label}</span>
          {isSelected && (
            <span className="text-xs">✓</span>
          )}
        </div>
        {tagOption.description && variant !== 'compact' && (
          <div className="text-xs opacity-75 mt-1">
            {tagOption.description}
          </div>
        )}
      </button>
    );
  };

  const hasMaxSelectionLimit = Boolean(maxSelection && selectedTags.length >= maxSelection);

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      {(title || description) && (
        <div>
          {title && <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}

      {/* 選択状況の表示 */}
      {maxSelection && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            選択中: {selectedTags.length} / {maxSelection}
          </span>
          {hasMaxSelectionLimit && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              {maxSelectionMessage}
            </span>
          )}
        </div>
      )}

      {/* フラットなタグリスト */}
      {tags.length > 0 && (
        <div className={`grid gap-3 ${getColumnsClass()}`}>
          {tags.map(renderTag)}
        </div>
      )}

      {/* カテゴリ化されたタグ */}
      {categories.length > 0 && (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.category}>
              <div className="mb-3">
                <h4 className="text-md font-medium text-gray-800">
                  {category.category}
                </h4>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {category.description}
                  </p>
                )}
              </div>
              <div className={`grid gap-3 ${getColumnsClass()}`}>
                {category.tags.map(renderTag)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空の状態 */}
      {tags.length === 0 && categories.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          選択可能なタグがありません
        </div>
      )}
    </div>
  );
}) as <T = string>(props: TagSelectorProps<T>) => React.ReactElement;