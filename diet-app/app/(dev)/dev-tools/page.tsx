'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 開発環境チェック
const isDevelopment = process.env.NODE_ENV === 'development';

interface TestPage {
  name: string;
  path: string;
  description: string;
  icon: string;
}

const testPages: TestPage[] = [
  {
    name: 'データベーステスト',
    path: '/dev/database',
    description: 'IndexedDB + Dexie.js の動作確認',
    icon: '🗄️'
  },
  {
    name: 'AI機能テスト',
    path: '/dev/ai',
    description: 'OpenAI API統合のテスト',
    icon: '🤖'
  },
  {
    name: 'バックアップテスト',
    path: '/dev/backup',
    description: 'データのエクスポート/インポート機能',
    icon: '💾'
  },
  {
    name: 'コンディションテスト',
    path: '/dev/condition',
    description: '体調記録機能のテスト',
    icon: '🌡️'
  },
  {
    name: '暗号化テスト',
    path: '/dev/encryption',
    description: 'Web Crypto APIの暗号化機能',
    icon: '🔒'
  },
  {
    name: '食事編集テスト',
    path: '/dev/meal-edit',
    description: '食事記録の編集機能',
    icon: '🍽️'
  },
  {
    name: 'UIコンポーネント',
    path: '/dev/ui',
    description: 'UI/UXコンポーネントのテスト',
    icon: '🎨'
  }
];

export default function DevToolsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 本番環境の場合はホームにリダイレクト
    if (!isDevelopment) {
      router.push('/');
    }
  }, [router]);

  if (!mounted || !isDevelopment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🛠️ 開発ツール
            </h1>
            <p className="text-gray-600">
              開発・テスト用のツールとページ
            </p>
            <div className="mt-4 inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              開発環境でのみ利用可能
            </div>
          </div>

          {/* Test Pages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {testPages.map((page) => (
              <Link
                key={page.path}
                href={page.path}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="text-4xl mb-3">{page.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {page.name}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {page.description}
                </p>
                <div className="mt-4 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                  テストを開く
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              クイックアクション
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/reset-data"
                className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors group"
              >
                <span className="text-2xl mr-3">🗑️</span>
                <div>
                  <h4 className="font-medium text-red-900">データリセット</h4>
                  <p className="text-sm text-red-700">全データを削除して初期状態に戻す</p>
                </div>
              </Link>
              <Link
                href="/"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <span className="text-2xl mr-3">🏠</span>
                <div>
                  <h4 className="font-medium text-blue-900">ホームに戻る</h4>
                  <p className="text-sm text-blue-700">メインアプリケーションへ</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">開発者向け情報</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• これらのページは開発環境でのみアクセス可能です</li>
              <li>• 本番環境では自動的にホームページにリダイレクトされます</li>
              <li>• テストデータは本番データとは別に管理されています</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}