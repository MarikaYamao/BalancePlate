'use client';

import { useState } from 'react';
import { runDatabaseTests } from '@/lib/db/testDatabase';
import type { TestResult } from '@/lib/db/testDatabase';

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<{ total: number; passed: number; failed: number; passRate: number } | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      const testResults = await runDatabaseTests();
      setResults(testResults);
      
      // サマリー計算
      const total = testResults.length;
      const passed = testResults.filter(r => r.success).length;
      const failed = total - passed;
      const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
      
      setSummary({ total, passed, failed, passRate });
    } catch (error) {
      console.error('Test execution failed:', error);
      setResults([{
        success: false,
        message: 'Test execution failed',
        error: error instanceof Error ? error.message : String(error)
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              データベーステスト
            </h1>
            <p className="text-gray-600">
              Phase 2: IndexedDB + Dexie.js の動作確認
            </p>
          </div>

          {/* Test Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-soft-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  isRunning
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {isRunning ? '🧪 テスト実行中...' : '🧪 テストを実行'}
              </button>
              
              {summary && (
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">
                    ✅ {summary.passed}件成功
                  </span>
                  <span className="text-red-600 font-medium">
                    ❌ {summary.failed}件失敗
                  </span>
                  <span className="text-gray-600 font-medium">
                    ({summary.passRate}% 成功率)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-soft-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                テスト結果
              </h2>
              
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {result.success ? '✅' : '❌'}
                      </span>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          result.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {result.message}
                        </h3>
                        
                        {result.data && (
                          <div className="mt-2">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                データを表示
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                        
                        {result.error && (
                          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded">
                            <p className="text-red-800 text-sm font-medium">
                              エラー: {result.error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Development Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>このページはPhase 2の開発・テスト用です</p>
            <p>本番環境では表示されません</p>
          </div>
        </div>
      </div>
    </div>
  );
}