'use client';

import { Card } from '@/components/ui/Card';
import { User, Info } from 'lucide-react';

interface GenderSettingsProps {
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  onChange: (gender: 'male' | 'female' | 'other' | 'prefer_not_to_say') => void;
}

export function GenderSettings({ gender, onChange }: GenderSettingsProps) {
  const genderOptions = [
    { value: 'male', label: '男性', icon: '👨' },
    { value: 'female', label: '女性', icon: '👩' },
    { value: 'other', label: 'その他', icon: '👤' },
    { value: 'prefer_not_to_say', label: '回答しない', icon: '🔒' },
  ] as const;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">性別</h3>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              性別情報は、より適切な健康アドバイスを提供するために使用されます。
              プライバシーは厳重に保護されます。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {genderOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${
                  gender === option.value
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-2xl">{option.icon}</span>
                <span className={`font-medium ${
                  gender === option.value ? 'text-teal-700' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
              </div>
              {gender === option.value && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}