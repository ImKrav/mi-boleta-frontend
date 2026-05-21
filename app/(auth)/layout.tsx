export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-background to-slate-100 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
