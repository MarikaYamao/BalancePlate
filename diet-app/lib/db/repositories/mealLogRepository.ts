import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { BaseRepository } from './baseRepository';
import type { MealLog, MealType, NutrientEstimate } from '@/types';
import { getTodayKey } from '@/lib/utils/dateUtils';

export interface MealLogInput {
  dateKey?: string; // 省略時は今日
  mealType: MealType;
  text: string;
  followedPlan?: boolean;
  planId?: string;
}

export interface MealAnalysis {
  estimatedNutrients?: NutrientEstimate;
  suggestions?: string[];
}

export class MealLogRepository extends BaseRepository {
  /**
   * 食事記録を保存
   */
  async save(input: MealLogInput, resetTime: string = '04:00'): Promise<MealLog> {
    try {
      this.validateRequired(input, ['mealType', 'text']);
      
      if (input.text.trim().length === 0) {
        throw new Error('Meal text cannot be empty');
      }

      const dateKey = input.dateKey || getTodayKey(resetTime);
      this.validateDateKey(dateKey);

      if (input.planId) {
        this.validateUuid(input.planId);
      }

      const now = new Date();
      const id = uuidv4();
      
      const mealLog: MealLog = {
        id,
        dateKey,
        mealType: input.mealType,
        actualTime: now,
        text: input.text.trim(),
        followedPlan: input.followedPlan,
        planId: input.planId,
        createdAt: now,
        updatedAt: now
      };

      await db.mealLogs.add(mealLog);
      
      return mealLog;
    } catch (error) {
      this.handleError('MealLog save', error);
    }
  }

  /**
   * 食事記録を更新
   */
  async update(id: string, updates: Partial<MealLogInput>): Promise<MealLog> {
    try {
      this.validateUuid(id);
      
      const existing = await db.mealLogs.get(id);
      if (!existing || existing.deletedAt) {
        throw new Error(`MealLog not found: ${id}`);
      }

      const updateData = {
        ...updates,
        text: updates.text ? updates.text.trim() : undefined,
        updatedAt: new Date()
      };

      await db.mealLogs.update(id, updateData);
      
      const updated = await db.mealLogs.get(id);
      
      return updated!;
    } catch (error) {
      this.handleError('MealLog update', error);
    }
  }

  /**
   * AI分析結果を追加
   */
  async addAnalysis(id: string, analysis: MealAnalysis): Promise<void> {
    try {
      this.validateUuid(id);
      
      await db.mealLogs.update(id, {
        aiAnalysis: {
          ...analysis,
          analyzedAt: new Date()
        }
      });
    } catch (error) {
      this.handleError('MealLog addAnalysis', error);
    }
  }

  /**
   * 食事記録を取得
   */
  async get(id: string): Promise<MealLog | null> {
    try {
      this.validateUuid(id);
      
      const meal = await db.mealLogs.get(id);
      
      // 論理削除されていないかチェック
      if (meal && meal.deletedAt) {
        return null;
      }
      
      return meal || null;
    } catch (error) {
      this.handleError('MealLog get', error);
    }
  }

  /**
   * 特定日の食事記録を取得
   */
  async getByDate(dateKey: string): Promise<MealLog[]> {
    try {
      this.validateDateKey(dateKey);
      
      const meals = await db.mealLogs
        .where('dateKey')
        .equals(dateKey)
        .sortBy('actualTime');
      
      return this.filterDeleted(meals);
    } catch (error) {
      this.handleError('MealLog getByDate', error);
    }
  }

  /**
   * 今日の食事記録を取得
   */
  async getToday(resetTime: string = '04:00'): Promise<MealLog[]> {
    try {
      const todayKey = getTodayKey(resetTime);
      return await this.getByDate(todayKey);
    } catch (error) {
      this.handleError('MealLog getToday', error);
    }
  }

  /**
   * 特定日の特定食事タイプの記録を取得
   */
  async getByDateAndType(dateKey: string, mealType: MealType): Promise<MealLog[]> {
    try {
      this.validateDateKey(dateKey);
      
      const meals = await db.mealLogs
        .where('[dateKey+mealType]')
        .equals([dateKey, mealType])
        .sortBy('actualTime');
      
      return this.filterDeleted(meals);
    } catch (error) {
      this.handleError('MealLog getByDateAndType', error);
    }
  }

  /**
   * 期間内の食事記録を取得
   */
  async getByDateRange(startKey: string, endKey: string): Promise<MealLog[]> {
    try {
      this.validateDateKey(startKey);
      this.validateDateKey(endKey);
      
      const meals = await db.mealLogs
        .where('dateKey')
        .between(startKey, endKey, true, true)
        .sortBy('actualTime');
      
      return this.filterDeleted(meals);
    } catch (error) {
      this.handleError('MealLog getByDateRange', error);
    }
  }

  /**
   * 全ての食事記録を取得 (バックアップ用)
   */
  async getAll(): Promise<MealLog[]> {
    try {
      const meals = await db.mealLogs.toArray();
      return this.filterDeleted(meals);
    } catch (error) {
      this.handleError('MealLog getAll', error);
    }
  }

  /**
   * 全データをクリア (バックアップ復元時に使用)
   */
  async clearAll(): Promise<void> {
    try {
      await db.mealLogs.clear();
    } catch (error) {
      this.handleError('MealLog clearAll', error);
    }
  }

  /**
   * 最新のN件を取得
   */
  async getRecent(count: number = 10): Promise<MealLog[]> {
    try {
      const meals = await db.mealLogs
        .orderBy('actualTime')
        .reverse()
        .limit(count)
        .toArray();
      
      return this.filterDeleted(meals);
    } catch (error) {
      this.handleError('MealLog getRecent', error);
    }
  }

  /**
   * 特定日に特定食事タイプの記録があるかチェック
   */
  async existsByDateAndType(dateKey: string, mealType: MealType): Promise<boolean> {
    try {
      this.validateDateKey(dateKey);
      
      const count = await db.mealLogs
        .where('[dateKey+mealType]')
        .equals([dateKey, mealType])
        .and(meal => !meal.deletedAt)
        .count();
      
      return count > 0;
    } catch (error) {
      this.handleError('MealLog existsByDateAndType', error);
    }
  }

  /**
   * 今日の食事タイプ別記録状況を取得
   */
  async getTodayMealStatus(resetTime: string = '04:00'): Promise<Record<MealType, boolean>> {
    try {
      const todayKey = getTodayKey(resetTime);
      const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
      
      const status: Record<MealType, boolean> = {
        breakfast: false,
        lunch: false,
        dinner: false,
        snack: false
      };

      for (const mealType of mealTypes) {
        status[mealType] = await this.existsByDateAndType(todayKey, mealType);
      }

      return status;
    } catch (error) {
      this.handleError('MealLog getTodayMealStatus', error);
    }
  }

  /**
   * 食事記録を論理削除
   */
  async delete(id: string): Promise<void> {
    try {
      this.validateUuid(id);
      
      const existing = await db.mealLogs.get(id);
      if (existing) {
        const deleted = this.markAsDeleted(existing);
        await db.mealLogs.put(deleted);
      }
    } catch (error) {
      this.handleError('MealLog delete', error);
    }
  }

  /**
   * 期間内の食事記録を一括論理削除
   */
  async deleteRange(startKey: string, endKey: string): Promise<void> {
    try {
      this.validateDateKey(startKey);
      this.validateDateKey(endKey);
      
      await db.mealLogs
        .where('dateKey')
        .between(startKey, endKey, true, true)
        .modify({ deletedAt: new Date() });
    } catch (error) {
      this.handleError('MealLog deleteRange', error);
    }
  }
}