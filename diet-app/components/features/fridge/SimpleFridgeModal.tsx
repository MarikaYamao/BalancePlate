"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { FridgeItemCategory } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  predictCategory,
  POPULAR_INGREDIENTS,
} from "@/lib/utils/fridgeHelpers";
import { useCreateFridgeItem } from "@/lib/hooks";

interface SimpleFridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

export function SimpleFridgeModal({
  isOpen,
  onClose,
  onSuccess,
}: SimpleFridgeModalProps) {
  const [name, setName] = useState("");
  const [predictedCategory, setPredictedCategory] =
    useState<FridgeItemCategory>("vegetables");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateFridgeItem();

  // クライアントサイドでのマウント状態を管理
  useEffect(() => {
    setMounted(true);
  }, []);

  // 食材名変更時にカテゴリを自動推定
  useEffect(() => {
    if (name.trim()) {
      const predicted = predictCategory(name.trim());
      setPredictedCategory(predicted);
    }
  }, [name]);

  // モーダル開いた時にフォーカス & ESCキー対応
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setName("");
    setPredictedCategory("vegetables");
    setShowSuggestions(false);
    onClose();
  };

  const handleAdd = async () => {
    if (!name.trim()) return;

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        category: predictedCategory,
        available: true, // 手持ちあり状態で追加
      });

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const filteredSuggestions = POPULAR_INGREDIENTS.filter(
    (ingredient) =>
      ingredient.includes(name.toLowerCase()) && ingredient !== name,
  );

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-gray-900/30 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fridge-modal-title"
    >
      <div className="bg-white rounded-lg max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h2 id="fridge-modal-title" className="text-lg font-semibold text-teal-800">
              🛒 手持ち食材を追加
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="モーダルを閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 説明 */}
          <p className="text-sm text-gray-600 mb-4">
            今手元にある食材を教えてください。AIがおすすめレシピを優先的に提案します。
          </p>

          {/* 食材名入力 */}
          <div className="mb-6">
            <div className="relative">
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(name.length > 0)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg text-center"
                placeholder="例: にんじん, 鶏肉, 卵..."
              />

              {/* カテゴリ表示 */}
              {name.trim() && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">
                    {categoryIcons[predictedCategory]}
                  </span>
                </div>
              )}

              {/* サジェスト */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-2">
                  {filteredSuggestions.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setName(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* よく使う食材（クイック選択） */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">よく使う食材:</p>
            <div className="flex flex-wrap gap-2">
              {["にんじん", "玉ねぎ", "鶏肉", "卵", "牛乳", "パン"].map(
                (ingredient) => (
                  <button
                    key={ingredient}
                    onClick={() => {
                      setName(ingredient);
                      setShowSuggestions(false);
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-teal-100 text-gray-700 hover:text-teal-700 rounded-full text-sm font-medium transition-colors"
                  >
                    {ingredient}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!name.trim() || createMutation.isPending}
              className="flex-2"
            >
              {createMutation.isPending ? "追加中..." : "追加"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
