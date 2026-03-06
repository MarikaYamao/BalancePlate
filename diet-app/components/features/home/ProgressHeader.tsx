"use client";

import React from "react";

interface ProgressHeaderProps {
  mealsPerDay: 2 | 3;
  todayProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ 
  mealsPerDay, 
  todayProgress 
}) => {
  return (
    <header className="bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 pb-6">
      <div className="px-4 pt-6">
        {/* 進捗とモチベーション */}
        <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <div>
                <h2 className="font-bold text-gray-800">今日の進捗</h2>
                <p className="text-xs text-gray-600">
                  目標：{mealsPerDay === 2 ? '朝食・夕食' : '朝昼夕'}の記録
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {todayProgress.percentage}%
              </div>
              <div className="text-xs text-gray-500">
                {todayProgress.completed}/{todayProgress.total}食
              </div>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                todayProgress.percentage === 100
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : todayProgress.percentage >= 60
                    ? "bg-gradient-to-r from-blue-400 to-green-400"
                    : todayProgress.percentage >= 30
                      ? "bg-gradient-to-r from-yellow-400 to-blue-400"
                      : "bg-gradient-to-r from-gray-300 to-yellow-400"
              }`}
              style={{ width: `${todayProgress.percentage}%` }}
            ></div>
          </div>

          {/* モチベーションメッセージ */}
          <div className="text-center">
            {todayProgress.percentage === 100 ? (
              <span className="text-sm text-green-600 font-medium">
                🎉 素晴らしい！今日も完璧です
              </span>
            ) : mealsPerDay === 2 ? (
              // 2食設定の場合のメッセージ
              todayProgress.completed === 1 ? (
                <span className="text-sm text-blue-600 font-medium">
                  💪 あと夕食で完了です！
                </span>
              ) : (
                <span className="text-sm text-gray-600">
                  📝 今日も記録を始めましょう
                </span>
              )
            ) : (
              // 3食設定の場合のメッセージ
              todayProgress.percentage >= 66 ? (
                <span className="text-sm text-blue-600 font-medium">
                  💪 もう少しで完了です！
                </span>
              ) : todayProgress.percentage >= 33 ? (
                <span className="text-sm text-yellow-600 font-medium">
                  🌱 良いスタートです
                </span>
              ) : (
                <span className="text-sm text-gray-600">
                  📝 今日も記録を始めましょう
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};