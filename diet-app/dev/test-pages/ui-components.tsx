'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { FadeIn, SlideIn, Stagger } from '@/components/ui/PageTransition';
import { AccessibleButton } from '@/components/ui/AccessibleButton';
import { AccessibleInput, AccessibleSelect, AccessibleTextarea } from '@/components/ui/AccessibleForm';

export default function TestUIPage() {
  const [showError, setShowError] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    meal: 'breakfast',
    notes: '',
  });

  const handleButtonClick = () => {
    setLoadingButton(true);
    setTimeout(() => setLoadingButton(false), 2000);
  };

  const staggerItems = [
    { id: 1, title: 'アイテム 1', content: 'スタガーアニメーションのテスト' },
    { id: 2, title: 'アイテム 2', content: '順番に表示されます' },
    { id: 3, title: 'アイテム 3', content: '遅延付きでフェードイン' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen p-4 pb-24">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">UI/UXテスト</h1>

        {/* アニメーションテスト */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">アニメーション</h2>
          
          <div className="space-y-4">
            <FadeIn>
              <Card className="p-4">
                <h3 className="font-medium mb-2">フェードイン</h3>
                <p className="text-sm text-gray-600">このカードはフェードインで表示されます</p>
              </Card>
            </FadeIn>

            <SlideIn from="left" delay={200}>
              <Card className="p-4">
                <h3 className="font-medium mb-2">左からスライドイン</h3>
                <p className="text-sm text-gray-600">左側から滑らかに入ってきます</p>
              </Card>
            </SlideIn>

            <SlideIn from="right" delay={400}>
              <Card className="p-4">
                <h3 className="font-medium mb-2">右からスライドイン</h3>
                <p className="text-sm text-gray-600">右側から滑らかに入ってきます</p>
              </Card>
            </SlideIn>

            <div>
              <h3 className="font-medium mb-2">スタガーアニメーション</h3>
              <Stagger delay={150}>
                {staggerItems.map(item => (
                  <Card key={item.id} className="p-3 mb-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.content}</p>
                  </Card>
                ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* スケルトンローダー */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">スケルトンローダー</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600 mb-2">テキスト</p>
              <SkeletonLoader lines={3} />
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">カード</p>
              <SkeletonLoader type="card" />
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">食事記録</p>
              <SkeletonLoader type="meal" />
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">体重記録</p>
              <SkeletonLoader type="weight" />
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-2">チャート</p>
              <SkeletonLoader type="chart" />
            </div>
          </div>
        </section>

        {/* エラーメッセージ */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">エラーメッセージ</h2>
          
          <div className="space-y-4">
            <ErrorMessage
              type="error"
              title="エラー"
              message="データの保存に失敗しました"
              onRetry={() => console.log('Retry')}
              onDismiss={() => console.log('Dismiss')}
            />

            <ErrorMessage
              type="warning"
              title="警告"
              message="インターネット接続が不安定です"
              details="詳細なエラー情報がここに表示されます"
            />

            <ErrorMessage
              type="info"
              message="新しい機能が追加されました"
              onDismiss={() => console.log('Dismiss')}
            />
          </div>

          <Button
            onClick={() => setShowError(!showError)}
            variant="outline"
            className="mt-4"
          >
            エラーを{showError ? '非表示' : '表示'}
          </Button>

          {showError && (
            <div className="mt-4">
              <ErrorMessage
                type="error"
                message="テストエラーメッセージ"
                onDismiss={() => setShowError(false)}
              />
            </div>
          )}
        </section>

        {/* アクセシブルボタン */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">アクセシブルボタン</h2>
          
          <div className="flex flex-wrap gap-2">
            <AccessibleButton
              variant="primary"
              onClick={handleButtonClick}
              loading={loadingButton}
              ariaLabel="プライマリボタン"
            >
              プライマリ
            </AccessibleButton>

            <AccessibleButton variant="secondary">
              セカンダリ
            </AccessibleButton>

            <AccessibleButton variant="outline">
              アウトライン
            </AccessibleButton>

            <AccessibleButton variant="ghost">
              ゴースト
            </AccessibleButton>

            <AccessibleButton variant="danger">
              デンジャー
            </AccessibleButton>

            <AccessibleButton disabled>
              無効
            </AccessibleButton>
          </div>
        </section>

        {/* アクセシブルフォーム */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">アクセシブルフォーム</h2>
          
          <Card className="p-4">
            <form className="space-y-4">
              <AccessibleInput
                label="名前"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                helperText="フルネームを入力してください"
                placeholder="山田 太郎"
              />

              <AccessibleSelect
                label="食事タイプ"
                value={formData.meal}
                onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                options={[
                  { value: 'breakfast', label: '朝食' },
                  { value: 'lunch', label: '昼食' },
                  { value: 'dinner', label: '夕食' },
                ]}
                helperText="該当する食事タイプを選択"
              />

              <AccessibleTextarea
                label="メモ"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="自由にメモを入力..."
                helperText="最大500文字まで"
              />

              <AccessibleInput
                label="エラーありの入力"
                value=""
                onChange={() => {}}
                error="このフィールドは必須です"
                required
              />
            </form>
          </Card>
        </section>

        {/* ローディング状態 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">ローディング状態</h2>
          
          <div className="flex items-center gap-8">
            <div className="text-center">
              <LoadingSpinner size="small" />
              <p className="text-xs mt-2">Small</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="medium" />
              <p className="text-xs mt-2">Medium</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="text-xs mt-2">Large</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="medium" message="読み込み中..." />
              <p className="text-xs mt-2">With Message</p>
            </div>
          </div>
        </section>

        {/* アクセシビリティ情報 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">アクセシビリティ機能</h2>
          
          <Card className="p-4">
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ キーボードナビゲーション対応</li>
              <li>✅ スクリーンリーダー対応（ARIA属性）</li>
              <li>✅ フォーカス管理</li>
              <li>✅ スキップリンク（タブキーで確認）</li>
              <li>✅ 適切なコントラスト比</li>
              <li>✅ Reduced Motion対応</li>
              <li>✅ エラーメッセージの読み上げ</li>
              <li>✅ ローディング状態の通知</li>
            </ul>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
}