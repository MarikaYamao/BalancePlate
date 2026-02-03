'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';

export default function RecordPage() {
  const router = useRouter();

  const recordOptions = [
    {
      title: '今日のコンディション',
      icon: '😊',
      description: '体調や気分を記録',
      path: '/record/condition',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: '食事記録',
      icon: '🍽️',
      description: '朝食・昼食・夕食を記録',
      path: '/record/meal',
      color: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: '体重記録',
      icon: '⚖️',
      description: '体重の変化を記録',
      path: '/record/weight',
      color: 'bg-purple-50 hover:bg-purple-100',
      disabled: true,
      comingSoon: 'Phase 10'
    },
    {
      title: '運動・活動',
      icon: '🏃',
      description: '運動や活動を記録',
      path: '/record/activity',
      color: 'bg-orange-50 hover:bg-orange-100',
      disabled: true,
      comingSoon: '今後実装予定'
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">記録</h1>
        
        <div className="grid gap-4">
          {recordOptions.map((option) => (
            <button
              key={option.title}
              onClick={() => !option.disabled && router.push(option.path)}
              disabled={option.disabled}
              className={`
                relative text-left p-4 rounded-lg transition-all
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${option.color}
              `}
            >
              {option.comingSoon && (
                <span className="absolute top-2 right-2 text-xs bg-gray-200 px-2 py-1 rounded">
                  {option.comingSoon}
                </span>
              )}
              
              <div className="flex items-center gap-4">
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{option.title}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {!option.disabled && (
                  <div className="text-gray-400">
                    →
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <Card className="mt-6">
          <p className="text-sm text-gray-600">
            💡 ヒント：毎日の記録を続けることで、自分の体調パターンが見えてきます
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}