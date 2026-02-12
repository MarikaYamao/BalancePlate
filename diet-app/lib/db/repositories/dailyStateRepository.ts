import { db } from '../database';
import { BaseRepository } from './baseRepository';
import type { DailyState, ConditionTag } from '@/types';
import { getTodayKey, getDateKey } from '@/lib/utils/dateUtils';

export interface DailyStateInput {
  dateKey?: string; // 省略時は今日
  conditionTags: ConditionTag[];
  freeMemo: string;
  activityMemo?: string;
}

export class DailyStateRepository extends BaseRepository {
  /**
   * 日次状態を保存または更新（upsert）
   */
  async upsert(input: DailyStateInput, resetTime: string = '04:00'): Promise<DailyState> {
    try {
      const dateKey = input.dateKey || getTodayKey(resetTime);
      this.validateDateKey(dateKey);

      const now = new Date();
      
      // 既存のレコードを確認
      const existing = await db.dailyStates.get(dateKey);
      
      if (existing) {
        // 更新
        const updated: DailyState = {
          ...existing,
          conditionTags: input.conditionTags,
          freeMemo: input.freeMemo,
          activityMemo: input.activityMemo,
          updatedAt: now
        };
        
        await db.dailyStates.put(updated);
        return updated;
      } else {
        // 新規作成
        const dailyState: DailyState = {
          dateKey,
          actualDate: now,
          conditionTags: input.conditionTags,
          freeMemo: input.freeMemo,
          activityMemo: input.activityMemo,
          createdAt: now,
          updatedAt: now
        };
        
        await db.dailyStates.put(dailyState);
        return dailyState;
      }
    } catch (error) {
      this.handleError('DailyState upsert', error);
    }
  }

  /**
   * 日次状態を取得
   */
  async get(dateKey: string): Promise<DailyState | null> {
    try {
      this.validateDateKey(dateKey);
      
      const state = await db.dailyStates.get(dateKey);
      
      // 論理削除されていないかチェック
      if (state && state.deletedAt) {
        return null;
      }
      
      return state || null;
    } catch (error) {
      this.handleError('DailyState get', error);
    }
  }

  /**
   * 今日の状態を取得
   */
  async getToday(resetTime: string = '04:00'): Promise<DailyState | null> {
    try {
      const todayKey = getTodayKey(resetTime);
      return await this.get(todayKey);
    } catch (error) {
      this.handleError('DailyState getToday', error);
    }
  }

  /**
   * 期間内の日次状態を取得
   */
  async getByDateRange(startKey: string, endKey: string): Promise<DailyState[]> {
    try {
      this.validateDateKey(startKey);
      this.validateDateKey(endKey);
      
      const states = await db.dailyStates
        .where('dateKey')
        .between(startKey, endKey, true, true)
        .toArray();
      
      // 論理削除されていないもののみ返す
      return this.filterDeleted(states);
    } catch (error) {
      this.handleError('DailyState getByDateRange', error);
    }
  }

  /**
   * 最新のN件を取得
   */
  async getRecent(count: number = 7): Promise<DailyState[]> {
    try {
      const states = await db.dailyStates
        .orderBy('dateKey')
        .reverse()
        .limit(count)
        .toArray();
      
      return this.filterDeleted(states);
    } catch (error) {
      this.handleError('DailyState getRecent', error);
    }
  }

  /**
   * 今日の状態が存在するかチェック
   */
  async existsToday(resetTime: string = '04:00'): Promise<boolean> {
    try {
      const todayKey = getTodayKey(resetTime);
      const state = await this.get(todayKey);
      return state !== null;
    } catch (error) {
      this.handleError('DailyState existsToday', error);
    }
  }

  /**
   * 全ての日次状態を取得 (バックアップ用)
   */
  async getAll(): Promise<DailyState[]> {
    try {
      const states = await db.dailyStates.toArray();
      return this.filterDeleted(states);
    } catch (error) {
      this.handleError('DailyState getAll', error);
    }
  }

  /**
   * 全データをクリア (バックアップ復元時に使用)
   */
  async clearAll(): Promise<void> {
    try {
      await db.dailyStates.clear();
    } catch (error) {
      this.handleError('DailyState clearAll', error);
    }
  }

  /**
   * コンディションタグの統計を取得
   */
  async getConditionStats(days: number = 30): Promise<Record<ConditionTag, number>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      const startKey = getDateKey(startDate);
      const endKey = getDateKey(endDate);
      
      const states = await this.getByDateRange(startKey, endKey);
      
      const stats: Record<string, number> = {};
      
      states.forEach(state => {
        state.conditionTags.forEach(tag => {
          stats[tag] = (stats[tag] || 0) + 1;
        });
      });
      
      return stats as Record<ConditionTag, number>;
    } catch (error) {
      this.handleError('DailyState getConditionStats', error);
    }
  }

  /**
   * 日次状態を論理削除
   */
  async delete(dateKey: string): Promise<void> {
    try {
      this.validateDateKey(dateKey);
      
      const existing = await db.dailyStates.get(dateKey);
      if (existing) {
        const deleted = this.markAsDeleted(existing);
        await db.dailyStates.put(deleted);
      }
    } catch (error) {
      this.handleError('DailyState delete', error);
    }
  }

  /**
   * 期間内の日次状態を一括論理削除
   */
  async deleteRange(startKey: string, endKey: string): Promise<void> {
    try {
      this.validateDateKey(startKey);
      this.validateDateKey(endKey);
      
      await db.dailyStates
        .where('dateKey')
        .between(startKey, endKey, true, true)
        .modify({ deletedAt: new Date() });
    } catch (error) {
      this.handleError('DailyState deleteRange', error);
    }
  }
}