'use client';

import { ReactNode } from 'react';
import { TabNavigation } from './TabNavigation';

interface MainLayoutProps {
  children: ReactNode;
  showTabBar?: boolean;
}

export function MainLayout({ children, showTabBar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <main className={`${showTabBar ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showTabBar && <TabNavigation />}
    </div>
  );
}