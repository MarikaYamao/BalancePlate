"use client";

interface AIFeedbackDisplayProps {
  feedback: string | null;
  isLoading?: boolean;
  onGenerateFeedback?: () => void;
}

export function AIFeedbackDisplay({ 
  feedback, 
  isLoading = false,
  onGenerateFeedback 
}: AIFeedbackDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!feedback) {
    if (onGenerateFeedback) {
      return (
        <div className="text-center py-4">
          <button
            onClick={onGenerateFeedback}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            アドバイスを生成
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span>🤖</span>
        <h3 className="font-medium text-gray-800">
          AIからのアドバイス
        </h3>
      </div>
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {feedback}
      </div>
    </div>
  );
}