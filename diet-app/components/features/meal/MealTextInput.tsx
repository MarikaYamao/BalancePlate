'use client';

import { useState } from 'react';

interface MealTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

const mealExamples = [
  '白米、味噌汁、焼き鮭、ほうれん草のお浸し',
  'パスタ（カルボナーラ）、サラダ、スープ',
  'そば、天ぷら、お茶',
  'サンドイッチ、コーヒー、ヨーグルト',
  'おにぎり2個、唐揚げ、お茶',
];

export function MealTextInput({ 
  value, 
  onChange, 
  placeholder = '食べたものを入力してください',
  disabled = false,
  maxLength = 1000
}: MealTextInputProps) {
  const [showExamples, setShowExamples] = useState(false);
  const remainingChars = maxLength - value.length;

  const handleExampleClick = (example: string) => {
    onChange(example);
    setShowExamples(false);
  };

  const quickInputs = [
    { label: 'コンビニ', value: 'コンビニ弁当' },
    { label: '外食', value: '外食：' },
    { label: '自炊', value: '自炊：' },
    { label: 'デリバリー', value: 'デリバリー：' },
  ];

  return (
    <div className="space-y-3">
      {/* クイック入力ボタン */}
      <div className="flex flex-wrap gap-2">
        {quickInputs.map((quick) => (
          <button
            key={quick.label}
            onClick={() => onChange(value ? `${value}、${quick.value}` : quick.value)}
            disabled={disabled}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
          >
            {quick.label}
          </button>
        ))}
        <button
          onClick={() => setShowExamples(!showExamples)}
          disabled={disabled}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors disabled:opacity-50"
        >
          例を見る
        </button>
      </div>

      {/* 例の表示 */}
      {showExamples && (
        <div className="p-3 bg-blue-50 rounded-lg space-y-2">
          <div className="text-sm font-medium text-blue-900">入力例：</div>
          {mealExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={disabled}
              className="block w-full text-left p-2 text-sm hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {/* テキストエリア */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={4}
          className={`
            w-full px-4 py-3 border rounded-lg resize-none
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${remainingChars < 100 ? 'pr-20' : ''}
          `}
        />
        
        {/* 文字数カウンター */}
        <div className={`
          absolute bottom-2 right-2 text-xs
          ${remainingChars < 100 ? 'text-orange-600' : 'text-gray-400'}
        `}>
          {remainingChars}文字
        </div>
      </div>

      {/* ヒント */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>詳しく書くと具体的な提案ができますが、まずは記録することが大切です。</p>
        <p>忙しいときは「ラーメン」「コンビニ弁当」など大まかでOK！</p>
      </div>
    </div>
  );
}