/**
 * 日付ユーティリティ関数
 * リセット時間を考慮した日付キー生成
 */

/**
 * リセット時間を考慮した日付キーを生成
 * @param date - 基準となる日時
 * @param resetTime - リセット時間（"04:00"形式）
 * @returns dateKey - "2024-01-15"形式
 */
export function getDateKey(date: Date = new Date(), resetTime: string = '04:00'): string {
  const [hours, minutes] = resetTime.split(':').map(Number);
  const resetDate = new Date(date);
  
  // リセット時間前なら前日扱い
  if (date.getHours() < hours || 
      (date.getHours() === hours && date.getMinutes() < minutes)) {
    resetDate.setDate(resetDate.getDate() - 1);
  }
  
  return resetDate.toISOString().split('T')[0];
}

/**
 * 日付キーから表示用の日付文字列を生成
 * @param dateKey - "2024-01-15"形式
 * @returns 表示用日付 - "1月15日（月）"形式
 */
export function formatDateFromKey(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const dayName = dayNames[date.getDay()];
  
  return `${month}月${day}日（${dayName}）`;
}

/**
 * 今日の日付キーを取得
 * @param resetTime - リセット時間（デフォルト: "04:00"）
 * @returns 今日の日付キー
 */
export function getTodayKey(resetTime: string = '04:00'): string {
  return getDateKey(new Date(), resetTime);
}

/**
 * 指定した日数前/後の日付キーを取得
 * @param baseKey - 基準となる日付キー
 * @param days - 日数（負数で過去、正数で未来）
 * @returns 計算後の日付キー
 */
export function getOffsetDateKey(baseKey: string, days: number): string {
  const date = new Date(baseKey + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * 2つの日付キーの間の日数を計算
 * @param startKey - 開始日付キー
 * @param endKey - 終了日付キー
 * @returns 日数差
 */
export function getDaysDifference(startKey: string, endKey: string): number {
  const start = new Date(startKey + 'T00:00:00');
  const end = new Date(endKey + 'T00:00:00');
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 日付キーが有効かチェック
 * @param dateKey - チェック対象の日付キー
 * @returns 有効性
 */
export function isValidDateKey(dateKey: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateKey)) return false;
  
  // 日付の各部分を取得して妥当性を確認
  const [year, month, day] = dateKey.split('-').map(Number);
  
  // 月と日の基本的な範囲チェック
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Date オブジェクトを作成して、実際に有効な日付かチェック
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}

/**
 * 日付キーの配列を日付順にソート
 * @param dateKeys - 日付キーの配列
 * @param order - ソート順（'asc' | 'desc'）
 * @returns ソート済み配列
 */
export function sortDateKeys(dateKeys: string[], order: 'asc' | 'desc' = 'desc'): string[] {
  return dateKeys.sort((a, b) => {
    const comparison = a.localeCompare(b);
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * 期間の日付キー配列を生成
 * @param startKey - 開始日付キー
 * @param endKey - 終了日付キー
 * @returns 期間内の日付キー配列
 */
export function getDateRange(startKey: string, endKey: string): string[] {
  const start = new Date(startKey + 'T00:00:00');
  const end = new Date(endKey + 'T00:00:00');
  const dateKeys: string[] = [];
  
  const current = new Date(start);
  while (current <= end) {
    dateKeys.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dateKeys;
}