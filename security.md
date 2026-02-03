# セキュリティ・暗号化仕様書

## 1. セキュリティ方針

### 基本原則
- **プライバシーファースト**: 個人の体質・健康データを最優先で保護
- **ローカルファースト**: データは原則デバイス内で完結
- **最小権限の原則**: 必要最小限のデータのみ取得・保存
- **透明性**: ユーザーがデータの利用状況を把握可能

### 保護対象データ
- 体質情報（むくみやすい、低血圧など）
- 生活習慣情報（在宅ワーク、育児など）
- 体重記録
- 食事記録
- コンディション記録

---

## 2. 暗号化実装

### Web Crypto API を使用した暗号化

```typescript
// lib/crypto/encryption.ts
class EncryptionService {
  private algorithm = 'AES-GCM';
  private keyLength = 256;
  private ivLength = 12; // 96 bits for GCM
  private saltLength = 16; // 128 bits
  private tagLength = 128; // bits
  
  private key: CryptoKey | null = null;
  
  /**
   * 初期化 - 暗号化キーの生成または復元
   */
  async initialize(): Promise<void> {
    try {
      // 既存のキーを取得
      const storedKey = await this.getStoredKey();
      
      if (storedKey) {
        this.key = await this.importKey(storedKey);
      } else {
        // 新規キー生成
        this.key = await this.generateKey();
        await this.storeKey(this.key);
      }
    } catch (error) {
      throw new Error('暗号化の初期化に失敗しました');
    }
  }
  
  /**
   * 暗号化キーの生成
   */
  private async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      false, // extractable: false (セキュリティ向上のため)
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * データの暗号化
   */
  async encrypt(plaintext: string): Promise<string> {
    if (!this.key) {
      throw new Error('暗号化キーが初期化されていません');
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // IV（初期化ベクター）生成
    const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
    
    // 暗号化実行
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
        tagLength: this.tagLength,
      },
      this.key,
      data
    );
    
    // IV + 暗号化データを結合してBase64エンコード
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return this.arrayBufferToBase64(combined.buffer);
  }
  
  /**
   * データの復号化
   */
  async decrypt(encryptedData: string): Promise<string> {
    if (!this.key) {
      throw new Error('暗号化キーが初期化されていません');
    }
    
    const combined = this.base64ToArrayBuffer(encryptedData);
    const combinedArray = new Uint8Array(combined);
    
    // IVと暗号化データを分離
    const iv = combinedArray.slice(0, this.ivLength);
    const encrypted = combinedArray.slice(this.ivLength);
    
    // 復号化実行
    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv,
        tagLength: this.tagLength,
      },
      this.key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
  
  /**
   * バックアップ用キーの生成とエクスポート
   * 通常の暗号化キーとは別に、ユーザー操作時のみ生成
   */
  async generateBackupKey(): Promise<string> {
    // バックアップ専用のextractableキーを生成
    const backupKey = await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true, // バックアップ用は extractable: true
      ['encrypt', 'decrypt']
    );
    
    const exported = await crypto.subtle.exportKey('jwk', backupKey);
    return JSON.stringify(exported);
  }
  
  /**
   * キーのインポート（復元用）
   */
  async importKey(keyData: string): Promise<CryptoKey> {
    const jwk = JSON.parse(keyData);
    
    return await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * キーの安全な保存
   */
  private async storeKey(key: CryptoKey): Promise<void> {
    // extractable: false のキーはエクスポートできないため
    // キーの参照をメモリ上で保持
    // ブラウザのリロード時は再生成が必要
    // または、初回のみ extractable: true で生成して保存後、
    // メモリ上では extractable: false のキーを使用する方法もあり
    
    // 初回生成時のみ保存用に一時的に extractable キーを作成
    const exportableKey = await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true, // 保存用に一時的に true
      ['encrypt', 'decrypt']
    );
    
    const exported = await crypto.subtle.exportKey('jwk', exportableKey);
    const keyString = JSON.stringify(exported);
    
    // IndexedDBに保存（localStorage は避ける）
    await this.secureStore.set('encryption_key', keyString);
  }
  
  /**
   * 保存されたキーの取得
   */
  private async getStoredKey(): Promise<string | null> {
    return await this.secureStore.get('encryption_key');
  }
  
  // ユーティリティ関数
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export const encryptionService = new EncryptionService();
```

---

## 3. セキュアストレージ

### IndexedDB を使用したセキュアストレージ

```typescript
// lib/crypto/secureStore.ts
class SecureStore {
  private dbName = 'SecureStorage';
  private storeName = 'secrets';
  private db: IDBDatabase | null = null;
  
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }
  
  async set(key: string, value: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async get(key: string): Promise<string | null> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  
  async delete(key: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const secureStore = new SecureStore();
```

---

## 4. 暗号化対象フィールドの実装

### Repository層での暗号化実装（Dexieフックは使用しない）

```typescript
// lib/db/repositories/encryptedRepository.ts
import { encryptionService } from '@/lib/crypto/encryption';

export abstract class EncryptedRepository {
  /**
   * 暗号化して保存（fail-closed）
   */
  protected async encryptField(data: any): Promise<string> {
    try {
      return await encryptionService.encrypt(JSON.stringify(data));
    } catch (error) {
      // 暗号化失敗時は保存を中止
      throw new Error('
        個人情報の保護処理に失敗しました。
        データを保存できません。
        問題が続く場合はアプリを再起動してください。
      ');
    }
  }
  
  /**
   * 復号化して取得
   */
  protected async decryptField(encryptedData: string): Promise<any> {
    try {
      const decrypted = await encryptionService.decrypt(encryptedData);
      return JSON.parse(decrypted);
    } catch (error) {
      // 復号化失敗時もデータを露出しない
      throw new Error('
        データの読み込みに失敗しました。
        暗号化キーに問題がある可能性があります。
      ');
    }
  }
}

// UserSettingsRepository の実装例
export class UserSettingsRepository extends EncryptedRepository {
  async save(settings: UserSettingsInput): Promise<UserSettings> {
    // 暗号化フィールドを別カラムとして保存
    const encrypted = {
      ...settings,
      bodyConstitutionEnc: await this.encryptField(settings.bodyConstitution),
      lifestyleEnc: await this.encryptField(settings.lifestyle),
      // 元のフィールドはDBに保存しない
      bodyConstitution: undefined,
      lifestyle: undefined,
    };
    
    await db.userSettings.add(encrypted);
    
    // メモリ上のオブジェクトには復号化したデータを返す
    return {
      ...settings,
      id: encrypted.id,
    };
  }
  
  async get(id: string): Promise<UserSettings | null> {
    const stored = await db.userSettings.get(id);
    if (!stored) return null;
    
    // 暗号化フィールドを復号化
    return {
      ...stored,
      bodyConstitution: await this.decryptField(stored.bodyConstitutionEnc),
      lifestyle: await this.decryptField(stored.lifestyleEnc),
    };
  }
}
```

---

## 5. API セキュリティ

### OpenAI API キーの保護

```typescript
// app/api/ai/route.ts
import { headers } from 'next/headers';
import { validateRequest } from '@/lib/security/validation';

export async function POST(request: Request) {
  // CSRF トークン検証
  const headersList = headers();
  const csrfToken = headersList.get('x-csrf-token');
  
  if (!validateCsrfToken(csrfToken)) {
    return new Response('Invalid CSRF token', { status: 403 });
  }
  
  // レート制限
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = await checkRateLimit(ip);
  
  if (!rateLimitResult.allowed) {
    return new Response('Rate limit exceeded', { 
      status: 429,
      headers: {
        'Retry-After': rateLimitResult.retryAfter.toString(),
      }
    });
  }
  
  // リクエスト検証
  const body = await request.json();
  const validationResult = validateRequest(body);
  
  if (!validationResult.valid) {
    return new Response('Invalid request', { status: 400 });
  }
  
  // OpenAI API呼び出し（サーバーサイドのみ）
  const response = await callOpenAI(body);
  
  return Response.json(response);
}
```

### CSRF対策

```typescript
// lib/security/csrf.ts
import crypto from 'crypto';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCsrfToken(token: string | null): boolean {
  if (!token) return false;
  
  // セッションストレージのトークンと比較
  const sessionToken = getSessionToken();
  return token === sessionToken;
}
```

---

## 6. XSS対策

### 入力値のサニタイゼーション

```typescript
// lib/security/sanitization.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  // HTMLタグを除去
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  
  // 追加の検証
  return cleaned.trim();
}

export function sanitizeForDisplay(text: string): string {
  // 表示用にエスケープ
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

---

## 7. データバックアップとリカバリー

### 暗号化されたバックアップ

```typescript
// lib/backup/backup.ts
export class BackupService {
  /**
   * データのエクスポート（暗号化済み）
   */
  async exportData(): Promise<Blob> {
    const data = {
      userSettings: await db.userSettings.toArray(),
      dailyStates: await db.dailyStates.toArray(),
      mealLogs: await db.mealLogs.toArray(),
      weightLogs: await db.weightLogs.toArray(),
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    
    // 全体を暗号化
    const encrypted = await encryptionService.encrypt(
      JSON.stringify(data)
    );
    
    return new Blob([encrypted], { 
      type: 'application/octet-stream' 
    });
  }
  
  /**
   * データのインポート（復号化）
   */
  async importData(file: File): Promise<void> {
    const text = await file.text();
    
    try {
      // 復号化
      const decrypted = await encryptionService.decrypt(text);
      const data = JSON.parse(decrypted);
      
      // バージョンチェック
      if (!this.isCompatibleVersion(data.version)) {
        throw new Error('互換性のないバックアップファイルです');
      }
      
      // データ復元
      await this.restoreData(data);
      
    } catch (error) {
      throw new Error('バックアップの復元に失敗しました');
    }
  }
  
  private async restoreData(data: any): Promise<void> {
    // トランザクション内で復元
    await db.transaction('rw', 
      db.userSettings,
      db.dailyStates,
      db.mealLogs,
      db.weightLogs,
      async () => {
        // 既存データをクリア
        await Promise.all([
          db.userSettings.clear(),
          db.dailyStates.clear(),
          db.mealLogs.clear(),
          db.weightLogs.clear(),
        ]);
        
        // 新規データを追加
        await Promise.all([
          db.userSettings.bulkAdd(data.userSettings),
          db.dailyStates.bulkAdd(data.dailyStates),
          db.mealLogs.bulkAdd(data.mealLogs),
          db.weightLogs.bulkAdd(data.weightLogs),
        ]);
      }
    );
  }
}
```

---

## 8. プライバシー設定

### データ削除機能

```typescript
// lib/privacy/dataManagement.ts
export class DataManagementService {
  /**
   * 全データの削除
   */
  async deleteAllData(): Promise<void> {
    // 確認ダイアログ表示後
    if (confirm('本当にすべてのデータを削除しますか？この操作は取り消せません。')) {
      // データベースクリア
      await db.delete();
      
      // セキュアストレージクリア
      await secureStore.delete('encryption_key');
      
      // IndexedDB完全削除
      await indexedDB.deleteDatabase('DietDatabase');
      await indexedDB.deleteDatabase('SecureStorage');
      
      // セッションクリア
      sessionStorage.clear();
      
      // PWAキャッシュクリア
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
    }
  }
  
  /**
   * 特定期間のデータ削除
   */
  async deleteDataByDateRange(
    startDate: Date, 
    endDate: Date
  ): Promise<void> {
    const startKey = getDateKey(startDate);
    const endKey = getDateKey(endDate);
    
    await db.transaction('rw',
      db.dailyStates,
      db.mealLogs,
      db.weightLogs,
      async () => {
        // 論理削除
        await db.dailyStates
          .where('dateKey')
          .between(startKey, endKey)
          .modify({ deletedAt: new Date() });
          
        await db.mealLogs
          .where('dateKey')
          .between(startKey, endKey)
          .modify({ deletedAt: new Date() });
          
        await db.weightLogs
          .where('dateKey')
          .between(startKey, endKey)
          .modify({ deletedAt: new Date() });
      }
    );
  }
}
```

---

## 9. セキュリティヘッダー

### Next.js セキュリティヘッダー設定

```typescript
// next.config.js
const isDevelopment = process.env.NODE_ENV === 'development';

// 開発時のCSP（緩和）
const devCSP = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://api.openai.com ws: wss:;
  frame-ancestors 'none';
`.replace(/\s{2,}/g, ' ').trim();

// 本番時のCSP（厳格）
const prodCSP = `
  default-src 'self';
  script-src 'self' 'nonce-{NONCE}';
  style-src 'self' 'nonce-{NONCE}';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://api.openai.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: isDevelopment ? devCSP : prodCSP
  }
];

// 本番環境ではnonceを使用
export async function generateNonce() {
  if (!isDevelopment) {
    return crypto.randomBytes(16).toString('base64');
  }
  return null;
}

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 10. セキュリティチェックリスト

### 開発時
- [ ] 環境変数に機密情報を含めない
- [ ] APIキーをクライアントコードに含めない
- [ ] console.log でセンシティブデータを出力しない
- [ ] エラーメッセージに詳細情報を含めない

### デプロイ前
- [ ] HTTPS の有効化
- [ ] セキュリティヘッダーの設定
- [ ] 依存関係の脆弱性チェック（npm audit）
- [ ] 本番環境でのデバッグモード無効化
- [ ] レート制限の実装
- [ ] CORS設定の確認

### 運用時
- [ ] 定期的な依存関係の更新
- [ ] セキュリティパッチの適用
- [ ] アクセスログの監視
- [ ] 異常なAPIアクセスパターンの検知

---

## 11. インシデント対応

### データ漏洩時の対応
1. 影響範囲の特定
2. 該当ユーザーへの通知
3. 暗号化キーのローテーション
4. セキュリティ監査の実施

### 復旧手順
1. バックアップからのデータ復元
2. 暗号化キーの再生成
3. ユーザー認証のリセット（将来実装時）