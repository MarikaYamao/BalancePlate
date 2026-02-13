# やさしいダイエット

体質と習慣に寄り添うパーソナル ダイエット支援アプリ

## 📋 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [開発環境](#開発環境)
- [プロジェクト構造](#プロジェクト構造)
- [セキュリティ](#セキュリティ)
- [パフォーマンス](#パフォーマンス)
- [デプロイ](#デプロイ)

## 概要

このアプリは、ユーザーの体質や生活習慣に寄り添った、パーソナライズされたダイエットサポートを提供します。AIを活用した食事提案と、プライバシーを重視したローカルファーストのアーキテクチャが特徴です。

### 主な特徴

- 🔒 **プライバシー重視**: すべてのデータはローカルに暗号化保存
- 🤖 **AI食事提案**: OpenAI APIによるパーソナライズされた食事プラン
- 📱 **PWA対応**: オフラインでも動作可能なプログレッシブウェブアプリ
- ♿ **アクセシブル**: WCAG 2.1準拠のアクセシビリティ対応
- 🚀 **高速**: 最適化されたパフォーマンスとキャッシング戦略

## 主な機能

### コア機能
- ✅ **体質・習慣登録**: 40種類以上の体質タグと生活習慣タグ
- ✅ **コンディション記録**: 日々の体調を簡単に記録
- ✅ **食事記録**: テキストベースの簡単な食事記録
- ✅ **AI食事提案**: 朝の3つのプラン提案（A/B/C）
- ✅ **食後フィードバック**: リアルタイムの栄養アドバイス
- ✅ **体重記録**: グラフ表示と推移分析
- ✅ **データバックアップ**: 暗号化されたエクスポート/インポート

### セキュリティ機能
- ✅ **Web Crypto API**: AES-GCM暗号化による個人情報保護
- ✅ **CSPヘッダー**: コンテンツセキュリティポリシー
- ✅ **セキュアストレージ**: IndexedDBによる安全なデータ保存

## 技術スタック

### フロントエンド
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS v4
- **PWA**: next-pwa
- **Font**: Noto Sans JP

### データ層
- **Database**: IndexedDB (Dexie.js)
- **State**: Zustand + TanStack Query
- **Encryption**: Web Crypto API (AES-GCM)

### AI/API
- **AI Provider**: OpenAI API (GPT-4)
- **AI SDK**: Vercel AI SDK
- **Rate Limiting**: カスタム実装

### UI/UX
- **Charts**: Recharts
- **Animations**: CSS Transitions
- **Accessibility**: WCAG 2.1 AA準拠

## セットアップ

### 必要要件
- Node.js 18.x以上
- npm 9.x以上
- OpenAI APIキー（AI機能を使用する場合）

### インストール手順

1. リポジトリのクローン
```bash
git clone [repository-url]
cd diet-app
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
```bash
cp .env.example .env.local
# .env.localを編集してAPIキーを設定
```

4. 開発サーバーの起動
```bash
npm run dev
```

5. ブラウザで確認
```
http://localhost:3000
```

## 開発環境

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint

# 型チェック
npx tsc --noEmit
```

### 環境変数

必要な環境変数は`.env.example`を参照してください。

主要な環境変数：
- `OPENAI_API_KEY`: OpenAI APIキー（必須）
- `NEXT_PUBLIC_APP_URL`: アプリケーションURL
- `ENCRYPTION_ENABLED`: 暗号化の有効/無効

## プロジェクト構造

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

## セキュリティ

### 実装済みのセキュリティ機能

#### 1. データ暗号化
- AES-GCM 256bitによる暗号化
- Web Crypto APIを使用
- 個人情報（体質・習慣）は全て暗号化

#### 2. セキュリティヘッダー
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- Referrer-Policy

#### 3. エラートラッキング
- グローバルエラーハンドリング
- エラーバウンダリーの実装
- ローカルストレージによるエラー記録

### セキュリティベストプラクティス
- APIキーは環境変数で管理
- 本番環境でconsole.logを自動削除
- HTTPSの強制
- 外部リソースの制限

## パフォーマンス

### 最適化施策

#### 1. バンドル最適化
- コード分割 (Code Splitting)
- Tree Shaking
- SWC Minify
- 重要パッケージの最適化

#### 2. キャッシング戦略
- PWA Service Worker
- 静的リソースの長期キャッシュ
- API応答のメモリキャッシュ (TanStack Query)

#### 3. 画像最適化
- Next.js Image Optimization
- AVIF/WebP形式のサポート
- レスポンシブ画像

#### 4. パフォーマンス監視
- Core Web Vitals測定
- カスタムパフォーマンスフック
- メモリ使用量の監視

### パフォーマンス目標
- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Cumulative Layout Shift: < 0.1

## デプロイ

### Vercel へのデプロイ

1. Vercel CLIのインストール
```bash
npm i -g vercel
```

2. デプロイ実行
```bash
vercel
```

3. 環境変数の設定
Vercelダッシュボードで以下を設定：
- `OPENAI_API_KEY`
- その他の本番環境変数

### デプロイ設定
- リージョン: 東京 (hnd1)
- Node.js: 18.x
- Framework: Next.js
- Build Command: `npm run build`

## テスト用ページ

開発環境で以下のテストページが利用可能：

- `/test` - データベーステスト
- `/test-ai` - AI機能テスト
- `/test-backup` - バックアップ機能テスト
- `/test-condition` - コンディション記録テスト
- `/test-encryption` - 暗号化テスト
- `/test-meal-edit` - 食事編集テスト
- `/test-ui` - UI/UXコンポーネントテスト

## ライセンス

MIT License

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

---

**最終更新日**: 2026-02-13  
**バージョン**: 1.0.0
