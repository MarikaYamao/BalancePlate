'use client';

import { Card } from '@/components/ui/Card';

interface FreeNotesProps {
  value: string;
  onChange: (value: string) => void;
}

export function FreeNotes({ value, onChange }: FreeNotesProps) {
  const getEncouragementMessage = () => {
    if (value.length === 0) return '情報を追加してAIの精度を向上させましょう';
    if (value.length < 50) return 'もう少し詳しく書いていただけると助かります';
    if (value.length < 100) return 'いい感じです！詳細な情報が役立ちます';
    return '十分な情報です！AIがより良い提案ができます';
  };

  return (
    <Card className="mb-6 border-2 border-orange-100 hover:border-orange-200 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📝</span>
        <h2 className="text-lg font-semibold text-gray-800">その他の情報</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        参考となる追加情報があれば記入してください（任意）
      </p>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例: アレルギー詳細、好き嫌い、健康上の配慮事項など"
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 min-h-[120px] resize-y transition-all bg-white hover:bg-orange-50"
        maxLength={500}
      />
      
      <div className="mt-2 flex justify-between items-center">
        <p className="text-xs text-orange-600 font-medium">
          {getEncouragementMessage()}
        </p>
        <p className="text-xs text-gray-500">
          {value.length}/500文字
        </p>
      </div>
    </Card>
  );
}