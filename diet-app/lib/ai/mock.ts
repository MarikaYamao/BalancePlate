// AI機能のモック実装（テスト用）
import type { AIPromptContext } from './prompts';

export function generateMockResponse(context: AIPromptContext): string {
  const { userProfile, todayCondition, requestType } = context;
  
  // コンディションに基づく提案の調整
  const isOnPeriod = todayCondition.conditionTags.includes('period_during');
  const isPeriodBefore = todayCondition.conditionTags.includes('period_before');
  const isPeriodRelated = isOnPeriod || isPeriodBefore;
  const isStressed = todayCondition.conditionTags.includes('stressed');
  const isTired = todayCondition.conditionTags.includes('tired_high') || 
                   todayCondition.conditionTags.includes('tired_medium') ||
                   todayCondition.conditionTags.includes('sleep_bad');
  const hasEdemaToday = todayCondition.conditionTags.includes('edema_high') || 
                        todayCondition.conditionTags.includes('edema_medium') ||
                        isPeriodBefore; // 生理前はむくみやすい
  
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

    return `朝食を記録しました。

### 栄養状況
- **現状**: 朝食でエネルギー補給完了
- **次の調整**: ${hasWeakStomach ? '消化に優しいものを選択中。野菜をもう少し追加' : 'タンパク質（卵、納豆など）を追加で満足感アップ'}

${lunchSuggestions}### 夕食の提案（3パターン）
- **A. バランス重視**: ${isOnPeriod ? '鉄分豊富な赤身肉と緑黄色野菜の炒め物、玄米' : '焼き魚定食と野菜の小鉢2品'}
- **B. 軽め**: ${hasWeakStomach ? '野菜と豆腐の雑炊、温野菜サラダ' : '鶏団子スープとサラダ、全粒粉パン'}
- **C. 簡単**: ${isTired ? '冷凍餃子と野菜炒め、インスタント味噌汁' : 'パスタに市販ソース、袋サラダ'}

### 体調管理ポイント
- ${isStressed ? 'ストレスがあるので深呼吸や軽いストレッチを' : '水分をこまめに摂取（1.5L目安）'}
- ${isTired ? '可能なら15分程度の仮眠を取り入れましょう' : '軽い運動で血行を促進'}`;
  }

  if (requestType === 'after_lunch') {
    return `昼食を記録しました。

### 栄養状況（朝食〜昼食）
- **現状**: 2食分のエネルギー摂取完了
- **次の調整**: ${isTired ? '疲労が見られるため、ビタミンB群を意識' : '午後に向けて野菜不足を補う'}

### 夕食の提案（3パターン）
- **A. 栄養重視**: ${hasWeakStomach ? '白身魚と野菜の蒸し物、お粥、豆腐' : '鮭のムニエル、ひじきの煮物、野菜サラダ、玄米'}
- **B. 軽め**: ${isOnPeriod ? 'ほうれん草と卵の雑炊、温野菜' : '豆腐サラダ、野菜スープ、全粒粉パン'}
- **C. 簡単**: ${isTired ? 'レトルトカレー、袋サラダ、ヨーグルト' : '冷凍パスタ、カット野菜、缶スープ'}

### 午後のポイント
- ${isStressed ? '5分間の深呼吸タイムを作る' : '適度な水分補給（午後だけで500ml目安）'}
- ${hasEdema ? 'むくみ解消のため、軽く足を動かす' : '可能なら15-20分程度の軽い散歩を'}`;
  }
  
  // consultation（夕食・間食・その他）の場合
  if (requestType === 'consultation') {
    return `食事を記録しました。

### 栄養状況
- **現状**: ${hasWeakStomach ? '消化に配慮した食事選択中' : '今日の食事記録完了'}
- **次の調整**: ${isOnPeriod ? '生理中のため鉄分を多めに。ほうれん草やレバーを追加' : '野菜の種類を増やしてバランス改善'}

### 明日に向けたアドバイス
- ${isStressed ? 'ストレス緩和のため、食事時間をゆったり確保' : '規則正しい食事時間で体のリズムを整える'}
- ${hasEdema ? 'むくみ予防にカリウムの多い食材（バナナ、アボカド）を追加' : '水分補給は1日1.5〜2Lを目安に'}

### 次のステップ
${isTired ? '疲労時は消化の良いものを選択。' : '明日も継続して記録。'}無理せず自分のペースで続けましょう。`;
  }
  
  // morning_planの場合（新フォーマット）
  const todayGuideline = isPeriodBefore
    ? "生理前のため鉄分・マグネシウム強化、むくみ・イライラ対策重視"
    : hasEdemaToday 
    ? "むくみ対策優先で、夜は塩分と炭水化物を軽め"
    : isOnPeriod 
    ? "生理中のため鉄分とタンパク質を意識、温かい食事中心"
    : isTired
    ? "疲労回復優先、ビタミンB群と消化に良いメニュー"
    : "バランス良く、野菜多めで胃腸に優しいメニュー";

  const avoidToday = [];
  if (isPeriodBefore) avoidToday.push("塩分過多・甘い物の摂りすぎに注意");
  if (hasEdemaToday || hasEdema) avoidToday.push("夜の汁物・加工肉は控えめ");
  if (hasWeakStomach) avoidToday.push("揚げ物・香辛料の強いものは避ける");
  // avoidTodayは空配列のままでOK（「特になし」は入れない）

  // adjustmentRuleにユーザーの条件を必ず反映
  const conditionPart = isPeriodBefore ? "生理前のため鉄分・マグネシウム強化" :
                        isOnPeriod ? "生理中のため鉄分強化" :
                        hasEdemaToday ? "むくみ対策で塩分控えめ" :
                        isTired ? "疲労回復のためビタミンB群重視" :
                        "体調安定のためバランス重視";
  
  const goalPart = context.goals?.goalType === 'weight_loss' ? "カロリー控えめ" :
                   context.goals?.goalType === 'weight_gain' ? "カロリーしっかり" :
                   "適正カロリー維持";
  
  const adjustmentRule = `${conditionPart}、${goalPart}で調整`;

  const mealSuggestions = is2Meals ? (
    isPeriodBefore ? {
      "breakfast": {
        "convenience": "納豆巻き、豆乳、アーモンド小袋",
        "simpleCooking": "納豆ご飯、ほうれん草の胡麻和え、味噌汁",
        "normalCooking": "鮭の塩焼き、ひじきの煮物、玄米、豆腐の味噌汁"
      },
      "dinner": {
        "convenience": "レバニラ弁当、ほうれん草サラダ、ヨーグルト",
        "simpleCooking": "豚レバーと野菜炒め、玄米、わかめスープ",
        "normalCooking": "牛肉とほうれん草の炒め物、アサリの味噌汁、玄米"
      }
    } : {
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
    }
  ) : {
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
      "overall": "現在の食事状況を分析しました。次の食事で調整しましょう。",
      "positive": "継続記録ができているため、パターン把握が進んでいます",
      "suggestions": ["水分をこまめに摂る", "野菜の種類を増やす"],
      "encouragement": "無理せず自分のペースで続けましょう"
    },
    "nutritionAdvice": {
      "focus": isPeriodBefore ? ["鉄分", "マグネシウム"] : 
               hasEdemaToday ? ["カリウム", "タンパク質"] : 
               ["ビタミン", "タンパク質"],
      "avoid": isPeriodBefore ? ["塩分", "精製糖"] :
               hasEdemaToday ? ["塩分", "加工食品"] : 
               ["揚げ物"],
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