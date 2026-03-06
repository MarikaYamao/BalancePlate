'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSettings } from '@/lib/hooks';

export function OnboardingChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { settings, isLoading } = useUserSettings();

  useEffect(() => {
    // URLにonboarding完了フラグがある場合
    const params = new URLSearchParams(window.location.search);
    if (params.get('onboarding_completed') === 'true') {
      // URLパラメータをクリア
      window.history.replaceState({}, document.title, '/home');
      return;
    }
    
    if (!isLoading && !settings?.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [settings, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!settings?.onboardingCompleted) {
    return null;
  }

  return <>{children}</>;
}