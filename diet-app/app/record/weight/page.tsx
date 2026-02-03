'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { WeightInput } from '@/components/features/weight/WeightInput';
import { WeightHistory } from '@/components/features/weight/WeightHistory';
import { weightLogRepository } from '@/lib/db/repositories';
import type { WeightLog } from '@/types';

export default function WeightRecordPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'input' | 'history'>('input');
  
  // 体重記録用の状態
  const [weight, setWeight] = useState<number>(0);
  const [measurementTiming, setMeasurementTiming] = useState<'morning' | 'night' | 'other'>('morning');
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 履歴用の状態
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [todaysWeight, setTodaysWeight] = useState<WeightLog | null>(null);

  // 今日の体重記録と前回記録を取得
  useEffect(() => {
    loadPreviousWeight(); // この中でloadTodaysWeightも呼び出される
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
        return true; // 今日の記録があることを返す
      }
      return false; // 今日の記録がないことを返す
    } catch (error) {
      console.error('Failed to load today\'s weight:', error);
      return false;
    }
  };

  const loadPreviousWeight = async () => {
    try {
      // 今日の記録をチェック
      const hasTodayRecord = await loadTodaysWeight();
      
      // 今日の記録がない場合のみ前回の記録を使用
      if (!hasTodayRecord) {
        const recentLogs = await weightLogRepository.getRecent(1);
        if (recentLogs.length > 0) {
          const lastRecord = recentLogs[0];
          // デフォルト値として設定
          setWeight(lastRecord.weight);
          setMeasurementTiming(lastRecord.measurementTiming || 'morning');
          setNote(lastRecord.note || '');
        }
      }
    } catch (error) {
      console.error('Failed to load previous weight:', error);
    }
  };

  const loadWeightHistory = async () => {
    try {
      setIsLoading(true);
      const logs = await weightLogRepository.getRecent(50); // 最新50件
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
      
      // 成功メッセージと履歴タブに切り替え
      const actionText = todaysWeight ? '体重を更新しました！' : '体重を記録しました！';
      alert(actionText);
      setActiveTab('history');
      
    } catch (error) {
      console.error('Failed to save weight:', error);
      alert('体重の保存に失敗しました。もう一度お試しください。');
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


  const tabs = [
    { key: 'input' as const, label: '記録', icon: '⚖️' },
    { key: 'history' as const, label: '履歴', icon: '📈' }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ←
              </button>
              <h1 className="text-xl font-bold text-gray-800">体重記録</h1>
            </div>
          </div>
        </div>

        {/* タブ */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-4 px-6
                  transition-all duration-200 border-b-2
                  ${activeTab === tab.key
                    ? 'border-pink-500 text-pink-600 bg-pink-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-4">
          {activeTab === 'input' ? (
            <Card>
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    体重を記録
                  </h2>
                  <p className="text-sm text-gray-600">
                    毎日同じ時間に測定することで、より正確な変化を記録できます
                  </p>
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
          ) : (
            <div>
              <WeightHistory 
                weightLogs={weightLogs}
                isLoading={isLoading}
                onExportCSV={handleExportCSV}
              />
            </div>
          )}
        </div>

        {/* 今日の記録がある場合の通知 */}
        {todaysWeight && activeTab === 'input' && (
          <div className="fixed bottom-16 left-4 right-4">
            <Card className="bg-blue-50 border-blue-200">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-blue-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-700 font-medium">
                      今日はすでに{todaysWeight.weight}kgを記録済みです
                    </p>
                    <p className="text-xs text-blue-600">
                      複数回記録することも可能です
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}