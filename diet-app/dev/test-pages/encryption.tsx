'use client';

import { useState, useEffect } from 'react';
import { encryptionService } from '@/lib/crypto/encryptionService';
import { secureStore } from '@/lib/crypto/secureStore';
import { encryptedDb, initializeEncryptedDatabase, getEncryptedDatabaseInfo } from '@/lib/db/encryptedDatabase';
import { EncryptedUserSettingsRepository } from '@/lib/db/repositories/encryptedUserSettingsRepository';
import type { UserSettings, BodyConstitutionTag, LifestyleTag } from '@/types';

/**
 * 暗号化機能のテストページ
 * Phase 3の実装確認用
 */
export default function EncryptionTestPage() {
  const [status, setStatus] = useState<string>('初期化中...');
  const [results, setResults] = useState<string[]>([]);
  const [savedSettings, setSavedSettings] = useState<UserSettings | null>(null);
  const [exportedKey, setExportedKey] = useState<string>('');
  const [dbInfo, setDbInfo] = useState<any>(null);

  useEffect(() => {
    initializeAndTest();
  }, []);

  const initializeAndTest = async () => {
    setResults([]);
    try {
      // 1. 暗号化サービスの初期化
      addResult('暗号化サービスを初期化中...');
      await encryptionService.initialize();
      addResult('✅ 暗号化サービスの初期化成功');

      // 2. セキュアストアの初期化
      addResult('セキュアストアを初期化中...');
      await secureStore.initialize();
      addResult('✅ セキュアストアの初期化成功');

      // 3. 暗号化データベースの初期化
      addResult('暗号化データベースを初期化中...');
      await initializeEncryptedDatabase();
      const info = getEncryptedDatabaseInfo();
      setDbInfo(info);
      addResult(`✅ データベースの初期化成功: ${info.name} v${info.version}`);
      addResult(`   暗号化: ${info.encryptionEnabled ? '有効' : '無効'}`);

      setStatus('初期化完了');
    } catch (error) {
      addResult(`❌ エラー: ${error}`);
      setStatus('初期化失敗');
    }
  };

  const addResult = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  const testBasicEncryption = async () => {
    try {
      const testData = '機密データ: これは暗号化されるべきテキストです。';
      addResult(`\n📝 テストデータ: "${testData}"`);

      // 暗号化
      const encrypted = await encryptionService.encrypt(testData);
      addResult(`🔐 暗号化結果: ${encrypted.substring(0, 50)}...`);

      // 復号化
      const decrypted = await encryptionService.decrypt(encrypted);
      addResult(`🔓 復号化結果: "${decrypted}"`);

      // 検証
      if (testData === decrypted) {
        addResult('✅ 暗号化・復号化テスト成功！');
      } else {
        addResult('❌ 暗号化・復号化テスト失敗');
      }
    } catch (error) {
      addResult(`❌ エラー: ${error}`);
    }
  };

  const testUserSettingsSave = async () => {
    try {
      const repository = new EncryptedUserSettingsRepository();
      
      const testSettings = {
        dayResetTime: '04:00',
        mealsPerDay: 3 as const,
        profile: {
          assignedSexAtBirth: 'female' as const,
          height: 165,
          birthYear: 1990,
          currentWeight: 60
        },
        bodyConstitution: ['cold_sensitivity', 'constipation_prone'] as BodyConstitutionTag[],
        lifestyle: ['desk_work', 'sleep_deprived'] as LifestyleTag[],
        onboardingCompleted: true
      };

      addResult('\n📝 ユーザー設定を保存中...');
      addResult(`   体質タグ: ${testSettings.bodyConstitution.join(', ')}`);
      addResult(`   ライフスタイル: ${testSettings.lifestyle.join(', ')}`);

      const saved = await repository.save(testSettings);
      setSavedSettings(saved);
      addResult('✅ ユーザー設定の保存成功');

      // 保存されたデータを読み込み
      addResult('\n🔍 保存されたデータを読み込み中...');
      const loaded = await repository.get();
      
      if (loaded) {
        addResult('✅ データの読み込み成功');
        addResult(`   体質タグ: ${loaded.bodyConstitution.join(', ')}`);
        addResult(`   ライフスタイル: ${loaded.lifestyle.join(', ')}`);
        addResult(`   プロファイル: ${JSON.stringify(loaded.profile)}`);
        
        // データが正しく復号化されているか確認
        if (
          loaded.bodyConstitution.length === testSettings.bodyConstitution.length &&
          loaded.lifestyle.length === testSettings.lifestyle.length
        ) {
          addResult('✅ データは正しく暗号化・復号化されています');
        } else {
          addResult('❌ データの暗号化・復号化に問題があります');
        }
      } else {
        addResult('❌ データの読み込み失敗');
      }

      // 生データベースを直接確認（暗号化されているはず）
      const rawData = await encryptedDb.userSettings.toArray();
      if (rawData.length > 0) {
        const raw = rawData[0] as any;
        addResult('\n🔐 データベースの生データ確認:');
        if (raw.profileEnc) {
          addResult(`   profileEnc: ${raw.profileEnc.substring(0, 30)}...`);
        }
        if (raw.bodyConstitutionEnc) {
          addResult(`   bodyConstitutionEnc: ${raw.bodyConstitutionEnc.substring(0, 30)}...`);
        }
        if (raw.lifestyleEnc) {
          addResult(`   lifestyleEnc: ${raw.lifestyleEnc.substring(0, 30)}...`);
        }
      }

    } catch (error) {
      addResult(`❌ エラー: ${error}`);
    }
  };

  const testKeyExportImport = async () => {
    try {
      addResult('\n🔑 暗号化キーをエクスポート中...');
      const key = await encryptionService.exportKey();
      setExportedKey(key);
      addResult(`✅ キーのエクスポート成功: ${key.substring(0, 30)}...`);

      // キーを削除して再インポート
      addResult('\n🗑️ 既存のキーを削除中...');
      await encryptionService.deleteKey();
      addResult('✅ キーの削除成功');

      addResult('\n📥 キーを再インポート中...');
      await encryptionService.importKey(key);
      addResult('✅ キーの再インポート成功');

      // 再インポート後にデータが読めるか確認
      const repository = new EncryptedUserSettingsRepository();
      const loaded = await repository.get();
      if (loaded) {
        addResult('✅ 再インポート後もデータの復号化に成功');
      } else {
        addResult('⚠️ データが見つかりません（まだ保存されていない可能性）');
      }
    } catch (error) {
      addResult(`❌ エラー: ${error}`);
    }
  };

  const clearAllData = async () => {
    try {
      addResult('\n🗑️ すべてのデータをクリア中...');
      await encryptedDb.userSettings.clear();
      await encryptedDb.dailyStates.clear();
      await encryptedDb.mealLogs.clear();
      setSavedSettings(null);
      setExportedKey('');
      addResult('✅ データのクリア完了');
    } catch (error) {
      addResult(`❌ エラー: ${error}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">暗号化機能テスト</h1>
        
        {/* ステータス表示 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ステータス</h2>
          <p className="text-lg">状態: <span className="font-mono">{status}</span></p>
          {dbInfo && (
            <div className="mt-4 text-sm text-gray-600">
              <p>データベース: {dbInfo.name}</p>
              <p>バージョン: {dbInfo.version}</p>
              <p>暗号化: {dbInfo.encryptionEnabled ? '有効' : '無効'}</p>
              <p>テーブル数: {dbInfo.tables?.length || 0}</p>
            </div>
          )}
        </div>

        {/* テストボタン */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">テスト実行</h2>
          <div className="space-y-3">
            <button
              onClick={testBasicEncryption}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-3"
            >
              基本的な暗号化テスト
            </button>
            <button
              onClick={testUserSettingsSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-3"
            >
              ユーザー設定の保存テスト
            </button>
            <button
              onClick={testKeyExportImport}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mr-3"
            >
              キーのエクスポート/インポート
            </button>
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              すべてクリア
            </button>
          </div>
        </div>

        {/* 保存されたデータ */}
        {savedSettings && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">保存されたユーザー設定</h2>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(savedSettings, null, 2)}
            </pre>
          </div>
        )}

        {/* エクスポートされたキー */}
        {exportedKey && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">エクスポートされた暗号化キー</h2>
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-xs font-mono break-all">{exportedKey}</p>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              ⚠️ このキーは重要です。バックアップとして安全に保管してください。
            </p>
          </div>
        )}

        {/* テスト結果 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">実行ログ</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}