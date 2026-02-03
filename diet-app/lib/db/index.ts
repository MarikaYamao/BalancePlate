/**
 * データベースモジュールのエクスポート
 */

// 通常のデータベース
export { db, initializeDatabase, getDatabaseInfo } from './database';

// 暗号化対応データベース
export { encryptedDb, initializeEncryptedDatabase, getEncryptedDatabaseInfo } from './encryptedDatabase';

// リポジトリ
export * from './repositories';