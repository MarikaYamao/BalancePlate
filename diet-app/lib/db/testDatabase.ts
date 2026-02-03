/**
 * データベーステスト用ユーティリティ
 * Phase 2の動作確認用
 */

import { initializeDatabase, getDatabaseInfo } from './database';
import { 
  userSettingsRepository, 
  dailyStateRepository, 
  mealLogRepository 
} from './repositories';
import type { UserSettingsInput, DailyStateInput, MealLogInput } from './repositories';
import { getTodayKey, formatDateFromKey } from '@/lib/utils/dateUtils';

export interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class DatabaseTester {
  private results: TestResult[] = [];

  /**
   * すべてのテストを実行
   */
  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    console.log('🧪 Starting database tests...');
    
    await this.testDatabaseInitialization();
    await this.testUserSettings();
    await this.testDailyState();
    await this.testMealLog();
    await this.testDateUtils();
    
    console.log('✅ Database tests completed');
    return this.results;
  }

  /**
   * データベース初期化テスト
   */
  private async testDatabaseInitialization(): Promise<void> {
    try {
      await initializeDatabase();
      const info = getDatabaseInfo();
      
      this.addResult(true, 'Database initialization successful', info);
    } catch (error) {
      this.addResult(false, 'Database initialization failed', undefined, error);
    }
  }

  /**
   * ユーザー設定テスト
   */
  private async testUserSettings(): Promise<void> {
    try {
      // テストデータ
      const testSettings: UserSettingsInput = {
        dayResetTime: '04:00',
        mealsPerDay: 3,
        bodyConstitution: ['edema_prone', 'weak_stomach'],
        lifestyle: ['remote_work', 'has_children'],
        onboardingCompleted: false
      };

      // 保存テスト
      const saved = await userSettingsRepository.save(testSettings);
      this.addResult(true, 'UserSettings save successful', { id: saved.id });

      // 取得テスト
      const retrieved = await userSettingsRepository.get();
      this.addResult(
        retrieved !== null && retrieved.id === saved.id,
        'UserSettings get successful',
        retrieved
      );

      // 更新テスト
      const updated = await userSettingsRepository.update(saved.id, {
        onboardingCompleted: true
      });
      this.addResult(
        updated.onboardingCompleted === true,
        'UserSettings update successful',
        { onboardingCompleted: updated.onboardingCompleted }
      );

      // リセット時間取得テスト
      const resetTime = await userSettingsRepository.getResetTime();
      this.addResult(
        resetTime === '04:00',
        'UserSettings getResetTime successful',
        { resetTime }
      );

    } catch (error) {
      this.addResult(false, 'UserSettings test failed', undefined, error);
    }
  }

  /**
   * 日次状態テスト
   */
  private async testDailyState(): Promise<void> {
    try {
      const resetTime = await userSettingsRepository.getResetTime();
      const todayKey = getTodayKey(resetTime);

      // テストデータ
      const testState: DailyStateInput = {
        conditionTags: ['tired', 'stressed'],
        freeMemo: 'テスト用のメモです',
        activityMemo: 'ジムに行きました'
      };

      // 保存テスト
      const saved = await dailyStateRepository.upsert(testState, resetTime);
      this.addResult(true, 'DailyState upsert successful', {
        dateKey: saved.dateKey,
        conditionTags: saved.conditionTags
      });

      // 取得テスト
      const retrieved = await dailyStateRepository.getToday(resetTime);
      this.addResult(
        retrieved !== null && retrieved.dateKey === todayKey,
        'DailyState getToday successful',
        retrieved
      );

      // 存在チェックテスト
      const exists = await dailyStateRepository.existsToday(resetTime);
      this.addResult(exists, 'DailyState existsToday successful', { exists });

      // 更新テスト（同じdateKeyでupsert）
      const updatedState: DailyStateInput = {
        ...testState,
        freeMemo: '更新されたメモです'
      };
      const updated = await dailyStateRepository.upsert(updatedState, resetTime);
      this.addResult(
        updated.freeMemo === '更新されたメモです',
        'DailyState update successful',
        { freeMemo: updated.freeMemo }
      );

    } catch (error) {
      this.addResult(false, 'DailyState test failed', undefined, error);
    }
  }

  /**
   * 食事記録テスト
   */
  private async testMealLog(): Promise<void> {
    try {
      const resetTime = await userSettingsRepository.getResetTime();

      // テストデータ
      const testMeals: MealLogInput[] = [
        {
          mealType: 'breakfast',
          text: 'ご飯、味噌汁、納豆、サラダ'
        },
        {
          mealType: 'lunch',
          text: 'パスタ、スープ'
        }
      ];

      // 保存テスト
      const savedMeals = [];
      for (const meal of testMeals) {
        const saved = await mealLogRepository.save(meal, resetTime);
        savedMeals.push(saved);
      }
      this.addResult(true, 'MealLog save successful', {
        count: savedMeals.length,
        meals: savedMeals.map(m => ({ id: m.id, mealType: m.mealType }))
      });

      // 今日の食事記録取得テスト
      const todayMeals = await mealLogRepository.getToday(resetTime);
      this.addResult(
        todayMeals.length === 2,
        'MealLog getToday successful',
        { count: todayMeals.length }
      );

      // 食事タイプ別存在チェックテスト
      const todayKey = getTodayKey(resetTime);
      const hasBreakfast = await mealLogRepository.existsByDateAndType(todayKey, 'breakfast');
      const hasLunch = await mealLogRepository.existsByDateAndType(todayKey, 'lunch');
      const hasDinner = await mealLogRepository.existsByDateAndType(todayKey, 'dinner');
      
      this.addResult(
        hasBreakfast && hasLunch && !hasDinner,
        'MealLog existence check successful',
        { hasBreakfast, hasLunch, hasDinner }
      );

      // 今日の食事状況取得テスト
      const mealStatus = await mealLogRepository.getTodayMealStatus(resetTime);
      this.addResult(true, 'MealLog getTodayMealStatus successful', mealStatus);

      // 更新テスト
      const updated = await mealLogRepository.update(savedMeals[0].id, {
        text: '更新された朝食メニュー'
      });
      this.addResult(
        updated.text === '更新された朝食メニュー',
        'MealLog update successful',
        { text: updated.text }
      );

    } catch (error) {
      this.addResult(false, 'MealLog test failed', undefined, error);
    }
  }

  /**
   * 日付ユーティリティテスト
   */
  private async testDateUtils(): Promise<void> {
    try {
      const resetTime = '04:00';
      const todayKey = getTodayKey(resetTime);
      const formatted = formatDateFromKey(todayKey);

      this.addResult(true, 'DateUtils test successful', {
        todayKey,
        formatted,
        resetTime
      });
    } catch (error) {
      this.addResult(false, 'DateUtils test failed', undefined, error);
    }
  }

  /**
   * テスト結果を追加
   */
  private addResult(success: boolean, message: string, data?: any, error?: any): void {
    const result: TestResult = {
      success,
      message,
      data,
      error: error ? (error instanceof Error ? error.message : String(error)) : undefined
    };
    
    this.results.push(result);
    
    const emoji = success ? '✅' : '❌';
    console.log(`${emoji} ${message}`, data ? data : '');
    
    if (error) {
      console.error('Error details:', error);
    }
  }

  /**
   * テスト結果のサマリーを取得
   */
  getSummary(): { total: number; passed: number; failed: number; passRate: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, passed, failed, passRate };
  }
}

// エクスポート関数
export async function runDatabaseTests(): Promise<TestResult[]> {
  const tester = new DatabaseTester();
  const results = await tester.runAllTests();
  
  const summary = tester.getSummary();
  console.log(`\n📊 Test Summary: ${summary.passed}/${summary.total} passed (${summary.passRate}%)`);
  
  return results;
}