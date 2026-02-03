import { v4 as uuidv4 } from 'uuid';
import { encryptedDb } from '../encryptedDatabase';
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

/**
 * 暗号化対応のUserSettingsリポジトリ
 * 個人情報フィールドは自動的に暗号化・復号化される
 */
export class EncryptedUserSettingsRepository extends BaseRepository {
  /**
   * ユーザー設定を保存（暗号化付き）
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
      await encryptedDb.userSettings.clear();
      
      // 新しい設定を保存（Dexieフックで自動的に暗号化される）
      await encryptedDb.userSettings.add(userSettings);
      
      return userSettings;
    } catch (error) {
      this.handleError('UserSettings save', error);
    }
  }

  /**
   * ユーザー設定を更新（暗号化付き）
   */
  async update(id: string, updates: Partial<UserSettingsInput>): Promise<UserSettings> {
    try {
      this.validateUuid(id);
      
      const existing = await encryptedDb.userSettings.get(id);
      if (!existing) {
        throw new Error(`UserSettings not found: ${id}`);
      }

      // 更新データの準備（Dexieフックで自動的に暗号化される）
      const updateData: any = {
        ...updates,
        updatedAt: new Date()
      };

      await encryptedDb.userSettings.update(id, updateData);
      
      // 更新後のデータを取得
      const updated = await encryptedDb.userSettings.get(id);
      if (!updated) {
        throw new Error('Failed to retrieve updated settings');
      }
      
      return updated;
    } catch (error) {
      this.handleError('UserSettings update', error);
    }
  }

  /**
   * ユーザー設定を取得（復号化付き）
   */
  async get(): Promise<UserSettings | null> {
    try {
      // 最新の設定を取得（Dexieフックで自動的に復号化される）
      const settings = await encryptedDb.userSettings
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
      const count = await encryptedDb.userSettings.count();
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
   * 体質タグを取得（復号化済み）
   */
  async getBodyConstitution(): Promise<BodyConstitutionTag[]> {
    try {
      const settings = await this.get();
      return settings?.bodyConstitution ?? [];
    } catch (error) {
      this.handleError('UserSettings getBodyConstitution', error);
    }
  }

  /**
   * ライフスタイルタグを取得（復号化済み）
   */
  async getLifestyle(): Promise<LifestyleTag[]> {
    try {
      const settings = await this.get();
      return settings?.lifestyle ?? [];
    } catch (error) {
      this.handleError('UserSettings getLifestyle', error);
    }
  }

  /**
   * プロファイルを取得（復号化済み）
   */
  async getProfile(): Promise<UserProfile | undefined> {
    try {
      const settings = await this.get();
      return settings?.profile;
    } catch (error) {
      this.handleError('UserSettings getProfile', error);
    }
  }

  /**
   * すべてのユーザー設定を削除
   */
  async deleteAll(): Promise<void> {
    try {
      await encryptedDb.userSettings.clear();
    } catch (error) {
      this.handleError('UserSettings deleteAll', error);
    }
  }

  /**
   * 暗号化されたデータのバックアップ用エクスポート
   */
  async exportEncrypted(): Promise<any> {
    try {
      // 暗号化されたままのデータを取得（フックを回避）
      const settings = await encryptedDb.userSettings.toArray();
      return settings;
    } catch (error) {
      this.handleError('UserSettings exportEncrypted', error);
    }
  }

  /**
   * 暗号化されたデータのインポート
   */
  async importEncrypted(encryptedData: any[]): Promise<void> {
    try {
      // 既存のデータをクリア
      await encryptedDb.userSettings.clear();
      
      // 暗号化されたデータをそのまま保存
      await encryptedDb.userSettings.bulkAdd(encryptedData);
    } catch (error) {
      this.handleError('UserSettings importEncrypted', error);
    }
  }
}