'use client';

import { ReactNode } from 'react';
import { TabNavigation } from './TabNavigation';
import { SkipLink } from '@/components/ui/SkipLink';
import { PageTransition } from '@/components/ui/PageTransition';

interface MainLayoutProps {
  children: ReactNode;
  showTabBar?: boolean;
}

export function MainLayout({ children, showTabBar = true }: MainLayoutProps) {
  return (
    <>
      <SkipLink />
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <main 
          id="main-content" 
          tabIndex={-1}
          className={`${showTabBar ? 'pb-20' : ''}`}
        >
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        {showTabBar && (
          <nav id="main-navigation" aria-label="メインナビゲーション">
            <TabNavigation />
          </nav>
        )}
      </div>
    </>
  );
}