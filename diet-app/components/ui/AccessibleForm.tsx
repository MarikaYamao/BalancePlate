import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

export function FormField({
  label,
  id,
  required = false,
  error,
  helperText,
  children,
}: FormFieldProps) {
  const ariaDescribedBy = [
    error && `${id}-error`,
    helperText && `${id}-helper`,
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="必須">
            *
          </span>
        )}
      </label>
      
      <div>
        {children}
      </div>

      {error && (
        <p 
          id={`${id}-error`}
          className="text-sm text-red-600 mt-1"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {helperText && !error && (
        <p 
          id={`${id}-helper`}
          className="text-sm text-gray-500 mt-1"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function AccessibleInput({
  label,
  id,
  error,
  helperText,
  required,
  className = '',
  ...props
}: AccessibleInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;

  return (
    <FormField
      label={label}
      id={inputId}
      required={required}
      error={error}
      helperText={helperText}
    >
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${hasError 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-pink-500'
          }
          ${className}
        `}
        aria-invalid={hasError}
        aria-required={required}
        aria-describedby={
          [error && `${inputId}-error`, helperText && `${inputId}-helper`]
            .filter(Boolean)
            .join(' ')
        }
        {...props}
      />
    </FormField>
  );
}

interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  helperText?: string;
}

export function AccessibleSelect({
  label,
  id,
  options,
  error,
  helperText,
  required,
  className = '',
  ...props
}: AccessibleSelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;

  return (
    <FormField
      label={label}
      id={selectId}
      required={required}
      error={error}
      helperText={helperText}
    >
      <select
        id={selectId}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${hasError 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-pink-500'
          }
          ${className}
        `}
        aria-invalid={hasError}
        aria-required={required}
        aria-describedby={
          [error && `${selectId}-error`, helperText && `${selectId}-helper`]
            .filter(Boolean)
            .join(' ')
        }
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function AccessibleTextarea({
  label,
  id,
  error,
  helperText,
  required,
  className = '',
  ...props
}: AccessibleTextareaProps) {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;

  return (
    <FormField
      label={label}
      id={textareaId}
      required={required}
      error={error}
      helperText={helperText}
    >
      <textarea
        id={textareaId}
        className={`
          w-full px-3 py-2 border rounded-lg resize-y min-h-[100px]
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${hasError 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-pink-500'
          }
          ${className}
        `}
        aria-invalid={hasError}
        aria-required={required}
        aria-describedby={
          [error && `${textareaId}-error`, helperText && `${textareaId}-helper`]
            .filter(Boolean)
            .join(' ')
        }
        {...props}
      />
    </FormField>
  );
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}