"use client";

import React from "react";
import type { FridgeItem, FridgeItemCategory } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  useFridgeItems,
  useUpdateFridgeItem,
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
  onToggleAvailable,
  onRemove,
  onCreateSuggestion,
}: {
  item: FridgeItem;
  onToggleAvailable: (id: string, available: boolean) => void;
  onRemove: (id: string) => void;
  onCreateSuggestion: (item: FridgeItem) => void;
}) {
  return (
    <Card
      className={`p-4 transition-all ${item.available ? "border-teal-200 bg-teal-50" : "border-gray-200 bg-gray-50 opacity-60"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{categoryIcons[item.category]}</span>
          <div>
            <h3
              className={`font-medium ${item.available ? "text-gray-900" : "text-gray-500 line-through"}`}
            >
              {item.name}
            </h3>
            <p className="text-xs text-gray-500">
              {item.available ? "手持ちあり" : "使い切り"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI提案ボタン */}
          {item.available && (
            <Button
              variant="outline"
              size="small"
              onClick={() => onCreateSuggestion(item)}
              className="text-xs px-2 py-1"
            >
              🤖 提案
            </Button>
          )}

          {/* あり/なし切り替え */}
          <button
            onClick={() => onToggleAvailable(item.id, !item.available)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              item.available
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-teal-100 text-teal-700 hover:bg-teal-200"
            }`}
          >
            {item.available ? "使い切り" : "復活"}
          </button>

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
  const updateMutation = useUpdateFridgeItem();
  const deleteMutation = useDeleteFridgeItem();

  // 手持ちありと使い切りで分類
  const availableItems = allItems.filter((item) => item.available);
  const unavailableItems = allItems.filter((item) => !item.available);

  const handleToggleAvailable = async (id: string, available: boolean) => {
    try {
      await updateMutation.mutateAsync({ id, available });
      refetch();
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

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

  const handleCreateSuggestion = (item: FridgeItem) => {
    // 食事提案画面に遷移（実装は後で）
    const params = new URLSearchParams();
    params.set("ingredient", item.name);
    params.set("hasFridge", "true"); // 有料機能フラグ
    window.location.href = `/food-plan?${params.toString()}`;
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
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-teal-600">
              {availableItems.length}
            </p>
            <p className="text-xs text-gray-600">手持ちあり</p>
          </div>
          {unavailableItems.length > 0 && (
            <>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-400">
                  {unavailableItems.length}
                </p>
                <p className="text-xs text-gray-600">使い切り</p>
              </div>
            </>
          )}
        </div>

        {availableItems.length > 0 && (
          <Button
            variant="outline"
            size="small"
            onClick={() => {
              const ingredients = availableItems
                .map((item) => item.name)
                .join(",");
              const params = new URLSearchParams();
              params.set("ingredients", ingredients);
              params.set("hasFridge", "true");
              window.location.href = `/food-plan?${params.toString()}`;
            }}
          >
            🤖 まとめて提案
          </Button>
        )}
      </div>

      {/* 手持ちあり */}
      {availableItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            ✅ 手持ちあり ({availableItems.length}品)
          </h3>
          <div className="space-y-2">
            {availableItems.map((item) => (
              <FridgeItemCard
                key={item.id}
                item={item}
                onToggleAvailable={handleToggleAvailable}
                onRemove={handleRemove}
                onCreateSuggestion={handleCreateSuggestion}
              />
            ))}
          </div>
        </div>
      )}

      {/* 使い切り */}
      {unavailableItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            📝 使い切り済み ({unavailableItems.length}品)
          </h3>
          <div className="space-y-2">
            {unavailableItems.map((item) => (
              <FridgeItemCard
                key={item.id}
                item={item}
                onToggleAvailable={handleToggleAvailable}
                onRemove={handleRemove}
                onCreateSuggestion={handleCreateSuggestion}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
