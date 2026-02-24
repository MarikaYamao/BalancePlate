'use client';

import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Dynamic import for heavy backup component
const BackupManagerComponent = lazy(() => 
  import('./BackupManager').then(module => ({ default: module.BackupManager }))
);

export function BackupManagerLazy() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="medium" />
          <span className="ml-2 text-gray-600">バックアップ管理を読み込んでいます...</span>
        </div>
      }
    >
      <BackupManagerComponent />
    </Suspense>
  );
}