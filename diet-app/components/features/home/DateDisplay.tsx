'use client';

import { useEffect, useState } from 'react';
import { getDateKey } from '@/lib/utils/dateUtils';

interface DateDisplayProps {
  resetTime?: string;
}

export function DateDisplay({ resetTime = '04:00' }: DateDisplayProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [dateKey, setDateKey] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateDate = () => {
      const now = new Date();
      setCurrentDate(now);
      setDateKey(getDateKey(now, resetTime));
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, [resetTime]);

  // SSRの場合は何も表示しない
  if (!mounted || !currentDate) {
    return (
      <div className="text-center py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--color-border-light)] rounded-lg w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-[var(--color-border-light)] rounded-lg w-24 mx-auto"></div>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    
    return {
      dateString: `${year}年${month}月${day}日`,
      weekDay: `(${weekDay})`,
      time: date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { dateString, weekDay, time } = formatDate(currentDate);
  
  // リセット時間を考慮した日付表示
  const displayDate = new Date(dateKey);
  const displayDateFormatted = formatDate(displayDate);

  const isAfterReset = dateKey === getDateKey(new Date(), resetTime);

  return (
    <div className="text-center py-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {displayDateFormatted.dateString}
          <span className="text-[var(--color-brand-primary)] ml-1">{displayDateFormatted.weekDay}</span>
        </h2>
        {!isAfterReset && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            ※ リセット時間前のため前日として記録されます
          </p>
        )}
      </div>
      <div className="text-sm text-[var(--color-text-secondary)]">
        現在時刻: {time}
      </div>
      <div className="text-xs text-[var(--color-text-tertiary)] mt-1">
        リセット時間: {resetTime}
      </div>
    </div>
  );
}