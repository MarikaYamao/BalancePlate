/**
 * EncryptionService - Web Crypto API を使用した暗号化サービス
 * 個人情報（体質・習慣データ）の暗号化・復号化を管理
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: CryptoKey | null = null;
  private readonly KEY_STORAGE_NAME = 'diet-app-encryption-key';
  private readonly SALT_LENGTH = 16;
  private readonly IV_LENGTH = 12;
  private readonly TAG_LENGTH = 16;

  private constructor() {}

  /**
   * シングルトンインスタンスの取得
   */
  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * 暗号化サービスの初期化
   * 既存のキーを取得するか、新しいキーを生成
   */
  async initialize(): Promise<void> {
    try {
      // IndexedDBから既存のキーを取得
      const existingKey = await this.loadKey();
      
      if (existingKey) {
        this.encryptionKey = existingKey;
      } else {
        // 新しいキーを生成して保存
        this.encryptionKey = await this.generateKey();
        await this.saveKey(this.encryptionKey);
      }
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      throw new Error('暗号化サービスの初期化に失敗しました');
    }
  }

  /**
   * データの暗号化
   * @param data 暗号化するデータ（文字列）
   * @returns Base64エンコードされた暗号化データ
   */
  async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // IV（初期化ベクトル）を生成
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      // データを暗号化
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        dataBuffer
      );
      
      // IV + 暗号化データを結合
      const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combinedBuffer.set(iv, 0);
      combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // Base64エンコードして返す
      return btoa(String.fromCharCode(...combinedBuffer));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('データの暗号化に失敗しました');
    }
  }

  /**
   * データの復号化
   * @param encryptedData Base64エンコードされた暗号化データ
   * @returns 復号化されたデータ（文字列）
   */
  async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      // Base64デコード
      const combinedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // IV と暗号化データを分離
      const iv = combinedBuffer.slice(0, this.IV_LENGTH);
      const encryptedBuffer = combinedBuffer.slice(this.IV_LENGTH);
      
      // データを復号化
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encryptedBuffer
      );
      
      // 文字列に変換して返す
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('データの復号化に失敗しました');
    }
  }

  /**
   * 暗号化キーのエクスポート（バックアップ用）
   * @returns Base64エンコードされたキーデータ
   */
  async exportKey(): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const exportedKey = await crypto.subtle.exportKey('raw', this.encryptionKey);
      return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
    } catch (error) {
      console.error('Key export failed:', error);
      throw new Error('キーのエクスポートに失敗しました');
    }
  }

  /**
   * 暗号化キーのインポート（復元用）
   * @param keyData Base64エンコードされたキーデータ
   */
  async importKey(keyData: string): Promise<void> {
    try {
      const keyBuffer = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
      
      this.encryptionKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      await this.saveKey(this.encryptionKey);
    } catch (error) {
      console.error('Key import failed:', error);
      throw new Error('キーのインポートに失敗しました');
    }
  }

  /**
   * 暗号化キーの生成
   */
  private async generateKey(): Promise<CryptoKey> {
    try {
      return await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Key generation failed:', error);
      throw new Error('暗号化キーの生成に失敗しました');
    }
  }

  /**
   * 暗号化キーをIndexedDBに保存
   */
  private async saveKey(key: CryptoKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EncryptionKeyStore', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['keys'], 'readwrite');
        const store = transaction.objectStore('keys');
        const saveRequest = store.put(key, this.KEY_STORAGE_NAME);
        
        saveRequest.onsuccess = () => {
          db.close();
          resolve();
        };
        
        saveRequest.onerror = () => {
          db.close();
          reject(saveRequest.error);
        };
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys');
        }
      };
    });
  }

  /**
   * IndexedDBから暗号化キーを読み込み
   */
  private async loadKey(): Promise<CryptoKey | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EncryptionKeyStore', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains('keys')) {
          db.close();
          resolve(null);
          return;
        }
        
        const transaction = db.transaction(['keys'], 'readonly');
        const store = transaction.objectStore('keys');
        const getRequest = store.get(this.KEY_STORAGE_NAME);
        
        getRequest.onsuccess = () => {
          db.close();
          resolve(getRequest.result || null);
        };
        
        getRequest.onerror = () => {
          db.close();
          reject(getRequest.error);
        };
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys');
        }
      };
    });
  }

  /**
   * 暗号化キーの削除（リセット用）
   */
  async deleteKey(): Promise<void> {
    this.encryptionKey = null;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EncryptionKeyStore', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains('keys')) {
          db.close();
          resolve();
          return;
        }
        
        const transaction = db.transaction(['keys'], 'readwrite');
        const store = transaction.objectStore('keys');
        const deleteRequest = store.delete(this.KEY_STORAGE_NAME);
        
        deleteRequest.onsuccess = () => {
          db.close();
          resolve();
        };
        
        deleteRequest.onerror = () => {
          db.close();
          reject(deleteRequest.error);
        };
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys');
        }
      };
    });
  }

  /**
   * 暗号化サービスが初期化済みかチェック
   */
  isInitialized(): boolean {
    return this.encryptionKey !== null;
  }
}

// シングルトンインスタンスをエクスポート
export const encryptionService = EncryptionService.getInstance();