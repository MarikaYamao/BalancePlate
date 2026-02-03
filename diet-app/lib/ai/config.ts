import OpenAI from 'openai';

// OpenAI クライアントの初期化
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// モデル設定
export const AI_CONFIG = {
  model: 'gpt-4o',
  temperature: 0.2,
  maxTokens: 1000,
} as const;

// レート制限設定
export const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 100,
} as const;