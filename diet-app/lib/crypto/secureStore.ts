import { encryptionService } from './encryptionService';
import type { 
  UserSettings, 
  BodyConstitutionTag, 
  LifestyleTag, 
  UserProfile,
  DailyState,
  MealLog
} from '@/types';

/**
 * SecureStore - 暗号化されたデータの管理
 * 個人情報フィールドの暗号化・復号化を透過的に処理
 */
export class SecureStore {
  private static instance: SecureStore;
  
  private constructor() {}

  /**
   * シングルトンインスタンスの取得
   */
  static getInstance(): SecureStore {
    if (!SecureStore.instance) {
      SecureStore.instance = new SecureStore();
    }
    return SecureStore.instance;
  }

  /**
   * 初期化
   */
  async initialize(): Promise<void> {
    if (!encryptionService.isInitialized()) {
      await encryptionService.initialize();
    }
  }

  /**
   * UserSettingsの暗号化
   * 個人情報フィールドを暗号化した新しいオブジェクトを返す
   */
  async encryptUserSettings(settings: UserSettings): Promise<any> {
    try {
      const encrypted: any = { ...settings };
      
      // profileの暗号化
      if (settings.profile) {
        encrypted.profileEnc = await encryptionService.encrypt(
          JSON.stringify(settings.profile)
        );
        delete encrypted.profile;
      }
      
      // bodyConstitutionの暗号化
      if (settings.bodyConstitution && settings.bodyConstitution.length > 0) {
        encrypted.bodyConstitutionEnc = await encryptionService.encrypt(
          JSON.stringify(settings.bodyConstitution)
        );
        delete encrypted.bodyConstitution;
      }
      
      // lifestyleの暗号化
      if (settings.lifestyle && settings.lifestyle.length > 0) {
        encrypted.lifestyleEnc = await encryptionService.encrypt(
          JSON.stringify(settings.lifestyle)
        );
        delete encrypted.lifestyle;
      }
      
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt user settings:', error);
      throw new Error('ユーザー設定の暗号化に失敗しました');
    }
  }

  /**
   * UserSettingsの復号化
   * 暗号化されたフィールドを復号化した新しいオブジェクトを返す
   */
  async decryptUserSettings(encrypted: any): Promise<UserSettings> {
    try {
      const decrypted: any = { ...encrypted };
      
      // profileの復号化
      if (encrypted.profileEnc) {
        const profileJson = await encryptionService.decrypt(encrypted.profileEnc);
        decrypted.profile = JSON.parse(profileJson) as UserProfile;
        delete decrypted.profileEnc;
      }
      
      // bodyConstitutionの復号化
      if (encrypted.bodyConstitutionEnc) {
        const bodyConstitutionJson = await encryptionService.decrypt(
          encrypted.bodyConstitutionEnc
        );
        decrypted.bodyConstitution = JSON.parse(bodyConstitutionJson) as BodyConstitutionTag[];
        delete decrypted.bodyConstitutionEnc;
      } else {
        decrypted.bodyConstitution = [];
      }
      
      // lifestyleの復号化
      if (encrypted.lifestyleEnc) {
        const lifestyleJson = await encryptionService.decrypt(encrypted.lifestyleEnc);
        decrypted.lifestyle = JSON.parse(lifestyleJson) as LifestyleTag[];
        delete decrypted.lifestyleEnc;
      } else {
        decrypted.lifestyle = [];
      }
      
      return decrypted as UserSettings;
    } catch (error) {
      console.error('Failed to decrypt user settings:', error);
      throw new Error('ユーザー設定の復号化に失敗しました');
    }
  }

  /**
   * DailyStateの暗号化（freeMemoフィールドのみ）
   */
  async encryptDailyState(state: DailyState): Promise<any> {
    try {
      const encrypted: any = { ...state };
      
      // freeMemoの暗号化（空文字でない場合のみ）
      if (state.freeMemo && state.freeMemo.trim() !== '') {
        encrypted.freeMemoEnc = await encryptionService.encrypt(state.freeMemo);
        delete encrypted.freeMemo;
      }
      
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt daily state:', error);
      throw new Error('日次状態の暗号化に失敗しました');
    }
  }

  /**
   * DailyStateの復号化（freeMemoフィールドのみ）
   */
  async decryptDailyState(encrypted: any): Promise<DailyState> {
    try {
      // encrypted が undefined または null の場合は空のfreeMemoを持つオブジェクトを返す
      if (!encrypted) {
        return {
          freeMemo: ''
        } as DailyState;
      }
      
      const decrypted: any = { ...encrypted };
      
      // freeMemoの復号化
      if (encrypted.freeMemoEnc) {
        decrypted.freeMemo = await encryptionService.decrypt(encrypted.freeMemoEnc);
        delete decrypted.freeMemoEnc;
      } else if (!decrypted.freeMemo) {
        decrypted.freeMemo = '';
      }
      
      return decrypted as DailyState;
    } catch (error) {
      console.error('Failed to decrypt daily state:', error);
      // エラーが発生した場合は、暗号化されていない部分だけ返す
      const fallbackDecrypted = { ...encrypted };
      if (fallbackDecrypted.freeMemoEnc) {
        delete fallbackDecrypted.freeMemoEnc;
      }
      if (!fallbackDecrypted.freeMemo) {
        fallbackDecrypted.freeMemo = '';
      }
      return fallbackDecrypted as DailyState;
    }
  }

  /**
   * MealLogの暗号化（textフィールドのみ、オプション）
   */
  async encryptMealLog(meal: MealLog, shouldEncrypt: boolean = false): Promise<any> {
    if (!shouldEncrypt) {
      return meal;
    }
    
    try {
      const encrypted: any = { ...meal };
      
      // textの暗号化
      if (meal.text && meal.text.trim() !== '') {
        encrypted.textEnc = await encryptionService.encrypt(meal.text);
        delete encrypted.text;
      }
      
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt meal log:', error);
      throw new Error('食事記録の暗号化に失敗しました');
    }
  }

  /**
   * MealLogの復号化（textフィールドのみ、オプション）
   */
  async decryptMealLog(encrypted: any): Promise<MealLog> {
    try {
      const decrypted: any = { ...encrypted };
      
      // textの復号化
      if (encrypted.textEnc) {
        decrypted.text = await encryptionService.decrypt(encrypted.textEnc);
        delete decrypted.textEnc;
      } else if (!decrypted.text) {
        decrypted.text = '';
      }
      
      return decrypted as MealLog;
    } catch (error) {
      console.error('Failed to decrypt meal log:', error);
      throw new Error('食事記録の復号化に失敗しました');
    }
  }

  /**
   * 暗号化キーのエクスポート（バックアップ用）
   */
  async exportEncryptionKey(): Promise<string> {
    return await encryptionService.exportKey();
  }

  /**
   * 暗号化キーのインポート（復元用）
   */
  async importEncryptionKey(keyData: string): Promise<void> {
    await encryptionService.importKey(keyData);
  }

  /**
   * すべての暗号化データをリセット
   * 注意：これにより復号化できなくなる可能性があります
   */
  async resetEncryption(): Promise<void> {
    await encryptionService.deleteKey();
    await encryptionService.initialize();
  }

  /**
   * 暗号化が有効かチェック
   */
  isEncryptionEnabled(): boolean {
    return encryptionService.isInitialized();
  }
}

// シングルトンインスタンスをエクスポート
export const secureStore = SecureStore.getInstance();