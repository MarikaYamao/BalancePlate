'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { db } from '@/lib/db';

export default function ResetDataPage() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);

  const handleResetAll = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      // IndexedDBを完全に削除
      await db.delete();
      
      // LocalStorageもクリア（念のため）
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      setDeleteComplete(true);
      
      // 2秒後にオンボーディング画面へリダイレクト
      setTimeout(() => {
        router.push('/onboarding');
      }, 2000);
    } catch (error) {
      console.error('Failed to reset data:', error);
      alert('データのリセットに失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    router.back();
  };

  if (deleteComplete) {
    return (
      <div className="min-h-screen bg-sand-300 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-teal-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            リセット完了
          </h2>
          <p className="text-gray-600">
            すべてのデータが削除されました。<br />
            初期設定画面へ移動します...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-300 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-coral-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            データのリセット
          </h1>
          <p className="text-gray-600">
            すべての設定とデータを削除します
          </p>
        </div>

        {!showConfirm ? (
          <>
            <div className="bg-coral-50 border border-coral-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-coral-700 mb-2">
                削除されるデータ：
              </h3>
              <ul className="text-sm text-coral-600 space-y-1">
                <li>• 基本設定（リセット時間、食事回数）</li>
                <li>• 体質・生活習慣の設定</li>
                <li>• 食材の好み設定</li>
                <li>• すべての食事記録</li>
                <li>• 体重記録</li>
                <li>• コンディション記録</li>
                <li>• AI提案履歴</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResetAll}
                variant="danger"
                fullWidth
                className="flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                すべてのデータを削除
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                fullWidth
              >
                キャンセル
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-coral-100 border-2 border-coral-300 rounded-lg p-4 mb-6">
              <p className="text-coral-700 font-semibold text-center">
                ⚠️ 本当にすべてのデータを削除しますか？
              </p>
              <p className="text-coral-600 text-sm text-center mt-2">
                この操作は取り消すことができません
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResetAll}
                variant="danger"
                fullWidth
                disabled={isDeleting}
                className="flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    削除中...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    はい、削除します
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowConfirm(false)}
                variant="outline"
                fullWidth
                disabled={isDeleting}
              >
                いいえ、キャンセル
              </Button>
            </div>
          </>
        )}

        <p className="text-xs text-gray-500 text-center mt-6">
          データ削除後は、初期設定画面から再スタートできます
        </p>
      </Card>
    </div>
  );
}