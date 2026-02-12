'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useBackup, useBackupInfo } from '@/lib/hooks/useBackup';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function BackupManager() {
  const [exportPassword, setExportPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showExportForm, setShowExportForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    exportData,
    importData,
    createAutoBackup,
    isExporting,
    isImporting,
    isProcessing,
    progress,
  } = useBackup();

  const { lastBackup, backupCount, loadBackupInfo } = useBackupInfo();

  useEffect(() => {
    loadBackupInfo();
  }, []);

  const handleExport = () => {
    if (!exportPassword) {
      alert('パスワードを入力してください');
      return;
    }

    if (exportPassword.length < 8) {
      alert('パスワードは8文字以上で設定してください');
      return;
    }

    exportData(exportPassword);
    setExportPassword('');
    setShowExportForm(false);
  };

  const handleImport = () => {
    if (!selectedFile) {
      alert('ファイルを選択してください');
      return;
    }

    if (!importPassword) {
      alert('パスワードを入力してください');
      return;
    }

    importData({ file: selectedFile, password: importPassword });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        alert('JSONファイルを選択してください');
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* バックアップ情報 */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">バックアップ情報</h3>
            <p className="text-sm text-blue-700 mt-1">
              {lastBackup ? (
                <>最終バックアップ: {lastBackup} ({backupCount}件)</>
              ) : (
                'バックアップはまだ作成されていません'
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* エクスポート */}
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-3">データのエクスポート</h3>
        
        {!showExportForm ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              すべてのデータを暗号化してバックアップファイルとして保存します。
            </p>
            <Button
              onClick={() => setShowExportForm(true)}
              disabled={isProcessing}
              className="w-full"
            >
              エクスポートを開始
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                バックアップパスワード
              </label>
              <input
                type="password"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
                placeholder="8文字以上のパスワード"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isExporting}
              />
              <p className="text-xs text-gray-500 mt-1">
                このパスワードは復元時に必要です。忘れないように保管してください。
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleExport}
                disabled={isExporting || !exportPassword}
                className="flex-1"
              >
                {isExporting ? <LoadingSpinner size="small" /> : 'ダウンロード'}
              </Button>
              <Button
                onClick={() => {
                  setShowExportForm(false);
                  setExportPassword('');
                }}
                variant="outline"
                disabled={isExporting}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* インポート */}
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-3">データのインポート</h3>
        
        {!showImportForm ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              バックアップファイルからデータを復元します。
              <span className="text-red-600 font-medium">現在のデータは上書きされます。</span>
            </p>
            <Button
              onClick={() => setShowImportForm(true)}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
            >
              インポートを開始
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ファイル選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                バックアップファイル
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isImporting}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isImporting}
              >
                {selectedFile ? (
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                ) : (
                  <span className="text-sm text-gray-500">クリックしてファイルを選択</span>
                )}
              </button>
            </div>

            {/* パスワード入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                バックアップパスワード
              </label>
              <input
                type="password"
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
                placeholder="エクスポート時のパスワード"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isImporting}
              />
            </div>

            {/* 警告メッセージ */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ インポートすると現在のすべてのデータが削除され、バックアップファイルの内容で置き換えられます。
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleImport}
                disabled={isImporting || !selectedFile || !importPassword}
                variant="danger"
                className="flex-1"
              >
                {isImporting ? <LoadingSpinner size="small" /> : 'インポート実行'}
              </Button>
              <Button
                onClick={() => {
                  setShowImportForm(false);
                  setImportPassword('');
                  setSelectedFile(null);
                }}
                variant="outline"
                disabled={isImporting}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 進行状況 */}
      {progress && (
        <div className="fixed bottom-4 left-4 right-4 bg-white shadow-lg rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <LoadingSpinner size="small" />
            <span className="text-sm text-gray-700">{progress}</span>
          </div>
        </div>
      )}

      {/* 自動バックアップ */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">自動バックアップ</h4>
            <p className="text-sm text-gray-600 mt-1">
              ローカルストレージに自動的にバックアップを作成します
            </p>
          </div>
          <Button
            onClick={() => createAutoBackup()}
            size="small"
            variant="outline"
          >
            今すぐバックアップ
          </Button>
        </div>
      </Card>
    </div>
  );
}