import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg viewBox="0 0 56 40" fill="none" className="h-9 w-auto">
        <defs>
          <linearGradient id="cL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
          <linearGradient id="cR" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx={18} cy={20} r={17} fill="url(#cL)" />
        <circle cx={38} cy={20} r={17} fill="url(#cR)" />
        <path d="M28 3.54a17 17 0 010 32.92 17 17 0 000-32.92z" fill="#0891B2" opacity={0.5} />
        {[[10,11],[11,16],[14,21],[18,25],[22,21],[25,16],[28,21],[32,25],[36,21],[39,16],[42,11]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={3.5} height={3.5} rx={0.6} fill="white" opacity={0.95} />
        ))}
      </svg>
      <span className="font-logo text-lg font-black tracking-wider text-cyan-300" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        WE INSIGHT
      </span>
    </Link>
  );
}
