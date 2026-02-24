// User profile and settings related types

export type BodyConstitutionTag = 
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
  
  // その他
  | 'prone_to_headaches' // 頭痛持ち
  | 'skin_problems' // 肌荒れしやすい
  | 'sleep_issues' // 睡眠障害
  | 'sensitive_to_caffeine' // カフェインに敏感
  | 'water_retention'; // 水分を溜めやすい

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
  | 'non_drinker'; // 飲酒しない

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

// フェーズ21: ゴールモード（3つのシンプルなモード）
export type GoalMode = 'CUT' | 'MAINTAIN' | 'GAIN';

// 制約タイプ（センシティブな情報）
export type ConstraintType = 
  | 'pregnancy'      // 妊娠中
  | 'breastfeeding' // 授乳中
  | 'hormone_ftm'   // ホルモン療法（FTM）
  | 'hormone_mtf'   // ホルモン療法（MTF）
  | 'medical';      // その他医療的制約

// GAINモード専用の検知タグ
export type GainDetectionTag = 
  | 'low_total_intake'      // 総量不足
  | 'low_meal_frequency'    // 回数不足
  | 'early_fullness'        // すぐ満腹
  | 'low_protein'          // タンパク不足
  | 'low_energy_density';  // 低密度（サラダばかり等）

// ゴールモード設定
export interface GoalModeConfig {
  mode: GoalMode;
  priorities: string[];
  detectionTags: string[];
  adjustmentRules?: string[];
}

// 制約レイヤー設定
export interface ConstraintLayer {
  type: ConstraintType;
  safetyFilters: string[];
  nutritionFocus: string[];
  warningSignals: string[];
}

export interface UserProfile {
  // 性別関連情報（包括的設計）
  assignedSexAtBirth?: 'male' | 'female'; // 出生時に割り当てられた性別（任意）
  currentHormoneStatus?: HormoneStatus; // 現在のホルモン状態（任意）
  hormoneTherapyDuration?: HormoneTherapyDuration; // ホルモン治療期間
  
  // 身体情報
  height?: number; // cm単位
  birthYear?: number; // 生年（年齢を計算）
  
  // 現在の状態
  currentWeight?: number; // kg単位（最新の体重とは別管理）
  activityLevel?: ActivityLevel; // 活動レベル
  
  // 目標設定
  goalType?: string; // 目標タイプ（health, weight_loss, weight_gain等）
  targetWeight?: number; // 目標体重（kg単位）
  goalPeriod?: string; // 目標期間（1_month, 3_months, 6_months, 1_year, no_limit）
  
  // フェーズ21: 拡張目標設定
  goalMode?: GoalMode; // シンプルな3モード
  goalDetails?: {
    targetWeight?: number;
    targetDate?: Date;
    weeklyTarget?: number; // kg/週
  };
  
  // 制約条件（センシティブ情報）
  constraints?: ConstraintType[];
  constraintDetails?: {
    pregnancyWeek?: number;
    hormoneStartDate?: Date;
    medicalNotes?: string;
  };
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
  
  // 食材の好み（暗号化対象）
  favoriteFoods?: string[]; // 好きな食材・料理
  dislikedFoods?: string[]; // 嫌い・アレルギーのある食材
  
  // フェーズ21: ゴール関連設定
  goalMode?: GoalMode; // CUT/MAINTAIN/GAIN
  constraints?: ConstraintType[]; // 制約条件
  constraintDetails?: {
    pregnancyWeek?: number;
    hormoneStartDate?: Date;
    medicalNotes?: string;
  };
  
  // 自由記載
  additionalNotes?: string; // その他の情報（任意）
  
  // システム管理
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
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