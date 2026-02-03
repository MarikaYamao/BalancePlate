# データモデル追加仕様（ユーザー基本情報・目標設定）

## 追加された要素

### 1. UserProfile（ユーザー基本情報）
```typescript
interface UserProfile {
  // 身体情報
  biologicalSex?: 'male' | 'female' | 'other' // 生物学的性別
  height?: number // cm単位
  birthYear?: number // 生年（年齢を計算）
  
  // 現在の状態
  currentWeight?: number // kg単位（最新の体重とは別管理）
  activityLevel?: ActivityLevel // 活動レベル
}

type ActivityLevel = 
  | 'sedentary' // ほとんど運動しない
  | 'light' // 軽い運動（週 1-2回）
  | 'moderate' // 中程度（週 3-5回）
  | 'active' // 活発（週 6-7回）
  | 'very_active' // 非常に活発（アスリート等）
```

**理由**: 
- 適切なカロリー計算
- 栄養バランスの個別最適化
- 性別・年齢に応じた提案

### 2. DietGoals（目標設定）
```typescript
interface DietGoals {
  id: string // UUID
  userId: string // UserSettingsのID
  
  // 目標タイプ
  goalType: GoalType
  
  // 数値目標
  targetWeight?: number // 目標体重 (kg)
  targetDate?: Date // 目標達成日
  weeklyWeightChangeTarget?: number // 週間目標体重変化 (kg/週)
  
  // 行動目標
  dailyCalorieTarget?: number // 1日のカロリー目標
  dailyProteinTarget?: number // タンパク質目標 (g)
  dailyWaterTarget?: number // 水分摂取目標 (ml)
  
  // モチベーション
  motivation?: string // ダイエットの理由・動機
  milestones?: Milestone[] // 中間目標
  
  // メタデータ
  createdAt: Date
  updatedAt: Date
  achievedAt?: Date // 目標達成日
}

type GoalType = 
  | 'weight_loss' // 減量
  | 'weight_gain' // 増量
  | 'maintain' // 維持
  | 'body_recomposition' // 体質改善（筋肉増、脂肪減）
  | 'health_improvement' // 健康改善（数値目標なし）

interface Milestone {
  targetDate: Date
  targetWeight?: number
  description: string
  achieved: boolean
}
```

**理由**:
- 個別化された提案の精度向上
- 進捗の可視化
- モチベーション維持

## AI提案への活用

### プロンプトへの組み込み例
```typescript
// 基本情報を考慮した提案
"30歳女性、身長160cm、現在65kg、目標60kg"
"活動レベル：軽い運動（週1-2回）"
"減量ペース：週0.5kg（健康的なペース）"

// これにより以下が可能に：
- 基礎代謝量の推定
- 適切なカロリー収支の計算
- タンパク質必要量の算出
- 無理のないペース設定
```

### 提案の個別化例
```
【性別・年齢を考慮】
- 女性の場合：鉄分を意識した提案
- 40代以降：代謝低下を考慮
- 高齢者：タンパク質を重視

【目標タイプ別】
- 減量：カロリー控えめ、満腹感重視
- 増量：カロリー充実、食事回数増
- 体質改善：タンパク質中心、筋トレ日は炭水化物増
```

## 暗号化対象の追加
- `UserSettings.profile` → `profileEnc` として保存
- `DietGoals` 全体（目標情報もプライバシー）

## 実装時の注意点

### 1. オプショナル設計
すべての身体情報はオプショナル（?）として設計
- ユーザーが段階的に入力可能
- 入力しなくても基本機能は使用可能

### 2. 年齢計算
```typescript
function calculateAge(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}
```

### 3. BMI自動計算
```typescript
function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}
```

### 4. 基礎代謝推定（ハリス-ベネディクト方程式）
```typescript
function calculateBMR(profile: UserProfile): number | null {
  if (!profile.biologicalSex || !profile.currentWeight || 
      !profile.height || !profile.birthYear) {
    return null;
  }
  
  const age = calculateAge(profile.birthYear);
  const weight = profile.currentWeight;
  const height = profile.height;
  
  if (profile.biologicalSex === 'male') {
    // 男性：(13.397 × 体重kg) + (4.799 × 身長cm) - (5.677 × 年齢) + 88.362
    return (13.397 * weight) + (4.799 * height) - (5.677 * age) + 88.362;
  } else {
    // 女性：(9.247 × 体重kg) + (3.098 × 身長cm) - (4.330 × 年齢) + 447.593
    return (9.247 * weight) + (3.098 * height) - (4.330 * age) + 447.593;
  }
}
```

## UIへの反映

### オンボーディングフロー
```
1. 基本情報（スキップ可）
   - 性別
   - 生年
   - 身長
   - 現在の体重
   - 活動レベル

2. 目標設定（スキップ可）
   - 目標タイプ選択
   - 目標体重
   - 目標期間
   - モチベーション

3. 体質・習慣（既存）
   - むくみやすい等
   - 生活習慣

4. 食事設定（既存）
   - 1日の食事回数
   - リセット時間
```

### 設定画面の構成
```
設定
├── プロフィール
│   ├── 基本情報
│   ├── 体質
│   └── 生活習慣
├── 目標
│   ├── 目標体重
│   ├── 目標期間
│   └── マイルストーン
└── アプリ設定
    ├── 食事回数
    └── リセット時間
```

これらの追加により、より個別化された、精度の高い食事提案が可能になります。