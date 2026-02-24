// Weight logging related types

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