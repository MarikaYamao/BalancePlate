'use client';

import { useState, useEffect } from 'react';

interface FreeMemoInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function FreeMemoInput({
  value,
  onChange,
  placeholder = '今日の体調や気分を自由に記録できます（任意）',
  maxLength = 500
}: FreeMemoInputProps) {
  const [charCount, setCharCount] = useState(value.length);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const getCharCountColor = () => {
    const ratio = charCount / maxLength;
    if (ratio < 0.7) return 'text-gray-400';
    if (ratio < 0.9) return 'text-yellow-600';
    return 'text-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="free-memo" className="text-sm font-medium text-gray-700">
          フリーメモ
        </label>
        <span className={`text-xs ${getCharCountColor()}`}>
          {charCount}/{maxLength}
        </span>
      </div>
      
      <div className="relative">
        <textarea
          id="free-memo"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={4}
          className="
            w-full px-4 py-3 
            border-2 border-gray-200 rounded-lg
            focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100
            resize-none
            text-gray-700 placeholder-gray-400
            transition-all duration-200
          "
        />
        
        {/* 装飾的な要素 */}
        <div className="absolute top-2 right-2 pointer-events-none">
          <span className="text-2xl opacity-10">📝</span>
        </div>
      </div>

      {/* ヒントテキスト */}
      <div className="flex items-start gap-1">
        <svg
          className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-xs text-gray-500">
          メモは暗号化されて保存されます。プライバシーが保護されているので安心して記録できます。
        </p>
      </div>
    </div>
  );
}