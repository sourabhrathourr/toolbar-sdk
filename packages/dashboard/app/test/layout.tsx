export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      {children}
    </div>
  );
} 