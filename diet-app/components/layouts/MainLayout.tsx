'use client';

import { ReactNode } from 'react';
import { TabNavigation } from './TabNavigation';
import { SkipLink } from '@/components/ui/SkipLink';
import { PageTransition } from '@/components/ui/PageTransition';
import Image from 'next/image';

interface MainLayoutProps {
  children: ReactNode;
  showTabBar?: boolean;
  showHeader?: boolean;
}

export function MainLayout({ children, showTabBar = true, showHeader = true }: MainLayoutProps) {
  return (
    <>
      <SkipLink />
      <div className="min-h-screen bg-sand-300">
        {showHeader && (
          <header className="bg-teal-500 shadow-sm">
            <div className="px-4 py-3 flex items-center justify-center bg-white/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="BalancePlate Logo" 
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <Image 
                  src="/string.png" 
                  alt="BalancePlate" 
                  width={120}
                  height={24}
                  className="object-contain"
                />
              </div>
            </div>
          </header>
        )}
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