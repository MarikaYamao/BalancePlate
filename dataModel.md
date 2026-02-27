# データモデル詳細仕様書

## 1. 基本方針

### ローカルファースト設計
- 全データをIndexedDB（Dexie.js）で管理
- オフライン時も記録機能は動作可能
- 将来的にSQLite（WA-SQLite）への移行を考慮した設計
- Supabase連携時のマイグレーションパスを確保

### データ暗号化
- 体質・習慣データなど個人情報は暗号化
- Web Crypto APIを使用したクライアントサイド暗号化
- 暗号化キーはデバイスローカルに保存

---

## 2. コアデータモデル

### UserSettings（ユーザー設定）

```typescript
interface UserSettings {
  id: string // UUID
  
  // 基本設定
  dayResetTime: string // "04:00" 形式
  mealsPerDay: 2 | 3 // 食事回数
  
  // 基本情報（暗号化対象）
  profile?: UserProfile
  
  // 体質・身体傾向（暗号化対象）
  bodyConstitution: BodyConstitutionTag[]
  
  // 生活習慣（暗号化対象）
  lifestyle: LifestyleTag[]
  
  // 食材の好み（暗号化対象）
  favoriteFoods?: string[] // 好きな食材・料理
  dislikedFoods?: string[] // 嫌い・アレルギーのある食材
  
  // フェーズ21: ゴール関連設定
  goalMode?: GoalMode // CUT/MAINTAIN/GAIN
  constraints?: ConstraintType[] // 制約条件
  constraintDetails?: {
    pregnancyWeek?: number
    hormoneStartDate?: Date
    medicalNotes?: string
  }
  
  // 自由記載
  additionalNotes?: string // その他の情報（任意）
  
  // システム管理
  onboardingCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

type BodyConstitutionTag = 
  // 健康状態
  | 'healthy' // 特に問題なし
  | 'good_digestion' // 消化が良い
  | 'high_metabolism' // 代謝が良い
  | 'good_stamina' // 体力がある
  | 'good_sleep' // 睡眠の質が良い
  
  // 循環・代謝
  | 'edema_prone' // むくみやすい
  | 'cold_sensitivity' // 冷えやすい
  | 'low_blood_pressure' // 低血圧
  | 'anemic' // 貧血気味
  | 'poor_circulation' // 血行不良
  
  // 消化器系
  | 'weak_stomach' // 胃腸が弱い
  | 'constipation_prone' // 便秘しやすい
  | 'diarrhea_prone' // 下痢しやすい
  | 'bloating_prone' // お腹が張りやすい
  | 'acid_reflux' // 逆流性食道炎・胃酸過多
  
  // 筋骨格系
  | 'weak_joints' // 関節が弱い
  | 'muscle_cramps' // つりやすい
  | 'back_pain' // 腰痛持ち
  
  // 食事関連
  | 'postprandial_sleepiness' // 食後に眠くなりやすい
  | 'stress_eating' // ストレスで食が乱れやすい
  | 'binge_eating' // 過食傾向
  | 'low_appetite' // 食欲不振
  | 'fast_eater' // 早食い
  | 'late_night_snacking' // 夜食べの習慣
  
  // アレルギー・不耐性
  | 'lactose_intolerant' // 乳糖不耐症
  | 'gluten_sensitive' // グルテン過敏症
  | 'food_allergies' // 食物アレルギーあり
  
  // 女性特有
  | 'pms_severe' // PMS強め
  | 'irregular_periods' // 生理不順
  | 'heavy_periods' // 生理が重い
  | 'menopause' // 更年期
  
  // 特別な配慮が必要な状況
  | 'pregnancy' // 妊娠中
  | 'breastfeeding' // 授乳中
  | 'hormone_ftm' // ホルモン療法中（FTM）
  | 'hormone_mtf' // ホルモン療法中（MTF）
  | 'medical_diet' // 医師から食事指導を受けている
  
  // その他
  | 'prone_to_headaches' // 頭痛持ち
  | 'skin_problems' // 肌荒れしやすい
  | 'sleep_issues' // 睡眠障害
  | 'sensitive_to_caffeine' // カフェインに敏感
  | 'water_retention' // 水分を溜めやすい

type LifestyleTag =
  // 仕事・活動
  | 'remote_work' // 在宅ワーク
  | 'desk_work' // デスクワーク・座り仕事
  | 'standing_work' // 立ち仕事
  | 'physical_labor' // 肉体労働
  | 'commute_walk' // 通勤徒歩
  | 'night_shift' // 夜勤
  | 'shift_work' // シフト勤務
  
  // 家族・ケア
  | 'has_children' // 育児あり
  | 'caregiving' // 介護中
  | 'pregnant' // 妊娠中
  | 'breastfeeding' // 授乳中
  
  // 生活パターン
  | 'regular_exercise' // 運動習慣あり
  | 'irregular_schedule' // 不規則な生活
  | 'sleep_deprived' // 睡眠不足
  | 'high_stress' // 高ストレス
  | 'frequent_travel' // 出張・旅行が多い
  | 'frequent_dining_out' // 外食が多い
  | 'prefer_cooking' // 自炊派
  | 'budget_conscious' // 節約志向
  
  // 医療・健康
  | 'taking_oral_contraceptives' // ピル服用中
  | 'hormone_therapy' // ホルモン治療中
  | 'taking_medications' // 投薬中
  | 'under_medical_treatment' // 治療中
  
  // 喫煙・飲酒
  | 'smoker' // 喫煙者
  | 'regular_drinker' // 習慣的飲酒
  | 'social_drinker' // 付き合い程度の飲酒
  | 'non_drinker' // 飲酒しない

// ユーザー基本情報（暗号化対象）
interface UserProfile {
  // 性別関連情報（包括的設計）
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' // 性別
  assignedSexAtBirth?: 'male' | 'female' // 出生時に割り当てられた性別（任意）
  currentHormoneStatus?: HormoneStatus // 現在のホルモン状態（任意）
  hormoneTherapyDuration?: HormoneTherapyDuration // ホルモン治療期間
  
  // 身体情報
  height?: number // cm単位
  birthYear?: number // 生年（年齢を計算）
  
  // 現在の状態
  currentWeight?: number // kg単位（最新の体重とは別管理）
  activityLevel?: ActivityLevel // 活動レベル
  
  // 目標設定
  goalType?: string // 目標タイプ
  targetWeight?: number // 目標体重（kg単位）
  goalPeriod?: string // 目標期間
  
  // フェーズ21: 拡張目標設定
  goalMode?: GoalMode // シンプルな3モード
  goalDetails?: {
    targetWeight?: number
    targetDate?: Date
    weeklyTarget?: number // kg/週
  }
  
  // 制約条件（センシティブ情報）
  constraints?: ConstraintType[]
  constraintDetails?: {
    pregnancyWeek?: number
    hormoneStartDate?: Date
    medicalNotes?: string
  }
}

type HormoneStatus = 
  | 'male_dominant' // 男性ホルモンが優位
  | 'female_dominant' // 女性ホルモンが優位
  | 'in_transition' // ホルモン治療中（調整段階）
  | 'not_selected' // 選択しない（デフォルト）

type HormoneTherapyDuration = 
  | 'less_than_6_months' // 6か月未満
  | '6_to_12_months' // 6〜12か月
  | '12_to_24_months' // 12〜24か月
  | 'more_than_24_months' // 24か月以上

type ActivityLevel = 
  | 'sedentary' // ほとんど運動しない
  | 'light' // 軽い運動（週 1-2回）
  | 'moderate' // 中程度（週 3-5回）
  | 'active' // 活発（週 6-7回）
  | 'very_active' // 非常に活発（アスリート等）
```

### DietGoals（目標設定）

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

// フェーズ21: ゴールモード（シンプルな3モード）
type GoalMode = 'CUT' | 'MAINTAIN' | 'GAIN'

// 制約タイプ（センシティブ情報）
type ConstraintType = 
  | 'pregnancy'      // 妊娠中
  | 'breastfeeding' // 授乳中
  | 'hormone_ftm'   // ホルモン療法（FTM）
  | 'hormone_mtf'   // ホルモン療法（MTF）
  | 'medical'       // その他医療的制約

// GAINモード専用の検知タグ
type GainDetectionTag = 
  | 'low_total_intake'      // 総量不足
  | 'low_meal_frequency'    // 回数不足
  | 'early_fullness'        // すぐ満腹
  | 'low_protein'          // タンパク不足
  | 'low_energy_density'   // 低密度（サラダばかり等）

interface Milestone {
  targetDate: Date
  targetWeight?: number
  description: string
  achieved: boolean
}
```

### DailyState（日次状態記録）

```typescript
interface DailyState {
  // dateKeyを主キーとして使用（日次で1件なので）
  dateKey: string // "2024-01-15" リセット時間基準（PRIMARY KEY）
  actualDate: Date // 実際の記録日時
  
  // コンディション
  conditionTags: ConditionTag[]
  freeMemo: string // 自由記述メモ
  
  // 運動・活動記録
  activityMemo?: string // 運動・活動のメモ
  
  // メタデータ
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date // 論理削除
}

type ConditionTag = 
  // 生理関連
  | 'period_before' // 生理前
  | 'period_during' // 生理中
  | 'period_after' // 生理後
  | 'ovulation' // 排卵期っぽい
  
  // 睡眠・疲労
  | 'sleep_good' // よく寝た
  | 'sleep_normal' // 普通
  | 'sleep_bad' // 寝不足
  | 'tired_low' // 疲労感低い
  | 'tired_medium' // 疲労感中程度
  | 'tired_high' // 疲労感高い
  
  // 体調
  | 'edema_low' // むくみ低い
  | 'edema_medium' // むくみ中程度
  | 'edema_high' // むくみ高い
  | 'stomach_good' // 胃腸快調
  | 'constipated' // 便秘気味
  | 'diarrhea' // 下し気味
  | 'stomach_weak' // 胃腸が弱っている
  
  // その他
  | 'normal' // 普通・特になし
  | 'stressed' // ストレスあり
  | 'craving_sweet' // 甘いものが欲しい
  | 'low_appetite' // 食欲なし
  | 'high_appetite' // 食欲旺盛
  
  // GAINモード専用検知タグ
  | 'low_total_intake' // 総摂取量不足
  | 'low_meal_frequency' // 食事回数不足
  | 'early_fullness' // すぐに満腹になる
  | 'need_liquid_calories' // 液体カロリー必要
  | 'post_workout' // 運動後
  
  // 制約レイヤー用
  | 'morning_sickness' // つわり
  | 'hormone_fluctuation' // ホルモン変動
  | 'medical_restriction' // 医療的制限
  
  // 今日の予定
  | 'dining_out' // 外食予定
  | 'drinking_planned' // 飲み会予定
  | 'exercise_planned' // 運動予定
  | 'travel_day' // 移動多い日
  | 'work_from_home' // 在宅日
  | 'hangover' // 二日酔い
```

### MealLog（食事記録）

```typescript
interface MealLog {
  id: string // UUID
  
  // 日付・タイミング
  dateKey: string // リセット時間基準の日付
  mealType: MealType
  actualTime: Date // 実際の食事時刻
  
  // 記録内容
  text: string // 食事内容（自由記述）
  followedPlan?: boolean // プランに従ったか
  planId?: string // 従ったプランのID
  
  // AI分析結果（非同期で追加）
  aiAnalysis?: {
    estimatedNutrients?: NutrientEstimate
    suggestions?: string[]
    analyzedAt: Date
  }
  
  // メタデータ
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface NutrientEstimate {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  // 将来的に拡張
}
```

### FoodPlan（AI提案プラン）

```typescript
interface FoodPlan {
  dateKey: string // 日付（PRIMARY KEYの一部）
  planType: 'A' | 'B' | 'C' // プランタイプ（PRIMARY KEYの一部）
  planName: string // "しっかり整えるプラン" など
  description: string // プランの説明
  
  // 選択状態
  selected: boolean
  selectedAt?: Date
  
  // 食事提案内容
  meals: FoodPlanMealSuggestion[]
  
  // メタデータ
  createdAt: Date
  expiresAt: Date // プランの有効期限
}

interface FoodPlanMealSuggestion {
  mealType: MealType
  mainItems: string[] // メイン料理
  sideItems: string[] // 副菜
  notes?: string // 注意点や理由
  alternatives?: string[] // 代替案
}
```

### WeightLog（体重記録）

```typescript
interface WeightLog {
  id: string // UUID
  
  // 記録データ
  timestamp: Date
  dateKey: string // リセット時間基準
  weight: number // kg単位、小数点1位まで
  
  // オプション情報
  note?: string // メモ
  measurementTiming?: 'morning' | 'night' | 'other'
  
  // メタデータ
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
```

### FridgeItem（冷蔵庫食材管理）

```typescript
// フェーズ19で追加
type FridgeItemCategory = 
  | 'vegetable' // 野菜
  | 'meat' // 肉類
  | 'fish' // 魚介類
  | 'dairy' // 乳製品
  | 'egg' // 卵
  | 'grain' // 穀物・パン
  | 'seasoning' // 調味料
  | 'frozen' // 冷凍食品
  | 'leftover' // 残り物
  | 'prepared' // 下ごしらえ済み
  | 'other' // その他

interface FridgeItem {
  id: string // UUID
  name: string // 食材名
  category: FridgeItemCategory // カテゴリ
  
  // 数量・状態
  quantity?: string // 数量（自由記述: "2本", "300g" など）
  unit?: string // 単位
  isAvailable: boolean // 現在利用可能か
  
  // 期限情報
  expirationDate?: Date // 消費期限
  addedDate: Date // 追加日
  
  // 優先度
  priority?: 'high' | 'medium' | 'low' // 使い切り優先度
  
  // メタデータ
  notes?: string // メモ（"今日使いたい" など）
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
```

### ShoppingList（買い物リスト）

```typescript
// フェーズ19で追加
interface ShoppingListItem {
  id: string
  name: string // 商品名
  category: FridgeItemCategory // カテゴリ
  quantity?: string // 数量
  unit?: string // 単位
  
  // 状態
  isPurchased: boolean // 購入済み
  isUrgent: boolean // 緊急
  
  // AI提案情報
  suggestedBy?: 'ai' | 'manual' // 提案元
  suggestedReason?: string // 提案理由
  relatedMealPlan?: string // 関連する食事プランID
  
  // メタデータ
  createdAt: Date
  purchasedAt?: Date
}

interface ShoppingList {
  id: string
  dateKey: string // 日付
  items: ShoppingListItem[]
  
  // 状態
  isCompleted: boolean
  completedAt?: Date
  
  // メタデータ
  createdAt: Date
  updatedAt: Date
}
```

---

## 3. AI連携用データ構造

### AIPromptContext（プロンプト生成用コンテキスト）

```typescript
interface AIPromptContext {
  // ユーザー基本情報
  userProfile: {
    // 身体情報
    age?: number // birthYearから計算
    height?: number
    currentWeight?: number
    activityLevel?: ActivityLevel
    
    // 体質・習慣
    bodyConstitution: BodyConstitutionTag[]
    lifestyle: LifestyleTag[]
    favoriteFoods?: string[] // 好きな食材
    dislikedFoods?: string[] // 嫌い・アレルギー食材
    mealsPerDay: 2 | 3
    additionalNotes?: string // その他の情報
  }
  
  // 目標情報
  goals?: {
    goalType: GoalType
    targetWeight?: number
    weeklyWeightChangeTarget?: number
    dailyCalorieTarget?: number
  }
  
  // フェーズ21: ゴールモードと制約
  goalMode?: GoalMode // CUT/MAINTAIN/GAIN
  constraints?: ConstraintType[] // 制約条件
  
  // 今日の状態
  todayCondition: {
    conditionTags: ConditionTag[]
    freeMemo?: string
  }
  
  // 前日の記録
  previousDayData?: {
    meals: {
      type: string
      content: string
    }[]
    weight?: number
    activityMemo?: string
  }
  
  // フェーズ19: 冷蔵庫食材情報
  fridgeItems?: {
    name: string
    category: string
    available: boolean
  }[]
  
  // リクエストタイプ
  requestType: 
    | 'morning_plan' // 朝のプラン提案
    | 'after_breakfast' // 朝食後の提案
    | 'after_lunch' // 昼食後の提案
    | 'consultation' // 相談
}
```

### AIResponse（AI応答形式）

```typescript
interface AIResponse {
  // プラン提案の場合
  plans?: {
    planA: FoodPlan
    planB: FoodPlan
    planC: FoodPlan
  }
  
  // 食後フィードバックの場合
  feedback?: {
    nutritionAnalysis: string
    nextMealSuggestions: string[]
    encouragement?: string // 励ましのメッセージ
  }
  
  // 共通
  message?: string // フリーテキストメッセージ
  generatedAt: Date
}
```

---

## 4. IndexedDBスキーマ（Dexie.js）

```typescript
// db.ts
import Dexie, { Table } from 'dexie';

export class DietDatabase extends Dexie {
  userSettings!: Table<UserSettings>;
  dailyStates!: Table<DailyState>;
  mealLogs!: Table<MealLog>;
  foodPlans!: Table<FoodPlan>;
  weightLogs!: Table<WeightLog>;
  
  constructor() {
    super('DietDatabase');
    
    this.version(1).stores({
      userSettings: 'id',
      // dateKeyを主キーに変更（upsertが簡単に）
      dailyStates: 'dateKey, actualDate, createdAt',
      mealLogs: 'id, dateKey, [dateKey+mealType], createdAt',
      // 複合主キーでA/B/Cプランを管理
      foodPlans: '[dateKey+planType], dateKey, selected, createdAt',
      weightLogs: 'id, dateKey, timestamp'
    });
  }
}

export const db = new DietDatabase();
```

---

## 5. データ暗号化仕様

### 暗号化対象フィールド
- `UserSettings.bodyConstitution` → `bodyConstitutionEnc` として保存
- `UserSettings.lifestyle` → `lifestyleEnc` として保存
- `DailyState.freeMemo`（オプション）
- `MealLog.text`（オプション）

※ 暗号化フィールドはDB上で別カラムとして保存し、アプリケーション層で透過的に処理

### 暗号化方式
```typescript
// Web Crypto API使用
interface EncryptionService {
  // 初期化（キー生成または取得）
  async initialize(): Promise<void>
  
  // 暗号化
  async encrypt(data: string): Promise<string>
  
  // 復号化
  async decrypt(encryptedData: string): Promise<string>
  
  // キーのエクスポート（バックアップ用）
  async exportKey(): Promise<string>
  
  // キーのインポート（復元用）
  async importKey(keyData: string): Promise<void>
}
```

---

## 6. データ同期戦略（将来拡張）

### 同期フラグ管理
```typescript
type SyncStatus = 'local' | 'synced' | 'pending' | 'conflict'

interface SyncMetadata {
  syncStatus: SyncStatus
  lastSyncAt?: Date
  remoteId?: string // Supabase上のID
  conflictResolution?: 'local' | 'remote' | 'merge'
}
```

### マイグレーションパス
1. **Phase 1**: IndexedDB（現在）
2. **Phase 2**: IndexedDB + オプションのクラウド同期
3. **Phase 3**: SQLite（WA-SQLite）+ Supabase

---

## 7. データ取得パターン

### 日付ベースのクエリ
```typescript
// 今日のデータ取得（主キーを活用）
async function getTodayData(dateKey: string) {
  const [dailyState, meals, plans, weights] = await Promise.all([
    // dateKeyが主キーなので直接get可能
    db.dailyStates.get(dateKey),
    db.mealLogs.where('dateKey').equals(dateKey).toArray(),
    db.foodPlans.where('dateKey').equals(dateKey).toArray(),
    db.weightLogs.where('dateKey').equals(dateKey).first()
  ]);
  
  return { dailyState, meals, plans, weights };
}

// 今日の状態をupsert（主キーを活用）
async function upsertTodayState(dateKey: string, condition: Partial<DailyState>) {
  await db.dailyStates.put({
    ...condition,
    dateKey,
    actualDate: new Date(),
    updatedAt: new Date()
  });
}
```

### リセット時間を考慮した日付キー生成
```typescript
function getDateKey(date: Date, resetTime: string): string {
  const [hours, minutes] = resetTime.split(':').map(Number);
  const resetDate = new Date(date);
  
  // リセット時間前なら前日扱い
  if (date.getHours() < hours || 
      (date.getHours() === hours && date.getMinutes() < minutes)) {
    resetDate.setDate(resetDate.getDate() - 1);
  }
  
  return resetDate.toISOString().split('T')[0];
}
```

---

## 8. パフォーマンス最適化

### インデックス戦略
- `dateKey`による高速検索
- 複合インデックス`[dateKey+mealType]`で食事タイプ別取得
- `createdAt`でソート済み取得

### キャッシュ戦略
- React Query / TanStack Queryでメモリキャッシュ
- 頻繁にアクセスされる設定値は Context で保持

### データ圧縮（将来検討）
- 古いデータの圧縮保存
- 画像データのサムネイル生成

---

## 9. エラーハンドリング

### データ整合性チェック
```typescript
interface DataValidation {
  // dateKeyの妥当性チェック
  validateDateKey(dateKey: string): boolean
  
  // 必須フィールドチェック
  validateRequired<T>(data: T, fields: (keyof T)[]): boolean
  
  // 暗号化データの整合性
  validateEncrypted(data: string): boolean
}
```

### リカバリー戦略
- 暗号化失敗時は **fail-closed**（保存を中止しエラーをユーザーに通知）
- 同期失敗時はローカル優先
- データ破損時は自動バックアップから復元
- 暗号化データの復号に失敗した場合はエラーを通知（データを露出しない）