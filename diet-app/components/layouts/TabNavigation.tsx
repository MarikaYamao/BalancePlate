'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  disabled?: boolean;
}

const tabs: TabItem[] = [
  {
    id: 'home',
    label: 'ホーム',
    href: '/home',
    icon: '🏠'
  },
  {
    id: 'fridge',
    label: '食材',
    href: '/fridge',
    icon: '🥬'
  },
  {
    id: 'shopping',
    label: '買い出し',
    href: '/shopping',
    icon: '🛒',
    disabled: true
  },
  {
    id: 'diary',
    label: 'ダイアリー',
    href: '/diary',
    icon: '📖'
  },
  {
    id: 'settings',
    label: '設定',
    href: '/settings',
    icon: '⚙️'
  }
];

export function TabNavigation() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActiveTab = (href: string) => {
    if (!mounted) return false;
    if (href === '/home' && (pathname === '/home' || pathname === '/')) return true;
    if (href === '/diary' && (pathname.startsWith('/diary') || pathname.startsWith('/record') || pathname.startsWith('/history'))) return true;
    if (href !== '/home' && href !== '/diary' && pathname.startsWith(href)) return true;
    return false;
  };

  if (!mounted) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-default)] safe-area-pb shadow-[0_-2px_10px_rgba(15,61,62,0.08)]">
        <div className="max-w-screen-xl mx-auto">
          <ul className="flex justify-around items-center h-16">
            {tabs.map((tab) => (
              <li key={tab.id} className="flex-1">
                {tab.disabled ? (
                  <div className="flex flex-col items-center justify-center h-full py-2 text-gray-300 cursor-not-allowed">
                    <span className="text-xl mb-1 opacity-30">{tab.icon}</span>
                    <span className="text-[12px] font-semibold">{tab.label}</span>
                  </div>
                ) : (
                  <Link
                    href={tab.href}
                    className="flex flex-col items-center justify-center h-full py-2 text-[var(--color-text-tertiary)]"
                  >
                    <span className="text-xl mb-1 opacity-70">{tab.icon}</span>
                    <span className="text-[12px] font-semibold">{tab.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-default)] safe-area-pb shadow-[0_-2px_10px_rgba(15,61,62,0.08)]">
      <div className="max-w-screen-xl mx-auto">
        <ul className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const isActive = isActiveTab(tab.href);
            return (
              <li key={tab.id} className="flex-1">
                {tab.disabled ? (
                  <div className="flex flex-col items-center justify-center h-full py-2 text-gray-300 cursor-not-allowed">
                    <span className="text-xl mb-1 opacity-30">{tab.icon}</span>
                    <span className="text-[12px] font-semibold">{tab.label}</span>
                  </div>
                ) : (
                  <Link
                    href={tab.href}
                    className={`
                      flex flex-col items-center justify-center h-full py-2
                      transition-all duration-200
                      ${isActive 
                        ? 'text-[var(--color-brand-primary)]' 
                        : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                      }
                    `}
                  >
                    <span className={`text-xl mb-1 transition-all ${isActive ? 'scale-110' : 'opacity-70'}`}>{tab.icon}</span>
                    <span className={`text-[12px] font-semibold ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}