# Phase 14.5: UX改善と履歴機能の実装計画

## 背景
Phase 10で予定されていた履歴機能が未実装であり、日常使用での使い勝手に改善の余地がある

## 実装内容

### 1. 履歴機能の実装（Phase 10の補完）
#### 1.1 履歴画面（/history）の改修
- [ ] 日付別の食事記録一覧表示
- [ ] カレンダービューでの閲覧
- [ ] 週間/月間サマリー表示
- [ ] 体重変化グラフとの連携表示

#### 1.2 データ表示
- [ ] 食事内容の詳細表示
- [ ] AIフィードバックの履歴
- [ ] コンディションタグの推移
- [ ] 写真がある場合の表示対応

### 2. 食事記録カードの機能拡張
#### 2.1 モーダルでのフィードバック表示
- [ ] 食事記録カードクリックでモーダル表示
- [ ] AIフィードバックの再表示
- [ ] 栄養情報の詳細表示
- [ ] 編集ボタンの追加

#### 2.2 実装詳細
```typescript
interface MealDetailModal {
  mealLog: MealLog;
  feedback?: AIFeedback;
  onEdit: () => void;
  onClose: () => void;
}
```

### 3. ホーム画面のナビゲーション改善
#### 3.1 食事カードのクリッカブル化
- [ ] 朝食/昼食/夕食カードをボタン化
- [ ] 対応する記録画面への遷移
- [ ] ホバー/タップ時のビジュアルフィードバック
- [ ] 未入力時は記録画面、入力済みは詳細モーダル

#### 3.2 UI改善
```typescript
// 例: QuickActionsコンポーネントの改修
<MealCard
  type="breakfast"
  isRecorded={hasBreakfast}
  onClick={() => hasBreakfast 
    ? openMealDetail(breakfastLog) 
    : navigateTo('/record/meal?type=breakfast')
  }
/>
```

### 4. 複数食事の一括入力機能
#### 4.1 スマート入力判定
- [ ] 現在時刻とリセット時間から未入力食事を検出
- [ ] 複数食事を一度に入力できるフォーム
- [ ] タブ切り替えで個別入力も可能

#### 4.2 実装例
```typescript
function detectMissedMeals(currentTime: Date, resetTime: string): MealType[] {
  const missed: MealType[] = [];
  const hour = currentTime.getHours();
  
  // 朝食時間帯を過ぎていて未入力
  if (hour >= 10 && !hasBreakfast) missed.push('breakfast');
  
  // 昼食時間帯を過ぎていて未入力
  if (hour >= 15 && !hasLunch) missed.push('lunch');
  
  return missed;
}
```

#### 4.3 バルク入力UI
- [ ] アコーディオン形式で展開/折りたたみ
- [ ] 各食事ごとにセクション分割
- [ ] 一括保存ボタン
- [ ] 個別スキップオプション

### 5. ホーム画面での未入力提案表示（AIレスポンスの構造化）

#### 5.1 AIレスポンスのJSON化
**現状の問題:**
- テキスト形式のレスポンスから提案部分を抽出するのが不安定
- パース処理でのエラーリスク
- データの再利用が困難

**解決策:**
- AIレスポンスをJSON形式に変更
- 型定義による安全性確保
- 構造化データの保存と表示

#### 5.2 新しいレスポンス型定義
```typescript
// AIレスポンスの型定義
interface AIConsultationResponse {
  // フィードバック部分
  feedback: {
    overall: string;           // 総合評価
    positive: string[];        // 良かった点
    suggestions: string[];     // 改善提案
    encouragement: string;     // 励ましメッセージ
  };
  
  // 食事提案部分
  mealPlans: {
    breakfast?: MealPlanDetail;
    lunch?: MealPlanDetail;
    dinner?: MealPlanDetail;
    snack?: MealPlanDetail;
  };
  
  // 栄養アドバイス
  nutritionAdvice: {
    focus: string[];          // 重視すべき栄養素
    avoid: string[];          // 控えめにすべきもの
    hydration: string;        // 水分摂取アドバイス
  };
  
  // メタデータ
  metadata: {
    generatedAt: string;
    conditionTags: ConditionTag[];
    context: 'morning' | 'meal' | 'evening';
  };
}

interface MealPlanDetail {
  menu: string[];            // メニュー項目
  preparation: string;       // 準備方法（簡単/手軽など）
  alternatives: string[];    // 代替案
  reason: string;           // この提案の理由
  calories?: number;        // カロリー目安
  timing?: string;          // 推奨時間
}
```

#### 5.3 プロンプトの修正
```typescript
// prompts.ts に追加
export const JSON_RESPONSE_PROMPT = `
必ず以下のJSON形式で回答してください。
テキストではなくJSON形式での返答を厳守してください。

{
  "feedback": {
    "overall": "総合的な評価をここに",
    "positive": ["良かった点1", "良かった点2"],
    "suggestions": ["改善提案1", "改善提案2"],
    "encouragement": "励ましのメッセージ"
  },
  "mealPlans": {
    "breakfast": {
      "menu": ["メニュー1", "メニュー2"],
      "preparation": "簡単",
      "alternatives": ["代替案1"],
      "reason": "提案理由",
      "calories": 400
    },
    // lunch, dinner も同様
  },
  "nutritionAdvice": {
    "focus": ["タンパク質", "ビタミンC"],
    "avoid": ["糖分"],
    "hydration": "こまめな水分補給を"
  },
  "metadata": {
    "generatedAt": "2024-02-12T10:00:00Z",
    "conditionTags": ["tired", "stressed"],
    "context": "morning"
  }
}
`;
```

#### 5.4 データフロー
1. **コンディション/食事入力時**
   - AIにJSON形式でレスポンスを要求
   - 型定義に基づいてパース
   - データベースに構造化して保存

2. **ホーム画面表示時**
   - 保存されたJSONから必要な部分を抽出
   - 未入力の食事タイプに対応する提案を表示
   - 時間帯と context に応じた表示調整

#### 5.5 実装の利点
- **型安全性**: TypeScriptの型チェックでエラー防止
- **再利用性**: 保存したデータを何度でも表示可能
- **拡張性**: 新しいフィールドの追加が容易
- **エラー処理**: JSON.parseで失敗した場合のフォールバック

#### 5.6 提案カードの表示
```typescript
// ホーム画面での使用例
function useMealSuggestions() {
  const { latestConsultation } = useAIConsultations();
  const { mealLogs } = useMealLogs();
  
  // 最新のAIレスポンスから未入力分の提案を抽出
  const suggestions = useMemo(() => {
    if (!latestConsultation?.mealPlans) return null;
    
    const unrecordedMeals = getUnrecordedMeals(mealLogs);
    const result: MealSuggestion[] = [];
    
    unrecordedMeals.forEach(mealType => {
      const plan = latestConsultation.mealPlans[mealType];
      if (plan) {
        result.push({
          mealType,
          plan,
          source: 'ai_consultation',
          timestamp: latestConsultation.metadata.generatedAt
        });
      }
    });
    
    return result;
  }, [latestConsultation, mealLogs]);
  
  return suggestions;
}
```

#### 5.7 段階的移行計画
1. **Phase 1**: 新規APIエンドポイントを作成（JSON対応）
2. **Phase 2**: 既存のテキストレスポンスと並行運用
3. **Phase 3**: UIで両方のレスポンスを処理できるようにする
4. **Phase 4**: 完全にJSON形式に移行

## 技術的実装詳細

### 1. 状態管理の拡張
```typescript
// useAppStore.tsに追加
interface AppState {
  // 既存のstate...
  
  // モーダル管理
  mealDetailModal: {
    isOpen: boolean;
    mealLog: MealLog | null;
  };
  
  // 複数食事入力
  bulkMealInput: {
    meals: MealType[];
    data: Record<MealType, string>;
  };
}
```

### 2. 新規コンポーネント
- `MealDetailModal`: 食事詳細モーダル
- `BulkMealInput`: 複数食事入力フォーム
- `MealSuggestionCard`: 食事提案カード
- `MealHistoryCalendar`: カレンダー表示
- `WeeklyStats`: 週間統計表示

### 3. カスタムフック
```typescript
// useMealSuggestions.ts
export function useMealSuggestions() {
  const { dailyState } = useDailyState();
  const { mealLogs } = useMealLogs();
  const currentTime = new Date();
  
  // 未入力の食事を検出
  const missedMeals = detectMissedMeals(currentTime, resetTime);
  
  // 提案を生成
  const suggestions = generateSuggestions(
    missedMeals,
    dailyState?.conditionTags,
    currentTime
  );
  
  return { missedMeals, suggestions };
}
```

## UI/UXの改善点

### 1. ビジュアルフィードバック
- カード押下時のリップルエフェクト
- 未入力項目のパルスアニメーション
- 提案カードのスライドイン

### 2. アクセシビリティ
- モーダルのフォーカストラップ
- ESCキーでのモーダルクローズ
- 適切なaria-label設定

### 3. レスポンシブデザイン
- タブレット表示での2カラムレイアウト
- モバイルでの縦スクロール最適化

## 実装優先順位

### 高優先度（必須）
1. 食事記録カードのモーダル表示
2. ホーム画面カードのナビゲーション
3. 履歴画面の基本実装

### 中優先度（推奨）
4. 複数食事の一括入力
5. 未入力時の提案表示

### 低優先度（nice to have）
6. カレンダービュー
7. 週間/月間統計

## テスト項目

### 機能テスト
- [ ] モーダルの開閉動作
- [ ] ナビゲーション遷移
- [ ] 複数食事の同時保存
- [ ] 提案の動的切り替え

### UXテスト
- [ ] タップ/クリックの反応速度
- [ ] アニメーションの滑らかさ
- [ ] エラー時の復旧フロー

### アクセシビリティテスト
- [ ] キーボード操作
- [ ] スクリーンリーダー対応
- [ ] フォーカス管理

## 期待される効果

### ユーザビリティ向上
- 入力忘れの削減（推定30%減）
- 操作ステップの削減（平均2タップ減）
- 情報の再確認しやすさ向上

### エンゲージメント向上
- 継続率の向上（推定20%増）
- 1日あたりの記録完了率向上
- フィードバック確認率の向上

## 実装スケジュール（推定）

- 履歴機能: 3時間
- モーダル実装: 2時間
- ナビゲーション改善: 1時間
- 複数食事入力: 2時間
- 提案表示: 2時間
- テスト・調整: 2時間

**合計: 約12時間**

## まとめ

Phase 14.5では、日常使用での使い勝手を大幅に改善し、ユーザーが自然に継続できるUIを実現します。特に「入力のし忘れ」と「情報の確認しづらさ」という2つの主要な課題を解決することで、アプリの実用性を高めます。