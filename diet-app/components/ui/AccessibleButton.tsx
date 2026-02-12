import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { useReducedMotion } from '@/lib/hooks/usePageTransition';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  ariaLabel?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      icon,
      ariaLabel,
      className = '',
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();

    const baseClasses = `
      inline-flex items-center justify-center font-medium rounded-lg
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:cursor-not-allowed disabled:opacity-60
      ${prefersReducedMotion ? '' : 'transition-all duration-200'}
    `;

    const variantClasses = {
      primary: 'bg-pink-500 text-white hover:bg-pink-600 focus-visible:ring-pink-500',
      secondary: 'bg-purple-500 text-white hover:bg-purple-600 focus-visible:ring-purple-500',
      outline: 'border-2 border-pink-500 text-pink-500 hover:bg-pink-50 focus-visible:ring-pink-500',
      ghost: 'text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-500',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
    };

    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm gap-1.5',
      medium: 'px-4 py-2 text-base gap-2',
      large: 'px-6 py-3 text-lg gap-2.5',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${widthClass}
          ${className}
        `}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">処理中...</span>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </>
        ) : (
          <>
            {icon && <span aria-hidden="true">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';