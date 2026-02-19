'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface FoodPreferencesProps {
  favoriteFoods: string[];
  dislikedFoods: string[];
  onFavoritesChange: (foods: string[]) => void;
  onDislikesChange: (foods: string[]) => void;
}


export function FoodPreferences({
  favoriteFoods,
  dislikedFoods,
  onFavoritesChange,
  onDislikesChange
}: FoodPreferencesProps) {
  const [favoriteInput, setFavoriteInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');

  const addFavorite = (food: string) => {
    // カンマ区切りで複数の食材を処理
    const foods = food.split('、').map(f => f.trim()).filter(f => f);
    const newFoods = foods.filter(f => !favoriteFoods.includes(f));
    if (newFoods.length > 0) {
      onFavoritesChange([...favoriteFoods, ...newFoods]);
    }
    setFavoriteInput('');
  };

  const removeFavorite = (food: string) => {
    onFavoritesChange(favoriteFoods.filter(f => f !== food));
  };

  const addDislike = (food: string) => {
    // カンマ区切りで複数の食材を処理
    const foods = food.split('、').map(f => f.trim()).filter(f => f);
    const newFoods = foods.filter(f => !dislikedFoods.includes(f));
    if (newFoods.length > 0) {
      onDislikesChange([...dislikedFoods, ...newFoods]);
    }
    setDislikeInput('');
  };

  const removeDislike = (food: string) => {
    onDislikesChange(dislikedFoods.filter(f => f !== food));
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
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">😍</span>
          <h3 className="font-bold text-gray-800">好きな食材・料理</h3>
        </div>
        
        <p className="text-xs text-gray-600 mb-3">
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => favoriteInput.trim() && addFavorite(favoriteInput)}
              disabled={!favoriteInput.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
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
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {food}
              <button
                onClick={() => removeFavorite(food)}
                className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

      </div>

      {/* 嫌い・アレルギーのある食材 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🚫</span>
          <h3 className="font-bold text-gray-800">嫌い・アレルギーのある食材</h3>
        </div>
        
        <p className="text-xs text-gray-600 mb-3">
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={() => dislikeInput.trim() && addDislike(dislikeInput)}
              disabled={!dislikeInput.trim()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
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
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
            >
              {food}
              <button
                onClick={() => removeDislike(food)}
                className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* アレルギー注意書き */}
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ アレルギーがある場合は必ず登録してください。
            AIはこの情報を基に安全な食事提案を行います。
          </p>
        </div>
      </div>
    </div>
  );
}