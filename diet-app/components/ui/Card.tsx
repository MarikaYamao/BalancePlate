import { ReactNode, memo } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = memo(function Card({
  children,
  className = '',
  padding = 'medium',
  shadow = 'md'
}: CardProps) {
  const paddingClasses = {
    none: '',
    small: 'p-3',
    medium: 'p-5',
    large: 'p-7'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-[var(--shadow-sm)]',
    md: 'shadow-[var(--shadow-md)]',
    lg: 'shadow-[var(--shadow-lg)]'
  };
  
  return (
    <div
      className={`
        bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-light)]
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${className}
      `}
    >
      {children}
    </div>
  );
});