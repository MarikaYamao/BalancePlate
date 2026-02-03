/**
 * ベースリポジトリクラス
 * 共通的なCRUD操作を提供
 */

export abstract class BaseRepository {
  /**
   * データの検証を行う
   */
  protected validateRequired<T>(data: T, fields: (keyof T)[]): void {
    for (const field of fields) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Required field '${String(field)}' is missing`);
      }
    }
  }

  /**
   * 日付キーの妥当性をチェック
   */
  protected validateDateKey(dateKey: string): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateKey)) {
      throw new Error(`Invalid dateKey format: ${dateKey}. Expected format: YYYY-MM-DD`);
    }
    
    // 日付の各部分を取得して妥当性を確認
    const [year, month, day] = dateKey.split('-').map(Number);
    
    // 月と日の基本的な範囲チェック
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month in dateKey: ${dateKey}`);
    }
    
    if (day < 1 || day > 31) {
      throw new Error(`Invalid day in dateKey: ${dateKey}`);
    }
    
    // Date オブジェクトを作成して、実際に有効な日付かチェック
    // month - 1 は JavaScript の Date が 0-based であるため
    const date = new Date(year, month - 1, day);
    
    if (date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
      throw new Error(`Invalid date: ${dateKey}`);
    }
  }

  /**
   * UUIDの妥当性をチェック
   */
  protected validateUuid(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }
  }

  /**
   * エラーハンドリングを統一
   */
  protected handleError(operation: string, error: unknown): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${operation} failed:`, error);
    throw new Error(`${operation} failed: ${errorMessage}`);
  }

  /**
   * 論理削除の実装
   */
  protected markAsDeleted<T extends { deletedAt?: Date }>(record: T): T {
    return {
      ...record,
      deletedAt: new Date()
    };
  }

  /**
   * 論理削除されていないレコードのフィルタ
   */
  protected filterDeleted<T extends { deletedAt?: Date }>(records: T[]): T[] {
    return records.filter(record => !record.deletedAt);
  }
}