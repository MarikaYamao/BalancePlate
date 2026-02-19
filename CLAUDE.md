# Claude Code 開発ガイドライン

このファイルはClaude Codeがこのプロジェクトで作業する際の重要な指示事項を含んでいます。

## 必須チェック事項

### 1. TypeScriptの型チェック（重要）

**実装後は必ず以下のコマンドを実行してください:**

```bash
cd diet-app
npm run typecheck
```

もし型エラーが発生した場合は、必ず修正してください。型の安全性はこのプロジェクトの品質を保つために重要です。

#### VSCodeでの型チェック方法

1. **ショートカットキー**: `Ctrl+Shift+B` を押すと型チェックが実行されます
2. **ターミナルメニュー**: Terminal > Run Task > Type Check
3. **問題パネル**: VSCodeの問題パネルに型エラーがリアルタイムで表示されます

### 2. リント・フォーマットチェック

必要に応じて以下も実行：

```bash
npm run lint
```

## プロジェクト固有の注意事項

### デザイントークン
- カラーは`lib/design-tokens.ts`に定義されたトークンを使用
- ハードコードされた色は避ける
- CSS変数を通じて参照する

### コンポーネント作成時
- 既存のコンポーネントスタイルに従う
- 統一されたpaddingとmarginを使用
- ボタンは`Button`コンポーネントを使用
- カードは`Card`コンポーネントを使用

### データベース操作
- 暗号化が必要なデータは`EncryptedDailyStateRepository`を使用
- 日付の扱いは`resetTime`を必ず考慮する

### 型定義
- `ConditionTag`の使用時は正しい値を使用
  - 例: `tired_medium`, `sleep_bad` など（`tired`や`sleepy`は使用しない）
- 新しい型を追加する場合は`types/index.ts`に追加

## 開発フロー

### Claude Codeが必ず実行すべきこと：

1. 実装を行う
2. **必ず `cd diet-app && npm run typecheck` を実行**
3. 型エラーがあれば修正
4. 必要に応じて`npm run lint`も実行
5. コミットする

### 型チェックの自動化

VSCodeを使用している場合：
- ファイル保存時に自動的に型エラーが表示されます
- `Ctrl+Shift+B`で全体の型チェックを実行できます

## 重要なコマンド一覧

```bash
# 開発サーバー起動
npm run dev

# 型チェック（必須）
npm run typecheck

# リントチェック
npm run lint

# ビルド
npm run build
```

## トラブルシューティング

### ポート3000が使用中の場合
別のNext.jsインスタンスが動いている可能性があります。タスクマネージャーでNode.jsプロセスを終了してください。

### ハイドレーションエラーが発生した場合
- クライアントサイドのみの要素には`mounted`フラグを使用
- `useEffect`内で`setMounted(true)`を設定

---
最終更新: 2024年2月