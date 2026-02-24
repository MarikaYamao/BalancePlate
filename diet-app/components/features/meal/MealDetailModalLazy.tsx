'use client';

import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { MealLog, AIConsultationResponse } from '@/types';

interface MealDetailModalProps {
  mealLog: MealLog | null;
  isOpen: boolean;
  onClose: () => void;
  aiResponse?: AIConsultationResponse;
}

// Dynamic import for meal detail modal
const MealDetailModalComponent = lazy(() => 
  import('./MealDetailModal').then(module => ({ default: module.MealDetailModal }))
);

export function MealDetailModalLazy(props: MealDetailModalProps) {
  if (!props.isOpen) {
    return null;
  }

  return (
    <Suspense 
      fallback={
        <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8">
            <LoadingSpinner size="medium" />
            <div className="mt-2 text-gray-600">詳細を読み込んでいます...</div>
          </div>
        </div>
      }
    >
      <MealDetailModalComponent {...props} />
    </Suspense>
  );
}