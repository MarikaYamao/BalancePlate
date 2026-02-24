'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/Button';
import { BasicSettings } from '@/components/features/settings/BasicSettings';
import { BodyConstitutionSelector } from '@/components/features/settings/BodyConstitutionSelector';
import { LifestyleSelector } from '@/components/features/settings/LifestyleSelector';
import { FoodPreferences } from '@/components/features/settings/FoodPreferences';
import { FreeNotes } from '@/components/features/settings/FreeNotes';
import { BackupManager } from '@/components/features/backup/BackupManager';
import { EnhancedGoalSettings, type GoalType, type GoalPeriod } from '@/components/features/settings/EnhancedGoalSettings';
import type { GoalMode, ConstraintType } from '@/types';
import { userSettingsRepository } from '@/lib/db/repositories';
import type { BodyConstitutionTag, LifestyleTag } from '@/types';

export default function SettingsPage() {
  const [dayResetTime, setDayResetTime] = useState('04:00');
  const [mealsPerDay, setMealsPerDay] = useState<2 | 3>(3);
  const [bodyConstitution, setBodyConstitution] = useState<BodyConstitutionTag[]>([]);
  const [lifestyle, setLifestyle] = useState<LifestyleTag[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<string[]>([]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [goalType, setGoalType] = useState<GoalType | undefined>();
  const [currentWeight, setCurrentWeight] = useState<number | undefined>();
  const [targetWeight, setTargetWeight] = useState<number | undefined>();
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriod>('no_limit');
  const [goalMode, setGoalMode] = useState<GoalMode | undefined>();
  const [constraints, setConstraints] = useState<ConstraintType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'backup'>('profile');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await userSettingsRepository.get();
      if (settings) {
        setDayResetTime(settings.dayResetTime);
        setMealsPerDay(settings.mealsPerDay);
        setBodyConstitution(settings.bodyConstitution || []);
        setLifestyle(settings.lifestyle || []);
        setFavoriteFoods(settings.favoriteFoods || []);
        setDislikedFoods(settings.dislikedFoods || []);
        setAdditionalNotes(settings.additionalNotes || '');
        // 目標設定を読み込み
        if (settings.profile) {
          setCurrentWeight(settings.profile.currentWeight);
          setGoalType(settings.profile.goalType as GoalType);
          setTargetWeight(settings.profile.targetWeight);
          setGoalPeriod(settings.profile.goalPeriod as GoalPeriod || 'no_limit');
        }
        // Phase21: 新しいゴール設定を読み込み
        setGoalMode(settings.goalMode);
        setConstraints(settings.constraints || []);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage('設定の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // プロファイル完成度を計算
  const calculateProfileCompleteness = () => {
    // 各項目の入力状態をチェック
    const checks = {
      basic: true, // 基本設定は常に完了とみなす
      goal: !!goalType, // 目標設定
      bodyInfo: bodyConstitution.includes('healthy') || bodyConstitution.length > 0,
      lifestyle: lifestyle.length > 0,
      foodPreferences: favoriteFoods.length > 0 || dislikedFoods.length > 0,
      notes: additionalNotes.length > 20
    };
    
    // 完成した項目数から割合を計算
    const completedCount = Object.values(checks).filter(Boolean).length;
    const totalCount = Object.keys(checks).length;
    
    return Math.round((completedCount / totalCount) * 100);
  };

  // 未完成項目を取得
  const getIncompleteItems = () => {
    const items = [];
    
    if (!goalType) {
      items.push('目標設定');
    }
    
    // 健康体の場合も選択を促す
    if (!bodyConstitution.includes('healthy') && bodyConstitution.length === 0) {
      items.push('体質情報（健康体の方も「特になし」を選択してください）');
    }
    
    if (lifestyle.length === 0) {
      items.push('生活習慣');
    }
    
    if (favoriteFoods.length === 0 && dislikedFoods.length === 0) {
      items.push('食材の好み（任意だが推奨）');
    }
    
    if (additionalNotes.length <= 20) {
      items.push('その他の情報（任意）');
    }
    
    return items;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage('');
      
      const existingSettings = await userSettingsRepository.get();
      
      if (existingSettings) {
        // 既存設定を更新
        await userSettingsRepository.update(existingSettings.id, {
          dayResetTime,
          mealsPerDay,
          bodyConstitution,
          lifestyle,
          // favoriteFoods,
          // dislikedFoods,
          additionalNotes,
          goalMode,
          constraints,
          profile: {
            ...existingSettings.profile,
            currentWeight,
            goalType: goalType as any,
            targetWeight,
            goalPeriod: goalPeriod as any,
          },
        });
      } else {
        // 新規作成
        await userSettingsRepository.save({
          dayResetTime,
          mealsPerDay,
          bodyConstitution,
          lifestyle,
          // favoriteFoods,
          // dislikedFoods,
          additionalNotes,
          goalMode,
          constraints,
          onboardingCompleted: true,
        });
      }
      
      setHasChanges(false);
      setMessage('設定を保存しました ✅');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // 設定変更を検知
  const markAsChanged = () => {
    if (!isLoading) {
      setHasChanges(true);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen p-4 flex items-center justify-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen pb-24">
        {/* ヘッダー with gradient background */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 pb-8">
          <h1 className="text-2xl font-bold mb-2">設定</h1>
          <p className="text-sm opacity-90">AIがより良い提案をするための情報を設定します</p>
          
          {/* プロファイル完成度 */}
          <div className="mt-4 bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">プロファイル完成度</span>
              <span className="text-lg font-bold">{calculateProfileCompleteness()}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${calculateProfileCompleteness()}%` }}
              />
            </div>
            {calculateProfileCompleteness() < 100 ? (
              <div className="mt-2">
                <p className="text-xs opacity-90 mb-1">
                  未入力項目：
                </p>
                <ul className="text-xs opacity-80 space-y-0.5">
                  {getIncompleteItems().map((item, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span>・</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs mt-2 opacity-90">
                ✨ プロファイル完成！AIが最適な提案をお届けします
              </p>
            )}
          </div>
        </div>
        
        {/* タブ切り替え */}
        <div className="flex gap-2 px-4 -mt-4 mb-4 relative z-10">
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeSection === 'profile'
                ? 'bg-white shadow-lg text-purple-600 border-2 border-purple-200'
                : 'bg-white/80 text-gray-600 border border-gray-200'
            }`}
          >
            <span className="text-lg mb-1 block">👤</span>
            <span className="text-sm">プロファイル</span>
          </button>
          <button
            onClick={() => setActiveSection('backup')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeSection === 'backup'
                ? 'bg-white shadow-lg text-purple-600 border-2 border-purple-200'
                : 'bg-white/80 text-gray-600 border border-gray-200'
            }`}
          >
            <span className="text-lg mb-1 block">💾</span>
            <span className="text-sm">バックアップ</span>
          </button>
        </div>
        
        <div className="px-4">
        {activeSection === 'profile' ? (
          <>
            {/* AIのメリット説明 */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex-1">
                  <p className="text-sm text-purple-800 font-medium">AI分析の精度向上</p>
                  <p className="text-xs text-purple-600 mt-1">
                    あなたの体質や生活習慣を理解することで、より適切な食事アドバイスを提供できます
                  </p>
                </div>
              </div>
            </div>
            
            {/* 基本設定 */}
            <BasicSettings
              dayResetTime={dayResetTime}
              mealsPerDay={mealsPerDay}
              onResetTimeChange={(value) => {
                setDayResetTime(value);
                markAsChanged();
              }}
              onMealsPerDayChange={(value) => {
                setMealsPerDay(value);
                markAsChanged();
              }}
            />
            
            {/* Phase21: 強化された目標設定 */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">🎯 目標設定</h2>
              <EnhancedGoalSettings
                goalType={goalType}
                currentWeight={currentWeight}
                targetWeight={targetWeight}
                goalPeriod={goalPeriod}
                goalMode={goalMode}
                constraints={constraints}
                onGoalTypeChange={(value) => {
                  setGoalType(value);
                  markAsChanged();
                }}
                onCurrentWeightChange={(value) => {
                  setCurrentWeight(value);
                  markAsChanged();
                }}
                onTargetWeightChange={(value) => {
                  setTargetWeight(value);
                  markAsChanged();
                }}
                onGoalPeriodChange={(value) => {
                  setGoalPeriod(value);
                  markAsChanged();
                }}
                onGoalModeChange={(value) => {
                  setGoalMode(value);
                  markAsChanged();
                }}
                onConstraintsChange={(value) => {
                  setConstraints(value);
                  markAsChanged();
                }}
              />
            </div>
            
            {/* 体質選択 */}
            <BodyConstitutionSelector
              selected={bodyConstitution}
              onChange={(value) => {
                setBodyConstitution(value);
                markAsChanged();
              }}
            />
            
            {/* 生活習慣選択 */}
            <LifestyleSelector
              selected={lifestyle}
              onChange={(value) => {
                setLifestyle(value);
                markAsChanged();
              }}
            />
            
            {/* 食材の好み */}
            <FoodPreferences
              favoriteFoods={favoriteFoods}
              dislikedFoods={dislikedFoods}
              onFavoriteFoodsChange={(value: string[]) => {
                setFavoriteFoods(value);
                markAsChanged();
              }}
              onDislikedFoodsChange={(value: string[]) => {
                setDislikedFoods(value);
                markAsChanged();
              }}
            />
            
            {/* 自由記載欄 */}
            <FreeNotes
              value={additionalNotes}
              onChange={(value) => {
                setAdditionalNotes(value);
                markAsChanged();
              }}
            />
          </>
        ) : (
          <>
            {/* バックアップセクション */}
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <span className="text-lg">🔒</span>
                <div className="flex-1">
                  <p className="text-sm text-green-800 font-medium">データの安全性</p>
                  <p className="text-xs text-green-600 mt-1">
                    定期的なバックアップでデータを安全に保護しましょう
                  </p>
                </div>
              </div>
            </div>
            <BackupManager />
          </>
        )}
        </div>
        
        {/* 固定保存ボタン（プロファイルタブのみ） */}
        {activeSection === 'profile' && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`w-full ${
                hasChanges 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : ''
              }`}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> 保存中...
                </span>
              ) : hasChanges ? (
                '💾 設定を保存'
              ) : (
                '✅ 保存済み'
              )}
            </Button>
            {message && (
              <p className={`mt-2 text-sm text-center font-medium animate-fade-in ${
                message.includes('失敗') ? 'text-red-600' : 'text-green-600'
              }`}>
                {message}
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}