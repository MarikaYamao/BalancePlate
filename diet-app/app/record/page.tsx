'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RecordPage() {
  const router = useRouter();
  
  useEffect(() => {
    // ダイアリーページにリダイレクト
    router.replace('/diary');
  }, [router]);

  return null;
}