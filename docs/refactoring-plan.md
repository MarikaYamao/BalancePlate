# diet-app リファクタリングプラン

## 現状分析と課題

### 🔴 優先度高の課題

#### 1. AI相談データ(localStorage)の読み書き・検索ロジックが複数箇所で重複

重複箇所:
- `app/home/ClientOnlyHome.tsx:42` - localStorage.getItem('aiConsultations')
- `app/diary/page.tsx:135` - localStorage.getItem('aiConsultations')  
- `components/features/meal/MealHistory.tsx:76` - localStorage.getItem('aiConsultations')
- `components/features/meal/MealDetailModal.tsx:103` - localStorage.getItem('aiConsultations')
- `components/features/condition/ConditionModal.tsx:52` - localStorage.getItem('aiConsultations')
- `components/features/meal/PostMealFeedback.tsx:35` - localStorage.getItem('aiConsultations')

**問題点:**
- 同一のlocalStorageキーに対する読み書きロジックが6箇所以上で重複
- findIntegrated/findNearestByTimestamp などの検索ロジックも重複実装
- エラーハンドリングの不一致

#### 2. 責務過多コンポーネント（600行超）

- `components/features/meal/MealDetailModal.tsx` - **674行**
- `app/diary/page.tsx` - **630行**  
- `app/home/ClientOnlyHome.tsx` - **619行**
- `components/features/meal/PostMealFeedback.tsx` - **592行**
- `components/features/settings/EnhancedGoalSettings.tsx` - **541行**

**問題点:**
- 単一責任原則違反
- UIとビジネスロジックの混在
- テスタビリティの低下

#### 3. mealType表示名/アイコン定義の散在

重複定義箇所:
- `app/diary/page.tsx:229` - mealTypeラベル定義
- `components/features/meal/MealHistory.tsx:14` - mealTypeアイコン定義
- `components/features/home/MealSuggestions.tsx:27` - mealType関連定義
- 他多数のコンポーネントで個別定義

**問題点:**
- 一貫性の欠如リスク
- 変更時の影響範囲が広い

#### 4. generateDateKey重複実装

- `app/diary/page.tsx:69` - 独自のgenerateDateKey関数
- `lib/utils/dateUtils.ts:12` - getDateKey関数（共通化済み）

**問題点:**
- 同一機能の重複実装
- 保守性の低下

### 🟡 中優先度の課題

#### 5. AIFeedbackDisplayコンポーネントの重複

- `components/features/condition/AIFeedbackDisplay.tsx` - 51行
- `components/features/meal/AIFeedbackDisplay.tsx` - 237行

**問題点:**
- 同名で異なる実装
- 共通化可能な表示ロジック

#### 6. TagSelector系コンポーネントのパターン重複

- ConditionTagSelector/GenderAwareConditionTagSelector
- BodyConstitutionSelector/GenderAwareBodyConstitutionSelector
- LifestyleSelector/GenderAwareLifestyleSelector

**問題点:**
- カテゴリ変換ロジックの重複
- 性別フィルタリングロジックの重複

## リファクタリングプラン

### 📋 Phase 1: 共通ユーティリティ抽出（最優先 - 1週間）

#### 1-1. AI相談データストレージの統合
```typescript
// lib/ai/consultationStorage.ts を新設
export const consultationStorage = {
  // localStorageからの取得
  get: () => AIConsultation[],
  
  // localStorageへの保存
  save: (consultation: AIConsultation) => void,
  
  // 統合データ検索（複数の食事タイプ）
  findIntegrated: (dateKey: string, mealTypes: string[]) => AIConsultation | null,
  
  // タイムスタンプによる検索
  findNearestByTimestamp: (timestamp: number, threshold?: number) => AIConsultation | null,
  
  // 日付とタイプによる検索
  findByDateAndType: (dateKey: string, type: string) => AIConsultation | null,
  
  // 期間内のデータ取得
  getInDateRange: (startDate: string, endDate: string) => AIConsultation[]
}
```

#### 1-2. mealType定数の一元化
```typescript
// lib/constants/mealType.ts を新設
export const MEAL_TYPES = {
  breakfast: {
    label: '朝食',
    icon: '🌅',
    order: 1,
    timeRange: { start: 5, end: 11 }
  },
  lunch: {
    label: '昼食',
    icon: '☀️',
    order: 2,
    timeRange: { start: 11, end: 15 }
  },
  dinner: {
    label: '夕食',
    icon: '🌙',
    order: 3,
    timeRange: { start: 17, end: 23 }
  },
  snack: {
    label: '間食',
    icon: '🍪',
    order: 4,
    timeRange: null
  }
} as const;

// ヘルパー関数
export const getMealTypeLabel = (type: string) => MEAL_TYPES[type]?.label || type;
export const getMealTypeIcon = (type: string) => MEAL_TYPES[type]?.icon || '🍽️';
export const getMealTypeOrder = (type: string) => MEAL_TYPES[type]?.order || 999;
```

#### 1-3. generateDateKey統一
```typescript
// app/diary/page.tsx の generateDateKey を削除
// 全箇所で lib/utils/dateUtils.ts の getDateKey を使用
```

### 📋 Phase 2: 画面ロジック分割（2週間）

#### 2-1. DiaryPage分割（最優先）
```
app/diary/
├── page.tsx                    // メインコンポーネント (150行)
├── components/
│   ├── DiaryHeader.tsx        // ヘッダー部分
│   ├── DiaryTabs.tsx          // タブ切り替え
│   └── DiaryDayCard.tsx       // 日付ごとのカード
└── hooks/
    └── useDiaryData.ts        // データ取得・加工ロジック
```

#### 2-2. ClientOnlyHome分割
```
app/home/
├── ClientOnlyHome.tsx          // メインコンポーネント (200行)
├── components/
│   ├── HomeDashboard.tsx      // ダッシュボード表示
│   ├── HomeStats.tsx          // 統計表示
│   └── HomeActions.tsx        // アクションボタン群
└── hooks/
    └── useHomeDashboardData.ts // データ取得・集計ロジック
```

#### 2-3. MealDetailModal分割
```
components/features/meal/detail/
├── MealDetailModal.tsx         // メインモーダル (150行)
├── MealFeedbackSections.tsx   // フィードバック表示
├── MealMetaHeader.tsx         // メタ情報ヘッダー
├── MealPlanDisplay.tsx        // 食事プラン表示
└── hooks/
    └── useMealFeedbackLoader.ts // フィードバック取得
```

### 📋 Phase 3: フィードバックUI統合（1週間）

#### 3-1. AIFeedbackDisplay統合
```typescript
// components/shared/AIFeedbackDisplay.tsx
interface Props {
  feedback: string | null;
  variant?: 'simple' | 'structured';
  isLoading?: boolean;
  onGenerate?: () => void;
}
```

#### 3-2. 食事プラン表示の共通化
```typescript
// components/shared/MealPlanDisplay.tsx
interface Props {
  plans: {
    A?: MealPlan;
    B?: MealPlan;
    C?: MealPlan;
  };
  onSelectPlan?: (plan: MealPlan) => void;
}
```

### 📋 Phase 4: クリーンアップ（3日）

#### 4-1. 未使用コード削除
- ClientOnlyHome.tsx:5 の未使用import削除
- 使用されていないstate/変数の削除

#### 4-2. 型安全性の向上
- any型の段階的削減
- AIConsultation関連型の統一
- 適切な型定義の追加

## 実施順序（推奨）

1. **Week 1**: Phase 1 完了
   - consultationStorage.ts作成 (2日)
   - mealType constants作成 (1日)
   - dateKey統一 (1日)
   - テスト・動作確認 (1日)

2. **Week 2-3**: Phase 2 実施
   - DiaryPage分割 (3日)
   - ClientOnlyHome分割 (3日)
   - MealDetailModal分割 (3日)
   - 統合テスト (1日)

3. **Week 4**: Phase 3-4 実施
   - フィードバックUI統合 (3日)
   - クリーンアップ (2日)

## 期待される効果

### 定量的効果
- **コード削減**: 約30-40%の重複コード解消
- **ファイルサイズ**: 大規模コンポーネント600行→200行以下
- **保守性**: 変更時の影響範囲を50%以上削減

### 定性的効果
- **開発速度向上**: 共通ユーティリティによる実装時間短縮
- **バグ削減**: 重複コード削除による不整合リスク排除
- **テスタビリティ**: 小規模コンポーネント化によるテスト容易性向上
- **可読性向上**: 単一責任原則に基づく明確な構造

## 成功指標

- [ ] localStorage操作が1箇所に集約される
- [ ] 600行超のコンポーネントが0になる
- [ ] mealType定義が一元化される
- [ ] 全てのdateKey生成が統一される
- [ ] TypeScript型エラーが0になる
- [ ] npm run typecheckが成功する

## リスクと対策

| リスク | 対策 |
|--------|------|
| 既存機能の破壊 | 段階的リファクタリング・各フェーズでのテスト |
| 実装の手戻り | 事前の影響調査・小さな単位での実装 |
| パフォーマンス低下 | 必要に応じたメモ化・遅延ロード維持 |

## 次のアクション

1. Phase 1-1: consultationStorage.tsの作成から開始
2. 既存コードの使用箇所を洗い出し
3. 段階的な置き換えとテスト

---

最終更新: 2024年3月
作成者: Claude Code