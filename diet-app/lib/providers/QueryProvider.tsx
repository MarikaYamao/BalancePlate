'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5分間はキャッシュを新鮮とみなす
            gcTime: 1000 * 60 * 30, // 30分間キャッシュを保持
            refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動リフェッチを無効化
            retry: 1, // リトライは1回まで
          },
          mutations: {
            retry: 0, // ミューテーションはリトライしない
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}