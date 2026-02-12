import { EncryptionService } from '@/lib/crypto/encryptionService';
import { UserSettingsRepository } from '@/lib/db/repositories/userSettingsRepository';
import { MealLogRepository } from '@/lib/db/repositories/mealLogRepository';
import { DailyStateRepository } from '@/lib/db/repositories/dailyStateRepository';
import { WeightLogRepository } from '@/lib/db/repositories/weightLogRepository';
import { FoodPlanRepository } from '@/lib/db/repositories/foodPlanRepository';
import { z } from 'zod';

// バックアップデータのスキーマ定義
const BackupDataSchema = z.object({
  version: z.string(),
  createdAt: z.string(),
  encryptedData: z.string(),
  checksum: z.string(),
});

const ExportDataSchema = z.object({
  userSettings: z.any(),
  mealLogs: z.array(z.any()),
  dailyStates: z.array(z.any()),
  weightLogs: z.array(z.any()),
  foodPlans: z.array(z.any()),
});

export type BackupData = z.infer<typeof BackupDataSchema>;
export type ExportData = z.infer<typeof ExportDataSchema>;

export class BackupService {
  private encryptionService: EncryptionService;
  private userSettingsRepo: UserSettingsRepository;
  private mealLogRepo: MealLogRepository;
  private dailyStateRepo: DailyStateRepository;
  private weightLogRepo: WeightLogRepository;
  private foodPlanRepo: FoodPlanRepository;

  constructor() {
    this.encryptionService = EncryptionService.getInstance();
    this.userSettingsRepo = new UserSettingsRepository();
    this.mealLogRepo = new MealLogRepository();
    this.dailyStateRepo = new DailyStateRepository();
    this.weightLogRepo = new WeightLogRepository();
    this.foodPlanRepo = new FoodPlanRepository();
  }

  /**
   * 全データをエクスポート
   */
  async exportData(password: string): Promise<string> {
    try {
      // 全データを収集
      const userSettings = await this.userSettingsRepo.get();
      const mealLogs = await this.mealLogRepo.getAll();
      const dailyStates = await this.dailyStateRepo.getAll();
      const weightLogs = await this.weightLogRepo.getAll();
      const foodPlans = await this.foodPlanRepo.getAll();

      const exportData: ExportData = {
        userSettings,
        mealLogs,
        dailyStates,
        weightLogs,
        foodPlans,
      };

      // データをJSON文字列化
      const jsonData = JSON.stringify(exportData);

      // パスワードベースの暗号化
      const encryptedData = await this.encryptWithPassword(jsonData, password);

      // チェックサムを生成
      const checksum = await this.generateChecksum(jsonData);

      // バックアップデータを作成
      const backupData: BackupData = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        encryptedData,
        checksum,
      };

      return JSON.stringify(backupData, null, 2);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('データのエクスポートに失敗しました');
    }
  }

  /**
   * バックアップファイルをダウンロード
   */
  async downloadBackup(password: string): Promise<void> {
    try {
      const backupData = await this.exportData(password);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `diet-backup-${timestamp}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('バックアップファイルのダウンロードに失敗しました');
    }
  }

  /**
   * データをインポート
   */
  async importData(backupJson: string, password: string): Promise<void> {
    try {
      // バックアップデータのパース
      const backupData = BackupDataSchema.parse(JSON.parse(backupJson));

      // パスワードベースの復号化
      const decryptedData = await this.decryptWithPassword(
        backupData.encryptedData,
        password
      );

      // チェックサムの検証
      const checksum = await this.generateChecksum(decryptedData);
      if (checksum !== backupData.checksum) {
        throw new Error('データの整合性チェックに失敗しました');
      }

      // データのパースと検証
      const exportData = ExportDataSchema.parse(JSON.parse(decryptedData));

      // データベースをクリア
      await this.clearAllData();

      // データを復元
      if (exportData.userSettings) {
        await this.userSettingsRepo.save(exportData.userSettings);
      }

      for (const mealLog of exportData.mealLogs) {
        await this.mealLogRepo.save(mealLog);
      }

      for (const dailyState of exportData.dailyStates) {
        await this.dailyStateRepo.upsert(dailyState);
      }

      for (const weightLog of exportData.weightLogs) {
        await this.weightLogRepo.save(weightLog);
      }

      for (const foodPlan of exportData.foodPlans) {
        await this.foodPlanRepo.save(foodPlan);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('バックアップファイルの形式が不正です');
      }
      console.error('Import failed:', error);
      throw new Error('データのインポートに失敗しました');
    }
  }

  /**
   * ファイルからインポート
   */
  async importFromFile(file: File, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          await this.importData(content, password);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * 全データをクリア
   */
  private async clearAllData(): Promise<void> {
    console.log('Clearing all data before import...');
    
    // 各リポジトリのデータをクリア
    await Promise.all([
      this.userSettingsRepo.clearAll(),
      this.mealLogRepo.clearAll(),
      this.dailyStateRepo.clearAll(),
      this.weightLogRepo.clearAll(),
      this.foodPlanRepo.clearAll(),
    ]);
  }

  /**
   * パスワードベースの暗号化
   */
  private async encryptWithPassword(data: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // パスワードからキーを導出
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Salt と IV を生成
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // PBKDF2でAESキーを導出
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // データを暗号化
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );
    
    // Salt + IV + 暗号化データを結合
    const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
    
    // Base64エンコード
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * パスワードベースの復号化
   */
  private async decryptWithPassword(encryptedData: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Base64デコード
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Salt, IV, 暗号化データを分離
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    // パスワードからキーを導出
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // PBKDF2でAESキーを導出
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // データを復号化
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    return decoder.decode(decryptedBuffer);
  }

  /**
   * チェックサムを生成
   */
  private async generateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * バックアップの自動作成（定期実行用）
   */
  async createAutoBackup(): Promise<void> {
    try {
      // 自動バックアップ用のパスワードを生成または取得
      const autoBackupPassword = await this.getAutoBackupPassword();
      
      // バックアップデータを作成
      const backupData = await this.exportData(autoBackupPassword);
      
      // IndexedDBに保存
      const timestamp = Date.now();
      const key = `auto-backup-${timestamp}`;
      localStorage.setItem(key, backupData);

      // 古いバックアップを削除（最新5件のみ保持）
      this.cleanupOldBackups();
    } catch (error) {
      console.error('Auto backup failed:', error);
    }
  }

  /**
   * 自動バックアップ用のパスワードを取得
   */
  private async getAutoBackupPassword(): Promise<string> {
    // デバイス固有の情報を使用してパスワードを生成
    const deviceId = localStorage.getItem('device-id') || this.generateDeviceId();
    return `auto-backup-${deviceId}`;
  }

  /**
   * デバイスIDを生成
   */
  private generateDeviceId(): string {
    const id = crypto.randomUUID();
    localStorage.setItem('device-id', id);
    return id;
  }

  /**
   * 古いバックアップを削除
   */
  private cleanupOldBackups(): void {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('auto-backup-'))
      .sort()
      .reverse();

    // 最新5件以外を削除
    if (backupKeys.length > 5) {
      for (let i = 5; i < backupKeys.length; i++) {
        localStorage.removeItem(backupKeys[i]);
      }
    }
  }
}