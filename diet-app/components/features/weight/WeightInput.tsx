'use client';

import { useState, useEffect } from 'react';
import { TextInput } from '@/components/ui/TextInput';

interface WeightInputProps {
  value: number;
  onChange: (value: number) => void;
  measurementTiming: 'morning' | 'night' | 'other';
  onTimingChange: (timing: 'morning' | 'night' | 'other') => void;
  note: string;
  onNoteChange: (note: string) => void;
  isLoading?: boolean;
  onSave: () => void;
  hasRecordToday?: boolean; // 今日既に記録があるかどうか
}

export function WeightInput({
  value,
  onChange,
  measurementTiming,
  onTimingChange,
  note,
  onNoteChange,
  isLoading = false,
  onSave,
  hasRecordToday = false
}: WeightInputProps) {
  const [inputValue, setInputValue] = useState(value > 0 ? value.toString() : '');

  // valueが変更されたときにinputValueも更新
  useEffect(() => {
    if (value > 0) {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue > 0) {
      onChange(numValue);
    } else {
      onChange(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value > 0) {
      onSave();
    }
  };

  const timingOptions = [
    { value: 'morning' as const, label: '朝', icon: '🌅' },
    { value: 'night' as const, label: '夜', icon: '🌙' },
    { value: 'other' as const, label: 'その他', icon: '⏰' }
  ];

  return (
    <div className="space-y-6">
      {/* 体重入力 */}
      <div className="space-y-2">
        <label htmlFor="weight" className="text-sm font-medium text-gray-700">
          体重
        </label>
        <div className="relative">
          <input
            id="weight"
            type="number"
            step="0.1"
            min="0"
            max="1000"
            value={inputValue}
            onChange={handleWeightChange}
            onKeyDown={handleKeyDown}
            placeholder="60.5"
            className="
              w-full px-4 py-4 pr-12
              border-2 border-gray-200 rounded-lg
              focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100
              text-lg text-center font-semibold text-gray-700
              placeholder-gray-400
              transition-all duration-200
            "
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <span className="text-lg font-medium text-gray-500">kg</span>
          </div>
          
          {/* 装飾的な要素 */}
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className="text-2xl opacity-10">⚖️</span>
          </div>
        </div>
      </div>

      {/* 測定タイミング */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          測定タイミング
        </label>
        <div className="grid grid-cols-3 gap-2">
          {timingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimingChange(option.value)}
              className={`
                flex flex-col items-center justify-center gap-1 p-3 rounded-lg
                border-2 transition-all duration-200
                ${measurementTiming === option.value
                  ? 'border-pink-400 bg-pink-50 text-pink-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:bg-pink-25'
                }
              `}
            >
              <span className="text-xl">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* メモ */}
      <TextInput
        value={note}
        onChange={onNoteChange}
        type="textarea"
        placeholder="体調や気になることがあれば記録できます"
        maxLength={200}
        rows={3}
        label="メモ（任意）"
        helpText="メモも暗号化されて保存されます"
        showCharCount={true}
        variant="bordered"
        icon="📝"
      />

      {/* 1日1回測定推奨メッセージ */}
      {hasRecordToday && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-yellow-600 mt-0.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-xs text-yellow-800">
            <p className="font-medium mb-1">1日1回の測定がおすすめです</p>
            <p>既に今日の記録があります。下のボタンで今日の記録を上書きします。</p>
          </div>
        </div>
      )}

      {/* 保存ボタン */}
      <button
        onClick={onSave}
        disabled={isLoading || value <= 0}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white
          transition-all duration-200 transform
          ${isLoading || value <= 0
            ? 'bg-gray-300 cursor-not-allowed'
            : hasRecordToday 
              ? 'bg-orange-500 hover:bg-orange-600 active:scale-95 shadow-lg hover:shadow-xl'
              : 'bg-pink-500 hover:bg-pink-600 active:scale-95 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {hasRecordToday ? '更新中...' : '保存中...'}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>{hasRecordToday ? '✏️' : '💾'}</span>
            {hasRecordToday ? '記録を更新' : '体重を記録'}
          </div>
        )}
      </button>

      {/* ヒント */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-blue-500 mt-0.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">体重記録のコツ</p>
          <ul className="space-y-1">
            <li>• 毎日同じ時間に測定するのがおすすめです</li>
            <li>• 起床後、トイレの後が最も正確です</li>
            <li>• 小数点1位まで記録できます（例：60.5kg）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}