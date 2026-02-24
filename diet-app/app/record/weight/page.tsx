'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { WeightInput } from '@/components/features/weight/WeightInput';
import { WeightHistory } from '@/components/features/weight/WeightHistory';
import { weightLogRepository } from '@/lib/db/repositories';
import { useUserSettings } from '@/lib/hooks';
import type { WeightLog } from '@/types';

export default function WeightRecordPage() {
  const router = useRouter();
  const { settings } = useUserSettings();
  
  // 体重記録用の状態
  const [weight, setWeight] = useState<number>(0);
  const [measurementTiming, setMeasurementTiming] = useState<'morning' | 'night' | 'other'>('morning');
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 履歴用の状態
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [todaysWeight, setTodaysWeight] = useState<WeightLog | null>(null);

  // ユーザー設定から初期体重を取得
  useEffect(() => {
    if (settings?.profile?.currentWeight && weight === 0) {
      setWeight(settings.profile.currentWeight);
    }
  }, [settings]);

  // 今日の体重記録と前回記録を取得
  useEffect(() => {
    loadPreviousWeight();
    loadWeightHistory();
  }, []);

  const loadTodaysWeight = async () => {
    try {
      const todayLogs = await weightLogRepository.getToday();
      if (todayLogs.length > 0) {
        const latest = todayLogs[todayLogs.length - 1];
        setTodaysWeight(latest);
        // 今日の記録がある場合は今日の記録をデフォルト値に設定
        setWeight(latest.weight);
        setMeasurementTiming(latest.measurementTiming || 'morning');
        setNote(latest.note || '');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load today\'s weight:', error);
      return false;
    }
  };

  const loadPreviousWeight = async () => {
    try {
      const hasTodayRecord = await loadTodaysWeight();
      
      if (!hasTodayRecord) {
        // プロフィールから初期体重を取得
        if (settings?.profile?.currentWeight) {
          setWeight(settings.profile.currentWeight);
        } else {
          // 前回の記録を使用
          const recentLogs = await weightLogRepository.getRecent(1);
          if (recentLogs.length > 0) {
            const lastRecord = recentLogs[0];
            setWeight(lastRecord.weight);
            setMeasurementTiming(lastRecord.measurementTiming || 'morning');
            setNote(lastRecord.note || '');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load previous weight:', error);
    }
  };

  const loadWeightHistory = async () => {
    try {
      setIsLoading(true);
      const logs = await weightLogRepository.getRecent(30); // 最新30件
      setWeightLogs(logs);
    } catch (error) {
      console.error('Failed to load weight history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (weight <= 0) {
      alert('正しい体重を入力してください');
      return;
    }

    try {
      setIsSaving(true);
      
      const newLog = await weightLogRepository.save({
        weight,
        measurementTiming,
        note: note.trim()
      });

      // 今日の記録を更新
      setTodaysWeight(newLog);
      
      // 履歴を再読み込み
      await loadWeightHistory();
      
      // プロフィールの現在体重も更新
      if (settings) {
        const { userSettingsRepository } = await import('@/lib/db/repositories');
        
        // 目標達成チェック
        let updatedProfile = {
          ...settings.profile,
          currentWeight: weight,
        };
        
        // 目標体重が設定されている場合、達成をチェック
        if (settings.profile?.targetWeight) {
          const targetWeight = settings.profile.targetWeight;
          const goalType = settings.profile.goalType;
          
          // 減量目標の場合
          if (goalType === 'weight_loss' && weight <= targetWeight) {
            updatedProfile = {
              ...updatedProfile,
              goalType: 'health', // 健康維持モードに切り替え
              targetWeight: undefined, // 目標体重をクリア
              goalPeriod: 'no_limit',
            };
            
            // 達成通知を表示
            setTimeout(() => {
              alert('🎉 おめでとうございます！\n\n目標体重を達成しました！\n健康維持モードに切り替わりました。');
            }, 500);
          }
          // 増量目標の場合
          else if (goalType === 'weight_gain' && weight >= targetWeight) {
            updatedProfile = {
              ...updatedProfile,
              goalType: 'health', // 健康維持モードに切り替え
              targetWeight: undefined, // 目標体重をクリア
              goalPeriod: 'no_limit',
            };
            
            // 達成通知を表示
            setTimeout(() => {
              alert('🎉 おめでとうございます！\n\n目標体重を達成しました！\n健康維持モードに切り替わりました。');
            }, 500);
          }
          // 筋肉増強や体型改善の場合も目標体重に到達したら通知
          else if ((goalType === 'muscle_gain' || goalType === 'body_recomposition') && 
                   targetWeight && Math.abs(weight - targetWeight) < 0.5) {
            updatedProfile = {
              ...updatedProfile,
              goalType: 'health', // 健康維持モードに切り替え
              targetWeight: undefined, // 目標体重をクリア
              goalPeriod: 'no_limit',
            };
            
            // 達成通知を表示
            setTimeout(() => {
              alert('🎉 おめでとうございます！\n\n目標を達成しました！\n健康維持モードに切り替わりました。');
            }, 500);
          }
        }
        
        await userSettingsRepository.update(settings.id, {
          profile: updatedProfile,
        });
      }
      
      // 成功メッセージ
      const actionText = todaysWeight ? '✅ 体重を更新しました' : '✅ 体重を記録しました';
      
      // 一時的にメモ欄に成功メッセージを表示
      setNote('');
      const originalNote = note;
      setTimeout(() => {
        setNote('');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save weight:', error);
      alert('体重の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = await weightLogRepository.getExportData();
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `weight-log-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('CSVエクスポートに失敗しました');
    }
  };

  // 目標との差分を計算
  const calculateProgress = () => {
    if (!settings?.profile?.targetWeight || !weight || weight === 0) {
      return null;
    }
    
    const targetWeight = settings.profile.targetWeight;
    const currentWeight = weight;
    const initialWeight = settings.profile.currentWeight || currentWeight;
    
    const totalToLose = initialWeight - targetWeight;
    const actualLost = initialWeight - currentWeight;
    
    if (targetWeight < initialWeight) {
      // 減量目標
      return {
        difference: currentWeight - targetWeight,
        percentage: Math.min(100, Math.max(0, (actualLost / totalToLose) * 100)),
        isLoss: true,
        reached: currentWeight <= targetWeight
      };
    } else {
      // 増量目標
      const totalToGain = targetWeight - initialWeight;
      const actualGained = currentWeight - initialWeight;
      return {
        difference: targetWeight - currentWeight,
        percentage: Math.min(100, Math.max(0, (actualGained / totalToGain) * 100)),
        isLoss: false,
        reached: currentWeight >= targetWeight
      };
    }
  };

  const progress = calculateProgress();

  return (
    <MainLayout>
      <div className="min-h-screen pb-24">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              ←
            </button>
            <h1 className="text-xl font-bold">体重管理</h1>
          </div>
          
          {/* 目標進捗 */}
          {progress && settings?.profile?.targetWeight && (
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">目標まで</span>
                <span className="text-lg font-bold">
                  {progress.reached ? '🎉 達成！' : `あと ${progress.difference.toFixed(1)}kg`}
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs opacity-90">
                  現在: {weight}kg
                </span>
                <span className="text-xs opacity-90">
                  目標: {settings.profile.targetWeight}kg
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* 入力フォーム */}
          <Card>
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  今日の体重
                </h2>
                {todaysWeight && (
                  <p className="text-sm text-blue-600 mt-1">
                    本日 {todaysWeight.weight}kg を記録済み（更新可能）
                  </p>
                )}
              </div>

              <WeightInput
                value={weight}
                onChange={setWeight}
                measurementTiming={measurementTiming}
                onTimingChange={setMeasurementTiming}
                note={note}
                onNoteChange={setNote}
                isLoading={isSaving}
                onSave={handleSave}
                hasRecordToday={!!todaysWeight}
              />
            </div>
          </Card>

          {/* 履歴グラフと一覧 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                記録履歴
              </h2>
              <button
                onClick={handleExportCSV}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>📊</span>
                <span>CSV出力</span>
              </button>
            </div>
            
            <WeightHistory 
              weightLogs={weightLogs}
              isLoading={isLoading}
              onExportCSV={handleExportCSV}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}