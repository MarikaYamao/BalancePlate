export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="text-6xl">🌱</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              やさしいダイエット
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              体質と習慣に寄り添う、あなただけのダイエット支援アプリ
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-soft-200">
              <div className="text-3xl mb-3">💝</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                やさしい提案
              </h3>
              <p className="text-sm text-gray-600">
                完璧を求めず、今日の状態に合わせた現実的な食事プランを提案します
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-soft-200">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                個人に最適化
              </h3>
              <p className="text-sm text-gray-600">
                あなたの体質・生活習慣・当日のコンディションを考慮した提案
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-soft-200">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                プライバシー重視
              </h3>
              <p className="text-sm text-gray-600">
                すべてのデータはデバイス内で暗号化され、安全に管理されます
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <div className="flex gap-4 justify-center flex-wrap">
              <a 
                href="/home"
                className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-8 rounded-full transition-colors"
              >
                はじめる
              </a>
              <a 
                href="/test"
                className="bg-soft-200 hover:bg-soft-300 text-gray-700 font-medium py-3 px-8 rounded-full transition-colors"
              >
                🧪 Phase 2 テスト
              </a>
              <a 
                href="/test-encryption"
                className="bg-soft-200 hover:bg-soft-300 text-gray-700 font-medium py-3 px-8 rounded-full transition-colors"
              >
                🔐 Phase 3 暗号化テスト
              </a>
            </div>
            <p className="text-sm text-gray-500">
              PWAアプリとしてインストール可能です
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
