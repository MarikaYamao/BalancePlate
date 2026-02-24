export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 開発環境のみで表示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <>{children}</>;
}