import { conditionTagsInfo } from "@/lib/constants/conditionTags";
import type { ConditionTag } from "@/types";

interface ConditionFeedbackParams {
  conditionTags: ConditionTag[];
  note?: string;
  dateKey: string;
}

interface FoodSuggestion {
  characteristics: string[];
  recommendations: {
    category: string;
    items: string[];
  }[];
  avoid?: string[];
}

export async function generateConditionFeedback({
  conditionTags,
  note,
}: ConditionFeedbackParams): Promise<{ feedback: string; foodSuggestions: FoodSuggestion }> {
  // コンディションタグの詳細情報を取得
  const tagDetails = conditionTags
    .map((tagId) => conditionTagsInfo.find((t) => t.id === tagId))
    .filter(Boolean);

  // カテゴリ別に分類
  const hasPhysicalIssue = tagDetails.some((tag) =>
    tag?.id.includes("tired") || tag?.id.includes("sleep")
  );
  const hasMentalIssue = tagDetails.some((tag) =>
    tag?.id.includes("stress") || tag?.id.includes("irritable")
  );
  const hasGoodCondition = tagDetails.some((tag) =>
    tag?.id.includes("good") || tag?.id.includes("energetic")
  );

  // フィードバックを生成（実際のAI APIを使用する場合はここを置き換え）
  let feedback = "";

  if (hasGoodCondition) {
    feedback = "素晴らしい体調ですね！✨\n\n";
    feedback += "今日の良いコンディションを維持するためのポイント：\n";
    feedback += "• バランスの良い食事を継続しましょう\n";
    feedback += "• 適度な運動を心がけましょう\n";
    feedback += "• 十分な睡眠時間を確保しましょう\n\n";
    feedback += "この調子を維持できるよう、無理のない範囲で活動してください。";
  } else if (hasPhysicalIssue && hasMentalIssue) {
    feedback = "心身ともにお疲れのようですね。\n\n";
    feedback += "今日は特に以下の点を意識してください：\n";
    feedback += "• 消化の良い温かい食事を選びましょう\n";
    feedback += "• カフェインは控えめにして、ハーブティーなどでリラックス\n";
    feedback += "• 早めの就寝を心がけ、睡眠の質を優先しましょう\n";
    feedback += "• 深呼吸や軽いストレッチで緊張をほぐしましょう\n\n";
    feedback += "無理せず、ご自身のペースで回復を優先してくださいね。";
  } else if (hasPhysicalIssue) {
    feedback = "身体的な疲れが見られるようです。\n\n";
    feedback += "体力回復のためのアドバイス：\n";
    feedback += "• ビタミンB群を含む食材（豚肉、納豆、卵など）を摂取\n";
    feedback += "• 消化に負担のかからない食事を選択\n";
    feedback += "• 十分な水分補給を心がける\n";
    feedback += "• 可能なら短時間の昼寝（15-20分）を取る\n\n";
    feedback += "身体のサインに耳を傾けて、休息を大切にしてください。";
  } else if (hasMentalIssue) {
    feedback = "精神的なストレスを感じているようですね。\n\n";
    feedback += "心のケアのための提案：\n";
    feedback += "• トリプトファンを含む食材（バナナ、チーズ、大豆など）でセロトニン分泌を促進\n";
    feedback += "• 好きな音楽を聴いたり、軽い散歩でリフレッシュ\n";
    feedback += "• 温かいお風呂でリラックスタイムを作る\n";
    feedback += "• 誰かと話したり、感情を書き出してみる\n\n";
    feedback += "ストレスは誰にでもあるもの。自分に優しくしてくださいね。";
  } else {
    feedback = "今日のコンディションを記録しました。\n\n";
    feedback += "健康維持のための基本ポイント：\n";
    feedback += "• 規則正しい食事時間を心がける\n";
    feedback += "• 栄養バランスを意識した食事選び\n";
    feedback += "• 適度な運動と休息のバランス\n";
    feedback += "• 質の良い睡眠の確保\n\n";
    feedback += "日々の記録が健康管理の第一歩です。継続していきましょう！";
  }

  if (note) {
    feedback += "\n\n📝 あなたのメモより：\n";
    feedback += `「${note}」\n`;
    feedback += "このメモも含めて、今後の体調管理の参考にしていきましょう。";
  }

  // 食事提案を生成
  const foodSuggestions = generateFoodSuggestions(conditionTags);

  return { feedback, foodSuggestions };
}

function generateFoodSuggestions(conditionTags: ConditionTag[]): FoodSuggestion {
  const tagDetails = conditionTags
    .map((tagId) => conditionTagsInfo.find((t) => t.id === tagId))
    .filter(Boolean);

  const characteristics: string[] = [];
  const recommendations: { category: string; items: string[] }[] = [];
  const avoid: string[] = [];

  // 疲労感が高い場合
  if (conditionTags.includes("tired_high") || conditionTags.includes("tired_medium")) {
    characteristics.push("消化に良いもの", "温かい料理", "ビタミンB群豊富");
    recommendations.push(
      { category: "主食", items: ["おかゆ", "雑炊", "うどん", "温かいスープパスタ"] },
      { category: "たんぱく質", items: ["豆腐", "卵", "白身魚", "鶏むね肉"] },
      { category: "野菜", items: ["かぼちゃ", "にんじん", "ほうれん草", "大根"] }
    );
    avoid.push("揚げ物", "脂っこい料理", "冷たい飲み物", "カフェイン過多");
  }

  // 睡眠不足の場合
  if (conditionTags.includes("sleep_bad")) {
    characteristics.push("トリプトファン豊富", "マグネシウム含有", "軽めの食事");
    recommendations.push(
      { category: "主食", items: ["玄米", "全粒粉パン", "オートミール"] },
      { category: "たんぱく質", items: ["納豆", "チーズ", "ヨーグルト", "豆乳"] },
      { category: "その他", items: ["バナナ", "アーモンド", "はちみつ", "カモミールティー"] }
    );
    avoid.push("カフェイン", "アルコール", "砂糖の多い食品", "夜遅い重い食事");
  }

  // ストレスがある場合
  if (conditionTags.includes("stressed")) {
    characteristics.push("抗酸化物質豊富", "ビタミンC含有", "心を落ち着ける");
    recommendations.push(
      { category: "野菜・果物", items: ["ブロッコリー", "パプリカ", "キウイ", "オレンジ"] },
      { category: "リラックス食材", items: ["ダークチョコレート", "ナッツ類", "緑茶", "ハーブティー"] },
      { category: "主菜", items: ["サーモン", "さば", "アボカド", "オリーブオイル"] }
    );
    avoid.push("加工食品", "ファストフード", "糖分の多い飲料");
  }

  // むくみがある場合
  if (conditionTags.includes("edema_high") || conditionTags.includes("edema_medium")) {
    characteristics.push("カリウム豊富", "塩分控えめ", "利尿作用あり");
    recommendations.push(
      { category: "野菜", items: ["きゅうり", "トマト", "アスパラガス", "セロリ"] },
      { category: "果物", items: ["スイカ", "メロン", "グレープフルーツ", "キウイ"] },
      { category: "飲み物", items: ["ハトムギ茶", "とうもろこし茶", "レモン水"] }
    );
    avoid.push("塩分の多い食品", "インスタント食品", "アルコール", "炭酸飲料");
  }

  // 胃腸が弱っている場合
  if (conditionTags.includes("stomach_weak") || conditionTags.includes("constipated")) {
    characteristics.push("食物繊維豊富", "発酵食品", "消化しやすい");
    recommendations.push(
      { category: "発酵食品", items: ["ヨーグルト", "納豆", "味噌汁", "ぬか漬け"] },
      { category: "食物繊維", items: ["さつまいも", "ごぼう", "キャベツ", "りんご"] },
      { category: "水分", items: ["白湯", "温かいスープ", "野菜ジュース"] }
    );
    avoid.push("刺激物", "油っぽいもの", "生もの", "冷たいもの");
  }

  // 生理前・生理中の場合
  if (conditionTags.includes("period_before") || conditionTags.includes("period_during")) {
    characteristics.push("鉄分豊富", "温かい料理", "血行促進");
    recommendations.push(
      { category: "鉄分補給", items: ["レバー", "ひじき", "小松菜", "あさり"] },
      { category: "温活食材", items: ["生姜", "ねぎ", "にんにく", "シナモン"] },
      { category: "その他", items: ["豆腐", "ナッツ", "ダークチョコレート", "ハーブティー"] }
    );
    avoid.push("カフェイン過多", "冷たい飲食物", "糖分の多いもの");
  }

  // 調子が良い場合
  if (conditionTags.includes("normal") || conditionTags.some(tag => tag.includes("good"))) {
    characteristics.push("バランス重視", "栄養価の高い", "季節の食材");
    recommendations.push(
      { category: "バランス食", items: ["季節の野菜", "新鮮な魚介類", "良質なたんぱく質", "全粒穀物"] },
      { category: "エネルギー源", items: ["玄米", "さつまいも", "オートミール", "キヌア"] },
      { category: "活力アップ", items: ["ベリー類", "ナッツ", "ヨーグルト", "緑黄色野菜"] }
    );
  }

  // デフォルト（特に指定がない場合）
  if (characteristics.length === 0) {
    characteristics.push("バランスの良い", "消化しやすい", "栄養豊富");
    recommendations.push(
      { category: "主食", items: ["ご飯", "パン", "パスタ", "うどん"] },
      { category: "たんぱく質", items: ["魚", "肉", "卵", "大豆製品"] },
      { category: "野菜", items: ["季節の野菜", "サラダ", "温野菜", "スープ"] }
    );
  }

  return {
    characteristics,
    recommendations,
    avoid: avoid.length > 0 ? avoid : undefined
  };
}