// Core type definitions for the diet app

export type BodyConstitutionTag = 
  // 循環・代謝
  | 'edema_prone' // むくみやすい
  | 'cold_sensitivity' // 冷えやすい
  | 'low_blood_pressure' // 低血圧
  | 'anemic' // 貧血気味
  
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
  
  // その他
  | 'prone_to_headaches' // 頭痛持ち
  | 'skin_problems' // 肌荒れしやすい
  | 'sleep_issues'; // 睡眠障害

export type LifestyleTag =
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
  
  // 医療・健康
  | 'taking_oral_contraceptives' // ピル服用中
  | 'hormone_therapy' // ホルモン治療中
  | 'taking_medications' // 投薬中
  | 'under_medical_treatment' // 治療中
  
  // 喫煙・飲酒
  | 'smoker' // 喫煙者
  | 'regular_drinker' // 習慣的飲酒
  | 'social_drinker' // 付き合い程度の飲酒
  | 'non_drinker'; // 飲酒しない

export type ConditionTag = 
  | 'period_before' // 生理前
  | 'period_during' // 生理中
  | 'period_after' // 生理後
  | 'tired' // 疲れている
  | 'stressed' // ストレスあり
  | 'sleepy' // 眠い
  | 'craving_sweet' // 甘いものが欲しい
  | 'stomach_weak' // 胃腸が弱っている
  | 'drinking_planned' // 飲酒予定
  | 'hangover'; // 二日酔い

export type HormoneStatus = 
  | 'male_dominant' // 男性ホルモンが優位
  | 'female_dominant' // 女性ホルモンが優位
  | 'in_transition' // ホルモン治療中（調整段階）
  | 'not_selected'; // 選択しない（デフォルト）

export type HormoneTherapyDuration = 
  | 'less_than_6_months' // 6か月未満
  | '6_to_12_months' // 6〜12か月
  | '12_to_24_months' // 12〜24か月
  | 'more_than_24_months'; // 24か月以上

export type ActivityLevel = 
  | 'sedentary' // ほとんど運動しない
  | 'light' // 軽い運動（週 1-2回）
  | 'moderate' // 中程度（週 3-5回）
  | 'active' // 活発（週 6-7回）
  | 'very_active'; // 非常に活発（アスリート等）

export type GoalType = 
  | 'weight_loss' // 減量
  | 'weight_gain' // 増量
  | 'maintain' // 維持
  | 'body_recomposition' // 体質改善（筋肉増、脂肪減）
  | 'health_improvement'; // 健康改善（数値目標なし）

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  // 性別関連情報（包括的設計）
  assignedSexAtBirth: 'male' | 'female'; // 出生時に割り当てられた性別（必須）
  currentHormoneStatus?: HormoneStatus; // 現在のホルモン状態（任意）
  hormoneTherapyDuration?: HormoneTherapyDuration; // ホルモン治療期間
  
  // 身体情報
  height?: number; // cm単位
  birthYear?: number; // 生年（年齢を計算）
  
  // 現在の状態
  currentWeight?: number; // kg単位（最新の体重とは別管理）
  activityLevel?: ActivityLevel; // 活動レベル
}

export interface UserSettings {
  id: string; // UUID
  
  // 基本設定
  dayResetTime: string; // "04:00" 形式
  mealsPerDay: 2 | 3; // 食事回数
  
  // 基本情報（暗号化対象）
  profile?: UserProfile;
  
  // 体質・身体傾向（暗号化対象）
  bodyConstitution: BodyConstitutionTag[];
  
  // 生活習慣（暗号化対象）
  lifestyle: LifestyleTag[];
  
  // システム管理
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyState {
  dateKey: string; // "2024-01-15" リセット時間基準（PRIMARY KEY）
  actualDate: Date; // 実際の記録日時
  
  // コンディション
  conditionTags: ConditionTag[];
  freeMemo: string; // 自由記述メモ
  
  // 運動・活動記録
  activityMemo?: string; // 運動・活動のメモ
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // 論理削除
}

export interface MealLog {
  id: string; // UUID
  
  // 日付・タイミング
  dateKey: string; // リセット時間基準の日付
  mealType: MealType;
  actualTime: Date; // 実際の食事時刻
  
  // 記録内容
  text: string; // 食事内容（自由記述）
  followedPlan?: boolean; // プランに従ったか
  planId?: string; // 従ったプランのID
  
  // AI分析結果（非同期で追加）
  aiAnalysis?: {
    estimatedNutrients?: NutrientEstimate;
    suggestions?: string[];
    analyzedAt: Date;
  };
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface NutrientEstimate {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface FoodPlan {
  dateKey: string; // 日付（PRIMARY KEYの一部）
  planType: 'A' | 'B' | 'C'; // プランタイプ（PRIMARY KEYの一部）
  planName: string; // "しっかり整えるプラン" など
  description: string; // プランの説明
  
  // 選択状態
  selected: boolean;
  selectedAt?: Date;
  
  // 食事提案内容
  meals: MealSuggestion[];
  
  // メタデータ
  createdAt: Date;
  expiresAt: Date; // プランの有効期限
}

export interface MealSuggestion {
  mealType: MealType;
  mainItems: string[]; // メイン料理
  sideItems: string[]; // 副菜
  notes?: string; // 注意点や理由
  alternatives?: string[]; // 代替案
}

export interface WeightLog {
  id: string; // UUID
  
  // 記録データ
  timestamp: Date;
  dateKey: string; // リセット時間基準
  weight: number; // kg単位、小数点1位まで
  
  // オプション情報
  note?: string; // メモ
  measurementTiming?: 'morning' | 'night' | 'other';
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface DietGoals {
  id: string; // UUID
  userId: string; // UserSettingsのID
  
  // 目標タイプ
  goalType: GoalType;
  
  // 数値目標
  targetWeight?: number; // 目標体重 (kg)
  targetDate?: Date; // 目標達成日
  weeklyWeightChangeTarget?: number; // 週間目標体重変化 (kg/週)
  
  // 行動目標
  dailyCalorieTarget?: number; // 1日のカロリー目標
  dailyProteinTarget?: number; // タンパク質目標 (g)
  dailyWaterTarget?: number; // 水分摂取目標 (ml)
  
  // モチベーション
  motivation?: string; // ダイエットの理由・動機
  milestones?: Milestone[]; // 中間目標
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  achievedAt?: Date; // 目標達成日
}

export interface Milestone {
  targetDate: Date;
  targetWeight?: number;
  description: string;
  achieved: boolean;
}