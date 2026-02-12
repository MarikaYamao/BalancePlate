import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { BackupService } from '@/lib/backup/backupService';
import { useAppStore } from '@/lib/stores/useAppStore';

const backupService = new BackupService();

export function useBackup() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const setLastError = useAppStore((state) => state.setLastError);

  // エクスポート処理
  const exportMutation = useMutation({
    mutationFn: async (password: string) => {
      setProgress('データを準備中...');
      await backupService.downloadBackup(password);
      setProgress('');
    },
    onError: (error) => {
      setLastError(error instanceof Error ? error.message : 'エクスポートに失敗しました');
      setProgress('');
    },
    onSuccess: () => {
      setProgress('');
    },
  });

  // インポート処理
  const importMutation = useMutation({
    mutationFn: async ({ file, password }: { file: File; password: string }) => {
      setProgress('ファイルを読み込み中...');
      await backupService.importFromFile(file, password);
      setProgress('データを復元中...');
      
      // インポート成功後、ページをリロードして新しいデータを反映
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      setLastError(error instanceof Error ? error.message : 'インポートに失敗しました');
      setProgress('');
    },
    onSuccess: () => {
      setProgress('インポート完了！ページを再読み込みします...');
    },
  });

  // 自動バックアップ
  const autoBackupMutation = useMutation({
    mutationFn: async () => {
      await backupService.createAutoBackup();
    },
    onError: (error) => {
      console.error('Auto backup failed:', error);
    },
  });

  return {
    exportData: exportMutation.mutate,
    importData: importMutation.mutate,
    createAutoBackup: autoBackupMutation.mutate,
    isExporting: exportMutation.isPending,
    isImporting: importMutation.isPending,
    isProcessing: exportMutation.isPending || importMutation.isPending,
    progress,
    error: exportMutation.error || importMutation.error,
  };
}

// バックアップ情報を取得するフック
export function useBackupInfo() {
  const [backupInfo, setBackupInfo] = useState<{
    lastBackup: string | null;
    backupCount: number;
  }>({
    lastBackup: null,
    backupCount: 0,
  });

  // 自動バックアップ情報を取得
  const loadBackupInfo = () => {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('auto-backup-'))
      .sort()
      .reverse();

    if (backupKeys.length > 0) {
      const lastBackupKey = backupKeys[0];
      const timestamp = parseInt(lastBackupKey.replace('auto-backup-', ''));
      setBackupInfo({
        lastBackup: new Date(timestamp).toLocaleString('ja-JP'),
        backupCount: backupKeys.length,
      });
    }
  };

  return {
    ...backupInfo,
    loadBackupInfo,
  };
}