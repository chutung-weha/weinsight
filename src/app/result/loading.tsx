export default function ResultLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-4" />
        <div className="text-slate-400">AI đang phân tích kết quả...</div>
      </div>
    </div>
  );
}
