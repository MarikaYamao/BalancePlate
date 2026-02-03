// Repository classes import
import { BaseRepository } from './baseRepository';
import { UserSettingsRepository } from './userSettingsRepository';
import { DailyStateRepository } from './dailyStateRepository';
import { MealLogRepository } from './mealLogRepository';
import { FoodPlanRepository } from './foodPlanRepository';
import { EncryptedUserSettingsRepository } from './encryptedUserSettingsRepository';
import { EncryptedDailyStateRepository } from './encryptedDailyStateRepository';

// Repository classes export
export { 
  BaseRepository, 
  UserSettingsRepository, 
  DailyStateRepository, 
  MealLogRepository,
  FoodPlanRepository,
  EncryptedUserSettingsRepository,
  EncryptedDailyStateRepository
};

// Repository instances export (シングルトンパターン)
export const userSettingsRepository = new UserSettingsRepository();
export const dailyStateRepository = new DailyStateRepository();
export const mealLogRepository = new MealLogRepository();
export const foodPlanRepository = new FoodPlanRepository();

// 暗号化対応のリポジトリインスタンス
export const encryptedUserSettingsRepository = new EncryptedUserSettingsRepository();
export const encryptedDailyStateRepository = new EncryptedDailyStateRepository();

// Type exports
export type { UserSettingsInput } from './userSettingsRepository';
export type { DailyStateInput } from './dailyStateRepository';
export type { MealLogInput, MealAnalysis } from './mealLogRepository';
export type { FoodPlanInput } from './foodPlanRepository';