import { useEffect, useCallback } from 'react';
import { errorTracker } from '@/lib/errorTracking/errorTracker';

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  detail?: any;
}

export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    // コンポーネントマウント時間の計測
    const mountTime = performance.now() - startTime;
    
    if (mountTime > 100) {
      // 100ms以上かかった場合は警告
      console.warn(`Slow component mount: ${componentName} took ${mountTime.toFixed(2)}ms`);
    }
    
    return () => {
      // コンポーネントのライフサイクル全体を計測
      const totalTime = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development' && totalTime > 1000) {
        console.warn(`Component ${componentName} was active for ${totalTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
  
  const measureAsyncOperation = useCallback(
    async <T,>(
      operationName: string,
      operation: () => Promise<T>,
      warningThreshold = 500
    ): Promise<T> => {
      const startTime = performance.now();
      
      try {
        const result = await operation();
        const duration = performance.now() - startTime;
        
        if (duration > warningThreshold) {
          console.warn(
            `Slow async operation in ${componentName}: ${operationName} took ${duration.toFixed(2)}ms`
          );
        }
        
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(
          `Failed async operation in ${componentName}: ${operationName} after ${duration.toFixed(2)}ms`,
          error
        );
        throw error;
      }
    },
    [componentName]
  );
  
  const measureSyncOperation = useCallback(
    <T,>(
      operationName: string,
      operation: () => T,
      warningThreshold = 16 // 60fps = 16.67ms per frame
    ): T => {
      const startTime = performance.now();
      
      try {
        const result = operation();
        const duration = performance.now() - startTime;
        
        if (duration > warningThreshold) {
          console.warn(
            `Slow sync operation in ${componentName}: ${operationName} took ${duration.toFixed(2)}ms`
          );
        }
        
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(
          `Failed sync operation in ${componentName}: ${operationName} after ${duration.toFixed(2)}ms`,
          error
        );
        throw error;
      }
    },
    [componentName]
  );
  
  return {
    measureAsyncOperation,
    measureSyncOperation,
  };
}

// レンダリングパフォーマンスの監視
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    let renderCount = 0;
    let lastRenderTime = performance.now();
    
    const checkRenderPerformance = () => {
      renderCount++;
      const now = performance.now();
      const timeSinceLastRender = now - lastRenderTime;
      
      if (timeSinceLastRender < 100 && renderCount > 5) {
        console.warn(
          `Excessive re-renders detected in ${componentName}: ${renderCount} renders in ${timeSinceLastRender.toFixed(2)}ms`
        );
      }
      
      lastRenderTime = now;
    };
    
    checkRenderPerformance();
  });
}

// メモリ使用量の監視
export function useMemoryMonitor(componentName: string, threshold = 50) {
  useEffect(() => {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        const limitMB = memory.jsHeapSizeLimit / 1048576;
        const percentage = (usedMB / limitMB) * 100;
        
        if (percentage > threshold) {
          console.warn(
            `High memory usage in ${componentName}: ${usedMB.toFixed(2)}MB (${percentage.toFixed(1)}% of limit)`
          );
        }
      };
      
      // 初回チェック
      checkMemory();
      
      // 定期的にチェック（開発環境のみ）
      if (process.env.NODE_ENV === 'development') {
        const intervalId = setInterval(checkMemory, 10000); // 10秒ごと
        return () => clearInterval(intervalId);
      }
    }
  }, [componentName, threshold]);
}