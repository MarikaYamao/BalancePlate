import type { AIPromptContext } from '@/lib/ai/prompts';

// AI APIクライアント
export class AIClient {
  private baseURL: string;

  constructor(baseURL: string = '/api/ai') {
    this.baseURL = baseURL;
  }

  async sendConsultation(context: AIPromptContext): Promise<{
    response: string;
    requestType: string;
    timestamp: string;
  }> {
    const response = await fetch(`${this.baseURL}/consultation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(context),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AIError(
        errorData.error || 'AI機能でエラーが発生しました',
        response.status,
        errorData.details
      );
    }

    return await response.json();
  }

  // 朝の食事プラン提案
  async getMorningPlan(context: Omit<AIPromptContext, 'requestType'>): Promise<{
    response: string;
    requestType: string;
    timestamp: string;
  }> {
    return this.sendConsultation({
      ...context,
      requestType: 'morning_plan',
    });
  }

  // 朝食後のアドバイス
  async getAfterBreakfastAdvice(context: Omit<AIPromptContext, 'requestType'>): Promise<{
    response: string;
    requestType: string;
    timestamp: string;
  }> {
    return this.sendConsultation({
      ...context,
      requestType: 'after_breakfast',
    });
  }

  // 昼食後のアドバイス
  async getAfterLunchAdvice(context: Omit<AIPromptContext, 'requestType'>): Promise<{
    response: string;
    requestType: string;
    timestamp: string;
  }> {
    return this.sendConsultation({
      ...context,
      requestType: 'after_lunch',
    });
  }

  // 一般的な相談
  async getGeneralConsultation(context: Omit<AIPromptContext, 'requestType'>): Promise<{
    response: string;
    requestType: string;
    timestamp: string;
  }> {
    return this.sendConsultation({
      ...context,
      requestType: 'consultation',
    });
  }
}

// AIエラークラス
export class AIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// グローバルAIクライアントインスタンス
export const aiClient = new AIClient();