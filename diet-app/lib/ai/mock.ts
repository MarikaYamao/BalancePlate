// AI機能のモック実装（テスト用）
import type { AIPromptContext } from './prompts';

export function generateMockResponse(context: AIPromptContext): string {
  const { userProfile, todayCondition, requestType } = context;
  
  // コンディションに基づく提案の調整
  const isOnPeriod = todayCondition.conditionTags.includes('period_during');
  const isStressed = todayCondition.conditionTags.includes('stressed');
  const isTired = todayCondition.conditionTags.includes('tired') || todayCondition.conditionTags.includes('sleepy');
  
  // 体質に基づく配慮
  const hasWeakStomach = userProfile.bodyConstitution.includes('weak_stomach');
  const hasBloating = userProfile.bodyConstitution.includes('bloating_prone');
  const hasEdema = userProfile.bodyConstitution.includes('edema_prone');

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
  
  // morning_planの場合（従来のロジック）
  const mockResponse = `
プランA: しっかり整えるプラン
バランスの取れた栄養で体調を整えるプランです。${isOnPeriod ? '生理中なので鉄分を意識しました。' : ''}${hasWeakStomach ? '胃腸に優しい食材を中心にしています。' : ''}

朝食: 
- 和定食（ご飯、味噌汁、焼き魚）
- ほうれん草のお浸し
- 納豆
※ 朝からしっかりと栄養を摂って一日をスタートしましょう

昼食:
- 鶏肉と野菜の煮物定食
- サラダ
- 玄米ご飯
※ ${hasWeakStomach ? '消化に良い煮物で胃腸を労わります' : 'タンパク質とビタミンをバランスよく摂取'}

夕食:
- 白身魚の蒸し物
- 温野菜
- 雑穀ご飯
※ ${isOnPeriod ? '鉄分豊富な食材で貧血予防' : '消化に良い調理法で夜の負担を軽減'}

---

プランB: 手軽さ重視プラン
忙しい日でも続けやすい、簡単で栄養のあるプランです。${isStressed ? 'ストレスがあるときは無理をしないことが大切です。' : ''}

朝食:
- バナナとヨーグルト
- 全粒粉パン1枚
- ハーブティー
※ 手軽に準備できて栄養価も十分です

昼食: 
- コンビニのサラダチキン
- おにぎり（梅干し）
- 野菜スープ
※ ${hasEdema ? 'むくみが気になるので塩分控えめを意識' : '外出先でも手に入りやすい食材'}

夕食:
- 冷凍野菜炒め
- 豆腐
- お茶漬け
※ 疲れた日でも5分で準備できます

---

プランC: 体調配慮プラン
今日のコンディションに特に配慮した優しいプランです。${isTired ? '疲れているときは消化の良いものを選びました。' : ''}

朝食:
- おかゆ
- 梅干し
- 白湯
※ ${hasWeakStomach ? '胃腸が弱っているときは優しい食事から' : '体調が優れないときの定番メニュー'}

昼食:
- うどん（温かい）
- 卵
- 青菜のお浸し
※ 消化が良く、体を温めてくれます

夕食:
- 鶏肉のスープ
- 蒸しパン
- カモミールティー
※ ${isStressed ? 'ストレス解消に役立つカモミールでリラックス' : '体を温めて早めの就寝を心がけましょう'}
`;

  return mockResponse.trim();
}

// モック機能が有効かどうかを確認
export function isMockEnabled(): boolean {
  return process.env.ENABLE_MOCK_AI === 'true';
}

// 遅延を追加してリアルなAPI感を演出
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}