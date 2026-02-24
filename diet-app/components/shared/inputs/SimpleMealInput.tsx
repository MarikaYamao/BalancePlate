'use client';

import { TextInput } from '@/components/ui/TextInput';

interface SimpleMealInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  label?: string;
  icon?: string;
}

export function SimpleMealInput({ 
  value, 
  onChange, 
  placeholder = '食べたものを入力',
  disabled = false,
  maxLength = 500,
  label,
  icon
}: SimpleMealInputProps) {
  return (
    <TextInput
      value={value}
      onChange={onChange}
      type="textarea"
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      rows={3}
      label={label}
      showCharCount={true}
      variant="default"
      icon={icon}
    />
  );
}