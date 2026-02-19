// AI機能のモック実装（テスト用）
import type { AIPromptContext } from './prompts';

export function generateMockResponse(context: AIPromptContext): string {
  const { userProfile, todayCondition, requestType } = context;
  
  // コンディションに基づく提案の調整
  const isOnPeriod = todayCondition.conditionTags.includes('period_during');
  const isStressed = todayCondition.conditionTags.includes('stressed');
  const isTired = todayCondition.conditionTags.includes('tired_high') || 
                   todayCondition.conditionTags.includes('tired_medium') ||
                   todayCondition.conditionTags.includes('sleep_bad');
  const hasEdemaToday = todayCondition.conditionTags.includes('edema_high') || 
                        todayCondition.conditionTags.includes('edema_medium');
  
  // 体質に基づく配慮
  const hasWeakStomach = userProfile.bodyConstitution.includes('weak_stomach');
  const hasBloating = userProfile.bodyConstitution.includes('bloating_prone');
  const hasEdema = userProfile.bodyConstitution.includes('edema_prone');
  const hasPMS = userProfile.bodyConstitution.includes('pms_severe');
  const is2Meals = userProfile.mealsPerDay === 2;

  // 食後フィードバックの場合
  if (requestType === 'after_breakfast') {
    const lunchSuggestions = userProfile.mealsPerDay === 3 ? `### 昼食の提案（3パターン）
- **A. しっかり**: 鶏肉と野菜の定食、ご飯、味噌汁
- **B. 軽め**: 野菜たっぷりのスープとパン
- **C. 手軽**: コンビニのサラダチキンとおにぎり、野菜ジュース

` : '';

    return `お疲れ様でした！朝食の記録をありがとうございます。

### 栄養評価
- **良い点**: 朝からしっかり食事を摂れていて素晴らしいです
- **改善提案**: ${hasWeakStomach ? '消化に優しいものを選んでいますが、野菜をもう少し追加できると良いですね' : 'タンパク質（卵、納豆など）を追加するとより満足感が得られます'}

${lunchSuggestions}### 夕食の提案（3パターン）
- **A. バランス重視**: ${isOnPeriod ? '鉄分豊富な赤身肉と緑黄色野菜の炒め物、玄米' : '焼き魚定食と野菜の小鉢2品'}
- **B. 軽め**: ${hasWeakStomach ? '野菜と豆腐の雑炊、温野菜サラダ' : '鶏団子スープとサラダ、全粒粉パン'}
- **C. 簡単**: ${isTired ? '冷凍餃子と野菜炒め、インスタント味噌汁' : 'パスタに市販ソース、袋サラダ'}

### 体調管理ポイント
- ${isStressed ? 'ストレスがあるので深呼吸や軽いストレッチを' : '水分をこまめに摂取（1.5L目安）'}
- ${isTired ? '可能なら15分程度の仮眠を取り入れましょう' : '軽い運動で血行を促進'}`;
  }

  if (requestType === 'after_lunch') {
    return `お疲れ様でした！昼食の記録をありがとうございます。

### 栄養評価（朝食〜昼食）
- **良い点**: 2食しっかり記録できていて、継続する姿勢が素晴らしいです
- **改善提案**: ${isTired ? '疲れが見られるので、ビタミンB群を意識して摂取しましょう' : '午後に向けて野菜不足を補うと良いでしょう'}

### 夕食の提案（3パターン）
- **A. 栄養重視**: ${hasWeakStomach ? '白身魚と野菜の蒸し物、お粥、豆腐' : '鮭のムニエル、ひじきの煮物、野菜サラダ、玄米'}
- **B. 軽め**: ${isOnPeriod ? 'ほうれん草と卵の雑炊、温野菜' : '豆腐サラダ、野菜スープ、全粒粉パン'}
- **C. 簡単**: ${isTired ? 'レトルトカレー、袋サラダ、ヨーグルト' : '冷凍パスタ、カット野菜、缶スープ'}

### 午後のポイント
- ${isStressed ? '5分間の深呼吸タイムを作りましょう' : '適度な水分補給（午後だけで500ml目安）'}
- ${hasEdema ? 'むくみ解消のため、軽く足を動かす' : '可能なら15-20分程度の軽い散歩を'}`;
  }
  
  // consultation（夕食・間食・その他）の場合
  if (requestType === 'consultation') {
    return `お疲れ様でした！食事の記録をありがとうございます。

### 栄養評価
- **良い点**: ${hasWeakStomach ? '消化に配慮した食事選びができていて良いですね' : '今日もしっかりと食事記録を続けられていて素晴らしいです'}
- **改善提案**: ${isOnPeriod ? '生理中は鉄分を多めに摂りましょう。ほうれん草やレバーがおすすめです' : '野菜の種類をもう少し増やすと、さらにバランスが良くなります'}

### 明日に向けたアドバイス
- ${isStressed ? 'ストレス解消のために、好きな音楽を聴きながら食事をしてみてください' : '規則正しい食事時間を心がけると、体のリズムが整います'}
- ${hasEdema ? 'むくみ予防に、カリウムの多い食材（バナナ、アボカド）を取り入れてみて' : '水分補給も忘れずに、1日1.5〜2Lを目安にしましょう'}

### 励ましメッセージ
今日もお疲れ様でした！${isTired ? '疲れている中でも食事記録を続けているあなたは本当に素晴らしいです。' : '継続は力なり、あなたの努力がきっと良い結果に繋がります。'}明日も無理をせず、自分のペースで続けていきましょう🌟`;
  }
  
  // morning_planの場合（新フォーマット）
  const todayGuideline = hasEdemaToday 
    ? "むくみ対策優先で、夜は塩分と炭水化物を軽め"
    : isOnPeriod 
    ? "生理中のため鉄分とタンパク質を意識、温かい食事中心"
    : isTired
    ? "疲労回復優先、ビタミンB群と消化に良いメニュー"
    : "バランス良く、野菜多めで胃腸に優しいメニュー";

  const avoidToday = [];
  if (hasEdemaToday || hasEdema) avoidToday.push("夜の汁物・加工肉は控えめ");
  if (hasWeakStomach) avoidToday.push("揚げ物・香辛料の強いものは避ける");
  if (avoidToday.length === 0) avoidToday.push("特になし");

  const adjustmentRule = context.previousDayData?.meals && context.previousDayData.meals.length > 0
    ? "昨日の食事を踏まえて野菜を増やし、塩分を控えめに調整"
    : "初日なのでバランス重視で基本的な栄養配分";

  const mealSuggestions = is2Meals ? {
    "breakfast": {
      "convenience": "サンドイッチ、ヨーグルト、野菜ジュース",
      "simpleCooking": "卵かけご飯、インスタント味噌汁、冷凍ほうれん草",
      "normalCooking": "焼き鮭定食、ひじきの煮物、味噌汁"
    },
    "dinner": {
      "convenience": "コンビニ弁当（野菜多め）、サラダ、ヨーグルト",
      "simpleCooking": "豚肉と野菜の炒め物、ご飯、インスタントスープ",
      "normalCooking": "鶏肉の照り焼き、野菜の煮物、玄米、味噌汁"
    }
  } : {
    "breakfast": {
      "convenience": "おにぎり2個、ゆで卵、野菜ジュース",
      "simpleCooking": "トースト、目玉焼き、インスタントスープ",
      "normalCooking": "和定食（ご飯、焼き魚、味噌汁、納豆）"
    },
    "lunch": {
      "convenience": "コンビニパスタ、サラダチキン、野菜スープ",
      "simpleCooking": "チャーハン、わかめスープ、冷凍餃子",
      "normalCooking": "鶏肉と野菜の煮物定食、サラダ"
    },
    "dinner": {
      "convenience": "コンビニ弁当、サラダ、ヨーグルト",
      "simpleCooking": "パスタ（市販ソース）、袋サラダ",
      "normalCooking": "白身魚の蒸し物、温野菜、雑穀ご飯"
    }
  };

  const mockResponse = JSON.stringify({
    "todayGuideline": todayGuideline,
    "mealSuggestions": mealSuggestions,
    "avoidToday": avoidToday.slice(0, 2),
    "adjustmentRule": adjustmentRule,
    "feedback": {
      "overall": "今日も食事管理お疲れ様です！",
      "positive": ["継続できていることが素晴らしいです"],
      "suggestions": ["水分をこまめに摂りましょう"],
      "encouragement": "無理せず自分のペースで続けていきましょう"
    },
    "nutritionAdvice": {
      "focus": [hasEdemaToday ? "カリウム" : "ビタミン", "タンパク質"],
      "avoid": hasEdemaToday ? ["塩分", "加工食品"] : ["揚げ物"],
      "hydration": "1日1.5〜2Lを目安に水分補給"
    },
    "metadata": {
      "generatedAt": new Date().toISOString(),
      "conditionTags": todayCondition.conditionTags,
      "context": "morning"
    }
  }, null, 2);

  return mockResponse;
}

// モック機能の有効/無効を切り替える
export function isMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_MOCK === 'true' || 
         process.env.NODE_ENV === 'development';
}

// 遅延を入れてリアルなAPI感を演出
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}