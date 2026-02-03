import Dexie, { type Table } from 'dexie';
import type { 
  UserSettings, 
  DailyState, 
  MealLog, 
  FoodPlan, 
  WeightLog,
  DietGoals 
} from '@/types';
import { secureStore } from '../crypto/secureStore';

/**
 * 暗号化機能を持つデータベースクラス
 * Dexie.jsのフックを使用して透過的に暗号化・復号化を行う
 */
export class EncryptedDietDatabase extends Dexie {
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

    // 暗号化フックの設定
    this.setupEncryptionHooks();
  }

  /**
   * 暗号化・復号化フックの設定
   */
  private setupEncryptionHooks() {
    // UserSettings用のフック
    this.userSettings.hook('creating', async function(primKey, obj) {
      // 暗号化が初期化されていることを確認
      if (!secureStore.isEncryptionEnabled()) {
        await secureStore.initialize();
      }
      
      // オブジェクトを暗号化
      const encrypted = await secureStore.encryptUserSettings(obj as UserSettings);
      
      // 暗号化されたオブジェクトで置き換え
      Object.keys(obj).forEach(key => delete obj[key]);
      Object.assign(obj, encrypted);
    });

    this.userSettings.hook('updating', async function(modifications, primKey, obj) {
      // 更新対象のフィールドを暗号化
      const toEncrypt: Partial<UserSettings> = {};
      
      if ('profile' in modifications) {
        toEncrypt.profile = modifications.profile;
        delete modifications.profile;
        modifications.profileEnc = await secureStore.encryptUserSettings({ 
          profile: toEncrypt.profile 
        } as UserSettings).then(enc => enc.profileEnc);
      }
      
      if ('bodyConstitution' in modifications) {
        toEncrypt.bodyConstitution = modifications.bodyConstitution;
        delete modifications.bodyConstitution;
        modifications.bodyConstitutionEnc = await secureStore.encryptUserSettings({ 
          bodyConstitution: toEncrypt.bodyConstitution 
        } as UserSettings).then(enc => enc.bodyConstitutionEnc);
      }
      
      if ('lifestyle' in modifications) {
        toEncrypt.lifestyle = modifications.lifestyle;
        delete modifications.lifestyle;
        modifications.lifestyleEnc = await secureStore.encryptUserSettings({ 
          lifestyle: toEncrypt.lifestyle 
        } as UserSettings).then(enc => enc.lifestyleEnc);
      }
    });

    this.userSettings.hook('reading', async function(obj) {
      // オブジェクトを復号化
      const decrypted = await secureStore.decryptUserSettings(obj);
      
      // 復号化されたオブジェクトで置き換え
      Object.keys(obj).forEach(key => delete obj[key]);
      Object.assign(obj, decrypted);
    });

    // DailyState用のフック（freeMemoの暗号化）
    this.dailyStates.hook('creating', async function(primKey, obj) {
      // 暗号化が初期化されていることを確認
      if (!secureStore.isEncryptionEnabled()) {
        await secureStore.initialize();
      }
      
      // freeMemoを暗号化
      const encrypted = await secureStore.encryptDailyState(obj as DailyState);
      
      // 暗号化されたオブジェクトで置き換え
      Object.keys(obj).forEach(key => delete obj[key]);
      Object.assign(obj, encrypted);
    });

    this.dailyStates.hook('updating', async function(modifications, primKey, obj) {
      // freeMemoの更新時に暗号化
      if ('freeMemo' in modifications && modifications.freeMemo) {
        const encrypted = await secureStore.encryptDailyState({ 
          freeMemo: modifications.freeMemo 
        } as DailyState);
        delete modifications.freeMemo;
        modifications.freeMemoEnc = encrypted.freeMemoEnc;
      }
    });

    // reading hookは非同期の問題があるため、一時的に無効化
    // リポジトリレベルで復号化を行う
    /*
    this.dailyStates.hook('reading', async function(obj) {
      // 現在無効化中
    });
    */

    // MealLog用のフック（オプション：環境変数で制御可能）
    if (process.env.NEXT_PUBLIC_ENCRYPT_MEAL_LOGS === 'true') {
      this.mealLogs.hook('creating', async function(primKey, obj) {
        // 暗号化が初期化されていることを確認
        if (!secureStore.isEncryptionEnabled()) {
          await secureStore.initialize();
        }
        
        // textを暗号化
        const encrypted = await secureStore.encryptMealLog(obj as MealLog, true);
        
        // 暗号化されたオブジェクトで置き換え
        Object.keys(obj).forEach(key => delete obj[key]);
        Object.assign(obj, encrypted);
      });

      this.mealLogs.hook('updating', async function(modifications, primKey, obj) {
        // textの更新時に暗号化
        if ('text' in modifications && modifications.text) {
          const encrypted = await secureStore.encryptMealLog({ 
            text: modifications.text 
          } as MealLog, true);
          delete modifications.text;
          modifications.textEnc = encrypted.textEnc;
        }
      });

      this.mealLogs.hook('reading', async function(obj) {
        // textを復号化
        const decrypted = await secureStore.decryptMealLog(obj);
        
        // 復号化されたオブジェクトで置き換え
        Object.keys(obj).forEach(key => delete obj[key]);
        Object.assign(obj, decrypted);
      });
    }
  }

  /**
   * データベースの初期化（暗号化サービスの初期化を含む）
   */
  async initializeWithEncryption(): Promise<void> {
    try {
      // 暗号化サービスの初期化
      await secureStore.initialize();
      
      // データベースを開く
      await this.open();
    } catch (error) {
      console.error('Failed to initialize encrypted database:', error);
      throw error;
    }
  }
}

// データベースインスタンスのエクスポート
export const encryptedDb = new EncryptedDietDatabase();

// データベース初期化関数
export async function initializeEncryptedDatabase(): Promise<void> {
  await encryptedDb.initializeWithEncryption();
}

// データベースのバージョン情報取得
export function getEncryptedDatabaseInfo() {
  return {
    name: encryptedDb.name,
    version: encryptedDb.verno,
    isOpen: encryptedDb.isOpen(),
    encryptionEnabled: secureStore.isEncryptionEnabled(),
    tables: encryptedDb.tables.map(table => ({
      name: table.name,
      schema: table.schema
    }))
  };
}