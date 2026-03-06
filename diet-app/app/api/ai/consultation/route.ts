import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { openai, AI_CONFIG } from '@/lib/ai/config';
import { buildPrompt, SYSTEM_PROMPT, type AIPromptContext } from '@/lib/ai/prompts';
import { rateLimiter, getClientIP } from '@/lib/ai/rateLimit';
import { generateMockResponse, isMockEnabled, delay } from '@/lib/ai/mock';

// リクエストのバリデーションスキーマ
const RequestSchema = z.object({
  userProfile: z.object({
    age: z.number().optional(),
    height: z.number().optional(),
    currentWeight: z.number().optional(),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
    bodyConstitution: z.array(z.string()),
    lifestyle: z.array(z.string()),
    favoriteFoods: z.array(z.string()).optional(),
    dislikedFoods: z.array(z.string()).optional(),
    mealsPerDay: z.union([z.literal(2), z.literal(3)]),
    additionalNotes: z.string().optional(),
  }),
  goals: z.object({
    goalType: z.enum(['weight_loss', 'weight_gain', 'maintain', 'body_recomposition', 'health_improvement']),
    targetWeight: z.number().optional(),
    weeklyWeightChangeTarget: z.number().optional(),
    dailyCalorieTarget: z.number().optional(),
  }).optional(),
  todayCondition: z.object({
    conditionTags: z.array(z.string()),
    freeMemo: z.string().optional(),
  }),
  previousDayData: z.object({
    meals: z.array(z.object({
      type: z.string(),
      content: z.string(),
    })),
    weight: z.number().optional(),
    activityMemo: z.string().optional(),
  }).optional(),
  todayMeals: z.array(z.object({
    type: z.string(),
    content: z.string(),
  })).optional(),
  requestType: z.enum(['morning_plan', 'after_breakfast', 'after_lunch', 'consultation']),
  consultationText: z.string().optional(),
  // Phase19: 冷蔵庫食材情報の追加
  fridgeItems: z.array(z.object({
    name: z.string(),
    category: z.string(),
    available: z.boolean(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const clientIP = getClientIP(request);
    const rateLimitResult = await rateLimiter.checkRateLimit(clientIP);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'レート制限に達しました。しばらく待ってから再試行してください。' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
          }
        }
      );
    }

    // リクエストボディの解析とバリデーション
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);

    // モック機能またはAPIキーの確認
    const isRealAPIKey = process.env.OPENAI_API_KEY && 
                        !process.env.OPENAI_API_KEY.includes('your_openai_api_key_here');
    
    if (!isRealAPIKey && !isMockEnabled()) {
      console.error('OPENAI_API_KEY is not set and mock is disabled');
      return NextResponse.json(
        { error: 'AI機能が利用できません。管理者にお問い合わせください。' },
        { status: 500 }
      );
    }

    // プロンプトの構築
    const context: AIPromptContext = {
      ...validatedData,
      userProfile: {
        ...validatedData.userProfile,
        bodyConstitution: validatedData.userProfile.bodyConstitution as any,
        lifestyle: validatedData.userProfile.lifestyle as any,
      },
      todayCondition: {
        ...validatedData.todayCondition,
        conditionTags: validatedData.todayCondition.conditionTags as any,
      },
      todayMeals: validatedData.todayMeals,
      // Phase19: 冷蔵庫食材情報を追加
      fridgeItems: validatedData.fridgeItems,
    };

    console.log('AI Request:', {
      requestType: validatedData.requestType,
      userProfile: validatedData.userProfile,
      timestamp: new Date().toISOString(),
      usingMock: !isRealAPIKey || isMockEnabled(),
    });

    let response: string;

    // モック機能を使用するかAPIを使用するかを判定
    if (!isRealAPIKey || isMockEnabled()) {
      console.log('Using mock AI response');
      await delay(1500); // リアルなAPI感を演出
      response = generateMockResponse(context);
    } else {
      // 実際のOpenAI API呼び出し
      const prompt = buildPrompt(context);
      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
      });

      const aiContent = completion.choices[0]?.message?.content;
      
      if (!aiContent) {
        throw new Error('AI応答が空です');
      }
      
      response = aiContent;
    }

    console.log('AI Response generated successfully');

    // AIレスポンスをJSONとしてパース
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
      console.log('Successfully parsed structured AI response');
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON, treating as text:', parseError);
      // JSONパースに失敗した場合は従来通りのテキストレスポンス
      parsedResponse = {
        response,
        requestType: validatedData.requestType,
        timestamp: new Date().toISOString(),
      };
    }

    // 構造化されたレスポンスにmetadataを追加
    if (typeof parsedResponse === 'object' && parsedResponse !== null) {
      parsedResponse.requestType = validatedData.requestType;
      parsedResponse.timestamp = new Date().toISOString();
    }

    return NextResponse.json(parsedResponse, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      }
    });

  } catch (error) {
    console.error('AI API Error:', error);

    // バリデーションエラー
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: '入力データが正しくありません。', 
          details: error.issues 
        },
        { status: 400 }
      );
    }

    // OpenAI APIエラー
    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json(
        { error: 'AI機能が一時的に利用できません。しばらくしてから再試行してください。' },
        { status: 503 }
      );
    }

    // その他のエラー
    return NextResponse.json(
      { error: '予期せぬエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// CORS対応（必要に応じて）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}