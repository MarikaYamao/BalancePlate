'use client';

import { Card } from '@/components/ui/Card';

interface FreeNotesProps {
  value: string;
  onChange: (value: string) => void;
}

export function FreeNotes({ value, onChange }: FreeNotesProps) {
  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">その他の情報</h2>
      <p className="text-sm text-gray-600 mb-4">
        参考となる追加情報があれば記入してください（任意）
      </p>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例: アレルギー詳細、好き嫌い、健康上の配慮事項など"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-y"
        maxLength={500}
      />
      
      <p className="mt-1 text-xs text-gray-500 text-right">
        {value.length}/500文字
      </p>
    </Card>
  );
}