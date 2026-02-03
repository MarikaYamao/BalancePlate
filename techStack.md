# 技術実装方針書

## 1. 技術スタック概要

### フロントエンド
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript 5.x
- **状態管理**: TanStack Query v5 + Zustand
- **スタイリング**: Tailwind CSS v3
- **UI コンポーネント**: Radix UI / shadcn/ui（軽量コンポーネント）
- **フォーム**: React Hook Form + Zod
- **PWA**: next-pwa

### データ層
- **ローカルDB**: IndexedDB (Dexie.js)
- **暗号化**: Web Crypto API
- **将来拡張**: WA-SQLite, Supabase

### AI連携
- **API**: OpenAI API
- **SDK**: Vercel AI SDK
- **レート制限**: p-queue

---

## 2. プロジェクト構造

```
diet-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連（将来）
│   ├── (main)/            # メインアプリ
│   │   ├── home/          # ホーム画面
│   │   ├── log/           # 記録画面
│   │   ├── history/       # 履歴画面
│   │   └── settings/      # 設定画面
│   ├── api/               # API Routes
│   │   └── ai/            # AI関連エンドポイント
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ランディング
│
├── components/            # 共通コンポーネント
│   ├── ui/               # UIコンポーネント
│   ├── features/         # 機能別コンポーネント
│   └── layouts/          # レイアウトコンポーネント
│
├── lib/                   # ライブラリ・ユーティリティ
│   ├── db/               # データベース関連
│   ├── ai/               # AI関連
│   ├── crypto/           # 暗号化
│   ├── hooks/            # カスタムフック
│   └── utils/            # ユーティリティ
│
├── types/                # 型定義
├── public/               # 静的ファイル
└── styles/               # グローバルスタイル
```

---

## 3. PWA実装

### next-pwa設定
```typescript
// next.config.js
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

export default config;
```

### マニフェスト
```json
// public/manifest.json
{
  "name": "やさしいダイエット",
  "short_name": "やさダイ",
  "description": "体質と習慣に寄り添うダイエット支援",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#10b981",
  "background_color": "#ffffff"
}
```

### オフライン対応
```typescript
// lib/hooks/useOnlineStatus.ts
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

---

## 4. 状態管理戦略

### TanStack Query（サーバー状態）
```typescript
// lib/hooks/useToday.ts
export function useTodayData() {
  const dateKey = useDateKey();
  
  return useQuery({
    queryKey: ['today', dateKey],
    queryFn: () => getTodayData(dateKey),
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分
  });
}
```

### Zustand（クライアント状態）
```typescript
// lib/stores/appStore.ts
interface AppStore {
  // UI状態
  isOnboarding: boolean;
  activeTab: 'home' | 'log' | 'history' | 'settings';
  
  // 一時データ
  draftMeal: Partial<MealLog> | null;
  
  // アクション
  setActiveTab: (tab: AppStore['activeTab']) => void;
  saveDraftMeal: (meal: Partial<MealLog>) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isOnboarding: false,
  activeTab: 'home',
  draftMeal: null,
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  saveDraftMeal: (meal) => set({ draftMeal: meal }),
}));
```

---

## 5. AI機能実装

### OpenAI API統合
```typescript
// lib/ai/openai.ts
import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFoodPlans(
  context: AIPromptContext
): Promise<AIResponse> {
  const prompt = buildPrompt(context);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  });
  
  return parseAIResponse(response);
}
```

### プロンプトテンプレート
```typescript
// lib/ai/prompts.ts
const SYSTEM_PROMPT = `
あなたは優しく寄り添うダイエット支援アシスタントです。
ユーザーの体質、生活習慣、今日のコンディションを考慮して、
無理のない食事プランを3パターン提案してください。

重要な指針：
- 完璧を求めない
- 今日の状態に合わせた現実的な提案
- 励まし、肯定的なトーン
- 「〜しなければならない」という表現は避ける
`;

// タグを日本語に変換
const BODY_CONSTITUTION_LABELS: Record<BodyConstitutionTag, string> = {
  // 循環・代謝
  'edema_prone': 'むくみやすい',
  'cold_sensitivity': '冷えやすい',
  'low_blood_pressure': '低血圧',
  'anemic': '貧血気味',
  
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
  
  // その他
  'prone_to_headaches': '頭痛持ち',
  'skin_problems': '肌荒れしやすい',
  'sleep_issues': '睡眠障害',
};

const LIFESTYLE_LABELS: Record<LifestyleTag, string> = {
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

const CONDITION_LABELS: Record<ConditionTag, string> = {
  'period_before': '生理前',
  'period_during': '生理中',
  'period_after': '生理後',
  'tired': '疲れている',
  'stressed': 'ストレスあり',
  'sleepy': '眠い',
  'craving_sweet': '甘いものが欲しい',
  'stomach_weak': '胃腸が弱っている',
  'drinking_planned': '飲酒予定',
  'hangover': '二日酔い',
};

function buildPrompt(context: AIPromptContext): string {
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

  // 基本情報の整形
  const profile = context.userProfile;
  const basicInfo = [];
  if (profile.biologicalSex) basicInfo.push(`性別: ${profile.biologicalSex === 'male' ? '男性' : profile.biologicalSex === 'female' ? '女性' : 'その他'}`);
  if (profile.age) basicInfo.push(`年齢: ${profile.age}歳`);
  if (profile.height) basicInfo.push(`身長: ${profile.height}cm`);
  if (profile.currentWeight) basicInfo.push(`現在の体重: ${profile.currentWeight}kg`);
  if (profile.activityLevel) basicInfo.push(`活動レベル: ${getActivityLevelLabel(profile.activityLevel)}`);

  // 目標情報の整形
  const goalInfo = [];
  if (context.goals) {
    if (context.goals.goalType) goalInfo.push(`目標: ${getGoalTypeLabel(context.goals.goalType)}`);
    if (context.goals.targetWeight) goalInfo.push(`目標体重: ${context.goals.targetWeight}kg`);
    if (context.goals.dailyCalorieTarget) goalInfo.push(`1日目標カロリー: ${context.goals.dailyCalorieTarget}kcal`);
  }

  return `
【ユーザー情報】
${basicInfo.join('\n')}
体質: ${bodyConstitutionJa}
生活: ${lifestyleJa}
食事回数: ${context.userProfile.mealsPerDay}食

${goalInfo.length > 0 ? '【目標】\n' + goalInfo.join('\n') + '\n\n' : ''}

【今日の状態】
コンディション: ${conditionJa}
メモ: ${context.todayCondition.freeMemo || 'なし'}

【前日の記録】
${formatPreviousDayData(context.previousDayData)}

【リクエスト】
${getRequestPrompt(context.requestType)}
`;
}
```

### API Route実装
```typescript
// app/api/ai/plans/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  context: z.object({
    userProfile: z.object({
      bodyConstitution: z.array(z.string()),
      lifestyle: z.array(z.string()),
      mealsPerDay: z.union([z.literal(2), z.literal(3)]),
    }),
    // ... その他のスキーマ
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = requestSchema.parse(body);
    
    // レート制限チェック
    await rateLimiter.check(request);
    
    // AI応答生成
    const response = await generateFoodPlans(validated.context);
    
    return Response.json(response);
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 6. データベース実装

### Dexie.js セットアップ
```typescript
// lib/db/database.ts
import Dexie, { Table } from 'dexie';

class DietDatabase extends Dexie {
  userSettings!: Table<UserSettings>;
  dailyStates!: Table<DailyState>;
  mealLogs!: Table<MealLog>;
  foodPlans!: Table<FoodPlan>;
  weightLogs!: Table<WeightLog>;
  
  constructor() {
    super('DietDatabase');
    this.version(1).stores({
      userSettings: 'id',
      dailyStates: 'dateKey, actualDate, createdAt', // dateKeyを主キーに
      mealLogs: 'id, dateKey, [dateKey+mealType], createdAt',
      foodPlans: '[dateKey+planType], dateKey, createdAt', // 複合主キー
      weightLogs: 'id, dateKey, timestamp'
    });
  }
}

export const db = new DietDatabase();
```

### データアクセス層（Repository層で暗号化/復号化）
```typescript
// lib/db/repositories/userSettingsRepository.ts
import { encryptionService } from '@/lib/crypto/encryption';

export class UserSettingsRepository {
  async save(settings: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSettings> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    // 暗号化処理（fail-closedで実装）
    let encryptedData;
    try {
      encryptedData = {
        bodyConstitutionEnc: await encryptionService.encrypt(
          JSON.stringify(settings.bodyConstitution)
        ),
        lifestyleEnc: await encryptionService.encrypt(
          JSON.stringify(settings.lifestyle)
        ),
      };
    } catch (error) {
      throw new Error('個人情報の保護処理に失敗しました。設定を保存できません。');
    }
    
    const userSettings = {
      id,
      dayResetTime: settings.dayResetTime,
      mealsPerDay: settings.mealsPerDay,
      onboardingCompleted: settings.onboardingCompleted,
      ...encryptedData,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.userSettings.add(userSettings);
    
    // メモリ上のオブジェクトには複号済みデータを返す
    return {
      ...userSettings,
      bodyConstitution: settings.bodyConstitution,
      lifestyle: settings.lifestyle,
    };
  }
  
  async get(id: string): Promise<UserSettings | null> {
    const stored = await db.userSettings.get(id);
    if (!stored) return null;
    
    // 復号化処理
    try {
      const bodyConstitution = JSON.parse(
        await encryptionService.decrypt(stored.bodyConstitutionEnc)
      );
      const lifestyle = JSON.parse(
        await encryptionService.decrypt(stored.lifestyleEnc)
      );
      
      return {
        ...stored,
        bodyConstitution,
        lifestyle,
      };
    } catch (error) {
      console.error('復号化エラー:', error);
      throw new Error('設定データの読み込みに失敗しました');
    }
  }
}

// lib/db/repositories/mealRepository.ts
export class MealRepository {
  async saveMeal(meal: Omit<MealLog, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const mealLog: MealLog = {
      ...meal,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.mealLogs.add(mealLog);
    
    // AI分析を非同期で実行
    this.analyzeInBackground(id, meal.text);
    
    return mealLog;
  }
  
  private async analyzeInBackground(mealId: string, text: string) {
    // バックグラウンドでAI分析
    setTimeout(async () => {
      try {
        const analysis = await analyzeMeal(text);
        await db.mealLogs.update(mealId, {
          aiAnalysis: analysis
        });
      } catch (error) {
        console.error('AI analysis failed:', error);
      }
    }, 0);
  }
}
```

---

## 7. UI/UX実装

### やさしいトーンのデザインシステム
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          500: '#10b981', // エメラルドグリーン
          600: '#059669',
        },
        soft: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
        }
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    }
  }
}
```

### コンポーネント例
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'soft' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick 
}: ButtonProps) {
  const styles = cn(
    'rounded-full transition-all font-medium',
    'focus:outline-none focus:ring-2 focus:ring-primary-500',
    {
      'bg-primary-500 text-white hover:bg-primary-600': variant === 'primary',
      'bg-soft-100 text-gray-700 hover:bg-soft-200': variant === 'soft',
      'hover:bg-soft-100': variant === 'ghost',
      'px-4 py-2 text-sm': size === 'sm',
      'px-6 py-3': size === 'md',
      'px-8 py-4 text-lg': size === 'lg',
    }
  );
  
  return (
    <button className={styles} onClick={onClick}>
      {children}
    </button>
  );
}
```

---

## 8. パフォーマンス最適化

### コード分割
```typescript
// 動的インポート
const HistoryChart = dynamic(
  () => import('@/components/features/HistoryChart'),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false 
  }
);
```

### 画像最適化
```typescript
// next/image使用
import Image from 'next/image';

<Image
  src="/meal-placeholder.jpg"
  alt="食事"
  width={400}
  height={300}
  placeholder="blur"
  loading="lazy"
/>
```

### バンドルサイズ最適化
```typescript
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

---

## 9. エラーハンドリング

### グローバルエラーバウンダリ
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-medium mb-4">
        申し訳ございません
      </h2>
      <p className="text-soft-600 mb-6">
        エラーが発生しました
      </p>
      <Button onClick={reset} variant="soft">
        もう一度試す
      </Button>
    </div>
  );
}
```

### API エラーハンドリング
```typescript
// lib/utils/error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }
  
  return Response.json(
    { error: '予期せぬエラーが発生しました' },
    { status: 500 }
  );
}
```

---

## 10. 開発環境

### 環境変数
```bash
# .env.local
OPENAI_API_KEY=your_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 暗号化キー（自動生成）
ENCRYPTION_KEY=generated_key
```

### 開発ツール
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

### Git hooks (Husky + lint-staged)
```json
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged

// .lintstagedrc
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```