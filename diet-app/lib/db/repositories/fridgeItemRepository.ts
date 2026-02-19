import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import type { FridgeItem, FridgeItemCategory } from '@/types';
import { BaseRepository } from './baseRepository';

export class FridgeItemRepository extends BaseRepository {
  /**
   * 冷蔵庫アイテムを作成
   */
  async createFridgeItem(
    name: string,
    category: FridgeItemCategory,
    options: Partial<Omit<FridgeItem, 'id' | 'name' | 'category' | 'createdAt' | 'updatedAt'>> = {}
  ): Promise<FridgeItem> {
    const now = new Date();
    const fridgeItem: FridgeItem = {
      id: uuidv4(),
      name: name.trim(),
      category,
      available: options.available !== undefined ? options.available : true, // デフォルトは手持ちあり
      createdAt: now,
      updatedAt: now,
      deletedAt: options.deletedAt
    };

    await db.fridgeItems.add(fridgeItem);
    return fridgeItem;
  }

  /**
   * 冷蔵庫アイテムを取得（削除されていないもののみ）
   */
  async getFridgeItems(): Promise<FridgeItem[]> {
    return await db.fridgeItems
      .filter(item => !item.deletedAt)
      .reverse()
      .sortBy('createdAt');
  }

  /**
   * カテゴリ別の冷蔵庫アイテムを取得
   */
  async getFridgeItemsByCategory(category: FridgeItemCategory): Promise<FridgeItem[]> {
    return await db.fridgeItems
      .where({ category })
      .and(item => !item.deletedAt)
      .reverse()
      .sortBy('createdAt');
  }

  /**
   * 手持ちありのアイテムを取得
   */
  async getAvailableFridgeItems(): Promise<FridgeItem[]> {
    return await db.fridgeItems
      .filter(item => !item.deletedAt && item.available)
      .reverse()
      .sortBy('createdAt');
  }

  /**
   * アイテムをIDで取得
   */
  async getFridgeItemById(id: string): Promise<FridgeItem | undefined> {
    const item = await db.fridgeItems.get(id);
    return item?.deletedAt ? undefined : item;
  }

  /**
   * 冷蔵庫アイテムを更新
   */
  async updateFridgeItem(
    id: string,
    updates: Partial<Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<FridgeItem | null> {
    const existingItem = await this.getFridgeItemById(id);
    if (!existingItem) return null;

    const updatedData = {
      ...updates,
      updatedAt: new Date()
    };

    await db.fridgeItems.update(id, updatedData);
    
    const updatedItem = await db.fridgeItems.get(id);
    return updatedItem || null;
  }

  /**
   * 冷蔵庫アイテムを論理削除
   */
  async deleteFridgeItem(id: string): Promise<boolean> {
    const existingItem = await this.getFridgeItemById(id);
    if (!existingItem) return false;

    await db.fridgeItems.update(id, {
      deletedAt: new Date(),
      updatedAt: new Date()
    });

    return true;
  }

  /**
   * 冷蔵庫アイテムを物理削除
   */
  async permanentlyDeleteFridgeItem(id: string): Promise<boolean> {
    const count = await db.fridgeItems.where('id').equals(id).delete();
    return count > 0;
  }

  /**
   * カテゴリ別のアイテム数を取得
   */
  async getFridgeItemCountByCategory(): Promise<Record<FridgeItemCategory, number>> {
    const allItems = await this.getFridgeItems();
    
    const counts = allItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<FridgeItemCategory, number>);

    // 全カテゴリを含むオブジェクトを作成（0で初期化）
    const categories: FridgeItemCategory[] = [
      'vegetables', 'fruits', 'meat', 'seafood', 'dairy', 'eggs', 
      'grains', 'seasonings', 'beverages', 'frozen', 'canned', 'other'
    ];

    const result = {} as Record<FridgeItemCategory, number>;
    categories.forEach(category => {
      result[category] = counts[category] || 0;
    });

    return result;
  }

  /**
   * アイテム名で検索
   */
  async searchFridgeItemsByName(query: string): Promise<FridgeItem[]> {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    return await db.fridgeItems
      .filter(item => 
        !item.deletedAt &&
        item.name.toLowerCase().includes(searchTerm)
      )
      .reverse()
      .sortBy('createdAt');
  }

  /**
   * 全データをクリア（テスト用）
   */
  async clearAllFridgeItems(): Promise<void> {
    await db.fridgeItems.clear();
  }

  /**
   * 全データをクリア（BaseRepositoryの抽象メソッド実装）
   */
  async clearAll(): Promise<void> {
    await this.clearAllFridgeItems();
  }
}

export const fridgeItemRepository = new FridgeItemRepository();