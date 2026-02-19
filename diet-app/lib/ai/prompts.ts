import type { 
  BodyConstitutionTag, 
  LifestyleTag, 
  ConditionTag,
  GoalType,
  ActivityLevel 
} from '@/types';

// システムプロンプト
export const SYSTEM_PROMPT = `
あなたは食事提案専門AIです。
ユーザーの体質、生活習慣、今日のコンディションと目標を考慮して、
無理のない食事プランを提案してください。

重要な指針：
- 完璧を求めない、できることから始める
- 今日の状態に合わせた現実的な提案
- 励まし、肯定的なトーン
- 「〜しなければならない」という表現は避ける
- 体調が悪い時は無理をしない提案
- ユーザーの好きな食材を積極的に取り入れる
- ユーザーの嫌いな食材・アレルギー食材は絶対に避ける
- 必ず指定されたJSON形式で回答する
`;

// JSON形式でのレスポンス要求プロンプト
export const JSON_RESPONSE_PROMPT = `
必ず以下のJSON形式で回答してください。
テキストではなくJSON形式での返答を厳守してください。
JSONの構造は以下の通りです：

{
  "todayGuideline": "今日の方針（1行）：例「むくみ対策優先で、夜は塩分と炭水化物を軽め」",
  "mealSuggestions": {
    "breakfast": {
      "convenience": "コンビニメニュー",
      "simpleCooking": "簡単自炊メニュー",
      "normalCooking": "普通に自炊メニュー"
    },
    "lunch": {
      "convenience": "コンビニメニュー",
      "simpleCooking": "簡単自炊メニュー",
      "normalCooking": "普通に自炊メニュー"
    },
    "dinner": {
      "convenience": "コンビニメニュー",
      "simpleCooking": "簡単自炊メニュー",
      "normalCooking": "普通に自炊メニュー"
    }
  },
  "avoidToday": [
    "NG/注意1：例「夜の汁物」",
    "NG/注意2：例「加工肉は控えめ」"
  ],
  "adjustmentRule": "調整ルール（ログ反映の計算結果）：例「朝が重かったので昼は主食を半分＋タンパク質優先」",
  "feedback": {
    "overall": "総合的な評価をここに記載",
    "positive": ["良かった点1", "良かった点2"],
    "suggestions": ["改善提案1", "改善提案2"],
    "encouragement": "励ましのメッセージ"
  },
  "mealPlans": {
    "breakfast": {
      "menu": ["メニュー項目1", "メニュー項目2"],
      "preparation": "簡単" | "普通" | "手間",
      "alternatives": ["代替案1", "代替案2"],
      "reason": "この提案をする理由",
      "calories": 推定カロリー数値,
      "timing": "推奨時間"
    },
    "lunch": {
      同様の構造
    },
    "dinner": {
      同様の構造
    },
    "snack": {
      同様の構造（必要に応じて）
    }
  },
  "nutritionAdvice": {
    "focus": ["重視すべき栄養素1", "栄養素2"],
    "avoid": ["控えめにすべきもの1", "もの2"],
    "hydration": "水分摂取に関するアドバイス"
  },
  "metadata": {
    "generatedAt": "現在時刻のISO文字列",
    "conditionTags": ["入力されたコンディションタグ"],
    "context": "morning" | "meal" | "evening"
  }
}

重要：
- 必ずValidなJSONとして出力
- 文字列内の改行は\\nでエスケープ
- ダブルクォートは\\"でエスケープ
- mealPlansは提案が必要な食事のみ含める
- caloriesは数値型で出力
`;

// 体質タグの日本語ラベル
export const BODY_CONSTITUTION_LABELS: Record<BodyConstitutionTag, string> = {
  // 循環・代謝
  'edema_prone': 'むくみやすい',
  'cold_sensitivity': '冷えやすい',
  'low_blood_pressure': '低血圧',
  'anemic': '貧血気味',
  'poor_circulation': '血行不良',
  
  // 消化器系
  'weak_stomach': '胃腸が弱い',
  'constipation_prone': '便秘しやすい',
  'diarrhea_prone': '下痢しやすい',
  'bloating_prone': 'お腹が張りやすい',
  'acid_reflux': '逆流性食道炎・胃酸過多',
  
  // 筋骨格系
  'weak_joints': '関節が弱い',
  'muscle_cramps': 'つりやすい',
  'back_pain': '腰痛持ち',
  
  // 食事関連
  'postprandial_sleepiness': '食後に眠くなりやすい',
  'stress_eating': 'ストレスで食が乱れやすい',
  'binge_eating': '過食傾向',
  'low_appetite': '食欲不振',
  'fast_eater': '早食い',
  'late_night_snacking': '夜食べの習慣',
  
  // アレルギー・不耐性
  'lactose_intolerant': '乳糖不耐症',
  'gluten_sensitive': 'グルテン過敏症',
  'food_allergies': '食物アレルギーあり',
  
  // 女性特有
  'pms_severe': 'PMS強め',
  'irregular_periods': '生理不順',
  'heavy_periods': '生理が重い',
  'menopause': '更年期',
  
  // その他
  'prone_to_headaches': '頭痛持ち',
  'skin_problems': '肌荒れしやすい',
  'sleep_issues': '睡眠障害',
  'sensitive_to_caffeine': 'カフェインに敏感',
  'water_retention': '水分を溜めやすい',
};

// 生活習慣タグの日本語ラベル
export const LIFESTYLE_LABELS: Record<LifestyleTag, string> = {
  // 仕事・活動
  'remote_work': '在宅ワーク',
  'desk_work': 'デスクワーク・座り仕事',
  'standing_work': '立ち仕事',
  'physical_labor': '肉体労働',
  'commute_walk': '通勤徒歩',
  'night_shift': '夜勤',
  'shift_work': 'シフト勤務',
  
  // 家族・ケア
  'has_children': '育児あり',
  'caregiving': '介護中',
  'pregnant': '妊娠中',
  'breastfeeding': '授乳中',
  
  // 生活パターン
  'regular_exercise': '運動習慣あり',
  'irregular_schedule': '不規則な生活',
  'sleep_deprived': '睡眠不足',
  'high_stress': '高ストレス',
  'frequent_travel': '出張・旅行が多い',
  'frequent_dining_out': '外食が多い',
  'prefer_cooking': '自炊派',
  'budget_conscious': '節約志向',
  
  // 医療・健康
  'taking_oral_contraceptives': 'ピル服用中',
  'hormone_therapy': 'ホルモン治療中',
  'taking_medications': '投薬中',
  'under_medical_treatment': '治療中',
  
  // 喫煙・飲酒
  'smoker': '喫煙者',
  'regular_drinker': '習慣的飲酒',
  'social_drinker': '付き合い程度の飲酒',
  'non_drinker': '飲酒しない',
};

// コンディションタグの日本語ラベル
export const CONDITION_LABELS: Record<ConditionTag, string> = {
  // 生理関連
  'period_before': '生理前',
  'period_during': '生理中',
  'period_after': '生理後',
  'ovulation': '排卵期っぽい',
  
  // 睡眠・疲労
  'sleep_good': 'よく寝た',
  'sleep_normal': '睡眠普通',
  'sleep_bad': '寝不足',
  'tired_low': '疲労感低い',
  'tired_medium': '疲労感中程度',
  'tired_high': '疲労感高い',
  
  // 体調
  'edema_low': 'むくみ低い',
  'edema_medium': 'むくみ中程度',
  'edema_high': 'むくみ高い',
  'stomach_good': '胃腸快調',
  'constipated': '便秘気味',
  'diarrhea': '下し気味',
  'stomach_weak': '胃腸が弱っている',
  
  // その他
  'stressed': 'ストレスあり',
  'craving_sweet': '甘いものが欲しい',
  'low_appetite': '食欲なし',
  'high_appetite': '食欲旺盛',
  
  // 今日の予定
  'dining_out': '外食予定',
  'drinking_planned': '飲み会予定',
  'exercise_planned': '運動予定',
  'travel_day': '移動多い日',
  'work_from_home': '在宅日',
  'hangover': '二日酔い',
};

// 目標タイプの日本語ラベル
export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  'weight_loss': '減量',
  'weight_gain': '増量',
  'maintain': '体重維持',
  'body_recomposition': '体質改善',
  'health_improvement': '健康改善',
};

// 活動レベルの日本語ラベル
export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  'sedentary': 'ほとんど運動しない',
  'light': '軽い運動（週1-2回）',
  'moderate': '中程度（週3-5回）',
  'active': '活発（週6-7回）',
  'very_active': '非常に活発',
};

// プロンプト生成用のコンテキスト型
export interface AIPromptContext {
  userProfile: {
    age?: number;
    height?: number;
    currentWeight?: number;
    activityLevel?: ActivityLevel;
    bodyConstitution: BodyConstitutionTag[];
    lifestyle: LifestyleTag[];
    favoriteFoods?: string[];
    dislikedFoods?: string[];
    mealsPerDay: 2 | 3;
    additionalNotes?: string;
  };
  goals?: {
    goalType: GoalType;
    targetWeight?: number;
    weeklyWeightChangeTarget?: number;
    dailyCalorieTarget?: number;
  };
  todayCondition: {
    conditionTags: ConditionTag[];
    freeMemo?: string;
  };
  previousDayData?: {
    meals: {
      type: string;
      content: string;
    }[];
    weight?: number;
    activityMemo?: string;
  };
  requestType: 'morning_plan' | 'after_breakfast' | 'after_lunch' | 'consultation';
}

// プロンプト構築関数
export function buildPrompt(context: AIPromptContext): string {
  // タグを日本語に変換
  const bodyConstitutionJa = context.userProfile.bodyConstitution
    .map(tag => BODY_CONSTITUTION_LABELS[tag])
    .join('、');
  
  const lifestyleJa = context.userProfile.lifestyle
    .map(tag => LIFESTYLE_LABELS[tag])
    .join('、');
  
  const conditionJa = context.todayCondition.conditionTags
    .map(tag => CONDITION_LABELS[tag])
    .join('、');
  
  // 食材の好みを整形
  const favoriteFoodsJa = context.userProfile.favoriteFoods?.join('、') || '';
  const dislikedFoodsJa = context.userProfile.dislikedFoods?.join('、') || '';

  // 基本情報の整形
  const profile = context.userProfile;
  const basicInfo = [];
  if (profile.age) basicInfo.push(`年齢: ${profile.age}歳`);
  if (profile.height) basicInfo.push(`身長: ${profile.height}cm`);
  if (profile.currentWeight) basicInfo.push(`現在の体重: ${profile.currentWeight}kg`);
  if (profile.activityLevel) {
    basicInfo.push(`活動レベル: ${ACTIVITY_LEVEL_LABELS[profile.activityLevel]}`);
  }

  // 目標情報の整形
  const goalInfo = [];
  if (context.goals) {
    if (context.goals.goalType) {
      goalInfo.push(`目標: ${GOAL_TYPE_LABELS[context.goals.goalType]}`);
    }
    if (context.goals.targetWeight) {
      goalInfo.push(`目標体重: ${context.goals.targetWeight}kg`);
    }
    if (context.goals.dailyCalorieTarget) {
      goalInfo.push(`1日目標カロリー: ${context.goals.dailyCalorieTarget}kcal`);
    }
  }

  // 前日の記録の整形
  let previousDayInfo = '';
  if (context.previousDayData) {
    const meals = context.previousDayData.meals
      .map(m => `${m.type}: ${m.content}`)
      .join('\n');
    previousDayInfo = meals || 'なし';
    if (context.previousDayData.weight) {
      previousDayInfo += `\n体重: ${context.previousDayData.weight}kg`;
    }
  } else {
    previousDayInfo = 'なし';
  }

  // リクエストタイプ別のプロンプト
  const requestPrompts: Record<typeof context.requestType, string> = {
    'morning_plan': `
今日の食事プランを提案してください。
新しいフォーマットで、以下の内容を含めてください：

1. 今日の方針（1行）：例「むくみ対策優先で、夜は塩分と炭水化物を軽め」

2. ${profile.mealsPerDay === 2 ? '朝夕' : '朝昼晩'}の例メニュー（各3案）:
   - コンビニ案：コンビニで買えるメニュー
   - 簡単自炊案：10分以内で作れるメニュー  
   - 普通自炊案：しっかり作るメニュー
   ${profile.mealsPerDay === 2 ? '※2食の場合は朝食（ブランチ）と夕食で提案' : ''}

3. NG/注意（最大2つ）：例「夜の汁物・加工肉は控えめ」

4. 調整ルール：前日の食事記録を踏まえた調整内容
`,
    'after_breakfast': `
朝食後のフィードバックをお願いします。
記録された朝食内容: ${context.previousDayData?.meals.find(m => m.type === 'breakfast')?.content || '内容不明'}

新しいフォーマットで、以下の内容を含めてください：

1. 朝食の評価と調整方針（1行）

2. ${profile.mealsPerDay === 2 ? '夕食' : '昼食と夕食'}の提案（各3案）:
   - コンビニ案
   - 簡単自炊案  
   - 普通自炊案
   ${profile.mealsPerDay === 2 ? '※朝食を踏まえて夕食を調整' : '※朝食を踏まえて昼食・夕食を調整'}

3. 調整ルール：朝食の内容を踏まえた栄養バランス調整
`,
    'after_lunch': `
${profile.mealsPerDay === 2 ? '※2食設定のため昼食フィードバックはスキップ' : `
昼食後のフィードバックをお願いします。
記録された昼食内容: ${context.previousDayData?.meals.find(m => m.type === 'lunch')?.content || '内容不明'}
朝食内容: ${context.previousDayData?.meals.find(m => m.type === 'breakfast')?.content || 'なし'}

新しいフォーマットで、以下の内容を含めてください：

1. 朝食・昼食の評価と調整方針（1行）

2. 夕食の提案（3案）:
   - コンビニ案
   - 簡単自炊案  
   - 普通自炊案

3. 調整ルール：朝食・昼食の内容を踏まえた夕食の調整
`}`,
    'consultation': `
${context.previousDayData?.meals && context.previousDayData.meals.length > 0 ? `
記録された食事内容をもとにフィードバックをお願いします。
今日の食事記録: ${context.previousDayData.meals.map(m => `${m.type}: ${m.content}`).join('\\n')}

お疲れ様でした！食事の記録をありがとうございます。

### 栄養評価
- **良い点**: [今日の食事の良い点を1つ具体的に]
- **改善提案**: [改善できる点を1つ具体的に]

### 明日に向けたアドバイス
- [体調や体質に合わせた具体的なアドバイス1]
- [体調や体質に合わせた具体的なアドバイス2]

### 励ましメッセージ
[ユーザーを労い、継続を促すポジティブなメッセージ]
` : `
ユーザーの相談に対して、体質や生活習慣を考慮したアドバイスをしてください。
励ましと実践的な提案を含めてください。
`}`
  };

  return `
【ユーザー情報】
${basicInfo.join('\n')}
体質: ${bodyConstitutionJa || 'なし'}
生活: ${lifestyleJa || 'なし'}
好きな食材・料理: ${favoriteFoodsJa || 'なし'}
嫌い・アレルギーのある食材: ${dislikedFoodsJa || 'なし'}
食事回数: ${context.userProfile.mealsPerDay}食
${context.userProfile.additionalNotes ? `その他の情報: ${context.userProfile.additionalNotes}` : ''}

${goalInfo.length > 0 ? '【目標】\n' + goalInfo.join('\n') + '\n' : ''}

【今日の状態】
コンディション: ${conditionJa || '通常'}
メモ: ${context.todayCondition.freeMemo || 'なし'}

【今日の食事記録】
${previousDayInfo}

【リクエスト】
${requestPrompts[context.requestType]}
`;
}