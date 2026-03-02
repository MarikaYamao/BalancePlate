import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

// Notion クライアントの初期化
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { content, path, timestamp } = body;

    // 必須フィールドのバリデーション
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    // Notion APIキーとデータベースIDの確認
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
      console.error("Notion configuration is missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // プロパティオブジェクトを構築
    const properties: any = {
      // タイトル（日時を含む）
      Title: {
        title: [
          {
            text: {
              content: `${new Date(timestamp || new Date().toISOString()).toLocaleString("ja-JP")}`,
            },
          },
        ],
      },
      // 内容
      Content: {
        rich_text: [
          {
            text: {
              content: content,
            },
          },
        ],
      },
      // ページのパス
      Path: {
        rich_text: [
          {
            text: {
              content: path || "Unknown",
            },
          },
        ],
      },
    };

    // Notionデータベースにフィードバックを追加
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId!,
      },
      properties,
    });

    return NextResponse.json(
      {
        success: true,
        id: response.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error submitting feedback to Notion:", error);

    // エラーの詳細をログ出力
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Failed to submit feedback",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
