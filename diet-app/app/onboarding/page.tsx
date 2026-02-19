'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BasicSettings } from '@/components/features/settings/BasicSettings';
import { BodyConstitutionSelector } from '@/components/features/settings/BodyConstitutionSelector';
import { LifestyleSelector } from '@/components/features/settings/LifestyleSelector';
import { OnboardingFoodPreferences } from '@/components/features/onboarding/OnboardingFoodPreferences';
import { useUserSettings } from '@/lib/hooks';
import { CheckCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import type { UserSettings } from '@/types';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'ようこそ！',
    description: 'BalancePlateへ',
    required: true,
  },
  {
    id: 'basic',
    title: '基本設定',
    description: '必須項目です',
    required: true,
  },
  {
    id: 'constitution',
    title: '体質',
    description: 'スキップ可能',
    required: false,
  },
  {
    id: 'lifestyle',
    title: '生活習慣',
    description: 'スキップ可能',
    required: false,
  },
  {
    id: 'food',
    title: '食材の好み',
    description: 'スキップ可能',
    required: false,
  },
  {
    id: 'complete',
    title: '準備完了！',
    description: '設定完了',
    required: true,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { settings, updateSettings, isLoading } = useUserSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [tempSettings, setTempSettings] = useState<Partial<UserSettings>>({
    dayResetTime: '04:00',
    mealsPerDay: 3,
    bodyConstitution: [],
    lifestyle: [],
    favoriteFoods: [],
    dislikedFoods: [],
    onboardingCompleted: false,
  });
  const [pendingFavoriteInput, setPendingFavoriteInput] = useState('');
  const [pendingDislikeInput, setPendingDislikeInput] = useState('');

  useEffect(() => {
    if (!isLoading && settings?.onboardingCompleted) {
      router.replace('/home');
    }
  }, [settings, isLoading, router]);

  const handleNext = () => {
    // 食材の好みステップから次へ進む場合、入力中の内容を保存
    if (ONBOARDING_STEPS[currentStep].id === 'food') {
      const updatedFavorites = [...(tempSettings.favoriteFoods || [])];
      const updatedDislikes = [...(tempSettings.dislikedFoods || [])];
      
      // 入力中の好きな食材を追加
      if (pendingFavoriteInput.trim()) {
        const foods = pendingFavoriteInput.split('、').map(f => f.trim()).filter(f => f);
        const newFoods = foods.filter(f => !updatedFavorites.includes(f));
        updatedFavorites.push(...newFoods);
        setPendingFavoriteInput('');
      }
      
      // 入力中の嫌いな食材を追加
      if (pendingDislikeInput.trim()) {
        const foods = pendingDislikeInput.split('、').map(f => f.trim()).filter(f => f);
        const newFoods = foods.filter(f => !updatedDislikes.includes(f));
        updatedDislikes.push(...newFoods);
        setPendingDislikeInput('');
      }
      
      setTempSettings({
        ...tempSettings,
        favoriteFoods: updatedFavorites,
        dislikedFoods: updatedDislikes
      });
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (!ONBOARDING_STEPS[currentStep].required) {
      handleNext();
    }
  };

  const handleComplete = async () => {
    const finalSettings: UserSettings = {
      id: settings?.id || crypto.randomUUID(),
      ...tempSettings,
      onboardingCompleted: true,
      createdAt: settings?.createdAt || new Date(),
      updatedAt: new Date(),
    } as UserSettings;

    await updateSettings(finalSettings);
    router.push('/home');
  };

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const renderStepContent = () => {
    const step = ONBOARDING_STEPS[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <img 
                src="/logo.png" 
                alt="BalancePlate Logo" 
                className="w-24 h-24 object-contain"
              />
              <img 
                src="/string.png" 
                alt="BalancePlate" 
                className="h-8 object-contain"
              />
            </div>
            <p className="text-gray-600 max-w-md mx-auto">
              あなたの体質や生活習慣に合わせて、バランスの取れた食事提案をいたします。
              まずは簡単な設定から始めましょう。
            </p>
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                所要時間：約2〜3分
              </p>
            </div>
          </div>
        );

      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                基本設定
              </h2>
              <p className="text-gray-600">
                日付のリセット時間と1日の食事回数を設定します
              </p>
            </div>
            <BasicSettings
              dayResetTime={tempSettings.dayResetTime || '04:00'}
              mealsPerDay={tempSettings.mealsPerDay || 3}
              onDayResetTimeChange={(time) => 
                setTempSettings({ ...tempSettings, dayResetTime: time })
              }
              onMealsPerDayChange={(meals) => 
                setTempSettings({ ...tempSettings, mealsPerDay: meals })
              }
            />
          </div>
        );

      case 'constitution':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                体質を教えてください
              </h2>
              <p className="text-gray-600">
                当てはまるものを選択してください（複数選択可）
              </p>
              <p className="text-sm text-teal-600 mt-2">
                ※後から変更できます
              </p>
            </div>
            <BodyConstitutionSelector
              selected={tempSettings.bodyConstitution || []}
              onChange={(tags) => 
                setTempSettings({ ...tempSettings, bodyConstitution: tags })
              }
            />
          </div>
        );

      case 'lifestyle':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                生活習慣を教えてください
              </h2>
              <p className="text-gray-600">
                当てはまるものを選択してください（複数選択可）
              </p>
              <p className="text-sm text-teal-600 mt-2">
                ※後から変更できます
              </p>
            </div>
            <LifestyleSelector
              selected={tempSettings.lifestyle || []}
              onChange={(tags) => 
                setTempSettings({ ...tempSettings, lifestyle: tags })
              }
            />
          </div>
        );

      case 'food':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                食材の好みを教えてください
              </h2>
              <p className="text-gray-600">
                AI提案の精度が向上します
              </p>
              <p className="text-sm text-teal-600 mt-2">
                ※後から変更できます
              </p>
            </div>
            <OnboardingFoodPreferences
              favoriteFoods={tempSettings.favoriteFoods || []}
              dislikedFoods={tempSettings.dislikedFoods || []}
              onFavoriteFoodsChange={(foods) => 
                setTempSettings({ ...tempSettings, favoriteFoods: foods })
              }
              onDislikedFoodsChange={(foods) => 
                setTempSettings({ ...tempSettings, dislikedFoods: foods })
              }
              onFavoriteInputChange={setPendingFavoriteInput}
              onDislikeInputChange={setPendingDislikeInput}
              initialFavoriteInput={pendingFavoriteInput}
              initialDislikeInput={pendingDislikeInput}
            />
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-teal-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              準備が整いました！
            </h2>
            <div className="text-left max-w-md mx-auto space-y-4 bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-700">設定内容：</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>リセット時間: {tempSettings.dayResetTime}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>1日の食事回数: {tempSettings.mealsPerDay}食</span>
                </li>
                {tempSettings.bodyConstitution && tempSettings.bodyConstitution.length > 0 && (
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>体質: {tempSettings.bodyConstitution.length}項目設定済み</span>
                  </li>
                )}
                {tempSettings.lifestyle && tempSettings.lifestyle.length > 0 && (
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>生活習慣: {tempSettings.lifestyle.length}項目設定済み</span>
                  </li>
                )}
                {((tempSettings.favoriteFoods && tempSettings.favoriteFoods.length > 0) ||
                  (tempSettings.dislikedFoods && tempSettings.dislikedFoods.length > 0)) && (
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>食材の好み: 設定済み</span>
                  </li>
                )}
              </ul>
            </div>
            <p className="text-gray-600">
              それでは、BalancePlateを始めましょう！
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-300 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              ステップ {currentStep + 1} / {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm text-gray-600">
              {ONBOARDING_STEPS[currentStep].title}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-teal-400 to-silver-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {ONBOARDING_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-teal-600' : 'text-silver-500'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index < currentStep
                    ? 'bg-teal-500 text-white'
                    : index === currentStep
                    ? 'bg-silver-400 text-white'
                    : 'bg-sand-400 text-teal-700'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Content Card */}
        <Card className="p-6 sm:p-8">
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              戻る
            </Button>

            <div className="flex gap-2">
              {!ONBOARDING_STEPS[currentStep].required && 
               currentStep !== ONBOARDING_STEPS.length - 1 && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                >
                  スキップ
                </Button>
              )}
              
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                <Button
                  onClick={handleComplete}
                  className="flex items-center bg-gradient-to-r from-teal-500 to-silver-400 hover:from-teal-600 hover:to-silver-500"
                >
                  始める
                  <Sparkles className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex items-center"
                >
                  次へ
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Skip Info */}
        {!ONBOARDING_STEPS[currentStep].required && 
         currentStep !== 0 && 
         currentStep !== ONBOARDING_STEPS.length - 1 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            この項目はスキップ可能です。後から設定画面で変更できます。
          </p>
        )}
      </div>
    </div>
  );
}