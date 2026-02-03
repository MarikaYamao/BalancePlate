# やさしいダイエット

体質と習慣に寄り添うパーソナル ダイエット支援アプリ

## 🚀 Phase 1 実装完了

✅ Next.js + TypeScript + PWA基盤構築完了

### 実装内容
- Next.js 16 with App Router
- TypeScript with strict settings
- Tailwind CSS with custom theme
- PWA configuration (manifest.json, next-pwa)
- Project structure setup
- Type definitions
- Basic landing page with Japanese UI

### 技術スタック
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS v3 
- **PWA**: next-pwa
- **Font**: Noto Sans JP

## 🏗️ プロジェクト構造

```
diet-app/
├── app/                    # Next.js App Router
├── components/             # 共通コンポーネント
│   ├── ui/                # UIコンポーネント
│   ├── features/          # 機能別コンポーネント
│   └── layouts/           # レイアウトコンポーネント
├── lib/                   # ライブラリ・ユーティリティ
│   ├── db/               # データベース関連
│   ├── ai/               # AI関連
│   ├── crypto/           # 暗号化
│   ├── hooks/            # カスタムフック
│   ├── utils/            # ユーティリティ
│   └── stores/           # 状態管理
├── types/                # 型定義
└── public/               # 静的ファイル
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint
```

## 📱 PWA対応

- マニフェスト設定済み
- Service Worker対応（本番環境のみ）
- オフライン対応準備完了

## 🎨 デザインシステム

### カラーパレット
- **Primary**: エメラルドグリーン (#10b981)
- **Soft**: グレー系統 (#f3f4f6 - #4b5563)

### フォント
- Noto Sans JP (400, 500, 600, 700)

## 🚀 Phase 2 実装完了

✅ IndexedDB + Dexie.js データ層実装完了

### Phase 2 実装内容
- Dexie.js インストールと設定
- データベーススキーマ定義
- Repository パターンによるデータアクセス層
- 日付ユーティリティ（dateKey生成）
- 基本的なCRUD操作
- データベーステスト機能

### データベース構成
- **UserSettings**: ユーザー設定（体質・習慣）
- **DailyState**: 日次状態記録
- **MealLog**: 食事記録
- **WeightLog**: 体重記録
- **FoodPlan**: AI提案プラン
- **DietGoals**: 目標設定

## 🔄 次のフェーズ

Phase 3: 暗号化実装 (Web Crypto API)

## 📝 開発状況

- 開発サーバー: http://localhost:3000
- データベーステスト: http://localhost:3000/test
- PWAインストールテスト可能
- TypeScript strict mode有効
- レスポンシブ対応済み

---

**Phase 1 完了日**: 2026-01-28  
**Phase 2 完了日**: 2026-01-28
