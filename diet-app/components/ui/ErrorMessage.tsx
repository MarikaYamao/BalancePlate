import { useReducedMotion } from '@/lib/hooks/usePageTransition';

interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  className?: string;
  details?: string;
}

export function ErrorMessage({ 
  message, 
  title,
  onRetry, 
  onDismiss,
  type = 'error',
  className = '',
  details
}: ErrorMessageProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const typeStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-400',
      button: 'text-red-600 hover:text-red-800',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-400',
      button: 'text-yellow-600 hover:text-yellow-800',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-400',
      button: 'text-blue-600 hover:text-blue-800',
    },
  };

  const styles = typeStyles[type];
  const animationClass = prefersReducedMotion ? '' : 'animate-slideInTop';

  const icons = {
    error: (
      <path 
        fillRule="evenodd" 
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
        clipRule="evenodd" 
      />
    ),
    warning: (
      <path 
        fillRule="evenodd" 
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
        clipRule="evenodd" 
      />
    ),
    info: (
      <path 
        fillRule="evenodd" 
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
        clipRule="evenodd" 
      />
    ),
  };

  return (
    <div 
      className={`p-4 ${styles.bg} border ${styles.border} rounded-lg ${animationClass} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0" aria-hidden="true">
          <svg 
            className={`h-5 w-5 ${styles.icon} mt-0.5`}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            {icons[type]}
          </svg>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.text} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${styles.text}`}>{message}</p>
          
          {details && (
            <details className="mt-2">
              <summary className={`text-xs ${styles.button} cursor-pointer focus:outline-none focus:underline`}>
                詳細を表示
              </summary>
              <pre className={`mt-2 text-xs ${styles.text} bg-white/50 rounded p-2 overflow-auto`}>
                {details}
              </pre>
            </details>
          )}
          
          <div className="mt-3 flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`text-sm ${styles.button} underline focus:outline-none focus:ring-2 focus:ring-offset-1`}
                aria-label="再試行"
              >
                再試行する
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`text-sm ${styles.button} underline focus:outline-none focus:ring-2 focus:ring-offset-1`}
                aria-label="閉じる"
              >
                閉じる
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundaryFallback({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorMessage
        type="error"
        title="予期しないエラーが発生しました"
        message="アプリケーションで問題が発生しました。再読み込みをお試しください。"
        details={error.message}
        onRetry={resetError}
        className="max-w-md w-full"
      />
    </div>
  );
}