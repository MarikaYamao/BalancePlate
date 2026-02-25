'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X } from 'lucide-react';

interface OnboardingFoodPreferencesProps {
  favoriteFoods: string[];
  dislikedFoods: string[];
  onFavoriteFoodsChange: (foods: string[]) => void;
  onDislikedFoodsChange: (foods: string[]) => void;
  onFavoriteInputChange?: (value: string) => void;
  onDislikeInputChange?: (value: string) => void;
  initialFavoriteInput?: string;
  initialDislikeInput?: string;
}

export interface OnboardingFoodPreferencesRef {
  getFavoriteInput: () => string;
  getDislikeInput: () => string;
}

export const OnboardingFoodPreferences = forwardRef<
  OnboardingFoodPreferencesRef,
  OnboardingFoodPreferencesProps
>(({
  favoriteFoods,
  dislikedFoods,
  onFavoriteFoodsChange,
  onDislikedFoodsChange,
  onFavoriteInputChange,
  onDislikeInputChange,
  initialFavoriteInput = '',
  initialDislikeInput = ''
}, ref) => {
  const [favoriteInput, setFavoriteInput] = useState(initialFavoriteInput);
  const [dislikeInput, setDislikeInput] = useState(initialDislikeInput);

  useImperativeHandle(ref, () => ({
    getFavoriteInput: () => favoriteInput,
    getDislikeInput: () => dislikeInput
  }));

  useEffect(() => {
    onFavoriteInputChange?.(favoriteInput);
  }, [favoriteInput, onFavoriteInputChange]);

  useEffect(() => {
    onDislikeInputChange?.(dislikeInput);
  }, [dislikeInput, onDislikeInputChange]);

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
    <div className="space-y-6">
      {/* 好きな食材・料理 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-teal-700">
          好きな食材・料理
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={favoriteInput}
            onChange={(e) => setFavoriteInput(e.target.value)}
            onKeyPress={handleFavoriteKeyPress}
            placeholder="例: 鶏肉、サラダ、豆腐"
            className="flex-1 px-3 py-2 bg-white border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => favoriteInput.trim() && addFavorite(favoriteInput)}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition-colors shadow-sm"
          >
            追加
          </button>
        </div>
        <p className="text-xs text-gray-500">
          カンマ（、）で区切って複数入力できます。Enterキーでも追加できます。
        </p>
        {favoriteFoods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {favoriteFoods.map((food) => (
              <span
                key={food}
                className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
              >
                {food}
                <button
                  type="button"
                  onClick={() => removeFavorite(food)}
                  className="ml-2 text-teal-600 hover:text-teal-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 嫌い・アレルギーのある食材 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-red-600">
          嫌い・アレルギーのある食材
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={dislikeInput}
            onChange={(e) => setDislikeInput(e.target.value)}
            onKeyPress={handleDislikeKeyPress}
            placeholder="例: 牛乳、海老、ナス"
            className="flex-1 px-3 py-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => dislikeInput.trim() && addDislike(dislikeInput)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors shadow-sm"
          >
            追加
          </button>
        </div>
        <p className="text-xs text-red-600">
          ⚠️ アレルギーがある場合は必ず登録してください
        </p>
        {dislikedFoods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dislikedFoods.map((food) => (
              <span
                key={food}
                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
              >
                {food}
                <button
                  type="button"
                  onClick={() => removeDislike(food)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

OnboardingFoodPreferences.displayName = 'OnboardingFoodPreferences';