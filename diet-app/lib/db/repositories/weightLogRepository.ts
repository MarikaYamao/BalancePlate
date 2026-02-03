import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { BaseRepository } from './baseRepository';
import type { WeightLog } from '@/types';
import { getTodayKey } from '@/lib/utils/dateUtils';

export interface WeightLogInput {
  dateKey?: string; // 省略時は今日
  weight: number; // kg単位、小数点1位まで
  note?: string; // メモ
  measurementTiming?: 'morning' | 'night' | 'other';
}

export class WeightLogRepository extends BaseRepository {
  /**
   * 体重記録を保存
   */
  async save(input: WeightLogInput, resetTime: string = '04:00'): Promise<WeightLog> {
    try {
      this.validateRequired(input, ['weight']);
      
      if (input.weight <= 0 || input.weight > 1000) {
        throw new Error('Weight must be between 0.1 and 1000 kg');
      }

      const dateKey = input.dateKey || getTodayKey(resetTime);
      this.validateDateKey(dateKey);

      const now = new Date();
      const id = uuidv4();
      
      const weightLog: WeightLog = {
        id,
        timestamp: now,
        dateKey,
        weight: Math.round(input.weight * 10) / 10, // 小数点1位まで
        note: input.note?.trim() || '',
        measurementTiming: input.measurementTiming || 'other',
        createdAt: now,
        updatedAt: now
      };

      await db.weightLogs.add(weightLog);
      
      return weightLog;
    } catch (error) {
      this.handleError('WeightLog save', error);
    }
  }

  /**
   * 体重記録を更新
   */
  async update(id: string, updates: Partial<WeightLogInput>): Promise<WeightLog> {
    try {
      this.validateUuid(id);
      
      const existing = await db.weightLogs.get(id);
      if (!existing || existing.deletedAt) {
        throw new Error(`WeightLog not found: ${id}`);
      }

      if (updates.weight !== undefined) {
        if (updates.weight <= 0 || updates.weight > 1000) {
          throw new Error('Weight must be between 0.1 and 1000 kg');
        }
        updates.weight = Math.round(updates.weight * 10) / 10;
      }

      const updated: WeightLog = {
        ...existing,
        ...updates,
        note: updates.note !== undefined ? updates.note.trim() : existing.note,
        updatedAt: new Date()
      };

      await db.weightLogs.update(id, updated);
      
      return updated;
    } catch (error) {
      this.handleError('WeightLog update', error);
    }
  }

  /**
   * 体重記録を取得
   */
  async get(id: string): Promise<WeightLog | null> {
    try {
      this.validateUuid(id);
      
      const weightLog = await db.weightLogs.get(id);
      
      // 論理削除されていないかチェック
      if (weightLog && weightLog.deletedAt) {
        return null;
      }
      
      return weightLog || null;
    } catch (error) {
      this.handleError('WeightLog get', error);
    }
  }

  /**
   * 特定日の体重記録を取得
   */
  async getByDate(dateKey: string): Promise<WeightLog[]> {
    try {
      this.validateDateKey(dateKey);
      
      const weightLogs = await db.weightLogs
        .where('dateKey')
        .equals(dateKey)
        .sortBy('timestamp');
      
      return this.filterDeleted(weightLogs);
    } catch (error) {
      this.handleError('WeightLog getByDate', error);
    }
  }

  /**
   * 今日の体重記録を取得
   */
  async getToday(resetTime: string = '04:00'): Promise<WeightLog[]> {
    try {
      const todayKey = getTodayKey(resetTime);
      return await this.getByDate(todayKey);
    } catch (error) {
      this.handleError('WeightLog getToday', error);
    }
  }

  /**
   * 特定日の最新の体重を取得
   */
  async getLatestByDate(dateKey: string): Promise<WeightLog | null> {
    try {
      this.validateDateKey(dateKey);
      
      const weightLogs = await this.getByDate(dateKey);
      
      return weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;
    } catch (error) {
      this.handleError('WeightLog getLatestByDate', error);
    }
  }

  /**
   * 今日の最新の体重を取得
   */
  async getLatestToday(resetTime: string = '04:00'): Promise<WeightLog | null> {
    try {
      const todayKey = getTodayKey(resetTime);
      return await this.getLatestByDate(todayKey);
    } catch (error) {
      this.handleError('WeightLog getLatestToday', error);
    }
  }

  /**
   * 期間内の体重記録を取得
   */
  async getByDateRange(startKey: string, endKey: string): Promise<WeightLog[]> {
    try {
      this.validateDateKey(startKey);
      this.validateDateKey(endKey);
      
      const weightLogs = await db.weightLogs
        .where('dateKey')
        .between(startKey, endKey, true, true)
        .sortBy('timestamp');
      
      return this.filterDeleted(weightLogs);
    } catch (error) {
      this.handleError('WeightLog getByDateRange', error);
    }
  }

  /**
   * 最新のN件を取得
   */
  async getRecent(count: number = 10): Promise<WeightLog[]> {
    try {
      const weightLogs = await db.weightLogs
        .orderBy('timestamp')
        .reverse()
        .limit(count)
        .toArray();
      
      return this.filterDeleted(weightLogs);
    } catch (error) {
      this.handleError('WeightLog getRecent', error);
    }
  }

  /**
   * 日別の最新体重を取得（グラフ用）
   */
  async getDailyLatest(startKey: string, endKey: string): Promise<Array<{ dateKey: string; weight: number; timestamp: Date }>> {
    try {
      this.validateDateKey(startKey);
      this.validateDateKey(endKey);
      
      const allLogs = await this.getByDateRange(startKey, endKey);
      
      // 日付ごとにグループ化し、最新の体重を取得
      const dailyMap = new Map<string, WeightLog>();
      
      for (const log of allLogs) {
        const existing = dailyMap.get(log.dateKey);
        if (!existing || log.timestamp > existing.timestamp) {
          dailyMap.set(log.dateKey, log);
        }
      }
      
      // ソートして返す
      return Array.from(dailyMap.values())
        .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
        .map(log => ({
          dateKey: log.dateKey,
          weight: log.weight,
          timestamp: log.timestamp
        }));
    } catch (error) {
      this.handleError('WeightLog getDailyLatest', error);
    }
  }

  /**
   * 体重の統計情報を取得
   */
  async getStats(startKey?: string, endKey?: string): Promise<{
    count: number;
    latest?: number;
    min?: number;
    max?: number;
    average?: number;
    firstWeight?: number;
    lastWeight?: number;
    change?: number;
  }> {
    try {
      let weightLogs: WeightLog[];
      
      if (startKey && endKey) {
        this.validateDateKey(startKey);
        this.validateDateKey(endKey);
        weightLogs = await this.getByDateRange(startKey, endKey);
      } else {
        weightLogs = await db.weightLogs
          .orderBy('timestamp')
          .toArray()
          .then(logs => this.filterDeleted(logs));
      }

      if (weightLogs.length === 0) {
        return { count: 0 };
      }

      const weights = weightLogs.map(log => log.weight);
      const sortedLogs = weightLogs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      return {
        count: weightLogs.length,
        latest: weights[weights.length - 1],
        min: Math.min(...weights),
        max: Math.max(...weights),
        average: Math.round((weights.reduce((sum, w) => sum + w, 0) / weights.length) * 10) / 10,
        firstWeight: sortedLogs[0].weight,
        lastWeight: sortedLogs[sortedLogs.length - 1].weight,
        change: Math.round((sortedLogs[sortedLogs.length - 1].weight - sortedLogs[0].weight) * 10) / 10
      };
    } catch (error) {
      this.handleError('WeightLog getStats', error);
    }
  }

  /**
   * 特定日に体重記録があるかチェック
   */
  async existsByDate(dateKey: string): Promise<boolean> {
    try {
      this.validateDateKey(dateKey);
      
      const count = await db.weightLogs
        .where('dateKey')
        .equals(dateKey)
        .and(log => !log.deletedAt)
        .count();
      
      return count > 0;
    } catch (error) {
      this.handleError('WeightLog existsByDate', error);
    }
  }

  /**
   * 体重記録を論理削除
   */
  async delete(id: string): Promise<void> {
    try {
      this.validateUuid(id);
      
      const existing = await db.weightLogs.get(id);
      if (existing) {
        const deleted = this.markAsDeleted(existing);
        await db.weightLogs.put(deleted);
      }
    } catch (error) {
      this.handleError('WeightLog delete', error);
    }
  }

  /**
   * 期間内の体重記録を一括論理削除
   */
  async deleteRange(startKey: string, endKey: string): Promise<void> {
    try {
      this.validateDateKey(startKey);
      this.validateDateKey(endKey);
      
      await db.weightLogs
        .where('dateKey')
        .between(startKey, endKey, true, true)
        .modify({ deletedAt: new Date() });
    } catch (error) {
      this.handleError('WeightLog deleteRange', error);
    }
  }

  /**
   * CSVエクスポート用データを取得
   */
  async getExportData(startKey?: string, endKey?: string): Promise<string> {
    try {
      let weightLogs: WeightLog[];
      
      if (startKey && endKey) {
        this.validateDateKey(startKey);
        this.validateDateKey(endKey);
        weightLogs = await this.getByDateRange(startKey, endKey);
      } else {
        weightLogs = await db.weightLogs
          .orderBy('timestamp')
          .toArray()
          .then(logs => this.filterDeleted(logs));
      }

      const header = 'Date,Time,Weight(kg),Timing,Note\n';
      const rows = weightLogs.map(log => {
        const date = log.timestamp.toLocaleDateString('ja-JP');
        const time = log.timestamp.toLocaleTimeString('ja-JP');
        const timing = log.measurementTiming || 'other';
        const note = (log.note || '').replace(/"/g, '""'); // CSV用エスケープ
        
        return `"${date}","${time}",${log.weight},"${timing}","${note}"`;
      }).join('\n');
      
      return header + rows;
    } catch (error) {
      this.handleError('WeightLog getExportData', error);
    }
  }
}