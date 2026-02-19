import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';
  
  const variantClasses = {
    primary: 'bg-[var(--color-brand-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-brand-primary-hover)] focus:ring-[var(--color-brand-primary)] shadow-md disabled:opacity-50',
    secondary: 'bg-transparent border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)] hover:text-[var(--color-text-inverse)] focus:ring-[var(--color-brand-primary)] disabled:opacity-50',
    outline: 'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] disabled:opacity-50',
    ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] focus:ring-[var(--color-brand-primary)] shadow-none disabled:opacity-50',
    danger: 'bg-[var(--color-danger)] text-[var(--color-text-inverse)] hover:bg-[var(--color-danger-hover)] focus:ring-[var(--color-danger)] shadow-md disabled:opacity-50'
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm font-medium',
    medium: 'px-4 py-2.5 text-[15px] font-semibold',
    large: 'px-6 py-3.5 text-base font-semibold'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const combinedClassName = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
    ${className}
  `;
  
  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}