'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const tabs: TabItem[] = [
  {
    id: 'home',
    label: 'ホーム',
    href: '/home',
    icon: '🏠'
  },
  {
    id: 'food-plan',
    label: 'AI提案',
    href: '/food-plan',
    icon: '🤖'
  },
  {
    id: 'record',
    label: '記録',
    href: '/record',
    icon: '📝'
  },
  {
    id: 'history',
    label: '履歴',
    href: '/history',
    icon: '📊'
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
    if (href !== '/home' && pathname.startsWith(href)) return true;
    return false;
  };

  if (!mounted) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="max-w-screen-xl mx-auto">
          <ul className="flex justify-around items-center h-16">
            {tabs.map((tab) => (
              <li key={tab.id} className="flex-1">
                <Link
                  href={tab.href}
                  className="flex flex-col items-center justify-center h-full text-gray-400"
                >
                  <span className="text-xl mb-1">{tab.icon}</span>
                  <span className="text-xs font-medium">{tab.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
      <div className="max-w-screen-xl mx-auto">
        <ul className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const isActive = isActiveTab(tab.href);
            return (
              <li key={tab.id} className="flex-1">
                <Link
                  href={tab.href}
                  className={`
                    flex flex-col items-center justify-center h-full
                    transition-colors duration-200
                    ${isActive 
                      ? 'text-pink-500' 
                      : 'text-gray-400 hover:text-gray-600'
                    }
                  `}
                >
                  <span className="text-xl mb-1">{tab.icon}</span>
                  <span className="text-xs font-medium">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}