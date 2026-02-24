'use client';

import { useState, useEffect, ReactNode, memo } from 'react';

export interface QuickAction {
  label: string;
  value: string;
  icon?: ReactNode;
}

interface TextInputProps {
  // 基本プロパティ
  value: string;
  onChange: (value: string) => void;
  
  // 入力設定
  type?: 'text' | 'textarea' | 'number';
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number; // textarea用
  
  // ラベルとヘルプ
  label?: string;
  helpText?: string;
  required?: boolean;
  
  // 文字数カウント
  showCharCount?: boolean;
  
  // 例とクイックアクション
  examples?: string[];
  quickActions?: QuickAction[];
  
  // スタイリング
  variant?: 'default' | 'bordered' | 'focused';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  
  // バリデーション
  error?: string;
  success?: boolean;
  
  // その他
  id?: string;
  name?: string;
  autoFocus?: boolean;
}

export const TextInput = memo(function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  maxLength = 1000,
  rows = 4,
  label,
  helpText,
  required = false,
  showCharCount = true,
  examples = [],
  quickActions = [],
  variant = 'default',
  size = 'md',
  icon,
  error,
  success = false,
  id,
  name,
  autoFocus = false
}: TextInputProps) {
  const [showExamples, setShowExamples] = useState(false);
  const [charCount, setCharCount] = useState(value.length);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      return; // 最大文字数を超える場合は無視
    }
    onChange(newValue);
  };

  const handleExampleClick = (example: string) => {
    onChange(example);
    setShowExamples(false);
  };

  const handleQuickActionClick = (action: QuickAction) => {
    const newValue = value ? `${value}、${action.value}` : action.value;
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  // スタイリング関数
  const getContainerClasses = () => {
    const baseClasses = 'space-y-2';
    return baseClasses;
  };

  const getInputClasses = () => {
    const baseClasses = 'w-full transition-all duration-200 rounded-lg';
    
    // サイズクラス
    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg'
    };

    // バリアントクラス
    const variantClasses = {
      default: 'border border-gray-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100',
      bordered: 'border-2 border-gray-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100',
      focused: 'border-2 border-primary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'
    };

    // 状態クラス
    let stateClasses = 'text-gray-700 placeholder-gray-400';
    if (error) {
      stateClasses = 'border-red-400 text-red-700 placeholder-red-300 focus:border-red-500 focus:ring-red-100';
    } else if (success) {
      stateClasses = 'border-green-400 text-green-700 placeholder-green-300 focus:border-green-500 focus:ring-green-100';
    }
    
    const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white';

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${stateClasses} ${disabledClasses}`;
  };

  const getCharCountColor = () => {
    if (!maxLength) return 'text-gray-400';
    
    const ratio = charCount / maxLength;
    if (ratio < 0.7) return 'text-gray-400';
    if (ratio < 0.9) return 'text-yellow-600';
    return 'text-red-500';
  };

  const inputId = id || name || 'text-input';

  return (
    <div className={getContainerClasses()}>
      {/* ラベル */}
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {showCharCount && maxLength && (
            <span className={`text-xs ${getCharCountColor()}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      {/* クイックアクション */}
      {quickActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickActionClick(action)}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* 入力フィールド */}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            autoFocus={autoFocus}
            className={`${getInputClasses()} resize-none`}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={getInputClasses()}
          />
        )}
        
        {/* アイコン */}
        {icon && (
          <div className="absolute top-2 right-2 pointer-events-none opacity-20">
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>

      {/* 例を表示するトグル */}
      {examples.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            disabled={disabled}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showExamples ? '例を隠す' : '入力例を見る'}
          </button>
          
          {showExamples && (
            <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">クリックして入力：</p>
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  disabled={disabled}
                  className="block w-full text-left text-xs text-gray-700 hover:text-blue-600 hover:bg-white p-2 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="flex items-start gap-1">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* ヘルプテキスト */}
      {helpText && !error && (
        <div className="flex items-start gap-1">
          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-gray-500">{helpText}</p>
        </div>
      )}

      {/* 成功メッセージ */}
      {success && !error && (
        <div className="flex items-start gap-1">
          <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-green-600">入力が完了しました</p>
        </div>
      )}
    </div>
  );
});