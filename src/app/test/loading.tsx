export default function TestLoading() {
  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-6">
        <div className="glass p-8 sm:p-10 animate-pulse">
          <div className="h-3 w-20 bg-white/10 rounded mb-6" />
          <div className="h-6 w-3/4 bg-white/10 rounded mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl" />
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <div className="h-11 w-36 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
