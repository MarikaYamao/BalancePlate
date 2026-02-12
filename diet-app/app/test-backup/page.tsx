'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BackupService } from '@/lib/backup/backupService';
import { MealLogRepository } from '@/lib/db/repositories/mealLogRepository';
import { UserSettingsRepository } from '@/lib/db/repositories/userSettingsRepository';

export default function TestBackupPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  const runBackupTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const backupService = new BackupService();
      const mealLogRepo = new MealLogRepository();
      const userSettingsRepo = new UserSettingsRepository();

      // テスト1: サンプルデータの作成
      addResult('✅ テスト開始: サンプルデータの作成');
      
      // ユーザー設定を保存
      await userSettingsRepo.save({
        dayResetTime: '04:00',
        mealsPerDay: 3,
        bodyConstitution: ['cold_sensitivity'],
        lifestyle: ['desk_work'],
        additionalNotes: 'バックアップテスト用データ',
        onboardingCompleted: true,
      });
      addResult('  - ユーザー設定を作成');

      // 食事記録を保存
      await mealLogRepo.save({
        mealType: 'breakfast',
        text: 'バックアップテスト: トースト、コーヒー',
      });
      await mealLogRepo.save({
        mealType: 'lunch',
        text: 'バックアップテスト: サラダ、サンドイッチ',
      });
      addResult('  - 食事記録を2件作成');

      // テスト2: エクスポート
      addResult('✅ テスト開始: データのエクスポート');
      const password = 'test-password-123';
      const exportedData = await backupService.exportData(password);
      
      if (exportedData) {
        const parsed = JSON.parse(exportedData);
        addResult(`  - バックアップファイル生成: v${parsed.version}`);
        addResult(`  - 作成日時: ${new Date(parsed.createdAt).toLocaleString('ja-JP')}`);
        addResult(`  - チェックサム: ${parsed.checksum.substring(0, 10)}...`);
      }

      // テスト3: データクリア
      addResult('✅ テスト開始: データのクリア');
      await mealLogRepo.clearAll();
      await userSettingsRepo.clearAll();
      addResult('  - 全データをクリア完了');

      // データが削除されたことを確認
      const clearedMeals = await mealLogRepo.getAll();
      const clearedSettings = await userSettingsRepo.get();
      if (clearedMeals.length === 0 && !clearedSettings) {
        addResult('  - データ削除を確認');
      }

      // テスト4: インポート
      addResult('✅ テスト開始: データのインポート');
      await backupService.importData(exportedData, password);
      addResult('  - データ復元完了');

      // データが復元されたことを確認
      const restoredMeals = await mealLogRepo.getAll();
      const restoredSettings = await userSettingsRepo.get();
      
      if (restoredMeals.length === 2) {
        addResult(`  - 食事記録: ${restoredMeals.length}件復元`);
      }
      if (restoredSettings) {
        addResult('  - ユーザー設定: 復元成功');
      }

      // テスト5: 不正なパスワードでのインポート試行
      addResult('✅ テスト開始: セキュリティテスト');
      try {
        await backupService.importData(exportedData, 'wrong-password');
        addResult('  ❌ エラー: 不正なパスワードで復元できてしまった');
      } catch (error) {
        addResult('  - 不正なパスワードを正しく拒否');
      }

      // テスト6: 自動バックアップ
      addResult('✅ テスト開始: 自動バックアップ');
      await backupService.createAutoBackup();
      
      const autoBackupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('auto-backup-'));
      addResult(`  - 自動バックアップ作成: ${autoBackupKeys.length}件`);

      addResult('');
      addResult('🎉 全テスト完了！');
      
    } catch (error) {
      addResult(`❌ エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen p-4 pb-24">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          バックアップ機能テスト
        </h1>

        <Card className="p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">テスト内容</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• サンプルデータの作成</li>
            <li>• 暗号化エクスポート</li>
            <li>• データクリア</li>
            <li>• 暗号化インポート</li>
            <li>• パスワード検証</li>
            <li>• 自動バックアップ</li>
          </ul>
        </Card>

        <Button
          onClick={runBackupTests}
          disabled={isRunning}
          className="w-full mb-4"
        >
          {isRunning ? 'テスト実行中...' : 'バックアップテストを実行'}
        </Button>

        {testResults.length > 0 && (
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3">テスト結果</h2>
            <div className="bg-gray-50 rounded p-3">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {testResults.join('\n')}
              </pre>
            </div>
          </Card>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ このテストは実際のデータを変更します。本番環境では使用しないでください。
          </p>
        </div>
      </div>
    </MainLayout>
  );
}