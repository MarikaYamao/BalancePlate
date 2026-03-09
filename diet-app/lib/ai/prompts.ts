import type { 
  BodyConstitutionTag, 
  LifestyleTag, 
  ConditionTag,
  GoalType,
  ActivityLevel,
  GoalMode,
  ConstraintType 
} from '@/types';

// システムプロンプト
export const SYSTEM_PROMPT = `
あなたはユーザーの体質と生活習慣に寄り添う食事提案AIです。
落ち着いた丁寧語で、事務的すぎず淡々とした安心感のあるトーンで応答してください。

重要：JSONを返す際は、マークダウンのコードブロック（\`\`\`json）を使用せず、純粋なJSONのみを返してください。

## 重要な指針
- ユーザーの条件（mealsPerDay、conditionTags、lifestyle、goalType）を必ず1つ以上、todayGuidelineとadjustmentRuleに反映
- 完璧を求めない、現実的な提案
- 体調を最優先に考える
- 無理な制限はしない
- ユーザーの好きな食材を積極的に取り入れる
- ユーザーの嫌いな食材・アレルギー食材は絶対に避ける

## 禁止表現
以下の過度な称賛表現は使用禁止：
- お疲れ様です、素晴らしいです、偉い、最高、完璧、すごい
- 頑張って、よくできました、立派です

## トーン
- 状況説明と次のアクション中心
- 褒め言葉ではなく、継続しやすくする工夫の提案

必ずJSON形式で回答してください。
`;

// 手持ち食材を考慮したプロンプト（有料機能）
export const FRIDGE_AWARE_PROMPT = `
【手持ち食材連携機能】
ユーザーが登録した手持ち食材を最優先で活用したメニューを提案してください。

手持ち食材の優先ルール：
1. 提案メニューは可能な限り手持ち食材を使用する
2. 手持ち食材だけで完結するメニューを優先
3. 買い足しが必要な場合も、手持ち食材をメイン食材として扱う
4. 手持ち食材を使わないメニューは避ける
5. 手持ち食材の組み合わせから最適な栄養バランスを考える

手持ち食材情報：{availableIngredients}

注意：手持ち食材の情報がない場合は通常の提案を行ってください。
`;

// Phase21: ゴールモード別プロンプト
export const GOAL_MODE_PROMPTS = {
  CUT: `
【CUTモード（減量）の提案優先順位】
1. 過食抑制: 満足感を保ちながら適切な量をコントロール
2. 塩分・むくみ対策: 塩分控えめ、水分代謝促進
3. タンパク質確保: 筋肉量維持のためのタンパク質摂取
4. 習慣維持: 無理のない継続可能な食事

特別な調整：
- 夜重い食事 → 翌朝は高タンパク・高繊維、昼で戻す
- むくみ対策：塩分控えめ、カリウム豊富な食材
- 過食防止：食物繊維豊富で満足感のある食材
`,

  MAINTAIN: `
【MAINTAINモード（維持）の提案優先順位】
1. 平準化: 乱高下を防ぐバランス重視
2. 睡眠・ストレス時の暴走防止: 安定した食事リズム
3. 最低限のタンパク質: 筋肉量維持

特別な調整：
- 外食続き → "戻す日"テンプレ（薄味＋野菜＋水分＋適量主食）
- ストレス時 → 安定した定食スタイル
- 睡眠不足時 → 消化に良く栄養価の高い食事
`,

  GAIN: `
【GAINモード（増量）の提案優先順位】
1. 総摂取量確保: 栄養不足を避ける
2. タンパク質摂取: 筋肉・組織の材料確保
3. 消化・食欲サポート: 食べやすさ重視
4. 分割摂取: 無理なく量を増やす工夫

特別な調整・検知：
- 食事量少ない → 回数を増やす（4〜5回/日）
- すぐ満腹 → 液体栄養（スムージー、プロテイン）活用
- 固形物が辛い → スープ、ヨーグルト、牛乳、豆乳
- 運動後 → 必ず1回追加摂取（摂取窓を活用）
- 脂質を足す: オリーブオイル、ナッツ、チーズ（効率的に栄養摂取）

GAINモード特別提案テンプレート：
- 朝: しっかり食べる + 液体栄養追加
- 間食1: 10時にナッツ・ヨーグルト
- 昼: 普通量＋良質な脂質
- 間食2: 15時にプロテインスムージー
- 夜: 消化に良いものでしっかり量
`
} as const;

// Phase21: 制約レイヤー別プロンプト
export const CONSTRAINT_PROMPTS = {
  pregnancy: `
【妊娠中の安全配慮】
避ける食品：
- 生肉、生魚（刺身、ユッケなど）
- 未殺菌チーズ、生卵
- 水銀含有量の多い魚（マグロ、金目鯛など）
- アルコール、カフェイン過多

栄養重点：
- 葉酸、鉄分、カルシウム、DHA/EPA
- つわり対応：少量頻回、冷たいもの、匂い控えめ
- 体重増加管理：適正な増加ペース

危険シグナル検知時は受診案内：
- 急激な体重変動、脱水、強い浮腫＋頭痛
`,

  breastfeeding: `
【授乳中の配慮】
栄養重点：
- カルシウム、鉄分、たんぱく質、水分
- 母乳への影響を考慮した食材選択
- エネルギー必要量の増加対応

避ける・控える：
- 過度なカフェイン、アルコール
- 刺激の強い香辛料（大量摂取時）
- アレルギー誘発リスクの高い食材（個人差考慮）
`,

  hormone_ftm: `
【ホルモン療法中（FTM）の配慮】
体組成変化対応：
- 筋肉量変化に対応したタンパク質摂取
- 代謝変化を考慮した量調整
- ホルモン変動時は平準化テンプレを優先

メンタル・体調サポート：
- 安定した血糖値維持
- ストレス軽減食材の活用
- 医師の指示がある場合は最優先
`,

  hormone_mtf: `
【ホルモン療法中（MTF）の配慮】
体組成変化対応：
- 代謝変化を考慮した量調整  
- ホルモン変動時は平準化テンプレを優先
- 骨密度維持のカルシウム・ビタミンD

メンタル・体調サポート：
- 安定した血糖値維持
- ストレス軽減食材の活用
- 医師の指示がある場合は最優先
`,

  medical: `
【医療的制約がある場合】
最優先事項：
- 医師からの食事指導を最優先
- 処方薬との相互作用を考慮
- 制限食材の厳格な回避

提案方針：
- 一般的な健康食材中心
- 特定の栄養素制限に配慮
- 疑問がある場合は医療機関への相談案内
`
} as const;

// JSON形式でのレスポンス要求プロンプトを生成する関数
export function getJsonResponsePrompt(mealsPerDay: 2 | 3): string {
  const mealStructure = mealsPerDay === 2
    ? '"breakfast": { ... }, "dinner": { ... }'
    : '"breakfast": { ... }, "lunch": { ... }, "dinner": { ... }';

  return `
必ず以下のJSON形式で回答してください。
テキストではなくJSON形式での返答を厳守してください。

【重要】mealsPerDay=${mealsPerDay}なので、${mealsPerDay === 2 ? 'breakfast（朝食/ブランチ）とdinner（夕食）のみ' : 'breakfast、lunch、dinnerの3食'}を提案してください。

JSONの構造は以下の通りです：

{
  "todayGuideline": "今日の体調とユーザー条件を反映した過ごし方（1行）",
  "mealSuggestions": {
    ${mealStructure}
    // 各食事の構造：
    // {
    //   "convenience": "コンビニメニュー",
    //   "simpleCooking": "簡単自炊メニュー",
    //   "normalCooking": "普通に自炊メニュー"
    // }
  },
  "avoidToday": [], // 注意事項がない場合は空配列。「特になし」は入れない
  "adjustmentRule": "当日条件×目標を反映した具体的調整方針",
  "feedback": {
    "overall": "現状の説明と次のアクション（1-2行）",
    "positive": "継続しやすくする工夫の説明（1行）",
    "suggestions": ["具体的提案1", "具体的提案2"],
    "encouragement": "次のステップの案内（1行）"
  },
  "mealPlans": {
    ${mealStructure}
    // 各食事の構造：
    // {
    //   "menu": ["メニュー項目1", "メニュー項目2"],
    //   "preparation": "簡単" | "普通" | "手間",
    //   "alternatives": ["代替案1", "代替案2"],
    //   "reason": "この提案をする理由",
    //   "timing": "推奨時間"
    // }
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
- avoidTodayが空の場合は[]を返す。「特になし」は入れない
- adjustmentRuleには必ずユーザーの条件を1つ以上反映
`;
}

// 体質タグの日本語ラベル
export const BODY_CONSTITUTION_LABELS: Record<BodyConstitutionTag, string> = {
  // 健康状態
  'healthy': '特に問題なし',
  'good_digestion': '消化が良い',
  'high_metabolism': '代謝が良い',
  'good_stamina': '体力がある',
  'good_sleep': '睡眠の質が良い',
  
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
  
  // 特別な配慮が必要な状況
  'pregnancy': '妊娠中',
  'breastfeeding': '授乳中',
  'hormone_ftm': 'ホルモン療法中（FTM）',
  'hormone_mtf': 'ホルモン療法中（MTF）',
  'medical_diet': '医師から食事指導を受けている',
  
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
  'normal': '普通・特になし',
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
  
  // Phase21: GAINモード専用検知タグ
  'low_total_intake': '食事量が少ない',
  'low_meal_frequency': '食事回数が少ない',
  'early_fullness': 'すぐに満腹になる',
  'need_liquid_calories': '固形物が辛い',
  'post_workout': '運動後',
  
  // 制約レイヤー用
  'morning_sickness': 'つわり',
  'hormone_fluctuation': 'ホルモン変動',
  'medical_restriction': '医療的制限',
};

// 目標タイプの日本語ラベル
export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  'weight_loss': '減量',
  'weight_gain': '増量',
  'maintain': '体重維持',
  'body_recomposition': '体質改善',
  'health_improvement': '健康改善',
};

// Phase21: ゴールモードのラベル
export const GOAL_MODE_LABELS: Record<GoalMode, string> = {
  'CUT': '減量モード',
  'MAINTAIN': '維持モード',
  'GAIN': '増量モード',
};

// 制約タイプのラベル
export const CONSTRAINT_TYPE_LABELS: Record<ConstraintType, string> = {
  'pregnancy': '妊娠中',
  'breastfeeding': '授乳中', 
  'hormone_ftm': 'ホルモン療法中（FTM）',
  'hormone_mtf': 'ホルモン療法中（MTF）',
  'medical': '医療的制約',
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
  };
  // Phase21: 新しいゴール設定
  goalMode?: GoalMode;
  constraints?: ConstraintType[];
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
  todayMeals?: {
    type: string;
    content: string;
  }[];
  // Phase19: 冷蔵庫食材情報
  fridgeItems?: {
    name: string;
    category: string;
    available: boolean;
  }[];
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

${// 夕食が含まれているかチェック
context.previousDayData.meals.some(m => m.type === 'dinner') ? `
今日も1日お疲れ様でした。夕食まで記録を続けられたのは素晴らしいことです。

### 今日の振り返り
- **良かった点**: [今日の食事で特に良かった栄養バランスや選択を1-2つ具体的に]
- **気になる点**: [明日に向けて意識したい点を1つ、批判的にならずに]

### 今夜の過ごし方
- [消化と睡眠を考慮した具体的なアドバイス（例：水分補給、入浴タイミング、リラックス方法など）]
- [体質やコンディションに合わせた夜の過ごし方の提案]

### 明日の朝に向けて
- [翌朝の体調を整えるための準備（例：起床時の水分補給、朝食の準備など）]
- [今日の食事内容を踏まえた翌日の食事バランスの提案]

### 締めくくり
[1日頑張ったことを認め、明日も無理なく続けられるような温かいメッセージ]
` : `
食事の記録ありがとうございます。

### 栄養評価
- **良い点**: [今日の食事の良い点を1つ具体的に]
- **改善提案**: [改善できる点を1つ具体的に]

### 次の食事に向けて
- [体調や体質に合わせた具体的なアドバイス1]
- [体調や体質に合わせた具体的なアドバイス2]

### 応援メッセージ
[継続を促すポジティブなメッセージ]
`}` : `
ユーザーの相談に対して、体質や生活習慣を考慮したアドバイスをしてください。
励ましと実践的な提案を含めてください。
`}`
  };

  // Phase21: ゴールモードと制約の追加
  let goalModeInfo = '';
  if (context.goalMode) {
    goalModeInfo = `
【ゴールモード】
${GOAL_MODE_LABELS[context.goalMode]}
${GOAL_MODE_PROMPTS[context.goalMode]}
`;
  }

  let constraintInfo = '';
  if (context.constraints && context.constraints.length > 0) {
    const constraintLabels = context.constraints
      .map(c => CONSTRAINT_TYPE_LABELS[c])
      .join('、');
    const constraintPrompts = context.constraints
      .map(c => CONSTRAINT_PROMPTS[c])
      .join('\n');
    
    constraintInfo = `
【制約・配慮事項】
適用中: ${constraintLabels}
${constraintPrompts}
`;
  }

  // GAINモード専用の検知ロジック
  let gainModeDetection = '';
  if (context.goalMode === 'GAIN') {
    const gainTags = context.todayCondition.conditionTags.filter(tag => 
      ['low_total_intake', 'low_meal_frequency', 'early_fullness', 'need_liquid_calories', 'post_workout'].includes(tag)
    );
    
    if (gainTags.length > 0) {
      const gainTagsJa = gainTags.map(tag => CONDITION_LABELS[tag]).join('、');
      gainModeDetection = `
【GAINモード特別検知】
検知された状況: ${gainTagsJa}
→ 対応する特別提案を優先してください
`;
    }
  }

  // Phase19: 冷蔵庫食材情報の構築
  let fridgeItemsInfo = '';
  if (context.fridgeItems && context.fridgeItems.length > 0) {
    const availableItems = context.fridgeItems
      .filter(item => item.available)
      .map(item => item.name);
    const unavailableItems = context.fridgeItems
      .filter(item => !item.available)
      .map(item => item.name);
    
    fridgeItemsInfo = `
【手持ち食材情報】
✅ 利用可能な食材: ${availableItems.length > 0 ? availableItems.join('、') : 'なし'}
❌ 使い切った食材: ${unavailableItems.length > 0 ? unavailableItems.join('、') : 'なし'}

${availableItems.length > 0 ? FRIDGE_AWARE_PROMPT.replace('{availableIngredients}', availableItems.join('、')) : ''}
`;
  }

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
${goalModeInfo}
${constraintInfo}
${gainModeDetection}
${fridgeItemsInfo}

【今日の状態】
コンディション: ${conditionJa || '通常'}
メモ: ${context.todayCondition.freeMemo || 'なし'}

【今日の食事記録】
${previousDayInfo}

【リクエスト】
${requestPrompts[context.requestType]}

${getJsonResponsePrompt(context.userProfile.mealsPerDay)}
`;
}