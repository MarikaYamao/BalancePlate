import { Button } from "@/components/ui/Button";

interface MealDetailActionsProps {
  onEdit: () => void;
  onClose: () => void;
}

export function MealDetailActions({ onEdit, onClose }: MealDetailActionsProps) {
  return (
    <div className="flex gap-3">
      <Button onClick={onEdit} variant="primary" className="flex-1">
        編集する
      </Button>
      <Button onClick={onClose} variant="outline" className="flex-1">
        閉じる
      </Button>
    </div>
  );
}