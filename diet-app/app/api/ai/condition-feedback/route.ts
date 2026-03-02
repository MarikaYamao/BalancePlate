import { NextResponse } from "next/server";
import { generateConditionFeedback } from "@/lib/ai/conditionAnalysis";

export async function POST(request: Request) {
  try {
    const { dateKey, conditionTags, note } = await request.json();

    if (!conditionTags || conditionTags.length === 0) {
      return NextResponse.json(
        { error: "コンディションタグが必要です" },
        { status: 400 }
      );
    }

    const result = await generateConditionFeedback({
      conditionTags,
      note,
      dateKey,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Condition feedback error:", error);
    return NextResponse.json(
      { error: "フィードバックの生成に失敗しました" },
      { status: 500 }
    );
  }
}