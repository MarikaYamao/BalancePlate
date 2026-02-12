import type { FoodPlan, FoodPlanMealSuggestion, MealType } from '@/types';

// AI応答からプランを抽出するパーサー
export class FoodPlanParser {
  /**
   * AI応答テキストから3つのプランを解析
   */
  static parseAIResponse(response: string, dateKey: string): FoodPlan[] {
    const plans: FoodPlan[] = [];
    
    try {
      // プランA、B、Cのパターンを検索
      const planPatterns = [
        { type: 'A' as const, pattern: /プランA[：:]\s*(.+?)(?=プランB|プランC|$)/s },
        { type: 'B' as const, pattern: /プランB[：:]\s*(.+?)(?=プランC|$)/s },
        { type: 'C' as const, pattern: /プランC[：:]\s*(.+?)$/s },
      ];

      for (const { type, pattern } of planPatterns) {
        const match = response.match(pattern);
        if (match) {
          const planText = match[1].trim();
          const plan = this.parseSinglePlan(planText, dateKey, type);
          if (plan) {
            plans.push(plan);
          }
        }
      }

      // 3つのプランが見つからない場合のフォールバック
      if (plans.length === 0) {
        plans.push(...this.createFallbackPlans(response, dateKey));
      }

      return plans;
    } catch (error) {
      console.error('FoodPlan parsing error:', error);
      return this.createFallbackPlans(response, dateKey);
    }
  }

  /**
   * 単一プランの解析
   */
  private static parseSinglePlan(
    planText: string, 
    dateKey: string, 
    planType: 'A' | 'B' | 'C'
  ): FoodPlan | null {
    try {
      // プラン名を抽出（最初の行または明確に示されている部分）
      const nameMatch = planText.match(/^(.+?)(?:\n|：|:)/);
      const planName = nameMatch?.[1]?.trim() || this.getDefaultPlanName(planType);

      // 説明を抽出
      const description = this.extractDescription(planText);

      // 食事内容を抽出
      const meals = this.extractMeals(planText);

      const now = new Date();
      return {
        dateKey,
        planType,
        planName,
        description,
        selected: false,
        meals,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24時間後
      };
    } catch (error) {
      console.error(`Plan ${planType} parsing error:`, error);
      return null;
    }
  }

  /**
   * 説明を抽出
   */
  private static extractDescription(text: string): string {
    // 改行で分割して最初の数行を説明として使用
    const lines = text.split('\n').filter(line => line.trim());
    
    // プラン名以降の説明部分を探す
    const descLines = [];
    let foundMealSection = false;
    
    for (const line of lines.slice(1)) { // 最初の行（プラン名）をスキップ
      if (this.isMealLine(line)) {
        foundMealSection = true;
        break;
      }
      if (line.trim()) {
        descLines.push(line.trim());
      }
    }
    
    return descLines.join(' ') || '今日の体調と生活習慣に合わせたプランです。';
  }

  /**
   * 食事内容を抽出
   */
  private static extractMeals(text: string): FoodPlanMealSuggestion[] {
    const meals: FoodPlanMealSuggestion[] = [];
    const lines = text.split('\n');

    let currentMealType: MealType | null = null;
    let currentMainItems: string[] = [];
    let currentSideItems: string[] = [];
    let currentNotes = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // 食事タイプの判定
      const mealType = this.detectMealType(trimmedLine);
      if (mealType) {
        // 前の食事を保存（重複チェック）
        if (currentMealType && !meals.find(m => m.mealType === currentMealType)) {
          meals.push({
            mealType: currentMealType,
            mainItems: currentMainItems,
            sideItems: currentSideItems,
            notes: currentNotes || undefined,
          });
        }

        // 新しい食事を開始
        currentMealType = mealType;
        currentMainItems = [];
        currentSideItems = [];
        currentNotes = '';
        continue;
      }

      // 食事内容の抽出
      if (currentMealType && this.isFoodItem(trimmedLine)) {
        // メモ部分を分離
        const { items, note } = this.separateItemsAndNotes(trimmedLine);
        currentMainItems.push(...items);
        if (note) {
          currentNotes += (currentNotes ? ' ' : '') + note;
        }
      } else if (currentMealType && this.isNote(trimmedLine)) {
        currentNotes += (currentNotes ? ' ' : '') + trimmedLine;
      }
    }

    // 最後の食事を保存（重複チェック）
    if (currentMealType && !meals.find(m => m.mealType === currentMealType)) {
      meals.push({
        mealType: currentMealType,
        mainItems: currentMainItems,
        sideItems: currentSideItems,
        notes: currentNotes || undefined,
      });
    }

    return meals.length > 0 ? meals : this.createDefaultMeals();
  }

  /**
   * 食事タイプを検出
   */
  private static detectMealType(line: string): MealType | null {
    const lower = line.toLowerCase();
    if (lower.includes('朝食') || lower.includes('朝')) return 'breakfast';
    if (lower.includes('昼食') || lower.includes('昼') || lower.includes('ランチ')) return 'lunch';
    if (lower.includes('夕食') || lower.includes('夜') || lower.includes('ディナー')) return 'dinner';
    if (lower.includes('間食') || lower.includes('おやつ') || lower.includes('スナック')) return 'snack';
    return null;
  }

  /**
   * 食事行かどうかを判定
   */
  private static isMealLine(line: string): boolean {
    return this.detectMealType(line) !== null;
  }

  /**
   * 食品アイテムかどうかを判定
   */
  private static isFoodItem(line: string): boolean {
    // リスト形式 (-, *, •) または番号付きリストかどうかを判定
    return /^[-*•]\s/.test(line) || /^\d+[\.)]\s/.test(line) || 
           line.includes('、') || line.includes('と') || 
           /[ご飯|パン|魚|肉|野菜|スープ]/.test(line);
  }

  /**
   * 注釈かどうかを判定
   */
  private static isNote(line: string): boolean {
    return line.includes('※') || line.includes('注意') || 
           line.includes('ポイント') || line.includes('理由');
  }

  /**
   * 食品アイテムを抽出
   */
  private static extractFoodItems(line: string): string[] {
    // リストマーカーを除去
    const cleaned = line.replace(/^[-*•]\s*/, '').replace(/^\d+[\.)]\s*/, '');
    
    // 区切り文字で分割
    return cleaned.split(/[、,と]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * 食品アイテムとメモを分離
   */
  private static separateItemsAndNotes(line: string): { items: string[]; note?: string } {
    // ※が含まれている場合は分離
    if (line.includes('※')) {
      const parts = line.split('※');
      const itemsPart = parts[0].trim();
      const notePart = parts.slice(1).join('※').trim();
      
      return {
        items: this.extractFoodItems(itemsPart),
        note: notePart ? `※ ${notePart}` : undefined
      };
    }
    
    return {
      items: this.extractFoodItems(line)
    };
  }

  /**
   * フォールバックプラン作成
   */
  private static createFallbackPlans(response: string, dateKey: string): FoodPlan[] {
    const now = new Date();
    const baseText = response.substring(0, 200); // 最初の200文字を使用

    return ['A', 'B', 'C'].map((type, index) => ({
      dateKey,
      planType: type as 'A' | 'B' | 'C',
      planName: this.getDefaultPlanName(type as 'A' | 'B' | 'C'),
      description: `${baseText}...`,
      selected: false,
      meals: this.createDefaultMeals(),
      createdAt: now,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    }));
  }

  /**
   * デフォルトプラン名
   */
  private static getDefaultPlanName(type: 'A' | 'B' | 'C'): string {
    const names = {
      A: 'バランス重視プラン',
      B: '手軽さ重視プラン', 
      C: '体調配慮プラン',
    };
    return names[type];
  }

  /**
   * デフォルト食事作成
   */
  private static createDefaultMeals(): FoodPlanMealSuggestion[] {
    return [
      {
        mealType: 'breakfast',
        mainItems: ['和定食', 'ご飯', '味噌汁'],
        sideItems: ['野菜のおかず'],
      },
      {
        mealType: 'lunch', 
        mainItems: ['バランス弁当'],
        sideItems: ['サラダ'],
      },
      {
        mealType: 'dinner',
        mainItems: ['焼き魚', 'ご飯', '野菜炒め'],
        sideItems: ['スープ'],
      },
    ];
  }
}