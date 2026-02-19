'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface FoodPreferencesProps {
  favoriteFoods: string[];
  dislikedFoods: string[];
  onFavoriteFoodsChange: (foods: string[]) => void;
  onDislikedFoodsChange: (foods: string[]) => void;
}


export function FoodPreferences({
  favoriteFoods,
  dislikedFoods,
  onFavoriteFoodsChange,
  onDislikedFoodsChange
}: FoodPreferencesProps) {
  const [favoriteInput, setFavoriteInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');

  const addFavorite = (food: string) => {
    // カンマ区切りで複数の食材を処理
    const foods = food.split('、').map(f => f.trim()).filter(f => f);
    const newFoods = foods.filter(f => !favoriteFoods.includes(f));
    if (newFoods.length > 0) {
      onFavoriteFoodsChange([...favoriteFoods, ...newFoods]);
    }
    setFavoriteInput('');
  };

  const removeFavorite = (food: string) => {
    onFavoriteFoodsChange(favoriteFoods.filter(f => f !== food));
  };

  const addDislike = (food: string) => {
    // カンマ区切りで複数の食材を処理
    const foods = food.split('、').map(f => f.trim()).filter(f => f);
    const newFoods = foods.filter(f => !dislikedFoods.includes(f));
    if (newFoods.length > 0) {
      onDislikedFoodsChange([...dislikedFoods, ...newFoods]);
    }
    setDislikeInput('');
  };

  const removeDislike = (food: string) => {
    onDislikedFoodsChange(dislikedFoods.filter(f => f !== food));
  };

  const handleFavoriteKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && favoriteInput.trim()) {
      addFavorite(favoriteInput);
    }
  };

  const handleDislikeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && dislikeInput.trim()) {
      addDislike(dislikeInput);
    }
  };


  return (
    <div className="space-y-6 mb-6">
      {/* 好きな食材・料理 */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-4 shadow-[var(--shadow-sm)] border border-[var(--color-border-light)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">😍</span>
          <h3 className="font-bold text-[var(--color-text-primary)]">好きな食材・料理</h3>
        </div>
        
        <p className="text-xs text-[var(--color-text-secondary)] font-medium mb-3">
          AIが優先的に提案する食材・料理を登録できます
        </p>

        {/* 入力欄 */}
        <div className="relative mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={favoriteInput}
              onChange={(e) => setFavoriteInput(e.target.value)}
              onKeyPress={handleFavoriteKeyPress}
              placeholder="カレー、トマト、鶏肉など（複数可）"
              className="flex-1 px-3 py-2 border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-success)] text-[var(--color-text-primary)] font-medium"
            />
            <button
              onClick={() => favoriteInput.trim() && addFavorite(favoriteInput)}
              disabled={!favoriteInput.trim()}
              className="px-4 py-2 bg-[var(--color-success)] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-sm"
            >
              追加
            </button>
          </div>
        </div>

        {/* タグ表示 */}
        <div className="flex flex-wrap gap-2">
          {favoriteFoods.map((food) => (
            <span
              key={food}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-bg-elevated)] text-[var(--color-success)] border border-[var(--color-success)] border-opacity-30 rounded-full text-sm font-medium"
            >
              {food}
              <button
                onClick={() => removeFavorite(food)}
                className="hover:bg-[var(--color-bg-subtle)] rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

      </div>

      {/* 嫌い・アレルギーのある食材 */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-4 shadow-[var(--shadow-sm)] border border-[var(--color-border-light)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🚫</span>
          <h3 className="font-bold text-[var(--color-text-primary)]">嫌い・アレルギーのある食材</h3>
        </div>
        
        <p className="text-xs text-[var(--color-text-secondary)] font-medium mb-3">
          AIが避けて提案する食材・料理を登録できます
        </p>

        {/* 入力欄 */}
        <div className="relative mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={dislikeInput}
              onChange={(e) => setDislikeInput(e.target.value)}
              onKeyPress={handleDislikeKeyPress}
              placeholder="きのこ、生魚、小麦など（複数可）"
              className="flex-1 px-3 py-2 border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)] text-[var(--color-text-primary)] font-medium"
            />
            <button
              onClick={() => dislikeInput.trim() && addDislike(dislikeInput)}
              disabled={!dislikeInput.trim()}
              className="px-4 py-2 bg-[var(--color-danger)] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-danger-hover)] transition-colors shadow-sm"
            >
              追加
            </button>
          </div>
        </div>

        {/* タグ表示 */}
        <div className="flex flex-wrap gap-2">
          {dislikedFoods.map((food) => (
            <span
              key={food}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-bg-elevated)] text-[var(--color-danger)] border border-[var(--color-danger)] border-opacity-30 rounded-full text-sm font-medium"
            >
              {food}
              <button
                onClick={() => removeDislike(food)}
                className="hover:bg-[var(--color-bg-subtle)] rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* アレルギー注意書き */}
        <div className="mt-3 p-2 bg-[var(--color-bg-subtle)] border border-[var(--color-warning)] border-opacity-30 rounded-lg">
          <p className="text-xs text-[var(--color-warning)] font-medium">
            ⚠️ アレルギーがある場合は必ず登録してください。
            AIはこの情報を基に安全な食事提案を行います。
          </p>
        </div>
      </div>
    </div>
  );
}