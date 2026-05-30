export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-primary">VoxVignan AI</h1>
            <p className="text-gray-500 mt-2">Your Voice. Your Growth.</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
