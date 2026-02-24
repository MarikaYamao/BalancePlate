'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MealEditTest = dynamic(
  () => import('@/dev/test-pages/meal-edit'),
  { 
    loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
);

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return <MealEditTest />;
}