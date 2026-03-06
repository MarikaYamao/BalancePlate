'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PostConditionFeedback } from '@/components/features/condition/PostConditionFeedback';
import { conditionTagsInfo } from '@/lib/constants/conditionTags';
import { DailyStateRepository } from '@/lib/db/repositories/dailyStateRepository';
import { UserSettingsRepository } from '@/lib/db/repositories/userSettingsRepository';
import { fridgeItemRepository } from '@/lib/db/repositories/fridgeItemRepository';
import { getTodayKey } from '@/lib/utils/dateUtils';
import type { ConditionTag } from '@/types';

interface ConditionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  resetTime: string;
  onSave?: () => void;
}

export function ConditionModal({ isOpen, onClose, resetTime, onSave }: ConditionModalProps) {
  const [selectedTags, setSelectedTags] = useState<ConditionTag[]>([]);
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [savedData, setSavedData] = useState<{tags: ConditionTag[], memo: string} | null>(null);

  // モーダルが開いた時にボディのスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !showFeedback) return null;

  const handleTagToggle = (tagId: ConditionTag) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      }
      return [...prev, tagId];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const repository = new DailyStateRepository();
      const todayState = await repository.getToday(resetTime);
      
      // 何も選択されていない場合は空配列で記録
      await repository.upsert({
        conditionTags: selectedTags,
        freeMemo: memo || (todayState?.freeMemo || '')
      }, resetTime);

      // AI食事提案を生成
      console.log('✅ コンディション保存完了、AI提案を開始します...');
      try {
        // 暗号化DBを初期化
        const { initializeEncryptedDatabase } = await import('@/lib/db/encryptedDatabase');
        await initializeEncryptedDatabase();
        
        const userSettingsRepo = new UserSettingsRepository();
        const userSettings = await userSettingsRepo.get();
        console.log('👤 ユーザー設定取得:', userSettings ? 'あり' : 'なし');
        
        if (userSettings) {
          // 手持ち食材を取得
          const fridgeItems = await fridgeItemRepository.getAvailableFridgeItems();
          const availableIngredients = fridgeItems.map(item => item.name);
          
          console.log('🍽️ 手持ち食材:', availableIngredients);
          console.log('👤 ユーザー設定:', {
            bodyConstitution: userSettings.bodyConstitution,
            lifestyle: userSettings.lifestyle,
            currentWeight: userSettings.profile?.currentWeight,
            goalType: userSettings.profile?.goalType
          });
          console.log('💭 今日のコンディション:', selectedTags);

          // APIリクエストボディを構築
          const requestBody = {
            userProfile: {
              age: userSettings.profile?.birthYear 
                ? new Date().getFullYear() - userSettings.profile.birthYear
                : undefined,
              height: userSettings.profile?.height,
              currentWeight: userSettings.profile?.currentWeight,
              activityLevel: userSettings.profile?.activityLevel || 'moderate',
              bodyConstitution: userSettings.bodyConstitution || [],
              lifestyle: userSettings.lifestyle || [],
              favoriteFoods: userSettings.favoriteFoods || [],
              dislikedFoods: userSettings.dislikedFoods || [],
              mealsPerDay: userSettings.mealsPerDay || 3,
              additionalNotes: userSettings.additionalNotes || '',
            },
            goals: userSettings.profile?.goalType ? {
              goalType: userSettings.profile.goalType,
              targetWeight: userSettings.profile.targetWeight,
            } : undefined,
            todayCondition: {
              conditionTags: selectedTags,
              freeMemo: memo || '',
            },
            requestType: 'morning_plan' as const,
          };
          
          // 手持ち食材がある場合のみ追加
          if (availableIngredients.length > 0) {
            (requestBody as any).availableIngredients = availableIngredients;
          }
          
          console.log('🚀 AI APIリクエスト送信:', requestBody);

          // AI相談APIを呼び出し
          const response = await fetch('/api/ai/consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✨ AI食事提案を取得しました:', data);
            
            // LocalStorageに保存（配列形式で一貫性を保つ）
            const todayKey = getTodayKey(resetTime);
            const dateKey = todayKey;
            
            // 新しい相談データを追加
            const { consultationStorage } = await import("@/lib/ai/consultationStorage");
            const consultationData = {
              timestamp: new Date().toISOString(),
              type: 'condition_input',
              requestType: 'morning_plan',
              response: data,
              isConditionFeedback: true,
              dateKey
            };
            consultationStorage.save(dateKey, consultationData);
            consultationStorage.saveLatest(data);
            
            console.log('💾 LocalStorageに保存完了');
            
            // イベントを発行して画面を更新
            window.dispatchEvent(new CustomEvent('ai-consultation-updated'));
          } else {
            const errorText = await response.text();
            console.error('❌ AI APIエラー:', response.status, errorText);
          }
        } else {
          console.warn('⚠️ ユーザー設定が見つかりません。デフォルト設定でAI提案を実行します。');
          
          // デフォルト設定でAI提案を実行
          const requestBody = {
            userProfile: {
              mealsPerDay: 3,
              bodyConstitution: [],
              lifestyle: [],
              favoriteFoods: [],
              dislikedFoods: [],
              additionalNotes: '',
            },
            todayCondition: {
              conditionTags: selectedTags,
              freeMemo: memo || '',
            },
            requestType: 'morning_plan' as const,
          };
          
          console.log('🚀 デフォルト設定でAI API リクエスト送信:', requestBody);
          
          const response = await fetch('/api/ai/consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✨ AI食事提案を取得しました（デフォルト設定）:', data);
            
            // LocalStorageに保存（配列形式で一貫性を保つ）
            const todayKey = getTodayKey(resetTime);
            const dateKey = todayKey;
            
            // 新しい相談データを追加
            const { consultationStorage } = await import("@/lib/ai/consultationStorage");
            const consultationData = {
              timestamp: new Date().toISOString(),
              type: 'condition_input',
              requestType: 'morning_plan',
              response: data,
              isConditionFeedback: true,
              dateKey
            };
            consultationStorage.save(dateKey, consultationData);
            consultationStorage.saveLatest(data);
            
            console.log('💾 LocalStorageに保存完了');
            
            // イベントを発行して画面を更新
            window.dispatchEvent(new CustomEvent('ai-consultation-updated'));
          } else {
            const errorText = await response.text();
            console.error('❌ AI APIエラー:', response.status, errorText);
          }
        }
      } catch (aiError) {
        console.error('❌ AI提案の取得に失敗:', aiError);
        // AI提案の失敗は無視して続行
      }

      // フィードバック表示用のデータを保存
      setSavedData({ tags: selectedTags, memo: memo });
      setShowFeedback(true);
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Failed to save condition:', error);
      alert('コンディションの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // 強制モーダルの場合はバックドロップクリックで閉じない
    if (!onClose) return;
    
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // フィードバック表示中はConditionModalを非表示
  if (showFeedback && savedData) {
    const todayKey = getTodayKey(resetTime);
    return (
      <PostConditionFeedback
        conditionTags={savedData.tags}
        freeMemo={savedData.memo}
        dateKey={todayKey}
        onClose={() => {
          setShowFeedback(false);
          setSavedData(null);
          setSelectedTags([]);
          setMemo('');
          if (onClose) {
            onClose();
          }
        }}
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/30 p-4 pt-8"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--color-bg-surface)] rounded-2xl w-full max-w-md max-h-[calc(100vh-100px)] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-default)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-brand-primary)] bg-opacity-10 rounded-full flex items-center justify-center">
              <span className="text-xl">💭</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                今日のコンディション
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                体調を記録してください
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--color-text-tertiary)]" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
          {/* 重要性の説明 */}
          <div className="mb-4 p-3 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border-light)]">
            <p className="text-sm text-[var(--color-text-secondary)] font-medium">
              🎯 コンディション記録は、AIがあなたに最適な食事を提案するための重要な情報です
            </p>
          </div>

          {/* タグ選択 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              該当するものを選択（複数可・未選択でも記録可能）
            </h3>
            <div className="flex flex-wrap gap-2">
              {conditionTagsInfo.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id as ConditionTag)}
                    className={`
                      px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      flex items-center gap-1.5 border
                      ${isSelected
                        ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)] shadow-md scale-105'
                        : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-default)] hover:border-[var(--color-brand-primary)] hover:shadow-sm'
                      }
                    `}
                  >
                    <span className="text-base">{tag.icon}</span>
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
            
            {selectedTags.length === 0 && (
              <p className="text-xs text-[var(--color-text-tertiary)] font-medium mt-2">
                💡 記録するとAIがあなたに合った食事を提案できます（未選択でもOK）
              </p>
            )}
          </div>

          {/* メモ欄（オプション） */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              メモ（任意）
            </h3>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="気分や体調について自由に記録..."
              className="w-full p-3 border border-[var(--color-border-default)] rounded-xl text-sm text-[var(--color-text-primary)] font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border-default)] bg-[var(--color-bg-subtle)]">
          <div className="flex gap-3">
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isSaving}
              >
                キャンセル
              </Button>
            )}
            <Button
              onClick={handleSave}
              variant="primary"
              className="flex-1"
              disabled={isSaving}
            >
              {isSaving ? 'AI提案を生成中...' : '記録する'}
            </Button>
          </div>
          
          {!onClose && (
            <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-2 font-medium">
              ※ コンディションを記録すると続行できます
            </p>
          )}
        </div>
      </div>
    </div>
  );
}