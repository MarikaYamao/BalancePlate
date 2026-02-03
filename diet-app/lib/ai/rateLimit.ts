// シンプルなイン�メモリレート制限実装
// 本格的なアプリケーションではRedisや外部サービスを使用

interface RateLimitRecord {
  requests: number;
  lastReset: number;
}

class RateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private maxRequestsPerMinute: number;
  private windowSizeMs: number;

  constructor(maxRequestsPerMinute: number = 10) {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.windowSizeMs = 60 * 1000; // 1分間
  }

  async checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const record = this.records.get(identifier);

    // 初回アクセスまたはウィンドウがリセットされた場合
    if (!record || now - record.lastReset >= this.windowSizeMs) {
      this.records.set(identifier, {
        requests: 1,
        lastReset: now,
      });
      return {
        allowed: true,
        remaining: this.maxRequestsPerMinute - 1,
      };
    }

    // リクエスト数をチェック
    if (record.requests >= this.maxRequestsPerMinute) {
      return {
        allowed: false,
        remaining: 0,
      };
    }

    // リクエスト数を増加
    record.requests++;
    this.records.set(identifier, record);

    return {
      allowed: true,
      remaining: this.maxRequestsPerMinute - record.requests,
    };
  }

  // 古いレコードを定期的にクリーンアップ
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now - record.lastReset >= this.windowSizeMs) {
        this.records.delete(key);
      }
    }
  }
}

// シングルトンインスタンス
export const rateLimiter = new RateLimiter(10); // 1分間に10リクエスト

// 定期クリーンアップ（5分ごと）
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

// IPアドレスを取得するヘルパー関数
export function getClientIP(request: Request): string {
  // Vercelの場合
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // その他のヘッダーをチェック
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // フォールバック
  return 'unknown';
}