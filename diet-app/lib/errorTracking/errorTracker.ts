interface ErrorInfo {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userAgent?: string;
  url?: string;
}

interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

class ErrorTracker {
  private errorQueue: ErrorInfo[] = [];
  private isOnline: boolean = true;
  private maxQueueSize: number = 50;
  private flushInterval: number = 30000; // 30秒ごとに送信
  private intervalId?: NodeJS.Timeout;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupEventListeners();
      this.startFlushInterval();
      this.setupPerformanceObserver();
    }
  }

  private setupEventListeners(): void {
    // オンライン/オフライン状態の監視
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flush();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // グローバルエラーハンドリング
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        severity: 'high',
        url: event.filename,
      });
    });

    // Promise拒否の処理
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'high',
      });
    });
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      // Core Web Vitalsの監視
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              this.logPerformance({ LCP: entry.startTime });
            }
            if (entry.entryType === 'first-input' && 'processingStart' in entry) {
              const fid = (entry as any).processingStart - entry.startTime;
              this.logPerformance({ FID: fid });
            }
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              this.logPerformance({ CLS: (entry as any).value });
            }
          }
        });

        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        console.warn('Performance Observer setup failed:', e);
      }
    }
  }

  private startFlushInterval(): void {
    this.intervalId = setInterval(() => {
      if (this.errorQueue.length > 0 && this.isOnline) {
        this.flush();
      }
    }, this.flushInterval);
  }

  public logError(error: Partial<ErrorInfo>): void {
    const errorInfo: ErrorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      component: error.component,
      context: error.context,
      severity: error.severity || 'medium',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.errorQueue.push(errorInfo);

    // キューサイズ制限
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // クリティカルエラーは即座に送信
    if (error.severity === 'critical' && this.isOnline) {
      this.flush();
    }

    // 開発環境ではコンソールにも出力
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', errorInfo);
    }
  }

  public logPerformance(metrics: PerformanceMetrics): void {
    // パフォーマンスメトリクスの記録
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics('performance', metrics);
    }
  }

  private async flush(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // 本番環境では外部サービスに送信
      if (process.env.NODE_ENV === 'production') {
        await this.sendToErrorService(errors);
      } else {
        // 開発環境ではローカルストレージに保存
        this.saveToLocalStorage(errors);
      }
    } catch (error) {
      // 送信に失敗した場合はキューに戻す
      this.errorQueue.unshift(...errors);
      console.error('Failed to send errors:', error);
    }
  }

  private async sendToErrorService(errors: ErrorInfo[]): Promise<void> {
    // Sentryやその他のエラートラッキングサービスへの送信
    // 現在はローカルストレージに保存
    this.saveToLocalStorage(errors);
  }

  private saveToLocalStorage(errors: ErrorInfo[]): void {
    try {
      const existingErrors = localStorage.getItem('diet_app_errors');
      const allErrors = existingErrors ? JSON.parse(existingErrors) : [];
      
      // 最新100件のみ保持
      const updatedErrors = [...allErrors, ...errors].slice(-100);
      
      localStorage.setItem('diet_app_errors', JSON.stringify(updatedErrors));
      localStorage.setItem('diet_app_errors_last_updated', new Date().toISOString());
    } catch (e) {
      console.error('Failed to save errors to localStorage:', e);
    }
  }

  private sendToAnalytics(type: string, data: any): void {
    // Google Analytics, Mixpanel等への送信
    // 将来的な実装用のプレースホルダー
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', type, data);
    }
  }

  public getStoredErrors(): ErrorInfo[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const errors = localStorage.getItem('diet_app_errors');
      return errors ? JSON.parse(errors) : [];
    } catch (e) {
      console.error('Failed to retrieve stored errors:', e);
      return [];
    }
  }

  public clearStoredErrors(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('diet_app_errors');
      localStorage.removeItem('diet_app_errors_last_updated');
    }
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// シングルトンインスタンス
const errorTracker = new ErrorTracker();

// エクスポート
export { errorTracker, type ErrorInfo, type PerformanceMetrics };

// React用のヘルパー関数
export function logComponentError(
  error: Error,
  errorInfo: { componentStack: string },
  componentName?: string
): void {
  errorTracker.logError({
    message: error.message,
    stack: error.stack,
    component: componentName,
    context: {
      componentStack: errorInfo.componentStack,
    },
    severity: 'high',
  });
}

// API呼び出し用のエラーハンドリング
export function logApiError(
  endpoint: string,
  error: any,
  context?: Record<string, any>
): void {
  errorTracker.logError({
    message: `API Error: ${endpoint}`,
    stack: error?.stack,
    context: {
      endpoint,
      error: error?.message || error,
      ...context,
    },
    severity: error?.status === 500 ? 'critical' : 'medium',
  });
}