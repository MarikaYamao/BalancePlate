'use client';

import { TextInput } from '@/components/ui/TextInput';

interface MemoInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  label?: string;
  required?: boolean;
  helpText?: string;
  rows?: number;
}

export function MemoInput({
  value,
  onChange,
  placeholder = '自由にメモを記録できます',
  disabled = false,
  maxLength = 500,
  label = 'メモ',
  required = false,
  helpText = 'メモは暗号化されて保存されます。プライバシーが保護されているので安心して記録できます。',
  rows = 4
}: MemoInputProps) {
  return (
    <TextInput
      value={value}
      onChange={onChange}
      type="textarea"
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      rows={rows}
      label={label}
      required={required}
      helpText={helpText}
      showCharCount={true}
      variant="focused"
      icon="📝"
    />
  );
}