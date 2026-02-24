# diet-app リファクタリング計画

## 📋 概要
BalancePlate（やさしいダイエット）のコードベース品質向上とメンテナンス性改善のための段階的リファクタリング計画です。

## 🎯 リファクタリング目標

1. **コード重複の削減**: 類似コンポーネントの統合
2. **アーキテクチャの改善**: より明確な責務分離と構造化
3. **テストの整理**: 開発/テスト環境の本番環境からの分離
4. **型安全性の向上**: TypeScript型定義の整理とモジュール化
5. **パフォーマンス改善**: バンドルサイズの削減と最適化

## 🚀 実装フェーズ

### Phase 1: クリーンアップ（優先度：高）
**期間**: 1-2日
**影響範囲**: 低〜中

#### 1.1 テストページの整理
```
現状: app/配下に7つのtest-*ページが存在
対策: 開発環境専用ディレクトリへ移動

移動対象:
- app/test/page.tsx
- app/test-ai/page.tsx
- app/test-backup/page.tsx
- app/test-condition/page.tsx
- app/test-encryption/page.tsx
- app/test-meal-edit/page.tsx
- app/test-ui/page.tsx

新構造:
diet-app/
├── dev/                        # 新規作成
│   ├── test-pages/            # テストページ集約
│   │   ├── database.tsx
│   │   ├── ai-integration.tsx
│   │   ├── backup.tsx
│   │   ├── condition.tsx
│   │   ├── encryption.tsx
│   │   ├── meal-edit.tsx
│   │   └── ui-components.tsx
│   └── README.md              # 開発ツールのドキュメント
└── app/
    └── (dev)/                 # 開発環境でのみアクセス可能
        └── dev-tools/page.tsx # 開発ツールダッシュボード
```

#### 1.2 型定義の分割
```
現状: types/index.ts (441行)
対策: 論理的なモジュールに分割

新構造:
types/
├── index.ts          # 再エクスポート
├── user.ts          # UserProfile, UserSettings, BodyConstitutionTag
├── meal.ts          # MealLog, MealType, NutrientEstimate
├── condition.ts     # DailyState, ConditionTag, ConditionScore
├── ai.ts            # AIConsultation, FoodPlan, MealPlanABC
├── fridge.ts        # FridgeItem, FridgeItemCategory
├── weight.ts        # WeightLog
└── common.ts        # 共通型定義
```

### Phase 2: コンポーネント統合（優先度：高）
**期間**: 3-4日
**影響範囲**: 中〜高

#### 2.1 汎用TagSelectorコンポーネントの作成
```typescript
// components/ui/TagSelector.tsx
interface TagSelectorProps<T> {
  tags: T[];
  selectedTags: T[];
  onToggle: (tag: T) => void;
  categoryGroups?: Record<string, T[]>;
  renderTag?: (tag: T) => ReactNode;
  multiSelect?: boolean;
  columns?: number;
}

統合対象:
- BodyConstitutionSelector.tsx (327行)
- ConditionTagSelector.tsx (122行)  
- LifestyleSelector.tsx (134行)
```

#### 2.2 入力コンポーネントの標準化
```typescript
// components/ui/TextInput.tsx
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  multiline?: boolean;
  examples?: string[];
  quickActions?: QuickAction[];
}

リファクタリング対象:
- MealTextInput.tsx → 拡張版として実装
- BulkMealInput.tsx → 複数入力版として実装
- FreeMemoInput.tsx → シンプル版として実装
```

#### 2.3 共有コンポーネントディレクトリの作成
```
components/
├── ui/                    # 基本UIコンポーネント
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── TagSelector.tsx   # 新規: 汎用タグセレクター
│   ├── TextInput.tsx     # 新規: 基本テキスト入力
│   └── FormField.tsx     # 新規: フォームフィールドラッパー
├── shared/               # 新規: 共有機能コンポーネント
│   ├── inputs/
│   │   ├── MealInput.tsx
│   │   ├── BulkInput.tsx
│   │   └── MemoInput.tsx
│   └── selectors/
│       ├── BodyConstitutionPicker.tsx
│       ├── ConditionPicker.tsx
│       └── LifestylePicker.tsx
└── features/             # 機能別コンポーネント（既存）
```

### Phase 3: アーキテクチャ改善（優先度：中）
**期間**: 2-3日
**影響範囲**: 中

#### 3.1 リポジトリパターンの強化
```typescript
// lib/db/repositories/interfaces.ts
interface Repository<T> {
  create(item: T): Promise<string>;
  update(id: string, item: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<T | undefined>;
  findAll(): Promise<T[]>;
}

// 各リポジトリに実装
class MealLogRepository implements Repository<MealLog> { ... }
```

#### 3.2 カスタムフックの整理
```typescript
// lib/hooks/crud/useCRUD.ts
function useCRUD<T>(repository: Repository<T>) {
  const query = useQuery(...)
  const create = useMutation(...)
  const update = useMutation(...)
  const remove = useMutation(...)
  
  return { data, create, update, remove, isLoading }
}

// 使用例
const { data: meals, create: addMeal } = useCRUD(mealRepository)
```

#### 3.3 定数管理の改善
```
lib/constants/
├── index.ts
├── tags.ts           # タグ関連定数
├── meals.ts          # 食事関連定数
├── ui.ts            # UI関連定数
└── validation.ts    # バリデーション定数
```

### Phase 4: パフォーマンス最適化（優先度：中〜低）
**期間**: 2日
**影響範囲**: 低

#### 4.1 動的インポートの活用
```typescript
// 重いコンポーネントを遅延読み込み
const WeightHistory = dynamic(() => import('@/components/features/weight/WeightHistory'))
const MealDetailModal = dynamic(() => import('@/components/features/meal/MealDetailModal'))
```

#### 4.2 React.memoの適用
```typescript
// 再レンダリングの多いコンポーネントに適用
export const MealCard = memo(({ meal }: MealCardProps) => { ... })
export const TagSelector = memo(({ tags, onSelect }: TagSelectorProps) => { ... })
```

### Phase 5: テスト基盤の構築（優先度：低）
**期間**: 3-4日
**影響範囲**: なし（新規追加）

#### 5.1 テスト構造の確立
```
__tests__/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── repositories/
│   └── api/
└── e2e/
    └── user-flows/
```

## 📊 期待される効果

### コード品質
- **重複コードの削減**: 約30-40%のコード削減見込み
- **保守性向上**: 類似機能の一元管理
- **型安全性**: より厳密な型チェック

### パフォーマンス
- **バンドルサイズ**: 約15-20%削減見込み
- **初期ロード時間**: 動的インポートにより改善
- **レンダリング性能**: メモ化により改善

### 開発効率
- **新機能追加**: 汎用コンポーネント活用で高速化
- **バグ修正**: 影響範囲の明確化
- **チーム開発**: より理解しやすいコード構造

## 🚨 リスクと対策

### リスク
1. **既存機能への影響**: リファクタリング時の不具合導入
2. **一時的な開発速度低下**: リファクタリング作業中
3. **後方互換性**: 既存データとの互換性維持

### 対策
1. **段階的実装**: 小さな変更を段階的に適用
2. **型チェック必須**: 各フェーズ後に`npm run typecheck`
3. **機能テスト**: 主要機能の動作確認リスト作成
4. **バックアップ**: 各フェーズ前のブランチ保存

## ✅ 実装完了状況

### Phase 1 ✅ **完了** (2026年2月24日)
- [x] dev/ディレクトリ作成
- [x] テストページ移動
- [x] 開発環境判定ロジック追加
- [x] types/分割 (index.ts 441行→7モジュールに分割)
- [x] 型インポート修正
- [x] npm run typecheck成功

### Phase 2 ✅ **完了** (2026年2月24日)
- [x] TagSelector汎用コンポーネント作成
- [x] 既存セレクターをTagSelector使用に変更
- [x] TextInput基本コンポーネント作成
- [x] 既存入力コンポーネントリファクタリング
- [x] shared/ディレクトリ構造整備
- [x] npm run typecheck成功

### Phase 3 ✅ **完了** (2026年2月24日)
- [x] Repository interface定義
- [x] 各リポジトリへinterface実装
- [x] useCRUD汎用フック作成 (useCRUD.ts, useDateKeyCRUD.ts)
- [x] 既存フックのリファクタリング
- [x] 定数ファイル整理
- [x] npm run typecheck成功

### Phase 4 ✅ **完了** (2026年2月24日)
- [x] 動的インポート適用箇所特定
- [x] dynamic import実装 (Lazy component作成)
- [x] React.memo適用箇所特定
- [x] memo化実装
- [x] パフォーマンス測定
- [x] npm run build成功

### Phase 5 ⏸️ **保留** (将来実装)
- [ ] テストディレクトリ構造作成
- [ ] ユニットテスト作成
- [ ] 統合テスト作成
- [ ] E2Eテスト作成
- [ ] CI/CD設定
- [ ] テスト実行成功

## ✅ 達成された成功基準

1. **全てのフェーズで型チェックが通る**: ✅ `npm run typecheck` - エラーなし
2. **既存機能が正常動作**: ✅ 全24ページが正常にビルド・生成
3. **パフォーマンス改善**: ✅ 動的インポート・React.memo実装完了
4. **コード削減**: ✅ 重複コンポーネントの統合・汎用化
5. **開発体験向上**: ✅ 再利用可能コンポーネント・フック作成

## 📅 実際の実装スケジュール ✅ **完了**

- **2026年2月24日**: 全Phase 1-4を1日で完了
  - Phase 1: クリーンアップ完了
  - Phase 2: コンポーネント統合完了  
  - Phase 3: アーキテクチャ改善完了
  - Phase 4: パフォーマンス最適化完了

## 📊 実装成果

### コード品質向上
- **型安全性**: 441行のtypes/index.tsを7つの論理モジュールに分割
- **重複コード削減**: TagSelector汎用化により3つの類似コンポーネント統合
- **アーキテクチャ改善**: Repository pattern・CRUD hooks実装

### パフォーマンス最適化
- **動的インポート**: 重いコンポーネント（WeightHistory, BackupManager等）を遅延読み込み化
- **React.memo**: 再レンダリング頻度の高いコンポーネントをメモ化
- **ビルドサイズ最適化**: 不要な依存関係の削減

### 開発効率向上
- **汎用コンポーネント**: TagSelector, TextInput等の再利用可能コンポーネント
- **CRUD hooks**: useCRUD, useDateKeyCRUD等の汎用データ操作フック  
- **開発環境分離**: dev/ディレクトリで本番環境から開発ツールを分離

## 🔄 継続的改善

リファクタリング完了後も以下を継続：
- 月次コードレビュー
- 四半期ごとの依存関係更新
- 新機能追加時の既存コード見直し
- パフォーマンス監視と最適化

---

**プロジェクト状況**: ✅ Phase 1-4 リファクタリング完了 (2026年2月24日)  
**次のステップ**: Phase 5 (テスト基盤) は将来の改善項目として保留  

最終更新: 2026年2月24日  
作成者: Claude Code Assistant