'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitStatus('success');
      setContent('');
      
      // 2秒後に自動的にモーダルを閉じる
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">フィードバック</h2>
        
        {submitStatus === 'success' ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-green-600 font-medium">
              フィードバックを送信しました
            </p>
            <p className="text-sm text-gray-600 mt-2">
              貴重なご意見ありがとうございます！
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              アプリの改善のため、ご意見・ご要望をお聞かせください
            </p>

            {/* 内容入力 */}
            <div className="mb-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={6}
                placeholder="お気づきの点やご要望をお聞かせください..."
                maxLength={1000}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {content.length}/1000
              </p>
            </div>

            {submitStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  送信に失敗しました。もう一度お試しください。
                </p>
              </div>
            )}

            {/* ボタン */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="secondary"
                className="flex-1"
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={isSubmitting || !content.trim()}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> 送信中...
                  </span>
                ) : (
                  '送信'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}