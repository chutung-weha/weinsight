export default function ResultLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background orbs */}
      <div
        className="bg-orb w-[500px] h-[500px] -top-32 -left-32 absolute"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.07), transparent)" }}
      />
      <div
        className="bg-orb w-[400px] h-[400px] -bottom-24 -right-24 absolute"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.07), transparent)" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Triple-ring orbit animation */}
        <div className="relative w-[160px] h-[160px] flex items-center justify-center">
          {/* Outer ring — clockwise slow */}
          <svg
            width={160} height={160} viewBox="0 0 160 160"
            className="absolute inset-0"
            style={{ animation: "orbit-cw 8s linear infinite" }}
          >
            <circle
              cx={80} cy={80} r={72}
              fill="none"
              stroke="#06B6D4"
              strokeWidth={1.5}
              strokeDasharray="6 10"
              strokeLinecap="round"
              opacity={0.6}
            />
            {/* Sparkle dot on outer ring */}
            <circle cx={80} cy={8} r={3} fill="#06B6D4" opacity={0.9} />
          </svg>

          {/* Middle ring — counter-clockwise */}
          <svg
            width={120} height={120} viewBox="0 0 120 120"
            className="absolute"
            style={{ animation: "orbit-ccw 5s linear infinite" }}
          >
            <circle
              cx={60} cy={60} r={52}
              fill="none"
              stroke="#7C3AED"
              strokeWidth={2}
              strokeDasharray="40 20"
              strokeLinecap="round"
              opacity={0.5}
            />
            <circle cx={60} cy={8} r={2.5} fill="#7C3AED" opacity={0.9} />
          </svg>

          {/* Inner ring — clockwise fast */}
          <svg
            width={80} height={80} viewBox="0 0 80 80"
            className="absolute"
            style={{ animation: "orbit-cw 3s linear infinite" }}
          >
            <defs>
              <linearGradient id="innerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <circle
              cx={40} cy={40} r={32}
              fill="none"
              stroke="url(#innerRingGrad)"
              strokeWidth={3}
              strokeDasharray="20 60"
              strokeLinecap="round"
            />
            <circle cx={40} cy={8} r={2} fill="#14B8A6" opacity={0.9} />
          </svg>

          {/* Center symbol */}
          <div
            className="relative z-10 text-2xl text-cyan-300 select-none"
            style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
          >
            ✦
          </div>
        </div>

        {/* Progress steps */}
        <div className="space-y-2.5 min-w-[240px]">
          {[
            { text: "Đọc kết quả bài test...",       delay: "0s",    color: "text-cyan-400" },
            { text: "Phân tích hồ sơ DISC...",        delay: "1.5s",  color: "text-violet-400" },
            { text: "Tích hợp thần số học...",        delay: "3s",    color: "text-teal-400" },
            { text: "Tổng hợp AI Insight...",         delay: "4.5s",  color: "text-amber-400" },
          ].map(({ text, delay, color }) => (
            <div
              key={text}
              className={`flex items-center gap-2.5 text-sm ${color}`}
              style={{ opacity: 0, animation: `fade-step 0.5s ${delay} both` }}
            >
              <span className="text-[10px] opacity-60">◆</span>
              {text}
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p
          className="text-xs text-slate-500 italic"
          style={{ opacity: 0, animation: "fade-step 0.6s 5.5s both" }}
        >
          Đang khám phá con người thật của bạn...
        </p>
      </div>
    </div>
  );
}
