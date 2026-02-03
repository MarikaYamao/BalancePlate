'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/Button';
import { BasicSettings } from '@/components/features/settings/BasicSettings';
import { BodyConstitutionSelector } from '@/components/features/settings/BodyConstitutionSelector';
import { LifestyleSelector } from '@/components/features/settings/LifestyleSelector';
import { userSettingsRepository } from '@/lib/db/repositories';
import type { BodyConstitutionTag, LifestyleTag } from '@/types';

export default function SettingsPage() {
  const [dayResetTime, setDayResetTime] = useState('04:00');
  const [mealsPerDay, setMealsPerDay] = useState<2 | 3>(3);
  const [bodyConstitution, setBodyConstitution] = useState<BodyConstitutionTag[]>([]);
  const [lifestyle, setLifestyle] = useState<LifestyleTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await userSettingsRepository.get();
      if (settings) {
        setDayResetTime(settings.dayResetTime);
        setMealsPerDay(settings.mealsPerDay);
        setBodyConstitution(settings.bodyConstitution || []);
        setLifestyle(settings.lifestyle || []);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage('設定の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage('');
      
      const existingSettings = await userSettingsRepository.get();
      
      if (existingSettings) {
        // 既存設定を更新
        await userSettingsRepository.update(existingSettings.id, {
          dayResetTime,
          mealsPerDay,
          bodyConstitution,
          lifestyle,
        });
      } else {
        // 新規作成
        await userSettingsRepository.save({
          dayResetTime,
          mealsPerDay,
          bodyConstitution,
          lifestyle,
          onboardingCompleted: true,
        });
      }
      
      setMessage('設定を保存しました');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen p-4 flex items-center justify-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen p-4 pb-24">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>
        
        {/* 基本設定 */}
        <BasicSettings
          dayResetTime={dayResetTime}
          mealsPerDay={mealsPerDay}
          onResetTimeChange={setDayResetTime}
          onMealsPerDayChange={setMealsPerDay}
        />
        
        {/* 体質選択 */}
        <BodyConstitutionSelector
          selected={bodyConstitution}
          onChange={setBodyConstitution}
        />
        
        {/* 生活習慣選択 */}
        <LifestyleSelector
          selected={lifestyle}
          onChange={setLifestyle}
        />
        
        {/* 保存ボタン */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? '保存中...' : '設定を保存'}
          </Button>
          {message && (
            <p className={`mt-2 text-sm text-center ${
              message.includes('失敗') ? 'text-red-600' : 'text-green-600'
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}