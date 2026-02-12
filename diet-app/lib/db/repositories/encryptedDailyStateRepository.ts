import { encryptedDb } from '../encryptedDatabase';
import { BaseRepository } from './baseRepository';
import type { DailyState, ConditionTag } from '@/types';
import { getTodayKey, getDateKey } from '@/lib/utils/dateUtils';

export interface DailyStateInput {
  dateKey?: string; // 省略時は今日
  conditionTags: ConditionTag[];
  freeMemo: string;
  activityMemo?: string;
}

/**
 * 暗号化対応のDailyStateリポジトリ
 * freeMemoフィールドは自動的に暗号化・復号化される
 */
export class EncryptedDailyStateRepository extends BaseRepository {
  /**
   * 日次状態を保存または更新（upsert）
   */
  async upsert(input: DailyStateInput, resetTime: string = '04:00'): Promise<DailyState> {
    try {
      const dateKey = input.dateKey || getTodayKey(resetTime);
      this.validateDateKey(dateKey);

      const now = new Date();
      
      // 既存のレコードを確認
      const existing = await encryptedDb.dailyStates.get(dateKey);
      
      if (existing) {
        // 更新（Dexieフックで自動的に暗号化される）
        const updated: DailyState = {
          ...existing,
          conditionTags: input.conditionTags,
          freeMemo: input.freeMemo,
          activityMemo: input.activityMemo,
          updatedAt: now
        };
        
        await encryptedDb.dailyStates.put(updated);
        return updated;
      } else {
        // 新規作成（Dexieフックで自動的に暗号化される）
        const dailyState: DailyState = {
          dateKey,
          actualDate: now,
          conditionTags: input.conditionTags,
          freeMemo: input.freeMemo,
          activityMemo: input.activityMemo,
          createdAt: now,
          updatedAt: now
        };
        
        await encryptedDb.dailyStates.put(dailyState);
        return dailyState;
      }
    } catch (error) {
      console.error('Repository upsert error:', error);
      throw error;
    }
  }

  /**
   * 日次状態を取得（復号化付き）
   */
  async get(dateKey: string): Promise<DailyState | null> {
    try {
      this.validateDateKey(dateKey);
      
      // 暗号化されたデータをそのまま取得
      const encryptedState = await encryptedDb.dailyStates.get(dateKey);
      
      if (!encryptedState) {
        return null;
      }
      
      // 論理削除されていないかチェック
      if (encryptedState.deletedAt) {
        return null;
      }
      
      // 手動で復号化を実行
      const { secureStore } = await import('@/lib/crypto/secureStore');
      const decryptedState = await secureStore.decryptDailyState(encryptedState);
      
      return decryptedState;
    } catch (error) {
      console.error('Repository get error:', error);
      return null;
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
      
      const states = await encryptedDb.dailyStates
        .where('dateKey')
        .between(startKey, endKey, true, true)
        .toArray();
      
      // 論理削除されていないもののみ返す
      return this.filterDeleted(states);
    } catch (error) {
      console.error('Repository getByDateRange error:', error);
      return [];
    }
  }

  /**
   * 最新のN件を取得
   */
  async getRecent(count: number = 7): Promise<DailyState[]> {
    try {
      const encryptedStates = await encryptedDb.dailyStates
        .orderBy('dateKey')
        .reverse()
        .limit(count)
        .toArray();
      
      const validStates = this.filterDeleted(encryptedStates);
      
      // 手動で復号化
      const { secureStore } = await import('@/lib/crypto/secureStore');
      const decryptedStates = await Promise.all(
        validStates.map(state => secureStore.decryptDailyState(state))
      );
      
      return decryptedStates;
    } catch (error) {
      console.error('Repository getRecent error:', error);
      return [];
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
      
      const existing = await encryptedDb.dailyStates.get(dateKey);
      if (existing) {
        const deleted = this.markAsDeleted(existing);
        await encryptedDb.dailyStates.put(deleted);
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
      
      await encryptedDb.dailyStates
        .where('dateKey')
        .between(startKey, endKey, true, true)
        .modify({ deletedAt: new Date() });
    } catch (error) {
      this.handleError('DailyState deleteRange', error);
    }
  }

  /**
   * 全ての日次状態を取得 (バックアップ用)
   */
  async getAll(): Promise<DailyState[]> {
    try {
      const states = await encryptedDb.dailyStates.toArray();
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
      await encryptedDb.dailyStates.clear();
    } catch (error) {
      this.handleError('DailyState clearAll', error);
    }
  }
}