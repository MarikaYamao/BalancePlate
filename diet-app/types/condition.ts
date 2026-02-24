// Daily condition and state related types

export type ConditionTag = 
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
  
  // 今日の予定
  | 'dining_out' // 外食予定
  | 'drinking_planned' // 飲み会予定
  | 'exercise_planned' // 運動予定
  | 'travel_day' // 移動多い日
  | 'work_from_home' // 在宅日
  | 'hangover'; // 二日酔い

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