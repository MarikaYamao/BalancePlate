'use client';

import { useState } from 'react';
import type { ConditionTag } from '@/types';
import { conditionTagsInfo, conditionCategories } from '@/lib/constants/conditionTags';

interface ConditionTagSelectorProps {
  selectedTags: ConditionTag[];
  onTagsChange: (tags: ConditionTag[]) => void;
  maxSelection?: number;
}

export function ConditionTagSelector({
  selectedTags,
  onTagsChange,
  maxSelection = 5
}: ConditionTagSelectorProps) {
  const handleTagToggle = (tagId: ConditionTag) => {
    if (selectedTags.includes(tagId)) {
      // タグを削除
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      // タグを追加（最大数チェック）
      if (selectedTags.length < maxSelection) {
        onTagsChange([...selectedTags, tagId]);
      }
    }
  };

  const getTagColorClasses = (color: string, isSelected: boolean) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      purple: {
        bg: isSelected ? 'bg-purple-100' : 'bg-white',
        border: isSelected ? 'border-purple-400' : 'border-gray-300',
        text: isSelected ? 'text-purple-700' : 'text-gray-700'
      },
      red: {
        bg: isSelected ? 'bg-red-100' : 'bg-white',
        border: isSelected ? 'border-red-400' : 'border-gray-300',
        text: isSelected ? 'text-red-700' : 'text-gray-700'
      },
      blue: {
        bg: isSelected ? 'bg-blue-100' : 'bg-white',
        border: isSelected ? 'border-blue-400' : 'border-gray-300',
        text: isSelected ? 'text-blue-700' : 'text-gray-700'
      },
      gray: {
        bg: isSelected ? 'bg-gray-100' : 'bg-white',
        border: isSelected ? 'border-gray-400' : 'border-gray-300',
        text: isSelected ? 'text-gray-700' : 'text-gray-700'
      },
      indigo: {
        bg: isSelected ? 'bg-indigo-100' : 'bg-white',
        border: isSelected ? 'border-indigo-400' : 'border-gray-300',
        text: isSelected ? 'text-indigo-700' : 'text-gray-700'
      },
      yellow: {
        bg: isSelected ? 'bg-yellow-100' : 'bg-white',
        border: isSelected ? 'border-yellow-400' : 'border-gray-300',
        text: isSelected ? 'text-yellow-700' : 'text-gray-700'
      },
      orange: {
        bg: isSelected ? 'bg-orange-100' : 'bg-white',
        border: isSelected ? 'border-orange-400' : 'border-gray-300',
        text: isSelected ? 'text-orange-700' : 'text-gray-700'
      },
      pink: {
        bg: isSelected ? 'bg-pink-100' : 'bg-white',
        border: isSelected ? 'border-pink-400' : 'border-gray-300',
        text: isSelected ? 'text-pink-700' : 'text-gray-700'
      },
      amber: {
        bg: isSelected ? 'bg-amber-100' : 'bg-white',
        border: isSelected ? 'border-amber-400' : 'border-gray-300',
        text: isSelected ? 'text-amber-700' : 'text-gray-700'
      },
      green: {
        bg: isSelected ? 'bg-green-100' : 'bg-white',
        border: isSelected ? 'border-green-400' : 'border-gray-300',
        text: isSelected ? 'text-green-700' : 'text-gray-700'
      }
    };

    return colorMap[color] || colorMap.gray;
  };

  // カテゴリー別にタグをグループ化
  const groupedTags = {
    physical: conditionTagsInfo.filter(tag => tag.category === 'physical'),
    mental: conditionTagsInfo.filter(tag => tag.category === 'mental'),
    lifestyle: conditionTagsInfo.filter(tag => tag.category === 'lifestyle')
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          今日のコンディションを選択
        </h3>
        <span className="text-xs text-gray-500">
          {selectedTags.length}/{maxSelection} 選択中
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedTags).map(([category, tags]) => (
          <div key={category}>
            <div className="text-xs font-medium text-gray-500 mb-2">
              {conditionCategories[category as keyof typeof conditionCategories].label}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                const colors = getTagColorClasses(tag.color, isSelected);
                
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    disabled={!isSelected && selectedTags.length >= maxSelection}
                    className={`
                      px-3 py-2 rounded-full border-2 transition-all duration-200
                      flex items-center gap-1.5 text-sm
                      ${colors.bg} ${colors.border} ${colors.text}
                      ${!isSelected && selectedTags.length >= maxSelection 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:shadow-md active:scale-95 cursor-pointer'}
                    `}
                  >
                    <span className="text-base">{tag.icon}</span>
                    <span>{tag.label}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedTags.length >= maxSelection && (
        <p className="text-xs text-gray-500 text-center">
          最大{maxSelection}個まで選択できます
        </p>
      )}
    </div>
  );
}