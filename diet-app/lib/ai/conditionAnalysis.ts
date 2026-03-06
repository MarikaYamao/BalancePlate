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

interface MealPlan {
  planA: {
    title: string;
    menu: string;
    description: string;
  };
  planB: {
    title: string;
    menu: string;
    description: string;
  };
  planC: {
    title: string;
    menu: string;
    description: string;
  };
}

export async function generateConditionFeedback({
  conditionTags,
  note,
}: ConditionFeedbackParams): Promise<{ feedback: string; foodSuggestions: FoodSuggestion; mealPlans: { [key: string]: MealPlan } }> {
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
  
  // 食事プランを生成
  const mealPlans = generateMealPlans(conditionTags);

  return { feedback, foodSuggestions, mealPlans };
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

function generateMealPlans(conditionTags: ConditionTag[]): { [key: string]: MealPlan } {
  const hasPhysicalIssue = conditionTags.some(tag => 
    tag.includes("tired") || tag.includes("sleep"));
  const hasMentalIssue = conditionTags.some(tag => 
    tag.includes("stress") || tag.includes("irritable"));
  const hasGoodCondition = conditionTags.some(tag => 
    tag.includes("good") || tag.includes("energetic"));
  
  let mealPlans: { [key: string]: MealPlan } = {};

  if (hasPhysicalIssue) {
    mealPlans.lunch = {
      planA: {
        title: "消化の良い定食",
        menu: "鶏そぼろ丼、みそ汁、温野菜サラダ",
        description: "胃に優しく、疲労回復に効果的なビタミンB群を豊富に含む"
      },
      planB: {
        title: "栄養スープセット", 
        menu: "野菜たっぷりスープ、全粒粉パン、ヨーグルト",
        description: "温かく消化しやすい。タンパク質とビタミンをバランスよく摂取"
      },
      planC: {
        title: "疲労回復うどん",
        menu: "かけうどん、温泉卵、ほうれん草のおひたし",
        description: "炭水化物で即効性のエネルギー補給。鉄分とビタミンも豊富"
      }
    };
    
    mealPlans.dinner = {
      planA: {
        title: "回復定食",
        menu: "鮭の塩焼き、ご飯、具沢山みそ汁、納豆",
        description: "良質なタンパク質とオメガ3で疲労回復をサポート"
      },
      planB: {
        title: "温活鍋",
        menu: "豆腐と野菜の湯豆腐、雑炊、漬物",
        description: "身体を温めて消化を促進。優しい味付けで胃に負担をかけない"
      },
      planC: {
        title: "栄養粥セット",
        menu: "卵粥、蒸し野菜、豆乳スープ",
        description: "消化に優しく栄養価の高い。就寝前でも安心して食べられる"
      }
    };
  } else if (hasMentalIssue) {
    mealPlans.lunch = {
      planA: {
        title: "リラックスランチ",
        menu: "アボカドサーモン丼、具沢山スープ、ハーブティー",
        description: "オメガ3とトリプトファンでストレス軽減をサポート"
      },
      planB: {
        title: "癒しカフェセット",
        menu: "キッシュ、サラダ、カモミールティー",
        description: "リラックス効果のある食材とハーブで心を落ち着ける"
      },
      planC: {
        title: "抗ストレス定食",
        menu: "鶏むね肉のグリル、玄米、野菜炒め、緑茶",
        description: "ビタミンB群とマグネシウムでストレス対処能力を向上"
      }
    };
    
    mealPlans.dinner = {
      planA: {
        title: "安眠サポート定食",
        menu: "白身魚の煮付け、ご飯、温野菜、豆腐の味噌汁",
        description: "トリプトファンと温かい料理で質の良い睡眠をサポート"
      },
      planB: {
        title: "リラックス鍋",
        menu: "豚しゃぶしゃぶ、うどん、温野菜、ポン酢",
        description: "ビタミンB群豊富な豚肉と温かい鍋で心身をリラックス"
      },
      planC: {
        title: "癒しの和食",
        menu: "煮魚、炊き込みご飯、お吸い物、ひじきの煮物",
        description: "優しい和食で心を落ち着け、栄養バランスも良好"
      }
    };
  } else if (hasGoodCondition) {
    mealPlans.lunch = {
      planA: {
        title: "エネルギーランチ",
        menu: "パワーボウル（キヌア、アボカド、グリルチキン）、スムージー",
        description: "良いコンディションを維持する栄養価の高いスーパーフード"
      },
      planB: {
        title: "バランス定食",
        menu: "鯖の塩焼き、玄米、野菜サラダ、味噌汁",
        description: "オメガ3と食物繊維で健康状態をさらに向上させる"
      },
      planC: {
        title: "活力パスタ",
        menu: "全粒粉パスタ、野菜とシーフード、サラダ",
        description: "複合炭水化物と良質なタンパク質でエネルギーを持続"
      }
    };
    
    mealPlans.dinner = {
      planA: {
        title: "完全栄養定食",
        menu: "鶏むね肉のハーブ焼き、キヌア、ロースト野菜",
        description: "高タンパク低脂肪で栄養価抜群。アクティブな生活をサポート"
      },
      planB: {
        title: "地中海風ディナー",
        menu: "魚のオリーブオイル焼き、全粒粉パン、サラダ",
        description: "抗酸化物質と良質な脂質で健康維持に最適"
      },
      planC: {
        title: "スーパーフード鍋",
        menu: "豆腐と野菜の鍋、雑穀米、海藻サラダ",
        description: "栄養密度の高い食材で体調の良い状態をキープ"
      }
    };
  } else {
    // デフォルト
    mealPlans.lunch = {
      planA: {
        title: "バランスランチ",
        menu: "鶏照り焼き定食、ご飯、味噌汁、サラダ",
        description: "バランスの取れた定番メニューで栄養をしっかり摂取"
      },
      planB: {
        title: "ヘルシー定食",
        menu: "焼き魚、玄米、野菜炒め、豆腐スープ",
        description: "良質なタンパク質と食物繊維で健康的な食事"
      },
      planC: {
        title: "栄養パスタ",
        menu: "ボロネーゼパスタ、サラダ、野菜スープ",
        description: "炭水化物とタンパク質をバランスよく摂取できるイタリアン"
      }
    };
    
    mealPlans.dinner = {
      planA: {
        title: "家庭的定食",
        menu: "豚しょうが焼き、ご飯、味噌汁、小鉢",
        description: "栄養バランスが良く満足感のある定番の夕食"
      },
      planB: {
        title: "和風ヘルシー",
        menu: "鮭の西京焼き、ご飯、お吸い物、煮物",
        description: "優しい味付けの和食で消化に良く栄養価も高い"
      },
      planC: {
        title: "洋風ディナー",
        menu: "チキンソテー、ライス、コーンスープ、サラダ",
        description: "洋風の味付けで食欲をそそる栄養バランスの良い夕食"
      }
    };
  }
  
  return mealPlans;
}