'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { DateDisplay } from '@/components/features/home/DateDisplay';
import { QuickActions } from '@/components/features/home/QuickActions';
import { TodaysSummary } from '@/components/features/home/TodaysSummary';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function ClientOnlyHome() {
  const { settings, isLoading, error } = useUserSettings();
  const resetTime = settings?.dayResetTime || '04:00';

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" message="読み込み中..." />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen p-4">
          <ErrorMessage 
            message="データの読み込みに失敗しました" 
            onRetry={() => window.location.reload()}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* ヘッダー部分 */}
        <header className="bg-gradient-to-b from-pink-100 to-pink-50 pb-4">
          <DateDisplay resetTime={resetTime} />
        </header>

        {/* メインコンテンツ */}
        <main className="pb-6">
          {/* 今日のサマリー */}
          <section className="mb-6">
            <TodaysSummary resetTime={resetTime} />
          </section>

          {/* クイックアクション */}
          <section>
            <QuickActions />
          </section>
        </main>
      </div>
    </MainLayout>
  );
}