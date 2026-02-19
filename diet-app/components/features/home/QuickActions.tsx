'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
}

const quickActions: QuickAction[] = [
  {
    id: 'condition',
    label: '今日のコンディション',
    description: '体調を記録',
    icon: '💭',
    href: '/record/condition',
    variant: 'primary'
  },
  {
    id: 'meal',
    label: '食事を記録',
    description: '食べたものを記録',
    icon: '🍽️',
    href: '/record/meal',
    variant: 'secondary'
  },
  {
    id: 'weight',
    label: '体重を記録',
    description: '今日の体重',
    icon: '⚖️',
    href: '/record/weight',
    variant: 'outline'
  }
];

export function QuickActions() {
  const router = useRouter();

  const handleAction = (href: string) => {
    router.push(href);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] px-4">クイックアクション</h3>
      <div className="space-y-3 px-4">
        {quickActions.map((action) => (
          <Card key={action.id} padding="none" className="overflow-hidden">
            <Button
              variant={action.variant}
              size="large"
              fullWidth
              onClick={() => handleAction(action.href)}
              className="justify-start text-left"
            >
              <div className="flex items-center gap-4 w-full py-2">
                <span className="text-2xl flex-shrink-0">{action.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold">{action.label}</div>
                  <div className="text-sm font-medium opacity-95">{action.description}</div>
                </div>
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}