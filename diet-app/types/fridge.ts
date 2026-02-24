// Fridge and food inventory related types

export type FridgeItemCategory = 
  | 'vegetables' // 野菜
  | 'fruits' // 果物
  | 'meat' // 肉類
  | 'seafood' // 魚介類
  | 'dairy' // 乳製品
  | 'eggs' // 卵
  | 'grains' // 穀物・パン
  | 'seasonings' // 調味料
  | 'beverages' // 飲料
  | 'frozen' // 冷凍食品
  | 'canned' // 缶詰・保存食品
  | 'other'; // その他

export interface FridgeItem {
  id: string; // UUID
  
  // 基本情報
  name: string; // 食材名
  category: FridgeItemCategory; // カテゴリ
  
  // AI提案用の優先度情報（シンプル化）
  available: boolean; // 手持ちがあるか（true: ある, false: 使い切った）
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // 論理削除
}