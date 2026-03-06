import { useState, useCallback } from "react";

interface FeedbackSubmitParams {
  content: string;
  path?: string;
}

interface UseFeedbackSubmitResult {
  submitStatus: 'idle' | 'submitting' | 'success' | 'error';
  submitFeedback: (params: FeedbackSubmitParams) => Promise<void>;
  error: string | null;
}

export function useFeedbackSubmit(): UseFeedbackSubmitResult {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useCallback(async (params: FeedbackSubmitParams) => {
    setSubmitStatus('submitting');
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: params.content.trim(),
          path: params.path || window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `送信に失敗しました (${response.status})`);
      }
    } catch (err) {
      console.error('Feedback submission failed:', err);
      setError(
        err instanceof Error ? err.message : '予期せぬエラーが発生しました',
      );
      setSubmitStatus('error');
    }
  }, []);

  return {
    submitStatus,
    submitFeedback,
    error,
  };
}