import { AIConsultation, AIConsultationResponse } from '@/types/ai';
import { MealType } from '@/types/meal';

const CONSULTATION_KEY_PREFIX = 'ai-consultation-';
const LATEST_KEY = 'ai-consultation-latest';

// 既存データとの互換性を保つためのレガシータイプ
export interface LegacyConsultationData {
  timestamp: string;
  mealType?: MealType | string;
  mealText?: string;
  response: AIConsultationResponse | null;
  requestType?: string;
  isIntegratedFeedback?: boolean;
  isConditionFeedback?: boolean;
  dateKey: string;
  type?: string;
  request?: unknown;
  includesFridgeItems?: boolean;
}

// ストレージに保存するデータの統合型
export type StoredConsultationData = AIConsultation | LegacyConsultationData;

export const consultationStorage = {
  /**
   * 特定の日付のAI相談データを取得
   */
  getByDateKey(dateKey: string): StoredConsultationData[] {
    try {
      const storedData = localStorage.getItem(`${CONSULTATION_KEY_PREFIX}${dateKey}`);
      if (!storedData) return [];
      
      const parsedData = JSON.parse(storedData);
      return Array.isArray(parsedData) ? parsedData : [parsedData];
    } catch (error) {
      console.error('AI相談データの取得に失敗:', error);
      return [];
    }
  },

  /**
   * 全てのAI相談データを取得
   */
  getAll(): StoredConsultationData[] {
    const allConsultations: StoredConsultationData[] = [];
    
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(CONSULTATION_KEY_PREFIX) && key !== LATEST_KEY
      );
      
      keys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            const consultations = Array.isArray(parsedData) ? parsedData : [parsedData];
            allConsultations.push(...consultations);
          }
        } catch (error) {
          console.error(`データ取得エラー (${key}):`, error);
        }
      });
    } catch (error) {
      console.error('全AI相談データの取得に失敗:', error);
    }
    
    return allConsultations;
  },

  /**
   * 最新のAI相談データを取得
   */
  getLatest(): StoredConsultationData | null {
    try {
      const storedData = localStorage.getItem(LATEST_KEY);
      if (!storedData) return null;
      return JSON.parse(storedData);
    } catch (error) {
      console.error('最新AI相談データの取得に失敗:', error);
      return null;
    }
  },

  /**
   * AI相談データを保存
   */
  save(dateKey: string, consultation: StoredConsultationData, isLatest = false): void {
    try {
      const storageKey = `${CONSULTATION_KEY_PREFIX}${dateKey}`;
      
      // 既存データを取得
      const existingData = this.getByDateKey(dateKey);
      
      // 新規データを追加
      const updatedData = [...existingData, consultation];
      
      // 保存
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
      
      // 最新データとしても保存する場合
      if (isLatest) {
        localStorage.setItem(LATEST_KEY, JSON.stringify(consultation));
      }
    } catch (error) {
      console.error('AI相談データの保存に失敗:', error);
    }
  },

  /**
   * 最新データを保存（特別なキー用）
   */
  saveLatest(consultation: StoredConsultationData | AIConsultationResponse): void {
    try {
      localStorage.setItem(LATEST_KEY, JSON.stringify(consultation));
    } catch (error) {
      console.error('最新AI相談データの保存に失敗:', error);
    }
  },

  /**
   * 統合フィードバックを検索
   */
  findIntegrated(dateKey: string): LegacyConsultationData | null {
    try {
      const consultations = this.getByDateKey(dateKey);
      const integrated = consultations.find((c): c is LegacyConsultationData => 
        'isIntegratedFeedback' in c && c.isIntegratedFeedback === true
      );
      return integrated || null;
    } catch (error) {
      console.error('統合フィードバックの検索に失敗:', error);
      return null;
    }
  },

  /**
   * タイムスタンプに最も近いフィードバックを検索
   */
  findNearestByTimestamp(dateKey: string, timestamp: number, thresholdHours = 4): LegacyConsultationData | null {
    try {
      const consultations = this.getByDateKey(dateKey);
      const thresholdMs = thresholdHours * 60 * 60 * 1000;
      
      const nearest = consultations.find((c): c is LegacyConsultationData => {
        if (!('timestamp' in c) || !c.timestamp) return false;
        if ('isIntegratedFeedback' in c && c.isIntegratedFeedback) return false;
        const consultationTime = new Date(c.timestamp).getTime();
        return Math.abs(consultationTime - timestamp) < thresholdMs;
      });
      
      return nearest || null;
    } catch (error) {
      console.error('タイムスタンプによる検索に失敗:', error);
      return null;
    }
  },

  /**
   * 日付とタイプによる検索
   */
  findByDateAndType(dateKey: string, type: string): StoredConsultationData | null {
    try {
      const consultations = this.getByDateKey(dateKey);
      return consultations.find(c => 'type' in c && c.type === type) || null;
    } catch (error) {
      console.error('日付とタイプによる検索に失敗:', error);
      return null;
    }
  },

  /**
   * 期間内のデータを取得
   */
  getInDateRange(startDateKey: string, endDateKey: string): StoredConsultationData[] {
    try {
      const allConsultations = this.getAll();
      return allConsultations.filter(c => {
        const dateKey = 'dateKey' in c ? c.dateKey : '';
        return dateKey >= startDateKey && dateKey <= endDateKey;
      });
    } catch (error) {
      console.error('期間内データの取得に失敗:', error);
      return [];
    }
  },

  /**
   * 特定日付のフィードバック存在確認（タイムスタンプベース）
   */
  checkStoredFeedback(dateKey: string, mealTime: Date | string): boolean {
    try {
      const consultations = this.getByDateKey(dateKey);
      const mealTimestamp = new Date(mealTime).getTime();
      const thresholdMs = 4 * 60 * 60 * 1000; // 4時間
      
      return consultations.some((c): c is LegacyConsultationData => {
        if (!('timestamp' in c) || !c.timestamp) return false;
        if ('isIntegratedFeedback' in c && c.isIntegratedFeedback) return false;
        const consultationTime = new Date(c.timestamp).getTime();
        return Math.abs(consultationTime - mealTimestamp) < thresholdMs;
      });
    } catch (error) {
      console.error('フィードバック存在確認に失敗:', error);
      return false;
    }
  },

  /**
   * デバッグ用: 全てのAI相談関連キーを表示
   */
  debugKeys(): string[] {
    return Object.keys(localStorage).filter(key => 
      key.startsWith(CONSULTATION_KEY_PREFIX)
    );
  }
};