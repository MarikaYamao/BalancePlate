'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EnhancedGoalSettings, type GoalType, type GoalPeriod } from '@/components/features/settings/EnhancedGoalSettings';

export type { GoalType, GoalPeriod };
import type { GoalMode } from '@/types';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    goalType?: GoalType;
    currentWeight?: number;
    targetWeight?: number;
    goalPeriod: GoalPeriod;
    goalMode?: GoalMode;
  }) => void;
  initialData: {
    goalType?: GoalType;
    currentWeight?: number;
    targetWeight?: number;
    goalPeriod: GoalPeriod;
    goalMode?: GoalMode;
  };
}

export function GoalSettingsModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: GoalSettingsModalProps) {
  const [goalType, setGoalType] = useState<GoalType | undefined>(initialData.goalType);
  const [currentWeight, setCurrentWeight] = useState<number | undefined>(initialData.currentWeight);
  const [targetWeight, setTargetWeight] = useState<number | undefined>(initialData.targetWeight);
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriod>(initialData.goalPeriod);
  const [goalMode, setGoalMode] = useState<GoalMode | undefined>(initialData.goalMode);

  // モーダルが開いたときに初期値をセット
  useEffect(() => {
    if (isOpen) {
      setGoalType(initialData.goalType);
      setCurrentWeight(initialData.currentWeight);
      setTargetWeight(initialData.targetWeight);
      setGoalPeriod(initialData.goalPeriod);
      setGoalMode(initialData.goalMode);
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave({
      goalType,
      currentWeight,
      targetWeight,
      goalPeriod,
      goalMode
    });
    onClose();
  };

  const handleCancel = () => {
    // 変更を破棄して初期値に戻す
    setGoalType(initialData.goalType);
    setCurrentWeight(initialData.currentWeight);
    setTargetWeight(initialData.targetWeight);
    setGoalPeriod(initialData.goalPeriod);
    setGoalMode(initialData.goalMode);
    onClose();
  };

  const footer = (
    <div className="flex items-center justify-end space-x-3">
      <Button
        variant="outline"
        onClick={handleCancel}
      >
        キャンセル
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
      >
        保存
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="目標設定"
      footer={footer}
      size="lg"
    >
      <EnhancedGoalSettings
        goalType={goalType}
        currentWeight={currentWeight}
        targetWeight={targetWeight}
        goalPeriod={goalPeriod}
        goalMode={goalMode}
        onGoalTypeChange={setGoalType}
        onCurrentWeightChange={setCurrentWeight}
        onTargetWeightChange={setTargetWeight}
        onGoalPeriodChange={setGoalPeriod}
        onGoalModeChange={setGoalMode}
      />
    </Modal>
  );
}