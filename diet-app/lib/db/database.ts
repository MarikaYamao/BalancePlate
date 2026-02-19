import Dexie, { type Table } from 'dexie';
import type { 
  UserSettings, 
  DailyState, 
  MealLog, 
  FoodPlan, 
  WeightLog,
  DietGoals 
} from '@/types';

export class DietDatabase extends Dexie {
  // テーブル定義
  userSettings!: Table<UserSettings>;
  dailyStates!: Table<DailyState>;
  mealLogs!: Table<MealLog>;
  foodPlans!: Table<FoodPlan>;
  weightLogs!: Table<WeightLog>;
  dietGoals!: Table<DietGoals>;

  constructor() {
    super('DietDatabase');
    
    // データベーススキーマ定義
    this.version(1).stores({
      // UserSettings - 単一レコード（ユーザーごと）
      userSettings: 'id, onboardingCompleted, createdAt, updatedAt',
      
      // DailyState - dateKeyが主キー（日次で1件）
      dailyStates: 'dateKey, actualDate, createdAt, updatedAt',
      
      // MealLog - 食事記録
      mealLogs: 'id, dateKey, [dateKey+mealType], mealType, actualTime, createdAt',
      
      // FoodPlan - AI提案プラン（複合主キー: dateKey + planType）
      foodPlans: '[dateKey+planType], dateKey, planType, selected, createdAt',
      
      // WeightLog - 体重記録
      weightLogs: 'id, dateKey, timestamp, createdAt',
      
      // DietGoals - 目標設定
      dietGoals: 'id, userId, goalType, createdAt, updatedAt'
    });
    
    // Version 2: 食材の好み追加
    this.version(2).stores({
      userSettings: 'id, onboardingCompleted, createdAt, updatedAt',
      dailyStates: 'dateKey, actualDate, createdAt, updatedAt',
      mealLogs: 'id, dateKey, [dateKey+mealType], mealType, actualTime, createdAt',
      foodPlans: '[dateKey+planType], dateKey, planType, selected, createdAt',
      weightLogs: 'id, dateKey, timestamp, createdAt',
      dietGoals: 'id, userId, goalType, createdAt, updatedAt'
    }).upgrade(async trans => {
      // 既存のUserSettingsに新しいフィールドを追加
      await trans.userSettings.toCollection().modify(settings => {
        if (!settings.favoriteFoods) settings.favoriteFoods = [];
        if (!settings.dislikedFoods) settings.dislikedFoods = [];
      });
    });
  }
}

// データベースインスタンスのエクスポート
export const db = new DietDatabase();

// データベース初期化関数
export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// データベースのバージョン情報取得
export function getDatabaseInfo() {
  return {
    name: db.name,
    version: db.verno,
    isOpen: db.isOpen(),
    tables: db.tables.map(table => ({
      name: table.name,
      schema: table.schema
    }))
  };
}