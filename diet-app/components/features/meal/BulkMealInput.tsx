"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SimpleMealInput } from "@/components/shared/inputs";
import type { MealType } from "@/types";

interface BulkMealInputProps {
  missedMeals: MealType[];
  onSubmit: (meals: Record<MealType, string>) => Promise<void>;
  onCancel: () => void;
}

export function BulkMealInput({
  missedMeals,
  onSubmit,
  onCancel,
}: BulkMealInputProps) {
  const [mealData, setMealData] = useState<Record<MealType, string>>({
    breakfast: "",
    lunch: "",
    dinner: "",
    snack: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mealLabels = {
    breakfast: { label: "朝食", icon: "🌅", time: "朝" },
    lunch: { label: "昼食", icon: "☀️", time: "昼" },
    dinner: { label: "夕食", icon: "🌙", time: "夜" },
    snack: { label: "間食", icon: "🍪", time: "間" },
  };

  const handleInputChange = (mealType: MealType, value: string) => {
    setMealData((prev) => ({
      ...prev,
      [mealType]: value,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 全ての食事を送信（空欄の場合は空文字でスキップ記録）
      const submissionData: Record<MealType, string> = {} as Record<
        MealType,
        string
      >;
      missedMeals.forEach((mealType) => {
        submissionData[mealType] = mealData[mealType].trim() || "";
      });

      await onSubmit(submissionData);
    } catch (error) {
      console.error("Failed to submit bulk meals:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 何か入力があるか、または何もしなくても保存可能とする
  const canSubmit = true;

  if (missedMeals.length === 0) {
    return null;
  }

  return (
    <Card className="mx-4 mb-4 bg-[var(--color-bg-subtle)] border-[var(--color-border-default)]">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-lg">📝</div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            未入力の食事を記録
          </h3>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-4">
          {missedMeals.length}つの食事が未記録です。まとめて入力できます。
        </p>

        <div className="space-y-4">
          {missedMeals.map((mealType) => {
            return (
              <div
                key={mealType}
                className="border rounded-lg p-3 transition-all duration-200 border-[var(--color-border-default)] bg-[var(--color-bg-surface)]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{mealLabels[mealType].icon}</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {mealLabels[mealType].label}
                  </span>
                </div>

                <textarea
                  value={mealData[mealType]}
                  onChange={(e) => handleInputChange(mealType, e.target.value)}
                  placeholder={`${mealLabels[mealType].time}に食べたものを入力してください... （空欄の場合はスキップされます）`}
                  className="w-full p-2 border rounded text-sm resize-none font-medium border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                  rows={2}
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="primary"
            className="flex-1"
          >
            {isSubmitting ? "保存中..." : "記録を保存"}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>

        <p className="text-xs text-[var(--color-text-tertiary)] font-medium mt-2 text-center">
          空欄の食事は記録されません
        </p>
      </div>
    </Card>
  );
}
