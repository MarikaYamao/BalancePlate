"use client";

import React from "react";
import type { FridgeItem, FridgeItemCategory } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  useFridgeItems,
  useDeleteFridgeItem,
} from "@/lib/hooks";

interface SimpleFridgeListProps {
  onAddItem: () => void;
}

const categoryIcons: Record<FridgeItemCategory, string> = {
  vegetables: "🥬",
  fruits: "🍎",
  meat: "🥩",
  seafood: "🐟",
  dairy: "🥛",
  eggs: "🥚",
  grains: "🍞",
  seasonings: "🧂",
  beverages: "🥤",
  frozen: "❄️",
  canned: "🥫",
  other: "📦",
};

function FridgeItemCard({
  item,
  onRemove,
}: {
  item: FridgeItem;
  onRemove: (id: string) => void;
}) {
  return (
    <Card className="p-4 transition-all border-teal-200 bg-teal-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{categoryIcons[item.category]}</span>
          <div>
            <h3 className="font-medium text-gray-900">
              {item.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 削除ボタン */}
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="削除"
          >
            🗑️
          </button>
        </div>
      </div>
    </Card>
  );
}

export function SimpleFridgeList({ onAddItem }: SimpleFridgeListProps) {
  const { data: allItems = [], isLoading, refetch } = useFridgeItems();
  const deleteMutation = useDeleteFridgeItem();

  const handleRemove = async (id: string) => {
    if (confirm("この食材をリストから削除しますか？")) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-16 bg-gray-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            手持ち食材を追加しましょう
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            今手元にある食材を登録すると、AIがそれらを使ったレシピを優先的に提案します。
          </p>

          <Button onClick={onAddItem} className="px-6">
            🛒 最初の食材を追加
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* サマリー */}
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-lg font-bold text-teal-600">
            {allItems.length}
          </p>
          <p className="text-xs text-gray-600">手持ち食材</p>
        </div>
      </div>

      {/* 食材リスト */}
      {allItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            🍽️ 手持ち食材 ({allItems.length}品)
          </h3>
          <div className="space-y-2">
            {allItems.map((item) => (
              <FridgeItemCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
