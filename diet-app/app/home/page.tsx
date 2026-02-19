'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layouts/MainLayout';
import { OnboardingChecker } from '@/components/features/onboarding/OnboardingChecker';

// SSRを無効化してクライアントサイドのみでレンダリング
const ClientOnlyHome = dynamic(
  () => import('./ClientOnlyHome'),
  { 
    ssr: false,
    loading: () => (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </MainLayout>
    )
  }
);

export default function HomePage() {
  return (
    <OnboardingChecker>
      <ClientOnlyHome />
    </OnboardingChecker>
  );
}