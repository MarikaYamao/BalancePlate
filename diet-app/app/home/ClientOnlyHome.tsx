'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { DateDisplay } from '@/components/features/home/DateDisplay';
import { QuickActions } from '@/components/features/home/QuickActions';
import { TodaysSummary } from '@/components/features/home/TodaysSummary';

export default function ClientOnlyHome() {
  // TODO: ユーザー設定から取得
  const resetTime = '04:00';

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* ヘッダー部分 */}
        <header className="bg-gradient-to-b from-pink-100 to-pink-50 pb-4">
          <div className="pt-safe-area-top">
            <h1 className="text-center text-2xl font-bold text-gray-800 pt-4">
              やさしいダイエット
            </h1>
            <p className="text-center text-sm text-gray-600 mt-1">
              毎日の記録をサポート
            </p>
          </div>
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