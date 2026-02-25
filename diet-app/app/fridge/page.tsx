'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/Button';
import { SimpleFridgeList } from '@/components/features/fridge/SimpleFridgeList';
import { SimpleFridgeModal } from '@/components/features/fridge/SimpleFridgeModal';

export default function FridgePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddSuccess = () => {
    // リストは自動でリフレッシュされる
  };

  return (
    <>
      <MainLayout>
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* ヘッダー */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-teal-800">🛒 手持ち食材</h1>
            <p className="text-gray-600 text-sm mt-1">
              今手元にある食材を登録すると、AIが優先的にレシピを提案します
            </p>
          </div>

          {/* メインコンテンツ */}
          <SimpleFridgeList onAddItem={() => setIsAddModalOpen(true)} />

          {/* 追加モーダル */}
          <SimpleFridgeModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handleAddSuccess}
          />
        </div>
      </MainLayout>

      {/* FAB（追加ボタン） - MainLayoutの外に配置 */}
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg text-xl hover:shadow-xl transition-shadow bg-teal-500 text-white hover:bg-teal-600"
          aria-label="食材を追加"
        >
          ＋
        </Button>
      </div>
    </>
  );
}