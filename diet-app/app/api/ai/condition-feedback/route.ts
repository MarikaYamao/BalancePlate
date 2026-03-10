import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openai, AI_CONFIG } from "@/lib/ai/config";
import { rateLimiter, getClientIP } from "@/lib/ai/rateLimit";
import { isMockEnabled, delay } from "@/lib/ai/mock";
import { conditionTagsInfo } from "@/lib/constants/conditionTags";

// リクエストのバリデーションスキーマ
export const RequestSchema = z.object({
  dateKey: z.string(),
  conditionTags: z.array(z.string()),
  note: z.string().optional(),
  mealsPerDay: z.union([z.literal(2), z.literal(3)]).optional(),
  userProfile: z.object({
    favoriteFoods: z.array(z.string()).optional(),
    dislikedFoods: z.array(z.string()).optional(),
    bodyConstitution: z.array(z.string()).optional(),
    lifestyle: z.array(z.string()).optional(),
    additionalNotes: z.string().optional(),
  }).optional(),
  availableIngredients: z.array(z.string()).optional(),
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
    const { dateKey, conditionTags, note, mealsPerDay, userProfile, availableIngredients } = validatedData;

    if (!conditionTags || conditionTags.length === 0) {
      return NextResponse.json(
        { error: "コンディションタグが必要です" },
        { status: 400 }
      );
    }

    // クライアントから送信されたデータを使用
    const actualMealsPerDay = mealsPerDay || 3;

    // コンディションタグの詳細情報を取得
    const tagDetails = conditionTags
      .map((tagId) => conditionTagsInfo.find((t) => t.id === tagId))
      .filter(Boolean)
      .map(tag => tag!.label);

    // プロンプトの構築
    const systemPrompt = `あなたは健康管理と食事アドバイスの専門家です。
ユーザーの体調やコンディションに基づいて、適切なフィードバックと食事提案を行ってください。

重要な指示：
1. 必ず有効なJSON形式でレスポンスしてください
2. 文字列内の改行は\\nで表現してください（\\\\nではありません）
3. 文字列内のダブルクォートは\\"でエスケープしてください
4. JSONの末尾にカンマを付けないでください
5. すべてのプロパティ名をダブルクォートで囲んでください

必ず以下の形式のJSONでレスポンスしてください：
{
  "feedback": "コンディションに対するフィードバック。改行は\\nで表現してください。",
  "foodSuggestions": {
    "characteristics": ["推奨する食事の特徴を3つ"],
    "recommendations": [
      {
        "category": "カテゴリ名",
        "items": ["食品名1", "食品名2", "食品名3", "食品名4"]
      }
    ],
    "avoid": ["避けるべき食品"]
  },
  "mealPlans": {
    "breakfast": {
      "planA": {
        "title": "プラン名",
        "menu": "メニュー内容",
        "description": "プランの説明"
      },
      "planB": {
        "title": "プラン名",
        "menu": "メニュー内容",
        "description": "プランの説明"
      },
      "planC": {
        "title": "プラン名",
        "menu": "メニュー内容",
        "description": "プランの説明"
      }
    },
    ${actualMealsPerDay === 3 ? `"lunch": {
      "planA": {
        "title": "プラン名",
        "menu": "メニュー内容",
        "description": "プランの説明"
      },
      "planB": {
        "title": "プラン名",
        "menu": "メニュー内容",
        "description": "プランの説明"
      },
      "planC": {
        "title": "プラン名",
        "menu": "メニュー内容",
        "description": "プランの説明"
      }
    },` : ''}
    "dinner": {
      "planA": {
        "title": "プラン名",
        "menu": "メニュー内容",
        "description": "プランの説明"
      },
      "planB": {
        "title": "プラン名",
        "menu": "メニュー内容",
        "description": "プランの説明"
      },
      "planC": {
        "title": "プラン名",
        "menu": "メニュー内容",
        "description": "プランの説明"
      }
    }
  }
}

${actualMealsPerDay === 2 ? '食事プランは"breakfast"と"dinner"の2食分を提案してください。' : '食事プランは"breakfast"、"lunch"、"dinner"の3食分を提案してください。'}`;

    const userPrompt = `ユーザーのコンディション情報：
- コンディションタグ: ${tagDetails.join('、')}
${note ? `- メモ: ${note}` : ''}

ユーザープロフィール：
- 食事回数: ${actualMealsPerDay}食
${userProfile ? `
- 好きな食材: ${userProfile.favoriteFoods?.join('、') || '未設定'}
- 苦手な食材: ${userProfile.dislikedFoods?.join('、') || '未設定'}
- 体質: ${userProfile.bodyConstitution?.join('、') || '未設定'}
- ライフスタイル: ${userProfile.lifestyle?.join('、') || '未設定'}
${userProfile.additionalNotes ? `- 追加情報: ${userProfile.additionalNotes}` : ''}
` : ''}

${availableIngredients && availableIngredients.length > 0 ? `冷蔵庫にある食材:
${availableIngredients.map((item: string) => `- ${item}`).join('\n')}

冷蔵庫の食材を活用した提案を優先してください。` : ''}

上記の情報を基に、コンディションに適したフィードバックと食事提案を生成してください。
好きな食材を積極的に取り入れ、苦手な食材は避けるようにしてください。`;

    let response: string;

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

    if (!isRealAPIKey || isMockEnabled()) {
      // モックレスポンスを生成
      await delay(1500);
      response = JSON.stringify(generateMockConditionResponse(conditionTags, actualMealsPerDay, availableIngredients || [], userProfile));
    } else {
      // 実際のOpenAI API呼び出し
      try {
        const completion = await openai.chat.completions.create({
          model: AI_CONFIG.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: AI_CONFIG.temperature,
          max_tokens: 3000, // コンディションフィードバックは詳細な応答が必要なため増加
          response_format: { type: "json_object" },
          seed: 42, // 出力を安定させる
        });
        const aiContent = completion.choices[0]?.message?.content;
        
        if (!aiContent) {
          throw new Error('AI応答が空です');
        }
        
        response = aiContent;
      } catch (openaiError) {
        console.error('🔴 OpenAI API error:', openaiError);
        throw openaiError;
      }
    }

    // AIレスポンスをJSONとしてパース
    let parsedResponse;
    try {
      
      // JSONの前処理: マークダウンと制御文字の削除
      let cleanedResponse = response
        .replace(/^```json\s*/i, '') // 開始の```jsonを除去
        .replace(/^```\s*/i, '') // 開始の```を除去
        .replace(/\s*```$/i, '') // 終了の```を除去
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 制御文字を削除
        .replace(/\r\n/g, '\\n') // 改行を正規化
        .replace(/\r/g, '\\n')
        .trim();
      
      // JSONパースを試みる
      parsedResponse = JSON.parse(cleanedResponse);
      
      // 必須フィールドの検証
      if (!parsedResponse.feedback || !parsedResponse.foodSuggestions || !parsedResponse.mealPlans) {
        throw new Error('レスポンスに必須フィールドが不足しています');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Response that failed to parse (last 500 chars):', response.substring(response.length - 500));
      
      // パースエラーの詳細を調査
      try {
        // JSONの構文エラー位置を特定
        if (parseError instanceof SyntaxError && parseError.message.includes('position')) {
          const match = parseError.message.match(/position (\d+)/);
          if (match) {
            const errorPosition = parseInt(match[1]);
            const start = Math.max(0, errorPosition - 50);
            const end = Math.min(response.length, errorPosition + 50);
            console.error('Error context:', response.substring(start, end));
            console.error('Error at character:', response[errorPosition]);
          }
        }
      } catch (debugError) {
        console.error('Debug error:', debugError);
      }
      
      // パースエラーの場合はモックレスポンスを使用
      parsedResponse = generateMockConditionResponse(conditionTags, actualMealsPerDay, availableIngredients || [], userProfile);
    }

    return NextResponse.json(parsedResponse, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      }
    });
  } catch (error) {
    console.error("Condition feedback error:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

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

    // OpenAI APIエラー（より具体的な条件に変更）
    if (error instanceof Error && 
        (error.message.includes('OPENAI_API_KEY') || 
         error.message.includes('OpenAI') ||
         error.message.includes('429') ||
         error.message.includes('rate limit'))) {
      return NextResponse.json(
        { error: 'AI機能が一時的に利用できません。しばらくしてから再試行してください。' },
        { status: 503 }
      );
    }

    // 解析エラー
    if (error instanceof Error && error.message.includes('AIレスポンスの解析に失敗')) {
      return NextResponse.json(
        { error: 'AIレスポンスの処理に失敗しました。もう一度お試しください。' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "フィードバックの生成に失敗しました",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// モックレスポンス生成関数
function generateMockConditionResponse(conditionTags: string[], mealsPerDay: number, availableIngredients: string[], userProfile: any) {
  const hasPhysicalIssue = conditionTags.some(tag => 
    tag.includes("tired") || tag.includes("sleep"));
  const hasMentalIssue = conditionTags.some(tag => 
    tag.includes("stress") || tag.includes("irritable"));

  let feedback = "";
  let characteristics: string[] = [];
  let recommendations: any[] = [];
  let avoid: string[] = [];

  if (hasPhysicalIssue) {
    feedback = "身体的な疲れが見られるようです。\n\n体力回復のためのアドバイス：\n• ビタミンB群を含む食材（豚肉、納豆、卵など）を摂取\n• 消化に負担のかからない食事を選択\n• 十分な水分補給を心がける\n\n身体のサインに耳を傾けて、休息を大切にしてください。";
    characteristics = ["消化に良いもの", "温かい料理", "ビタミンB群豊富"];
    recommendations = [
      { category: "主食", items: ["おかゆ", "雑炊", "うどん", "温かいスープパスタ"] },
      { category: "たんぱく質", items: ["豆腐", "卵", "白身魚", "鶏むね肉"] }
    ];
    avoid = ["揚げ物", "脂っこい料理", "冷たい飲み物"];
  } else if (hasMentalIssue) {
    feedback = "精神的なストレスを感じているようですね。\n\n心のケアのための提案：\n• トリプトファンを含む食材でセロトニン分泌を促進\n• 温かいお風呂でリラックスタイムを作る\n\nストレスは誰にでもあるもの。自分に優しくしてくださいね。";
    characteristics = ["抗酸化物質豊富", "ビタミンC含有", "心を落ち着ける"];
    recommendations = [
      { category: "野菜・果物", items: ["ブロッコリー", "パプリカ", "キウイ", "オレンジ"] },
      { category: "リラックス食材", items: ["ダークチョコレート", "ナッツ類", "緑茶", "ハーブティー"] }
    ];
    avoid = ["加工食品", "ファストフード", "糖分の多い飲料"];
  } else {
    feedback = "今日のコンディションを記録しました。\n\n健康維持のための基本ポイント：\n• 規則正しい食事時間を心がける\n• 栄養バランスを意識した食事選び\n\n日々の記録が健康管理の第一歩です。継続していきましょう！";
    characteristics = ["バランスの良い", "消化しやすい", "栄養豊富"];
    recommendations = [
      { category: "主食", items: ["ご飯", "パン", "パスタ", "うどん"] },
      { category: "たんぱく質", items: ["魚", "肉", "卵", "大豆製品"] }
    ];
  }

  // 冷蔵庫の食材を活用
  if (availableIngredients.length > 0) {
    recommendations.push({
      category: "冷蔵庫の食材を活用",
      items: availableIngredients.slice(0, 4)
    });
  }

  // 食事プランの生成
  const mealPlans: any = {};
  
  if (mealsPerDay === 3) {
    mealPlans.breakfast = {
      planA: { title: "元気朝食", menu: "卵かけご飯、納豆、みそ汁", description: "消化に良くエネルギー補給" },
      planB: { title: "軽やか朝食", menu: "トースト、ヨーグルト、サラダ", description: "軽めで栄養バランス良好" },
      planC: { title: "和風朝食", menu: "おかゆ、焼き魚、漬物", description: "胃に優しい和食" }
    };
    mealPlans.lunch = {
      planA: { title: "バランスランチ", menu: "鶏照り焼き定食", description: "栄養バランス抜群" },
      planB: { title: "ヘルシーランチ", menu: "野菜たっぷりスープ", description: "ビタミン豊富" },
      planC: { title: "温かランチ", menu: "うどん、天ぷら", description: "消化に優しい" }
    };
  } else {
    mealPlans.breakfast = {
      planA: { title: "しっかり朝食", menu: "卵料理、パン、サラダ、スープ", description: "1日のエネルギーをしっかりチャージ" },
      planB: { title: "和朝食", menu: "焼き魚定食、ご飯、味噌汁", description: "バランスの良い和食" },
      planC: { title: "軽め朝食", menu: "グラノーラ、ヨーグルト、フルーツ", description: "軽めで消化に優しい" }
    };
  }

  mealPlans.dinner = {
    planA: { title: "家庭的定食", menu: "豚しょうが焼き、ご飯、味噌汁", description: "栄養バランス良好" },
    planB: { title: "和風ディナー", menu: "魚の煮付け、ご飯、お名物", description: "優しい味付け" },
    planC: { title: "洋風ディナー", menu: "チキンソテー、ライス、サラダ", description: "食欲をそそる" }
  };

  return {
    feedback,
    foodSuggestions: {
      characteristics,
      recommendations,
      avoid: avoid.length > 0 ? avoid : undefined
    },
    mealPlans
  };
}