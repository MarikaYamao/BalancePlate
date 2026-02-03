'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>
        
        <Card>
          <p className="text-gray-600">設定機能は Phase 7 で実装予定です</p>
        </Card>
      </div>
    </MainLayout>
  );
}