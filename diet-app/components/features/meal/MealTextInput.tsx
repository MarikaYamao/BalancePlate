'use client';

import { useState } from 'react';

interface MealTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

const quickTags = [
  { label: 'コンビニ', value: 'コンビニ', icon: '🏪' },
  { label: '外食', value: '外食', icon: '🍽️' },
  { label: '自炊', value: '自炊', icon: '🍳' },
];

export function MealTextInput({ 
  value, 
  onChange, 
  placeholder = '食べたものを入力してください',
  disabled = false,
  maxLength = 1000,
  className = ''
}: MealTextInputProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      // タグをテキストの先頭に追加
      if (!value.startsWith(tag)) {
        const cleanedValue = value.replace(/^(コンビニ|外食|自炊)[：　]?/, '');
        onChange(`${tag}：${cleanedValue}`);
      }
    }
  };

  // 現在の値からタグを検出
  const detectCurrentTag = () => {
    for (const tag of quickTags) {
      if (value.startsWith(tag.value)) {
        return tag.value;
      }
    }
    return null;
  };

  const currentTag = detectCurrentTag();

  return (
    <div className="space-y-3">
      {/* クイックタグ */}
      <div className="flex gap-2">
        {quickTags.map((tag) => (
          <button
            key={tag.value}
            type="button"
            onClick={() => handleTagClick(tag.value)}
            disabled={disabled}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${currentTag === tag.value || selectedTag === tag.value
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span>{tag.icon}</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>

      {/* テキストエリア */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`
          w-full min-h-[120px] p-4 
          border-2 border-gray-200 rounded-xl 
          focus:border-teal-600 focus:outline-none 
          resize-none text-base
          placeholder:text-gray-400
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${className}
        `}
      />
    </div>
  );
}