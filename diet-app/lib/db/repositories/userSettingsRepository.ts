import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { BaseRepository } from './baseRepository';
import type { UserSettings, BodyConstitutionTag, LifestyleTag, UserProfile } from '@/types';

export interface UserSettingsInput {
  dayResetTime: string;
  mealsPerDay: 2 | 3;
  profile?: UserProfile;
  bodyConstitution: BodyConstitutionTag[];
  lifestyle: LifestyleTag[];
  onboardingCompleted: boolean;
}

export class UserSettingsRepository extends BaseRepository {
  /**
   * ユーザー設定を保存
   */
  async save(input: UserSettingsInput): Promise<UserSettings> {
    try {
      // 入力検証
      this.validateRequired(input, ['dayResetTime', 'mealsPerDay', 'bodyConstitution', 'lifestyle', 'onboardingCompleted']);
      
      // リセット時間の形式チェック
      if (!/^\d{2}:\d{2}$/.test(input.dayResetTime)) {
        throw new Error('Invalid dayResetTime format. Expected HH:MM');
      }

      const now = new Date();
      const id = uuidv4();
      
      const userSettings: UserSettings = {
        id,
        dayResetTime: input.dayResetTime,
        mealsPerDay: input.mealsPerDay,
        profile: input.profile,
        bodyConstitution: input.bodyConstitution,
        lifestyle: input.lifestyle,
        onboardingCompleted: input.onboardingCompleted,
        createdAt: now,
        updatedAt: now
      };

      // 既存の設定があれば削除（単一ユーザー前提）
      await db.userSettings.clear();
      
      // 新しい設定を保存
      await db.userSettings.add(userSettings);
      
      return userSettings;
    } catch (error) {
      this.handleError('UserSettings save', error);
    }
  }

  /**
   * ユーザー設定を更新
   */
  async update(id: string, updates: Partial<UserSettingsInput>): Promise<UserSettings> {
    try {
      this.validateUuid(id);
      
      const existing = await db.userSettings.get(id);
      if (!existing) {
        throw new Error(`UserSettings not found: ${id}`);
      }

      const updatedSettings: UserSettings = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      };

      await db.userSettings.update(id, updatedSettings);
      
      return updatedSettings;
    } catch (error) {
      this.handleError('UserSettings update', error);
    }
  }

  /**
   * ユーザー設定を取得
   */
  async get(): Promise<UserSettings | null> {
    try {
      // 最新の設定を取得（単一ユーザー前提）
      const settings = await db.userSettings
        .orderBy('createdAt')
        .reverse()
        .first();
      
      return settings || null;
    } catch (error) {
      this.handleError('UserSettings get', error);
    }
  }

  /**
   * ユーザー設定が存在するかチェック
   */
  async exists(): Promise<boolean> {
    try {
      const count = await db.userSettings.count();
      return count > 0;
    } catch (error) {
      this.handleError('UserSettings exists', error);
    }
  }

  /**
   * オンボーディング完了状態を取得
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const settings = await this.get();
      return settings?.onboardingCompleted ?? false;
    } catch (error) {
      this.handleError('UserSettings isOnboardingCompleted', error);
    }
  }

  /**
   * オンボーディング完了状態を更新
   */
  async completeOnboarding(): Promise<void> {
    try {
      const settings = await this.get();
      if (settings) {
        await this.update(settings.id, { onboardingCompleted: true });
      }
    } catch (error) {
      this.handleError('UserSettings completeOnboarding', error);
    }
  }

  /**
   * リセット時間を取得
   */
  async getResetTime(): Promise<string> {
    try {
      const settings = await this.get();
      return settings?.dayResetTime ?? '04:00';
    } catch (error) {
      this.handleError('UserSettings getResetTime', error);
    }
  }

  /**
   * 食事回数を取得
   */
  async getMealsPerDay(): Promise<2 | 3> {
    try {
      const settings = await this.get();
      return settings?.mealsPerDay ?? 3;
    } catch (error) {
      this.handleError('UserSettings getMealsPerDay', error);
    }
  }

  /**
   * すべてのユーザー設定を削除
   */
  async deleteAll(): Promise<void> {
    try {
      await db.userSettings.clear();
    } catch (error) {
      this.handleError('UserSettings deleteAll', error);
    }
  }
}