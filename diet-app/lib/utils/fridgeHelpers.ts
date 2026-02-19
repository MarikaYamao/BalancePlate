import type { FridgeItemCategory } from '@/types';

// 食材名からカテゴリを推定する辞書
const INGREDIENT_CATEGORY_MAP: Record<string, FridgeItemCategory> = {
  // 野菜
  'にんじん': 'vegetables', 'キャベツ': 'vegetables', 'レタス': 'vegetables', 'たまねぎ': 'vegetables',
  'じゃがいも': 'vegetables', 'トマト': 'vegetables', 'きゅうり': 'vegetables', 'なす': 'vegetables',
  'ピーマン': 'vegetables', 'ほうれん草': 'vegetables', 'もやし': 'vegetables', 'ブロッコリー': 'vegetables',
  'アスパラガス': 'vegetables', 'ズッキーニ': 'vegetables', 'オクラ': 'vegetables', 'かぼちゃ': 'vegetables',
  'だいこん': 'vegetables', 'はくさい': 'vegetables', '小松菜': 'vegetables', '水菜': 'vegetables',
  'ねぎ': 'vegetables', '長ねぎ': 'vegetables', 'にら': 'vegetables', 'セロリ': 'vegetables',
  'ごぼう': 'vegetables', 'れんこん': 'vegetables', 'しいたけ': 'vegetables', 'えのき': 'vegetables',
  'しめじ': 'vegetables', 'まいたけ': 'vegetables', 'エリンギ': 'vegetables', 'マッシュルーム': 'vegetables',
  
  // 果物
  'りんご': 'fruits', 'みかん': 'fruits', 'バナナ': 'fruits', 'いちご': 'fruits',
  'ぶどう': 'fruits', 'なし': 'fruits', 'もも': 'fruits', 'すいか': 'fruits',
  'メロン': 'fruits', 'パイナップル': 'fruits', 'キウイ': 'fruits', 'レモン': 'fruits',
  'ライム': 'fruits', 'オレンジ': 'fruits', 'グレープフルーツ': 'fruits', 'アボカド': 'fruits',
  
  // 肉類
  '鶏肉': 'meat', '豚肉': 'meat', '牛肉': 'meat', 'ひき肉': 'meat',
  'ベーコン': 'meat', 'ハム': 'meat', 'ソーセージ': 'meat', '手羽先': 'meat',
  '鶏もも肉': 'meat', '鶏むね肉': 'meat', '豚バラ': 'meat', '豚ロース': 'meat',
  '牛バラ': 'meat', '牛ロース': 'meat', 'レバー': 'meat',
  
  // 魚介類
  '鮭': 'seafood', 'さば': 'seafood', 'いわし': 'seafood', 'あじ': 'seafood',
  'まぐろ': 'seafood', 'かつお': 'seafood', 'ぶり': 'seafood', 'たい': 'seafood',
  'えび': 'seafood', 'かに': 'seafood', 'いか': 'seafood', 'たこ': 'seafood',
  'しじみ': 'seafood', 'あさり': 'seafood', 'ほたて': 'seafood', '刺身': 'seafood',
  
  // 乳製品
  '牛乳': 'dairy', 'バター': 'dairy', 'チーズ': 'dairy', 'ヨーグルト': 'dairy',
  '生クリーム': 'dairy', 'クリームチーズ': 'dairy', 'モッツァレラ': 'dairy',
  
  // 卵
  '卵': 'eggs', 'たまご': 'eggs',
  
  // 穀物・パン
  'パン': 'grains', '食パン': 'grains', 'フランスパン': 'grains', 'ロールパン': 'grains',
  '米': 'grains', 'パスタ': 'grains', 'うどん': 'grains', 'そば': 'grains',
  'ラーメン': 'grains', 'そうめん': 'grains', '小麦粉': 'grains', 'パン粉': 'grains',
  
  // 調味料
  '醤油': 'seasonings', 'みそ': 'seasonings', '塩': 'seasonings', '砂糖': 'seasonings',
  '酢': 'seasonings', 'みりん': 'seasonings', '料理酒': 'seasonings', '日本酒': 'seasonings',
  'オリーブオイル': 'seasonings', 'サラダ油': 'seasonings', 'ごま油': 'seasonings',
  'マヨネーズ': 'seasonings', 'ケチャップ': 'seasonings', 'ソース': 'seasonings',
  'わさび': 'seasonings', 'からし': 'seasonings', 'こしょう': 'seasonings', '胡椒': 'seasonings',
  '七味': 'seasonings', 'にんにく': 'seasonings', 'しょうが': 'seasonings', '生姜': 'seasonings',
  
  // 飲料
  'ジュース': 'beverages', 'お茶': 'beverages', 'コーヒー': 'beverages', '紅茶': 'beverages',
  'ビール': 'beverages', 'ワイン': 'beverages', '焼酎': 'beverages',
  '水': 'beverages', 'ミネラルウォーター': 'beverages', '炭酸水': 'beverages',
  
  // 冷凍食品
  '冷凍野菜': 'frozen', '冷凍餃子': 'frozen', '冷凍チャーハン': 'frozen', '冷凍うどん': 'frozen',
  '冷凍パスタ': 'frozen', 'アイス': 'frozen', 'アイスクリーム': 'frozen',
  
  // 缶詰・保存食品
  'ツナ缶': 'canned', 'コーン缶': 'canned', 'トマト缶': 'canned', '鯖缶': 'canned',
  '納豆': 'canned', '豆腐': 'canned', '味噌汁の素': 'canned', 'インスタント': 'canned',
  'レトルト': 'canned', 'パックご飯': 'canned'
};

// よく使われる食材のサジェストリスト（簡素化版）
export const POPULAR_INGREDIENTS = [
  // 基本野菜
  'にんじん', 'たまねぎ', 'じゃがいも', 'キャベツ', 'もやし',
  // 基本肉類
  '鶏肉', '豚肉', '牛肉', 'ひき肉',
  // 基本その他
  '卵', '牛乳', 'パン', '米', '豆腐'
] as const;

/**
 * 食材名からカテゴリを推定する
 */
export function predictCategory(ingredientName: string): FridgeItemCategory {
  const name = ingredientName.toLowerCase().trim();
  
  // 完全一致を確認
  if (INGREDIENT_CATEGORY_MAP[name]) {
    return INGREDIENT_CATEGORY_MAP[name];
  }
  
  // 部分一致を確認（包含関係）
  for (const [key, category] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      return category;
    }
  }
  
  // 推定できない場合は野菜をデフォルトとする（最も一般的）
  return 'vegetables';
}

/**
 * 手持ち食材リストをAI提案用の文字列に変換
 */
export function formatIngredientsForAI(ingredients: string[]): string {
  if (ingredients.length === 0) return '';
  return ingredients.join(', ');
}