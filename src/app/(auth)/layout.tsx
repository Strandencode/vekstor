export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">
            Vekstor
          </h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Growth Intelligence</p>
        </div>
        {children}
      </div>
    </div>
  );
}
