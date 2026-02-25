# Phase 21: ゴール設定と個別化強化 - 詳細設計書

## 概要
ユーザーの目的に応じた3つのモード（CUT/MAINTAIN/GAIN）と制約レイヤー（妊娠・授乳・ホルモン療法など）を実装し、より個別化された食事提案を実現します。

## 1. ゴールモード設計

### 1.1 モード定義
```typescript
type GoalMode = 'CUT' | 'MAINTAIN' | 'GAIN';

interface GoalModeConfig {
  mode: GoalMode;
  priorities: string[];
  adjustmentRules: AdjustmentRule[];
  detectionTags: string[];
}
```

### 1.2 CUT（減量）モード
- **目的**: 脂肪を落とす、むくみ・暴食を抑える
- **優先順位**:
  1. 過食抑制
  2. 塩分・むくみ対策
  3. タンパク質確保
  4. 習慣維持
- **典型的な補正**: 夜重い → 翌朝は高タンパク/高繊維、昼で戻す
- **検知タグ**: overeating, high_sodium, low_protein, irregular_meals

### 1.3 MAINTAIN（維持）モード
- **目的**: 体重レンジ維持、体調の波を小さく
- **優先順位**:
  1. 平準化（乱高下を潰す）
  2. 睡眠/ストレス時の暴走防止
  3. 最低限のタンパク質
- **典型的な補正**: 外食続き → "戻す日"テンプレ（薄味＋野菜＋水分＋適量主食）
- **検知タグ**: fluctuation_detected, stress_eating, sleep_issues

### 1.4 GAIN（増量）モード
- **目的**: 体重（筋肉/脂肪）を増やす、食が細い人の摂取量確保
- **優先順位**:
  1. 総摂取量（カロリー）
  2. タンパク質
  3. 消化・食欲
  4. 分割摂取
- **典型的な補正**: 食事量が少ない → 回数増やす、液体カロリー、脂質を足す
- **検知タグ**: low_total_intake, low_meal_frequency, early_fullness, low_protein

## 2. 制約レイヤー設計

### 2.1 制約レイヤー定義
```typescript
type ConstraintType = 
  | 'pregnancy'      // 妊娠中
  | 'breastfeeding' // 授乳中
  | 'hormone_ftm'   // ホルモン療法（FTM）
  | 'hormone_mtf'   // ホルモン療法（MTF）
  | 'medical';      // その他医療的制約

interface ConstraintLayer {
  type: ConstraintType;
  safetyFilters: SafetyFilter[];
  nutritionFocus: string[];
  warningSignals: WarningSignal[];
}
```

### 2.2 妊娠・授乳レイヤー
- **安全性フィルタ**: 生肉/生魚、特定のチーズなど避ける食品
- **栄養の重点**: 鉄、葉酸、カルシウム、ヨウ素、DHA/EPA
- **つわり対応**: 少量頻回、匂い回避、冷たいもの
- **危険シグナル**: 急激な体重変動、脱水、強い浮腫＋頭痛 → 受診導線

### 2.3 ホルモン療法レイヤー
- **目的**: 体組成変化/食欲/気分変動の中での食事の安定
- **対応**: メンタル/体調が崩れやすい時期は平準化テンプレを優先
- **注記**: 「医師の指示がある場合はそれを最優先」の明記
- **個別性**: CUT/GAINどちらのモードにも対応可能

## 3. 増量モード特別機能

### 3.1 検知タグ（GAINモード専用）
```typescript
type GainDetectionTag = 
  | 'low_total_intake'      // 総量不足
  | 'low_meal_frequency'    // 回数不足
  | 'early_fullness'        // すぐ満腹
  | 'low_protein'          // タンパク不足
  | 'low_energy_density';  // 低密度（サラダばかり等）
```

### 3.2 提案テンプレート
1. **回数を増やす**: 3食 → 4〜5回（小分け）
2. **液体カロリー**: スムージー/プロテイン＋牛乳/豆乳＋オーツ
3. **脂質を足す**: オリーブオイル、ナッツ、チーズ（少量で高カロリー）
4. **消化優先**: 温かいもの、刺激物控えめ
5. **運動日対応**: トレ後に必ず1回追加（摂取窓を作る）

## 4. UI/UX設計

### 4.1 ゴール設定画面
```
【あなたの目標を教えてください】

○ 体重を減らしたい（CUT）
  - むくみを改善したい
  - 食べ過ぎを抑えたい
  
○ 今の状態を維持したい（MAINTAIN）
  - 体調を安定させたい
  - リバウンドを防ぎたい
  
○ 体重を増やしたい（GAIN）
  - 筋肉をつけたい
  - 食事量を増やしたい
```

### 4.2 制約条件の確認（任意）
```
【特別な配慮が必要な状況はありますか？】（任意・複数選択可）

□ 妊娠中
□ 授乳中
□ ホルモン変動の影響が大きい（治療・服薬含む）
□ 医師から食事指導を受けている

※この情報は提案の精度向上のためのみに使用します
※医師の指示がある場合は、それを最優先してください
```

## 5. データモデル拡張

### 5.1 UserSettings拡張
```typescript
interface UserSettings {
  // 既存フィールド...
  
  // ゴール設定（新規追加）
  goalMode?: GoalMode;
  goalDetails?: {
    targetWeight?: number;
    targetDate?: Date;
    weeklyTarget?: number; // kg/週
  };
  
  // 制約条件（新規追加）
  constraints?: ConstraintType[];
  constraintDetails?: {
    pregnancyWeek?: number;
    hormoneStartDate?: Date;
    medicalNotes?: string;
  };
}
```

### 5.2 新しいConditionTag追加
```typescript
// GAINモード用
| 'low_appetite'        // 食欲低下
| 'early_fullness'      // すぐ満腹
| 'need_liquid_calories' // 液体カロリー必要
| 'post_workout'        // 運動後

// 制約レイヤー用
| 'morning_sickness'    // つわり
| 'hormone_fluctuation' // ホルモン変動
| 'medical_restriction' // 医療的制限
```

## 6. AI提案の調整

### 6.1 プロンプト拡張
```typescript
interface AIPromptContext {
  // 既存フィールド...
  
  goalMode?: GoalMode;
  constraints?: ConstraintType[];
  modeSpecificTags?: string[];
}
```

### 6.2 モード別提案例

#### CUTモード
```
今日の方針：むくみ対策と適度な満足感の両立
朝：プロテイン多め、野菜たっぷり、炭水化物控えめ
昼：バランス重視、腹八分目
夜：軽め、塩分控えめ、温かいスープ中心
```

#### GAINモード
```
今日の方針：無理なく摂取量を増やす工夫
朝：しっかり食べる、液体カロリー追加
間食1：10時にナッツとヨーグルト
昼：普通量＋良質な脂質
間食2：15時にプロテインスムージー
夜：消化に良いものでしっかり
```

## 7. 実装の優先順位

1. **Phase 21-1**: 基本的なゴールモード実装（CUT/MAINTAIN/GAIN）
2. **Phase 21-2**: モード別の提案ロジック実装
3. **Phase 21-3**: 制約レイヤーの基本実装（妊娠・授乳）
4. **Phase 21-4**: GAINモード特別機能
5. **Phase 21-5**: ホルモン療法対応（センシティブ対応）

## 8. 注意事項とリスク管理

### 8.1 医療領域との境界
- 「診断」「治療」ではなく「一般的な栄養・生活支援」であることを明記
- 危険シグナルは必ず受診案内に誘導
- 免責事項の明確化

### 8.2 プライバシー配慮
- センシティブ情報は最小限かつ任意
- 利用目的を明確に表示
- データの暗号化必須

### 8.3 個別性への対応
- 「個人差があります」の注記
- 医師の指示優先の明記
- フィードバック機能で継続的改善

## 9. 成功指標

- ゴールモード選択率: 80%以上
- モード別継続率の改善
- GAINモードユーザーの摂取量増加
- 制約レイヤー利用者の満足度
- 医療的問題の発生ゼロ

## 10. 今後の拡張可能性

- 運動連携によるカロリー収支管理
- 医療機関との連携（将来）
- より詳細な栄養素管理
- AIの学習による個別最適化
- コミュニティ機能（同じゴールのユーザー同士）