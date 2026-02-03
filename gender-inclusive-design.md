# 包括的な性別入力設計

## 設計思想
トランスジェンダー、ノンバイナリー、性別移行中の方を含む、すべてのユーザーに適切な栄養提案を行うための設計。

## 入力フィールド構成

### 1. 出生時に割り当てられた性別（必須）
```typescript
assignedSexAtBirth: 'male' | 'female'
```
- **理由**: 基礎代謝の基本計算に必要
- **表示**: 「出生時に割り当てられた性別」

### 2. 現在のホルモン状態（任意）
```typescript
currentHormoneStatus?: 
  | 'male_dominant'     // 男性ホルモンが優位
  | 'female_dominant'   // 女性ホルモンが優位
  | 'in_transition'     // ホルモン治療中（調整段階）
  | 'not_selected'      // 選択しない（デフォルト）
```
- **理由**: 筋肉量、脂肪分布、代謝に影響
- **表示**: プルダウンメニューまたはラジオボタン

### 3. ホルモン治療期間（条件付き表示）
```typescript
hormoneTherapyDuration?: 
  | 'less_than_6_months'    // 6か月未満
  | '6_to_12_months'        // 6〜12か月
  | '12_to_24_months'       // 12〜24か月
  | 'more_than_24_months'   // 24か月以上
```
- **表示条件**: `currentHormoneStatus === 'in_transition'` の時のみ
- **理由**: 治療期間により体組成の変化度合いが異なる

## 栄養計算への反映

### 基礎代謝計算ロジック
```typescript
function calculateEffectiveMetabolism(profile: UserProfile): {
  bmr: number;
  adjustments: string[];
} {
  let baseBMR = calculateBaseBMR(profile.assignedSexAtBirth, profile);
  let adjustedBMR = baseBMR;
  const adjustments = [];
  
  // ホルモン状態による調整
  if (profile.currentHormoneStatus === 'in_transition') {
    // 移行期間による段階的調整
    const adjustmentFactor = getTransitionAdjustment(
      profile.assignedSexAtBirth,
      profile.hormoneTherapyDuration
    );
    adjustedBMR = baseBMR * adjustmentFactor;
    adjustments.push('ホルモン治療による代謝変化を考慮');
  } else if (profile.currentHormoneStatus === 'male_dominant') {
    // 男性ホルモン優位の場合
    if (profile.assignedSexAtBirth === 'female') {
      adjustedBMR *= 1.05; // 筋肉量増加による基礎代謝上昇
      adjustments.push('筋肉量増加による代謝向上を反映');
    }
  } else if (profile.currentHormoneStatus === 'female_dominant') {
    // 女性ホルモン優位の場合
    if (profile.assignedSexAtBirth === 'male') {
      adjustedBMR *= 0.95; // 筋肉量減少による基礎代謝低下
      adjustments.push('体組成変化による代謝調整');
    }
  }
  
  return { bmr: adjustedBMR, adjustments };
}

function getTransitionAdjustment(
  assignedSex: string, 
  duration?: HormoneTherapyDuration
): number {
  if (!duration) return 1;
  
  // 段階的な調整係数
  const adjustmentMap = {
    'less_than_6_months': 0.02,
    '6_to_12_months': 0.05,
    '12_to_24_months': 0.08,
    'more_than_24_months': 0.10
  };
  
  const adjustment = adjustmentMap[duration] || 0;
  
  // MtF: 基礎代謝が徐々に低下
  // FtM: 基礎代謝が徐々に上昇
  return assignedSex === 'male' 
    ? 1 - adjustment 
    : 1 + adjustment;
}
```

## AI提案への活用

### プロンプト生成時の考慮事項
```typescript
function getHormonalConsiderations(profile: UserProfile): string {
  const considerations = [];
  
  if (profile.currentHormoneStatus === 'in_transition') {
    considerations.push('ホルモン治療中のため、タンパク質需要が高い可能性');
    considerations.push('体組成が変化中なので、体重変動に一喜一憂しない');
    
    if (profile.hormoneTherapyDuration === 'less_than_6_months') {
      considerations.push('治療初期のため、食欲変動に注意');
    }
  }
  
  if (profile.currentHormoneStatus === 'female_dominant') {
    considerations.push('鉄分の必要量を考慮');
    considerations.push('カルシウムとビタミンDを意識');
  }
  
  if (profile.currentHormoneStatus === 'male_dominant') {
    considerations.push('タンパク質を十分に');
    considerations.push('筋肉維持のための栄養バランス');
  }
  
  return considerations.join('、');
}
```

## UI実装例

### 設定画面のフロー
```tsx
function GenderSettings() {
  const [assignedSex, setAssignedSex] = useState<'male' | 'female'>();
  const [hormoneStatus, setHormoneStatus] = useState<HormoneStatus>('not_selected');
  const [therapyDuration, setTherapyDuration] = useState<HormoneTherapyDuration>();
  
  return (
    <>
      {/* ステップ1: 必須 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          出生時に割り当てられた性別 *
        </label>
        <select 
          value={assignedSex} 
          onChange={(e) => setAssignedSex(e.target.value)}
          required
        >
          <option value="">選択してください</option>
          <option value="male">男性</option>
          <option value="female">女性</option>
        </select>
      </div>
      
      {/* ステップ2: 任意 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          現在のホルモン状態（任意）
        </label>
        <select 
          value={hormoneStatus} 
          onChange={(e) => setHormoneStatus(e.target.value)}
        >
          <option value="not_selected">選択しない</option>
          <option value="male_dominant">男性ホルモンが優位</option>
          <option value="female_dominant">女性ホルモンが優位</option>
          <option value="in_transition">ホルモン治療中（調整段階）</option>
        </select>
      </div>
      
      {/* ステップ3: 条件付き表示 */}
      {hormoneStatus === 'in_transition' && (
        <div className="mb-6 ml-4 p-4 bg-soft-100 rounded">
          <label className="block text-sm font-medium mb-2">
            ホルモン治療期間
          </label>
          <select 
            value={therapyDuration} 
            onChange={(e) => setTherapyDuration(e.target.value)}
          >
            <option value="">選択してください</option>
            <option value="less_than_6_months">6か月未満</option>
            <option value="6_to_12_months">6〜12か月</option>
            <option value="12_to_24_months">12〜24か月</option>
            <option value="more_than_24_months">24か月以上</option>
          </select>
        </div>
      )}
      
      {/* 説明テキスト */}
      <p className="text-sm text-gray-600 mt-4">
        ※ この情報は、より適切な栄養アドバイスを提供するために使用されます。
        すべての情報は暗号化され、安全に保管されます。
      </p>
    </>
  );
}
```

## プライバシーとセキュリティ

### 暗号化対象
- `UserProfile` 全体を暗号化
- 特に性別関連情報は機密性が高いため確実に保護

### データの扱い
```typescript
// Repository層での暗号化
class UserProfileRepository extends EncryptedRepository {
  async save(profile: UserProfile): Promise<void> {
    // profile全体を暗号化して保存
    const encrypted = await this.encryptField(profile);
    await db.userSettings.update(userId, {
      profileEnc: encrypted
    });
  }
}
```

## 考慮事項

### 1. 言語表現
- 「生物学的性別」という表現を避け、「出生時に割り当てられた性別」を使用
- 説明文は包括的で中立的な表現を心がける

### 2. デフォルト値
- ホルモン状態は「選択しない」をデフォルトに
- 無理に入力を促さない

### 3. 将来の拡張性
- ノンバイナリー対応（they/them代名詞など）
- より詳細なホルモン値の入力（血液検査結果など）
- 医療連携機能

この設計により、すべてのユーザーに対して科学的根拠に基づいた、個別最適化された栄養提案が可能になります。