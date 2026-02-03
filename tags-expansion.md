# 体質・生活習慣タグの拡充

## 追加した体質タグ（BodyConstitutionTag）

### 消化器系
- `constipation_prone`: 便秘しやすい
- `diarrhea_prone`: 下痢しやすい
- `bloating_prone`: お腹が張りやすい
- `acid_reflux`: 逆流性食道炎・胃酸過多

### 食事関連
- `postprandial_sleepiness`: 食後に眠くなりやすい
- `stress_eating`: ストレスで食が乱れやすい
- `binge_eating`: 過食傾向
- `low_appetite`: 食欲不振
- `fast_eater`: 早食い
- `late_night_snacking`: 夜食べの習慣

### 筋骨格系
- `muscle_cramps`: つりやすい
- `back_pain`: 腰痛持ち

### アレルギー・不耐性
- `lactose_intolerant`: 乳糖不耐症
- `gluten_sensitive`: グルテン過敏症
- `food_allergies`: 食物アレルギーあり

### その他
- `prone_to_headaches`: 頭痛持ち
- `skin_problems`: 肌荒れしやすい
- `sleep_issues`: 睡眠障害

## 追加した生活習慣タグ（LifestyleTag）

### 仕事・活動
- `desk_work`: デスクワーク・座り仕事
- `standing_work`: 立ち仕事
- `physical_labor`: 肉体労働
- `shift_work`: シフト勤務

### 家族・ケア
- `caregiving`: 介護中
- `pregnant`: 妊娠中
- `breastfeeding`: 授乳中

### 生活パターン
- `sleep_deprived`: 睡眠不足
- `high_stress`: 高ストレス
- `frequent_travel`: 出張・旅行が多い
- `frequent_dining_out`: 外食が多い

### 医療・健康
- `taking_oral_contraceptives`: ピル服用中
- `hormone_therapy`: ホルモン治療中
- `taking_medications`: 投薬中
- `under_medical_treatment`: 治療中

### 嗜好品
- `smoker`: 喫煙者
- `regular_drinker`: 習慣的飲酒
- `social_drinker`: 付き合い程度の飲酒
- `non_drinker`: 飲酒しない

## AI提案への活用例

### 便秘しやすい人への提案
```
【食物繊維を意識】
- 朝：オートミール＋ヨーグルト＋バナナ
- 昼：玄米ご飯＋きんぴらごぼう
- 夜：サラダたっぷり＋海藻スープ
- 水分：1日1.5L以上を目標に
```

### 食後眠くなりやすい人への提案
```
【血糖値スパイクを防ぐ】
- 食べる順番：野菜→タンパク質→炭水化物
- 炭水化物は少なめ、または低GI食品に
- 昼食は腹八分目に
- 食後に軽い散歩を推奨
```

### ストレスで食が乱れやすい人への提案
```
【ストレス対策込みの食事】
- セロトニンを増やす：トリプトファン豊富な食材
- GABAを含む食品：発芽玄米、トマト
- ストレス時の間食：ナッツ類、ダークチョコレート
- リラックスティー：カモミール、ラベンダー
```

### 立ち仕事の人への提案
```
【足のむくみ・疲労対策】
- カリウム豊富な食材：バナナ、アボカド
- 塩分控えめの味付け
- タンパク質をしっかり摂取
- 間食：アーモンドやくるみ
- 水分補給をこまめに
```

### 睡眠不足の人への提案
```
【睡眠の質を上げる食事】
- 夕食は就寝3時間前までに
- トリプトファン：牛乳、チーズ、大豆製品
- マグネシウム：ほうれん草、アーモンド
- 避けるもの：カフェイン、アルコール、重い食事
```

### ピル服用中の人への提案
```
【ホルモンバランスを考慮】
- ビタミンB群を意識：全粒穀物、レバー
- 血栓予防：ビタミンE、オメガ3脂肪酸
- むくみ対策：カリウム豊富な食材
- 葉酸の摂取も推奨
```

## UIでの表示グループ分け

### 体質選択画面
```
【循環・代謝】
□ むくみやすい
□ 冷えやすい
□ 低血圧
□ 貧血気味

【消化器系】
□ 胃腸が弱い
□ 便秘しやすい
□ 下痢しやすい
□ お腹が張りやすい
□ 逆流性食道炎・胃酸過多

【食事傾向】
□ 食後に眠くなりやすい
□ ストレスで食が乱れやすい
□ 過食傾向
□ 食欲不振
□ 早食い
□ 夜食べの習慣

【アレルギー・不耐性】
□ 乳糖不耐症
□ グルテン過敏症
□ 食物アレルギーあり

【その他】
□ 関節が弱い
□ つりやすい
□ 腰痛持ち
□ 頭痛持ち
□ 肌荒れしやすい
□ 睡眠障害
```

### 生活習慣選択画面
```
【お仕事】
□ 在宅ワーク
□ デスクワーク・座り仕事
□ 立ち仕事
□ 肉体労働
□ 通勤徒歩
□ 夜勤
□ シフト勤務

【家族・ケア】
□ 育児あり
□ 介護中
□ 妊娠中
□ 授乳中

【生活パターン】
□ 運動習慣あり
□ 不規則な生活
□ 睡眠不足
□ 高ストレス
□ 出張・旅行が多い
□ 外食が多い

【医療・健康】
□ ピル服用中
□ ホルモン治療中
□ 投薬中
□ 治療中

【嗜好品】
□ 喫煙者
□ 習慣的飲酒
□ 付き合い程度の飲酒
□ 飲酒しない
```

## 実装時の注意点

### 1. 複数選択可能
- ユーザーは該当する項目をすべて選択可能
- 相反する項目（便秘と下痢など）も両方選択可（体調による変動を考慮）

### 2. プライバシー配慮
- 医療関連項目は特に慎重に扱う
- すべて任意選択

### 3. AI提案の優先順位
```typescript
function getPriorityConsiderations(tags: {
  constitution: BodyConstitutionTag[],
  lifestyle: LifestyleTag[]
}): string[] {
  const priorities = [];
  
  // 医療系を最優先
  if (tags.lifestyle.includes('pregnant')) {
    priorities.push('妊娠中の栄養管理を最優先');
  }
  if (tags.lifestyle.includes('taking_medications')) {
    priorities.push('薬との相互作用に注意');
  }
  
  // 次に体質系
  if (tags.constitution.includes('food_allergies')) {
    priorities.push('アレルギー食材を完全に除外');
  }
  
  // 生活パターン系
  if (tags.lifestyle.includes('sleep_deprived')) {
    priorities.push('エナジー維持と睡眠改善');
  }
  
  return priorities;
}
```

これらの拡充により、より細かな個別対応が可能になります。