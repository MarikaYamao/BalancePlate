'use client';

import { useState, useEffect } from 'react';
import { initializeEncryptedDatabase } from '@/lib/db/encryptedDatabase';
import { EncryptedDailyStateRepository } from '@/lib/db/repositories/encryptedDailyStateRepository';
import { getTodayKey } from '@/lib/utils/dateUtils';
import type { DailyState } from '@/types';

export default function TestConditionPage() {
  const [todayKey, setTodayKey] = useState<string>('');
  const [savedData, setSavedData] = useState<DailyState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const resetTime = '04:00';

  useEffect(() => {
    testDataPersistence();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDataPersistence = async () => {
    try {
      // 1. 初期化
      addLog('データベース初期化中...');
      await initializeEncryptedDatabase();
      addLog('✅ データベース初期化完了');

      // 2. 今日のキーを取得
      const key = getTodayKey(resetTime);
      setTodayKey(key);
      addLog(`今日のキー: ${key}`);

      // 3. リポジトリを作成
      const repository = new EncryptedDailyStateRepository();
      
      // 4. 既存データを取得
      addLog('既存データを取得中...');
      const existing = await repository.getToday(resetTime);
      
      if (existing) {
        setSavedData(existing);
        addLog('✅ 既存データが見つかりました');
        addLog(`  - タグ: ${existing.conditionTags.join(', ')}`);
        addLog(`  - メモ: ${existing.freeMemo}`);
        addLog(`  - 作成日時: ${existing.createdAt}`);
        addLog(`  - 更新日時: ${existing.updatedAt}`);
      } else {
        addLog('⚠️ 保存済みデータが見つかりません');
      }
    } catch (error) {
      addLog(`❌ エラー: ${error}`);
      console.error(error);
    }
  };

  const testSaveData = async () => {
    try {
      addLog('テストデータを保存中...');
      const repository = new EncryptedDailyStateRepository();
      
      const testData = {
        conditionTags: ['tired', 'stressed'] as any,
        freeMemo: 'テスト保存: ' + new Date().toLocaleTimeString(),
        dateKey: todayKey
      };
      
      const saved = await repository.upsert(testData, resetTime);
      
      addLog('✅ データ保存成功');
      addLog(`  - 保存したキー: ${saved.dateKey}`);
      addLog(`  - タグ: ${saved.conditionTags.join(', ')}`);
      addLog(`  - メモ: ${saved.freeMemo}`);
      
      // 再読み込み
      addLog('保存後、再度データを読み込み...');
      const reloaded = await repository.getToday(resetTime);
      
      if (reloaded) {
        setSavedData(reloaded);
        addLog('✅ 再読み込み成功');
        addLog(`  - タグ: ${reloaded.conditionTags.join(', ')}`);
        addLog(`  - メモ: ${reloaded.freeMemo}`);
      } else {
        addLog('❌ 再読み込み失敗');
      }
    } catch (error) {
      addLog(`❌ 保存エラー: ${error}`);
      console.error(error);
    }
  };

  const checkIndexedDB = async () => {
    try {
      addLog('IndexedDB直接確認中...');
      
      // Dexie以外の方法でIndexedDBを確認
      const request = indexedDB.open('DietDatabase');
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        addLog(`✅ データベース接続成功: ${db.name} v${db.version}`);
        addLog(`  テーブル: ${Array.from(db.objectStoreNames).join(', ')}`);
        
        // dailyStatesテーブルの内容を確認
        const transaction = db.transaction(['dailyStates'], 'readonly');
        const store = transaction.objectStore('dailyStates');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const records = getAllRequest.result;
          addLog(`  dailyStatesレコード数: ${records.length}`);
          records.forEach((record: any, index: number) => {
            addLog(`  レコード${index + 1}:`);
            addLog(`    - dateKey: ${record.dateKey}`);
            addLog(`    - conditionTags: ${record.conditionTags?.join(', ') || 'なし'}`);
            addLog(`    - freeMemo: ${record.freeMemo || record.freeMemoEnc ? '(暗号化済み)' : 'なし'}`);
          });
        };
        
        db.close();
      };
      
      request.onerror = () => {
        addLog('❌ データベース接続失敗');
      };
    } catch (error) {
      addLog(`❌ IndexedDBエラー: ${error}`);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">コンディション保存テスト</h1>
        
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-semibold mb-2">情報</h2>
          <div className="text-sm space-y-1">
            <p>今日のキー: <span className="font-mono">{todayKey}</span></p>
            <p>リセット時間: <span className="font-mono">{resetTime}</span></p>
            <p>現在時刻: <span className="font-mono">{new Date().toLocaleString()}</span></p>
          </div>
        </div>

        {savedData && (
          <div className="bg-green-50 rounded-lg shadow p-4 mb-4">
            <h2 className="font-semibold mb-2">保存済みデータ</h2>
            <div className="text-sm space-y-1">
              <p>タグ: {savedData.conditionTags.join(', ') || 'なし'}</p>
              <p>メモ: {savedData.freeMemo || 'なし'}</p>
              <p>作成: {new Date(savedData.createdAt).toLocaleString()}</p>
              <p>更新: {new Date(savedData.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <button
            onClick={testDataPersistence}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            データを再読み込み
          </button>
          <button
            onClick={testSaveData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
          >
            テストデータを保存
          </button>
          <button
            onClick={checkIndexedDB}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            IndexedDBを直接確認
          </button>
        </div>

        <div className="bg-gray-900 text-green-400 rounded-lg p-4">
          <h2 className="font-semibold mb-2">ログ</h2>
          <div className="font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}