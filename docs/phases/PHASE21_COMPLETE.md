# Phase 21: ゴール設定と個別化強化 - 実装完了レポート

## 📋 概要
Phase 21として、ユーザーの目的に応じた3つのモード（CUT/MAINTAIN/GAIN）と制約レイヤーを実装し、より個別化された食事提案を実現しました。

**実装期間**: 2024年2月  
**ステータス**: ✅ 完了

## 🎯 実装目標（達成）
- [x] CUT/MAINTAIN/GAINの3つのシンプルなゴールモード実装
- [x] 制約レイヤー（妊娠・授乳・ホルモン療法・医療的制約）の実装
- [x] GAINモード専用の検知タグと提案テンプレート
- [x] AI提案ロジックのモード別・制約別カスタマイズ
- [x] プライバシーに配慮したセンシティブ情報の扱い

## 📁 変更ファイル

### 新規作成ファイル
```
diet-app/
├── components/features/settings/
│   └── EnhancedGoalSettings.tsx                 # 拡張されたゴール設定コンポーネント
└── PHASE21_COMPLETE.md                          # 本ドキュメント
```

### 更新ファイル
```
diet-app/
├── types/
│   ├── user.ts                                  # ゴールモード・制約タイプ定義追加
│   ├── condition.ts                             # GAINモード・制約レイヤー用タグ追加
│   └── index.ts                                 # 新しい型のエクスポート追加
├── lib/
│   ├── constants/conditionTags.ts               # 新しいコンディションタグ情報追加
│   ├── ai/prompts.ts                            # モード別・制約別プロンプト拡張
│   └── db/repositories/userSettingsRepository.ts # UserSettingsInput拡張
└── app/settings/page.tsx                        # 新しいゴール設定コンポーネント使用
```

## ✨ 実装機能

### 1. 3つのシンプルゴールモード

#### CUT（減量）モード
- **目的**: 脂肪を落とし、むくみや過食を抑える
- **優先順位**: ①過食抑制 ②塩分・むくみ対策 ③タンパク質確保 ④習慣維持
- **典型的な調整**: 夜重い → 翌朝は高タンパク・高繊維、昼で戻す

#### MAINTAIN（維持）モード
- **目的**: 体重レンジ維持、体調の波を小さく
- **優先順位**: ①平準化 ②睡眠・ストレス時の暴走防止 ③最低限のタンパク質
- **典型的な調整**: 外食続き → "戻す日"テンプレ（薄味＋野菜＋水分＋適量主食）

#### GAIN（増量）モード
- **目的**: 健康的に体重（筋肉/脂肪）を増やす
- **優先順位**: ①総摂取量確保 ②タンパク質摂取 ③消化・食欲サポート ④分割摂取
- **典型的な調整**: 食事量少ない → 回数増やす、液体カロリー、脂質を足す

### 2. 制約レイヤー実装

#### 妊娠中の安全配慮
- **避ける食品**: 生肉、生魚、未殺菌チーズ、水銀含有魚
- **栄養重点**: 葉酸、鉄分、カルシウム、DHA/EPA
- **つわり対応**: 少量頻回、冷たいもの、匂い控えめ

#### 授乳中の配慮
- **栄養重点**: カルシウム、鉄分、タンパク質、水分
- **配慮事項**: 母乳への影響、エネルギー必要量増加

#### ホルモン療法中の配慮
- **FTM/MTF対応**: 体組成変化、代謝変化、ホルモン変動
- **メンタルサポート**: 安定した血糖値維持、ストレス軽減食材

#### 医療的制約
- **最優先事項**: 医師の指示優先、処方薬との相互作用考慮
- **提案方針**: 一般的な健康食材中心、制限食材の厳格回避

### 3. GAINモード特別機能

#### 専用検知タグ
```typescript
type GainDetectionTag = 
  | 'low_total_intake'      // 総量不足
  | 'low_meal_frequency'    // 回数不足
  | 'early_fullness'        // すぐ満腹
  | 'need_liquid_calories'  // 固形物が辛い
  | 'post_workout';         // 運動後
```

#### 提案テンプレート
- **回数を増やす**: 3食 → 4〜5回（小分け）
- **液体カロリー**: スムージー/プロテイン＋牛乳＋オーツ
- **脂質を足す**: オリーブオイル、ナッツ、チーズ
- **運動後対応**: トレ後に必ず1回追加（摂取窓活用）

### 4. AI提案ロジック拡張

#### モード別プロンプト
```typescript
export const GOAL_MODE_PROMPTS = {
  CUT: `【CUTモード】過食抑制・塩分対策・タンパク確保`,
  MAINTAIN: `【MAINTAINモード】平準化・暴走防止・最低限タンパク`,
  GAIN: `【GAINモード】総摂取量・タンパク質・消化サポート・分割摂取`
} as const;
```

#### 制約レイヤー別プロンプト
```typescript
export const CONSTRAINT_PROMPTS = {
  pregnancy: `【妊娠中】安全食品・葉酸鉄分・つわり対応`,
  breastfeeding: `【授乳中】カルシウム鉄分・母乳配慮`,
  hormone_ftm: `【FTM】体組成変化・代謝調整・平準化`,
  hormone_mtf: `【MTF】代謝変化・骨密度・平準化`,
  medical: `【医療制約】医師指示優先・相互作用考慮`
} as const;
```

## 🔧 技術的な実装詳細

### 型システム拡張
```typescript
// Phase21で追加された主要な型定義
export type GoalMode = 'CUT' | 'MAINTAIN' | 'GAIN';
export type ConstraintType = 'pregnancy' | 'breastfeeding' | 'hormone_ftm' | 'hormone_mtf' | 'medical';

interface UserSettings {
  // 既存フィールド...
  goalMode?: GoalMode;
  constraints?: ConstraintType[];
}
```

### AIプロンプト構築の拡張
```typescript
export function buildPrompt(context: AIPromptContext): string {
  // ゴールモード情報の追加
  let goalModeInfo = '';
  if (context.goalMode) {
    goalModeInfo = `【ゴールモード】${GOAL_MODE_LABELS[context.goalMode]}`;
  }

  // 制約情報の追加
  let constraintInfo = '';
  if (context.constraints?.length > 0) {
    constraintInfo = `【制約・配慮事項】${constraintPrompts}`;
  }

  // GAINモード特別検知
  let gainModeDetection = '';
  if (context.goalMode === 'GAIN') {
    const gainTags = context.todayCondition.conditionTags.filter(tag => 
      ['low_total_intake', 'early_fullness', 'need_liquid_calories'].includes(tag)
    );
    if (gainTags.length > 0) {
      gainModeDetection = `【GAINモード特別検知】${gainTagsJa}`;
    }
  }
}
```

## 🎨 UI/UX設計

### EnhancedGoalSettings コンポーネント
- **3つのモードカード**: 視覚的に分かりやすいモード選択
- **例示とプライオリティ**: 各モードの具体例と優先順位表示
- **制約設定**: プライバシーに配慮したオプション設定
- **段階的表示**: 基本モード → 詳細設定 → 制約設定の段階的UI

### プライバシー配慮設計
- **任意設定**: すべての制約項目は任意入力
- **利用目的明示**: 情報の使用目的を明確表示
- **医師指示優先**: 医療的制約時の優先順位明確化
- **注意喚起**: 体調異変時の受診案内

## 📊 パフォーマンス・品質指標

### 型安全性
- **TypeScript型チェック**: 全てパス ✅
- **新しい型定義**: 適切にエクスポート・インポート
- **後方互換性**: 既存コードへの影響なし

### コード品質
- **コンポーネント分離**: 既存GoalSettingsを保持、EnhancedGoalSettingsを追加
- **プロンプト体系化**: モード別・制約別に体系化
- **拡張可能設計**: 新しいモードや制約の追加が容易

## 📈 ユーザーメリット

### 1. シンプル化されたゴール設定
- **Before**: 8つの詳細な目標タイプから選択
- **After**: 3つの分かりやすいモード（CUT/MAINTAIN/GAIN）+ 詳細設定（オプション）

### 2. 個別化された安全な提案
- **妊娠・授乳**: 生食回避、必要栄養素重視
- **ホルモン療法**: 体組成変化・メンタル配慮
- **医療制約**: 医師指示優先、安全重視

### 3. 実用的な増量支援
- **食が細い方**: 液体カロリー、小分け摂取
- **運動する方**: トレ後摂取、タンパク質重視
- **検知ベース**: コンディションに応じた自動調整

## 🔄 既存機能との統合

### 段階的移行設計
1. **既存GoalSettings**: そのまま保持
2. **EnhancedGoalSettings**: 新機能として追加
3. **設定画面**: EnhancedGoalSettingsを優先使用
4. **データ互換**: 既存データとの完全互換性

### AI提案への反映
- **モード情報**: buildPrompt関数で自動的にプロンプトに組み込み
- **制約情報**: 安全性を最優先した提案生成
- **検知ロジック**: GAINモード時の特別検知・対応

## 🐛 対応済み課題

### 型システム関連
- ✅ GoalMode、ConstraintTypeの型定義とエクスポート
- ✅ UserSettingsInput拡張でのデータベース保存対応
- ✅ TypeScript型チェック全体の通過

### UI/UX関連
- ✅ 制約情報の適切なプライバシー表示
- ✅ 医療的境界の明確化（診断・治療ではない旨）
- ✅ 段階的表示による情報過多の回避

## 🚀 今後の展開可能性

### 機能拡張
1. **運動連携**: カロリー収支管理との統合
2. **医療機関連携**: より詳細な医療的配慮（将来）
3. **コミュニティ**: 同じゴールのユーザー同士の情報共有
4. **学習機能**: 個別の効果測定による自動最適化

### データ分析
1. **モード別継続率**: 各モードの継続率比較
2. **制約レイヤー効果**: 制約考慮による満足度向上
3. **GAINモード効果**: 増量成功率の測定

## ✅ Phase 21 完了

### 成功指標達成
- ✅ 3つのシンプルモード実装完了
- ✅ 制約レイヤー5タイプ対応完了
- ✅ GAINモード特別機能実装完了
- ✅ AI提案ロジック拡張完了
- ✅ プライバシー配慮設計完了
- ✅ 型安全性・品質確保完了

### 次フェーズへの準備
Phase 22以降では、栄養分析詳細化や運動記録連携など、より高度な個別化機能の実装を検討予定です。

---

**実装者メモ**: Phase 21では「個別化と安全性」を最優先に設計。医療的境界を明確にしつつ、実用的な個別化を実現。ユーザーの多様な状況に対応する包括的なゴール設定システムの構築に成功しました。