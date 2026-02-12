'use client';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-50
        bg-white text-black px-4 py-2 rounded-lg
        border-2 border-black
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
      "
    >
      メインコンテンツへスキップ
    </a>
  );
}

export function SkipToNav() {
  return (
    <a
      href="#main-navigation"
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-50
        bg-white text-black px-4 py-2 rounded-lg
        border-2 border-black
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
      "
    >
      ナビゲーションへスキップ
    </a>
  );
}