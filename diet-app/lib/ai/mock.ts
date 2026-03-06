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

  // 食後フィードバックの場合（JSON構造化レスポンス）
  if (requestType === 'after_breakfast') {
    const mealSuggestions: any = {};
    
    // 昼食提案（3食の場合のみ）
    if (userProfile.mealsPerDay === 3) {
      mealSuggestions.lunch = {
        planA: {
          title: "しっかり定食",
          menu: "鶏肉と野菜の定食、ご飯、味噌汁",
          description: "バランス良くタンパク質と野菜を摂取"
        },
        planB: {
          title: "軽めランチ",
          menu: "野菜たっぷりのスープとパン",
          description: "消化に優しく野菜豊富"
        },
        planC: {
          title: "手軽選択",
          menu: "コンビニのサラダチキンとおにぎり、野菜ジュース",
          description: "忙しい日でもタンパク質確保"
        }
      };
    }

    // 夕食提案
    mealSuggestions.dinner = {
      planA: {
        title: "バランス重視",
        menu: isOnPeriod ? "鉄分豊富な赤身肉と緑黄色野菜の炒め物、玄米" : "焼き魚定食と野菜の小鉢2品",
        description: isOnPeriod ? "生理中の鉄分補給を重視" : "栄養バランスを考慮した定食"
      },
      planB: {
        title: "軽め選択",
        menu: hasWeakStomach ? "野菜と豆腐の雑炊、温野菜サラダ" : "鶏団子スープとサラダ、全粒粉パン",
        description: hasWeakStomach ? "胃に優しい消化の良い食事" : "軽めでもタンパク質しっかり"
      },
      planC: {
        title: "簡単調理",
        menu: isTired ? "冷凍餃子と野菜炒め、インスタント味噌汁" : "パスタに市販ソース、袋サラダ",
        description: isTired ? "疲労時でも手軽に栄養摂取" : "簡単調理で時短"
      }
    };

    return JSON.stringify({
      todayGuideline: "朝食でエネルギー補給完了。次の食事に向けて栄養バランスを整えましょう",
      avoidToday: hasWeakStomach ? ["油っぽいもの", "刺激の強いもの"] : [],
      adjustmentRule: hasWeakStomach 
        ? "消化に優しいものを選択中。野菜をもう少し追加"
        : "タンパク質（卵、納豆など）を追加で満足感アップ",
      feedback: {
        overall: "朝食を記録しました。エネルギー補給が完了し、良いスタートです",
        positive: "継続的な記録で食事リズムが整ってきています",
        suggestions: [
          isStressed ? "ストレス緩和のため深呼吸を取り入れる" : "水分をこまめに摂取（1.5L目安）",
          isTired ? "15分程度の仮眠で疲労回復" : "軽い運動で血行を促進"
        ],
        encouragement: "次の食事も無理なく継続していきましょう"
      },
      mealSuggestions,
      nutritionAdvice: {
        focus: isOnPeriod ? ["鉄分", "ビタミンC", "タンパク質"] : ["タンパク質", "食物繊維", "ビタミン類"],
        avoid: hasWeakStomach ? ["油っぽいもの", "刺激物"] : [],
        hydration: "1日1.5〜2Lを目安に、こまめに水分補給を"
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        conditionTags: todayCondition.conditionTags,
        context: "meal"
      }
    });
  }

  if (requestType === 'after_lunch') {
    const mealSuggestions: any = {
      dinner: {
        planA: {
          title: "栄養重視",
          menu: hasWeakStomach ? "白身魚と野菜の蒸し物、お粥、豆腐" : "鮭のムニエル、ひじきの煮物、野菜サラダ、玄米",
          description: hasWeakStomach ? "胃に優しく栄養価の高い食事" : "オメガ3と食物繊維で栄養バランス重視"
        },
        planB: {
          title: "軽め選択",
          menu: isOnPeriod ? "ほうれん草と卵の雑炊、温野菜" : "豆腐サラダ、野菜スープ、全粒粉パン",
          description: isOnPeriod ? "鉄分補給と消化の良さを両立" : "軽めでもタンパク質はしっかり"
        },
        planC: {
          title: "簡単調理",
          menu: isTired ? "レトルトカレー、袋サラダ、ヨーグルト" : "冷凍パスタ、カット野菜、缶スープ",
          description: isTired ? "疲労時でも栄養摂取できる手軽な組み合わせ" : "時短調理で栄養バランス確保"
        }
      }
    };

    return JSON.stringify({
      todayGuideline: "昼食を記録しました。2食分のエネルギー摂取が完了し、午後に向けて準備完了です",
      avoidToday: hasEdema ? ["塩分過多", "冷たい飲み物"] : [],
      adjustmentRule: isTired 
        ? "疲労が見られるため、ビタミンB群を意識して摂取"
        : "午後に向けて野菜不足を補い、バランス調整",
      feedback: {
        overall: "昼食を記録しました。朝食と昼食で基本的な栄養摂取は完了です",
        positive: "食事記録の継続で栄養バランスが見えてきています",
        suggestions: [
          isStressed ? "5分間の深呼吸タイムを作る" : "適度な水分補給（午後だけで500ml目安）",
          hasEdema ? "むくみ解消のため、軽く足を動かす" : "15-20分程度の軽い散歩を"
        ],
        encouragement: "夕食に向けて午後も体調を整えていきましょう"
      },
      mealSuggestions,
      nutritionAdvice: {
        focus: isTired ? ["ビタミンB群", "鉄分", "タンパク質"] : ["野菜", "食物繊維", "良質な脂質"],
        avoid: hasEdema ? ["塩分過多", "加工食品"] : [],
        hydration: "午後も継続的な水分補給を心がけて"
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        conditionTags: todayCondition.conditionTags,
        context: "meal"
      }
    });
  }
  
  // consultation（夕食・間食・その他）の場合
  if (requestType === 'consultation') {
    return JSON.stringify({
      todayGuideline: "食事を記録しました。今日の栄養摂取状況を振り返り、明日に向けて調整しましょう",
      avoidToday: hasWeakStomach ? ["刺激の強いもの", "油っぽいもの"] : [],
      adjustmentRule: isOnPeriod 
        ? "生理中のため鉄分を多めに。ほうれん草やレバーを追加"
        : "野菜の種類を増やしてバランス改善",
      feedback: {
        overall: hasWeakStomach ? "消化に配慮した食事選択を継続中" : "今日の食事記録が完了しました",
        positive: "継続的な記録で食事パターンが見えてきています",
        suggestions: [
          isStressed ? "ストレス緩和のため、食事時間をゆったり確保" : "規則正しい食事時間で体のリズムを整える",
          hasEdema ? "むくみ予防にカリウムの多い食材（バナナ、アボカド）を追加" : "水分補給は1日1.5〜2Lを目安に"
        ],
        encouragement: isTired ? "疲労時は消化の良いものを選択し、無理せず継続しましょう" : "明日も継続して記録し、自分のペースで続けましょう"
      },
      tomorrowAdvice: {
        focus: isOnPeriod ? "鉄分とタンパク質を意識した食事選び" : "野菜の種類を増やして栄養バランス向上",
        preparation: hasWeakStomach ? "胃に優しい食材の準備" : "バランス良い食材の買い物",
        mindset: "完璧を求めず、継続することを大切にする"
      },
      nutritionAdvice: {
        focus: isOnPeriod ? ["鉄分", "ビタミンC", "タンパク質"] : ["野菜", "食物繊維", "バランス"],
        avoid: hasWeakStomach ? ["刺激物", "油っぽいもの"] : [],
        hydration: "継続的な水分補給で体調管理"
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        conditionTags: todayCondition.conditionTags,
        context: "evening"
      }
    });
  }
  
  // morning_planの場合（新フォーマット）
  // 記録済み食事をチェックして除外する
  const recordedMealTypes = context.todayMeals?.map(meal => meal.type) || [];
  const hasBreakfast = recordedMealTypes.includes('breakfast');
  const hasLunch = recordedMealTypes.includes('lunch');
  const hasDinner = recordedMealTypes.includes('dinner');
  
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

  // 記録済み食事を除外した食事提案を生成
  const mealSuggestions: any = {};
  
  // 2食プランの場合
  if (is2Meals) {
    // 朝食が未記録の場合のみ提案
    if (!hasBreakfast) {
      mealSuggestions.breakfast = isPeriodBefore ? {
        "convenience": "納豆巻き、豆乳、アーモンド小袋",
        "simpleCooking": "納豆ご飯、ほうれん草の胡麻和え、味噌汁",
        "normalCooking": "鮭の塩焼き、ひじきの煮物、玄米、豆腐の味噌汁"
      } : {
        "convenience": "サンドイッチ、ヨーグルト、野菜ジュース",
        "simpleCooking": "卵かけご飯、インスタント味噌汁、冷凍ほうれん草",
        "normalCooking": "焼き鮭定食、ひじきの煮物、味噌汁"
      };
    }
    
    // 夕食が未記録の場合のみ提案
    if (!hasDinner) {
      mealSuggestions.dinner = isPeriodBefore ? {
        "convenience": "レバニラ弁当、ほうれん草サラダ、ヨーグルト",
        "simpleCooking": "豚レバーと野菜炒め、玄米、わかめスープ",
        "normalCooking": "牛肉とほうれん草の炒め物、アサリの味噌汁、玄米"
      } : {
        "convenience": "コンビニ弁当（野菜多め）、サラダ、ヨーグルト",
        "simpleCooking": "豚肉と野菜の炒め物、ご飯、インスタントスープ",
        "normalCooking": "鶏肉の照り焼き、野菜の煮物、玄米、味噌汁"
      };
    }
  } 
  // 3食プランの場合
  else {
    // 朝食が未記録の場合のみ提案
    if (!hasBreakfast) {
      mealSuggestions.breakfast = {
        "convenience": "おにぎり2個、ゆで卵、野菜ジュース",
        "simpleCooking": "トースト、目玉焼き、インスタントスープ",
        "normalCooking": "和定食（ご飯、焼き魚、味噌汁、納豆）"
      };
    }
    
    // 昼食が未記録の場合のみ提案
    if (!hasLunch) {
      mealSuggestions.lunch = {
        "convenience": "コンビニパスタ、サラダチキン、野菜スープ",
        "simpleCooking": "チャーハン、わかめスープ、冷凍餃子",
        "normalCooking": "鶏肉と野菜の煮物定食、サラダ"
      };
    }
    
    // 夕食が未記録の場合のみ提案
    if (!hasDinner) {
      mealSuggestions.dinner = {
        "convenience": "コンビニ弁当、サラダ、ヨーグルト",
        "simpleCooking": "パスタ（市販ソース）、袋サラダ",
        "normalCooking": "白身魚の蒸し物、温野菜、雑穀ご飯"
      };
    }
  }

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