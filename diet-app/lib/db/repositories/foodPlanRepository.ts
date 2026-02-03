import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { BaseRepository } from './baseRepository';
import type { FoodPlan, MealSuggestion } from '@/types';

export interface FoodPlanInput {
  dateKey: string;
  planType: 'A' | 'B' | 'C';
  planName: string;
  description: string;
  meals: MealSuggestion[];
}

export class FoodPlanRepository extends BaseRepository {
  /**
   * 食事プランを保存
   */
  async save(input: FoodPlanInput): Promise<FoodPlan> {
    try {
      this.validateRequired(input, ['dateKey', 'planType', 'planName', 'description', 'meals']);
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24時間後
      
      const foodPlan: FoodPlan = {
        dateKey: input.dateKey,
        planType: input.planType,
        planName: input.planName,
        description: input.description,
        selected: false,
        meals: input.meals,
        createdAt: now,
        expiresAt,
      };

      await db.foodPlans.put(foodPlan);
      
      return foodPlan;
    } catch (error) {
      this.handleError('FoodPlan save', error);
    }
  }

  /**
   * 複数のプランを一括保存
   */
  async saveMultiple(plans: FoodPlanInput[]): Promise<FoodPlan[]> {
    try {
      const savedPlans: FoodPlan[] = [];
      
      for (const plan of plans) {
        const savedPlan = await this.save(plan);
        savedPlans.push(savedPlan);
      }
      
      return savedPlans;
    } catch (error) {
      this.handleError('FoodPlan saveMultiple', error);
    }
  }

  /**
   * 日付別のプラン取得
   */
  async getByDate(dateKey: string): Promise<FoodPlan[]> {
    try {
      const plans = await db.foodPlans
        .where('dateKey')
        .equals(dateKey)
        .toArray();
      
      return plans.sort((a, b) => a.planType.localeCompare(b.planType));
    } catch (error) {
      this.handleError('FoodPlan getByDate', error);
    }
  }

  /**
   * 特定のプランを取得
   */
  async getByDateAndType(dateKey: string, planType: 'A' | 'B' | 'C'): Promise<FoodPlan | null> {
    try {
      const plan = await db.foodPlans
        .where('[dateKey+planType]')
        .equals([dateKey, planType])
        .first();
      
      return plan || null;
    } catch (error) {
      this.handleError('FoodPlan getByDateAndType', error);
    }
  }

  /**
   * プランを選択
   */
  async selectPlan(dateKey: string, planType: 'A' | 'B' | 'C'): Promise<void> {
    try {
      // 既存の選択をクリア
      await this.clearSelection(dateKey);
      
      // 指定されたプランを選択
      await db.foodPlans.update([dateKey, planType], {
        selected: true,
        selectedAt: new Date(),
      });
    } catch (error) {
      this.handleError('FoodPlan selectPlan', error);
    }
  }

  /**
   * 選択をクリア
   */
  async clearSelection(dateKey: string): Promise<void> {
    try {
      const plans = await this.getByDate(dateKey);
      
      for (const plan of plans) {
        if (plan.selected) {
          await db.foodPlans.update([dateKey, plan.planType], {
            selected: false,
            selectedAt: undefined,
          });
        }
      }
    } catch (error) {
      this.handleError('FoodPlan clearSelection', error);
    }
  }

  /**
   * 選択されたプランを取得
   */
  async getSelectedPlan(dateKey: string): Promise<FoodPlan | null> {
    try {
      const plans = await this.getByDate(dateKey);
      return plans.find(plan => plan.selected) || null;
    } catch (error) {
      this.handleError('FoodPlan getSelectedPlan', error);
    }
  }

  /**
   * 期限切れプランを削除
   */
  async cleanupExpired(): Promise<number> {
    try {
      const now = new Date();
      const expiredPlans = await db.foodPlans
        .where('expiresAt')
        .below(now)
        .toArray();
      
      if (expiredPlans.length > 0) {
        const keys = expiredPlans.map(plan => [plan.dateKey, plan.planType]);
        await db.foodPlans.bulkDelete(keys as any);
      }
      
      return expiredPlans.length;
    } catch (error) {
      this.handleError('FoodPlan cleanupExpired', error);
    }
  }

  /**
   * 日付のプランをすべて削除
   */
  async deleteByDate(dateKey: string): Promise<void> {
    try {
      const plans = await this.getByDate(dateKey);
      const keys = plans.map(plan => [plan.dateKey, plan.planType]);
      
      if (keys.length > 0) {
        await db.foodPlans.bulkDelete(keys as any);
      }
    } catch (error) {
      this.handleError('FoodPlan deleteByDate', error);
    }
  }

  /**
   * プラン統計取得
   */
  async getStats(): Promise<{
    totalPlans: number;
    selectedPlans: number;
    expiredPlans: number;
  }> {
    try {
      const now = new Date();
      const [totalPlans, selectedPlans, expiredPlans] = await Promise.all([
        db.foodPlans.count(),
        db.foodPlans.where('selected').equals(1).count(),
        db.foodPlans.where('expiresAt').below(now).count(),
      ]);

      return {
        totalPlans,
        selectedPlans,
        expiredPlans,
      };
    } catch (error) {
      this.handleError('FoodPlan getStats', error);
    }
  }
}