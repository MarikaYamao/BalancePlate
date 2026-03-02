# Notion フィードバック機能の設定ガイド

このガイドでは、BalancePlateアプリのフィードバック機能をNotionデータベースと連携させる方法を説明します。

## 必要なもの

- Notionアカウント
- Notionワークスペース

## セットアップ手順

### 1. Notion Integration の作成

1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. 「新しいインテグレーション」をクリック
3. 以下の情報を入力：
   - 名前: `BalancePlate Feedback`（任意の名前でOK）
   - ワークスペース: 使用するワークスペースを選択
4. 「送信」をクリック
5. 表示される「内部インテグレーショントークン」をコピー（後で使用）

### 2. Notionデータベースの作成

1. Notionで新しいページを作成
2. 「テーブル」または「データベース」を選択
3. 以下のプロパティを追加：

| プロパティ名 | タイプ | 説明 |
|------------|-------|-----|
| Title | タイトル | フィードバックのタイトル（自動生成） |
| Type | セレクト | フィードバックの種類 |
| Content | テキスト | フィードバックの内容 |
| Email | メール | 連絡先メールアドレス（任意） |
| Status | セレクト | 対応状況 |
| Date | 日付 | 送信日時 |
| UserAgent | テキスト | ブラウザ情報 |

#### Type プロパティの選択肢

- バグ報告
- 機能要望
- 改善提案
- その他

#### Status プロパティの選択肢

- 未対応
- 対応中
- 完了
- 保留

### 3. データベースへのIntegration接続

1. 作成したデータベースページを開く
2. 右上の「...」メニューをクリック
3. 「接続を追加」を選択
4. 作成したIntegration（BalancePlate Feedback）を選択

### 4. データベースIDの取得

1. データベースページのURLを確認
   ```
   https://www.notion.so/workspace-name/xxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=yyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```
2. `xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` の部分（?より前の32文字）がデータベースID

### 5. 環境変数の設定

1. `.env.local` ファイルに以下を追加：

```env
# Notion Integration
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

2. 値を置き換える：
   - `NOTION_API_KEY`: ステップ1でコピーしたトークン
   - `NOTION_DATABASE_ID`: ステップ4で取得したデータベースID

### 6. 動作確認

1. アプリを再起動
   ```bash
   npm run dev
   ```

2. アプリの画面右下のフィードバックボタンをクリック
3. テストメッセージを送信
4. Notionデータベースに新しいエントリが追加されることを確認

## トラブルシューティング

### エラー: Server configuration error

- 環境変数が正しく設定されているか確認
- `.env.local` ファイルが正しい場所にあるか確認

### エラー: Failed to submit feedback

- Notion Integration がデータベースに接続されているか確認
- データベースのプロパティ名が正しいか確認
- APIキーとデータベースIDが正しいか確認

### フィードバックが表示されない

- Notionでデータベースを更新（F5）してみる
- フィルターやソート設定を確認

## セキュリティに関する注意

- `NOTION_API_KEY` は秘密情報です。GitHubなどに公開しないよう注意してください
- `.env.local` ファイルは `.gitignore` に含まれていることを確認してください

## カスタマイズ

フィードバックのタイプや項目をカスタマイズしたい場合は、以下のファイルを編集してください：

- `/app/api/feedback/route.ts` - API処理
- `/components/features/feedback/FeedbackModal.tsx` - UIコンポーネント

必要に応じてNotionデータベースのプロパティも調整してください。