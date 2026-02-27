# データモデル・ドキュメント更新履歴

## 更新日: 2024年2月

### 概要
初期構想ドキュメントと実装の差異を確認し、実際のアプリケーションコードに合わせてドキュメントを更新しました。

## 主な更新内容

### 1. データモデル (dataModel.md)

#### BodyConstitutionTag の拡張
- **追加された健康状態タグ**
  - `healthy` - 特に問題なし
  - `good_digestion` - 消化が良い
  - `high_metabolism` - 代謝が良い
  - `good_stamina` - 体力がある
  - `good_sleep` - 睡眠の質が良い
  - `poor_circulation` - 血行不良
  
- **女性特有のタグ追加**
  - `pms_severe` - PMS強め
  - `irregular_periods` - 生理不順
  - `heavy_periods` - 生理が重い
  - `menopause` - 更年期

- **特別な配慮タグ**
  - `pregnancy` - 妊娠中
  - `breastfeeding` - 授乳中
  - `hormone_ftm` - ホルモン療法中（FTM）
  - `hormone_mtf` - ホルモン療法中（MTF）
  - `medical_diet` - 医師から食事指導を受けている
  
- **その他追加**
  - `sensitive_to_caffeine` - カフェインに敏感
  - `water_retention` - 水分を溜めやすい

#### LifestyleTag の追加
- `prefer_cooking` - 自炊派
- `budget_conscious` - 節約志向

#### ConditionTag の詳細化
- **睡眠の3段階評価**
  - `sleep_good` / `sleep_normal` / `sleep_bad`
  - 旧: `sleepy` のみ

- **疲労の3段階評価**
  - `tired_low` / `tired_medium` / `tired_high`
  - 旧: `tired` のみ

- **むくみの3段階評価**
  - `edema_low` / `edema_medium` / `edema_high`

- **新規追加タグ**
  - `ovulation` - 排卵期っぽい
  - `normal` - 普通・特になし
  - `low_appetite` / `high_appetite` - 食欲状態
  - `dining_out` - 外食予定
  - `exercise_planned` - 運動予定
  - `travel_day` - 移動多い日
  - `work_from_home` - 在宅日

#### フェーズ21: ゴールモード機能
- **GoalMode型の追加**
  - `CUT` - 減量モード
  - `MAINTAIN` - 維持モード  
  - `GAIN` - 増量モード

- **ConstraintType型の追加**
  - `pregnancy` - 妊娠中
  - `breastfeeding` - 授乳中
  - `hormone_ftm` / `hormone_mtf` - ホルモン療法
  - `medical` - その他医療的制約

- **GainDetectionTag型の追加**（GAINモード専用）
  - `low_total_intake` - 総量不足
  - `low_meal_frequency` - 回数不足
  - `early_fullness` - すぐ満腹
  - `low_protein` - タンパク不足
  - `low_energy_density` - 低密度

#### UserProfile の更新
- **性別フィールドの変更**
  - 追加: `gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'`
  - 変更: `assignedSexAtBirth` を任意フィールドに

- **目標設定の追加**
  - `goalType` - 目標タイプ
  - `targetWeight` - 目標体重
  - `goalPeriod` - 目標期間
  - `goalMode` - CUT/MAINTAIN/GAIN
  - `constraints` - 制約条件配列

#### UserSettings の更新
- `profile` を任意フィールドに変更
- **食材の好み追加**
  - `favoriteFoods` - 好きな食材・料理
  - `dislikedFoods` - 嫌い・アレルギーのある食材
- **自由記載追加**
  - `additionalNotes` - その他の情報

### 2. フェーズ19: 冷蔵庫管理機能（新規追加）

#### FridgeItem型の追加
```typescript
interface FridgeItem {
  id: string
  name: string
  category: FridgeItemCategory
  quantity?: string
  isAvailable: boolean
  expirationDate?: Date
  priority?: 'high' | 'medium' | 'low'
  notes?: string
}
```

#### ShoppingList機能の追加
- AI提案による買い物リスト生成
- カテゴリ別管理
- 購入状況トラッキング

### 3. AI連携の更新

#### AIPromptContext の改良
- `favoriteFoods` / `dislikedFoods` の追加
- `fridgeItems` - 手持ち食材情報の追加
- `goalMode` / `constraints` - フェーズ21機能の追加
- 性別関連フィールドの削除（より包括的な設計へ）

### 4. 技術スタック (techStack.md)

#### フレームワークのバージョン更新
- Next.js 14 → Next.js 15
- UIコンポーネント: Radix UI/shadcn/ui → カスタムコンポーネント

#### プロンプトラベルの更新
- すべての新タグに対応する日本語ラベルを追加
- 詳細な段階評価に対応

### 5. 画面構成 (mvp.md)

#### 起動フローの変更
- オンボーディング確認を追加
- コンディション入力を任意化
- 画面遷移をより明確に記載

#### コンディション選択UIの詳細化
- カテゴリ別にグループ化
- 段階評価を可能にする UI 設計

#### 実装済み機能の明確化
- フェーズ1-20の実装済み機能
- フェーズ19（冷蔵庫管理）
- フェーズ21（ゴールモード）
- 未実装機能の明記

## データベーススキーマの更新

### IndexedDB（Dexie.js）
- バージョンを1から2へ更新
- `fridgeItems` テーブル追加
- `shoppingLists` テーブル追加

### リポジトリパターンの採用
- シングルトンパターンでのリポジトリ管理
- 暗号化対応リポジトリの分離
- 新機能用リポジトリの追加

## 今後の課題

1. **ドキュメントの継続的更新**
   - 新機能追加時は必ずドキュメントも更新する
   - フェーズ完了時に差異をチェック

2. **型定義の一元管理**
   - types/ ディレクトリで型定義を管理
   - ドキュメントと実装の型を同期

3. **プロンプト管理**
   - AI プロンプトのバージョン管理
   - ゴールモード別・制約別プロンプトの拡充

## 変更の理由

1. **ユーザビリティの向上**
   - より詳細な体調管理が可能に
   - 段階評価により精密な AI 提案が可能

2. **包括的な設計**
   - 性別・ジェンダーに配慮した設計
   - 医療的制約への対応

3. **機能の拡張性**
   - 冷蔵庫管理による実用性向上
   - ゴールモード による個別最適化

これらの更新により、初期構想から大幅に機能が拡張され、より実用的で包括的なアプリケーションとなっています。