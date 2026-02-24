'use client';

import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { WeightLog } from '@/types';

interface WeightHistoryProps {
  weightLogs: WeightLog[];
  isLoading?: boolean;
  onExportCSV?: () => void;
}

// Dynamic import for heavy chart component
const WeightHistoryChart = lazy(() => 
  import('./WeightHistory').then(module => ({ default: module.WeightHistory }))
);

export function WeightHistoryLazy(props: WeightHistoryProps) {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="medium" />
          <span className="ml-2 text-gray-600">グラフを読み込んでいます...</span>
        </div>
      }
    >
      <WeightHistoryChart {...props} />
    </Suspense>
  );
}