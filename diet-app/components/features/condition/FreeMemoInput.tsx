'use client';

import { TextInput } from '@/components/ui/TextInput';

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
  return (
    <TextInput
      value={value}
      onChange={onChange}
      type="textarea"
      placeholder={placeholder}
      maxLength={maxLength}
      rows={4}
      label="フリーメモ"
      helpText="メモは暗号化されて保存されます。プライバシーが保護されているので安心して記録できます。"
      showCharCount={true}
      variant="focused"
      icon="📝"
    />
  );
}