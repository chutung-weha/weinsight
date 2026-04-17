"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { calculateAll } from "@/lib/numerology";
import { getDescription, LIFE_PATH } from "@/lib/numerology-descriptions";
import { saveNumerologyResult } from "@/lib/actions/numerology";
import type { NumerologyResult } from "@/types/numerology";

const INDICATORS = [
  { key: "lifePath" as const, label: "Số chủ đạo", sub: "Life Path", color: "amber" },
  { key: "attitude" as const, label: "Chỉ số thái độ", sub: "Attitude", color: "cyan" },
  { key: "naturalAbility" as const, label: "Năng lực tự nhiên", sub: "Natural Ability", color: "teal" },
  { key: "expression" as const, label: "Chỉ số sứ mệnh", sub: "Expression", color: "violet" },
  { key: "soulUrge" as const, label: "Chỉ số linh hồn", sub: "Soul Urge", color: "pink" },
  { key: "personality" as const, label: "Chỉ số nhân cách", sub: "Personality", color: "blue" },
] as const;

// Tailwind full classes — không dùng dynamic interpolation
const COLOR_CLASSES: Record<string, { ring: string; bg: string; text: string; border: string; gradStop1: string; gradStop2: string }> = {
  amber:  { ring: "from-amber-500 to-orange-300", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/25", gradStop1: "#F59E0B", gradStop2: "#FCD34D" },
  cyan:   { ring: "from-cyan-500 to-cyan-300", bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/25", gradStop1: "#06B6D4", gradStop2: "#67E8F9" },
  teal:   { ring: "from-teal-500 to-teal-300", bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/25", gradStop1: "#14B8A6", gradStop2: "#5EEAD4" },
  violet: { ring: "from-violet-500 to-violet-300", bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/25", gradStop1: "#7C3AED", gradStop2: "#C4B5FD" },
  pink:   { ring: "from-pink-500 to-pink-300", bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/25", gradStop1: "#EC4899", gradStop2: "#F9A8D4" },
  blue:   { ring: "from-blue-500 to-blue-300", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/25", gradStop1: "#3B82F6", gradStop2: "#93C5FD" },
};

// Ký hiệu thiên văn tương ứng từng chỉ số
const ASTRO_SYMBOLS: Record<string, string> = {
  lifePath: "☉",
  attitude: "☽",
  naturalAbility: "♃",
  expression: "✦",
  soulUrge: "♀",
  personality: "☿",
};

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function isValidDate(d: number, m: number, y: number): boolean {
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function NumerologyPage() {
  const [phase, setPhase] = useState<"form" | "result">("form");
  const [fullName, setFullName] = useState("");
  const [day, setDay] = useState(0);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const thisYear = new Date().getFullYear();
  const YEARS = Array.from({ length: thisYear - 1900 + 1 }, (_, i) => thisYear - i);

  function handleCalculate() {
    setError("");
    const name = fullName.trim();
    if (name.length < 2) { setError("Vui lòng nhập họ tên đầy đủ"); return; }
    if (!day || !month || !year) { setError("Vui lòng chọn đầy đủ ngày tháng năm sinh"); return; }
    if (!isValidDate(day, month, year)) { setError("Ngày tháng năm sinh không hợp lệ (VD: 31/02 không tồn tại)"); return; }

    const r = calculateAll(name, day, month, year);
    setResult(r);
    setPhase("result");
    setSaved(false);
  }

  async function handleSave() {
    if (!result || saving || saved) return;
    setSaving(true);
    setError("");
    const res = await saveNumerologyResult({ fullName: fullName.trim(), day, month, year });
    setSaving(false);
    if (res.success) {
      setSaved(true);
    } else {
      setError(res.error);
    }
  }

  function handleReset() {
    setPhase("form");
    setResult(null);
    setExpanded(null);
    setSaved(false);
  }

  return (
    <>
      <Header />

      {phase === "form" && (
        <section className="relative min-h-[calc(100dvh-60px)] flex items-center justify-center py-12 overflow-hidden">
          <div
            className="bg-orb w-[500px] h-[500px] -top-32 -right-32 absolute"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.1), transparent)" }}
          />
          <div
            className="bg-orb w-[300px] h-[300px] bottom-0 -left-20 absolute"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.08), transparent)" }}
          />

          <div className="relative w-full max-w-lg mx-auto px-6">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold tracking-[2px] uppercase text-amber-400 mb-3">
                Thần số học Pythagoras
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Khám phá <span className="bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">con số định mệnh</span>
              </h1>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Nhập họ tên khai sinh và ngày sinh dương lịch để xem 6 chỉ số thần số học của bạn.
              </p>
            </div>

            <div className="glass p-8 sm:p-10">
              {/* Họ tên */}
              <div className="mb-5">
                <label htmlFor="numerology-fullname" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Họ và tên khai sinh
                </label>
                <input
                  id="numerology-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Phạm Thị Mai"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.08] transition-all"
                />
              </div>

              {/* Ngày sinh */}
              <div className="mb-6">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Ngày tháng năm sinh (dương lịch)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    aria-label="Ngày sinh"
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="px-3 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500/30 transition-all"
                  >
                    <option value={0}>Ngày</option>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    aria-label="Tháng sinh"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="px-3 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500/30 transition-all"
                  >
                    <option value={0}>Tháng</option>
                    {MONTHS.map((m) => <option key={m} value={m}>Tháng {m}</option>)}
                  </select>
                  <select
                    aria-label="Năm sinh"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="px-3 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500/30 transition-all"
                  >
                    <option value={0}>Năm</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm mb-4">{error}</div>
              )}

              <button
                onClick={handleCalculate}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-violet-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5 transition-all"
              >
                Khám phá con số của bạn
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "result" && result && (
        <section className="relative py-12 lg:py-16 overflow-hidden">
          {/* Background orbs */}
          <div className="bg-orb w-[600px] h-[600px] -top-40 -right-40 absolute" style={{ background: "radial-gradient(circle, rgba(245,158,11,0.07), transparent)" }} />
          <div className="bg-orb w-[400px] h-[400px] -bottom-20 -left-20 absolute" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent)" }} />

          <div className="max-w-[1128px] mx-auto px-6 relative">
            {/* Hero: Mandala + Số chủ đạo */}
            <div className="text-center mb-14">
              <p className="text-xs font-semibold tracking-[3px] uppercase text-amber-400 mb-4">
                ✦ Kết quả thần số học Pythagoras ✦
              </p>

              {/* Mandala visual */}
              <div className="flex justify-center mb-6">
                <div className="relative w-[200px] h-[200px] flex items-center justify-center">
                  {/* Starfield dots — cố định, không random */}
                  {[
                    { cx: 12, cy: 40, r: 1.2, pulse: true },
                    { cx: 188, cy: 60, r: 1, pulse: false },
                    { cx: 30, cy: 160, r: 1.5, pulse: true },
                    { cx: 175, cy: 155, r: 1, pulse: false },
                    { cx: 100, cy: 8, r: 1.2, pulse: true },
                    { cx: 60, cy: 190, r: 1, pulse: false },
                    { cx: 155, cy: 185, r: 1.3, pulse: true },
                    { cx: 8, cy: 100, r: 1, pulse: false },
                    { cx: 192, cy: 110, r: 1.2, pulse: true },
                    { cx: 45, cy: 15, r: 0.8, pulse: false },
                    { cx: 165, cy: 22, r: 1, pulse: true },
                    { cx: 20, cy: 140, r: 0.8, pulse: false },
                  ].map((dot, i) => (
                    <svg key={i} width={200} height={200} viewBox="0 0 200 200" className="absolute inset-0 pointer-events-none">
                      <circle
                        cx={dot.cx} cy={dot.cy} r={dot.r}
                        fill="#F59E0B"
                        opacity={dot.pulse ? 0.7 : 0.3}
                        style={dot.pulse ? { animation: "pulse-glow 3s ease-in-out infinite", animationDelay: `${i * 0.4}s` } : undefined}
                      />
                    </svg>
                  ))}

                  {/* Outer dashed ring — orbit-cw slow */}
                  <svg width={200} height={200} viewBox="0 0 200 200" className="absolute inset-0" style={{ animation: "orbit-cw 20s linear infinite" }}>
                    <defs>
                      <linearGradient id="outerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <circle cx={100} cy={100} r={90} fill="none" stroke="url(#outerRingGrad)" strokeWidth={1} strokeDasharray="4 8" />
                    {/* 8 sparkle dots trên outer ring */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                      const rad = (angle * Math.PI) / 180;
                      return (
                        <circle
                          key={angle}
                          cx={100 + 90 * Math.cos(rad - Math.PI / 2)}
                          cy={100 + 90 * Math.sin(rad - Math.PI / 2)}
                          r={2}
                          fill="#F59E0B"
                          opacity={0.7}
                        />
                      );
                    })}
                  </svg>

                  {/* Middle ring — orbit-ccw */}
                  <svg width={160} height={160} viewBox="0 0 160 160" className="absolute" style={{ animation: "orbit-ccw 12s linear infinite" }}>
                    <defs>
                      <linearGradient id="midRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <circle cx={80} cy={80} r={70} fill="none" stroke="url(#midRingGrad)" strokeWidth={1.5} />
                    <circle cx={80} cy={10} r={2.5} fill="#7C3AED" opacity={0.8} />
                    <circle cx={80} cy={150} r={2} fill="#F59E0B" opacity={0.6} />
                  </svg>

                  {/* Inner thick gradient ring — orbit-cw */}
                  <svg width={116} height={116} viewBox="0 0 116 116" className="absolute" style={{ animation: "orbit-cw 8s linear infinite" }}>
                    <defs>
                      <linearGradient id="innerNumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#7C3AED" />
                      </linearGradient>
                    </defs>
                    <circle cx={58} cy={58} r={48} fill="none" stroke="url(#innerNumGrad)" strokeWidth={4} strokeLinecap="round" strokeDasharray="30 70" />
                  </svg>

                  {/* Center: con số + label */}
                  <div className="relative z-10 text-center">
                    <svg width={80} height={56} viewBox="0 0 80 56">
                      <defs>
                        <linearGradient id="numTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                      </defs>
                      <text x={40} y={40} textAnchor="middle" fontSize={44} fontWeight={900} fill="url(#numTextGrad)">
                        {result.lifePath}
                      </text>
                    </svg>
                    <div className="text-[9px] tracking-[2px] uppercase text-amber-400/70 -mt-1">số chủ đạo</div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-extrabold mb-2">
                <span style={{
                  background: "linear-gradient(135deg, #F59E0B, #7C3AED)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {LIFE_PATH[result.lifePath]?.title || `Số ${result.lifePath}`}
                </span>
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                {LIFE_PATH[result.lifePath]?.summary}
              </p>
            </div>

            {/* 6 Indicator Cards — thiên văn style */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {INDICATORS.map((ind) => {
                const value = result[ind.key];
                const desc = getDescription(ind.key, value);
                const colors = COLOR_CLASSES[ind.color];
                const isExpanded = expanded === ind.key;
                const lifePathData = ind.key === "lifePath" ? LIFE_PATH[value] : null;
                const symbol = ASTRO_SYMBOLS[ind.key];

                return (
                  <div
                    key={ind.key}
                    className={`glass p-6 transition-all duration-300 border ${colors.border} ${isExpanded ? "sm:col-span-2 lg:col-span-3" : ""}`}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      {/* Astro symbol badge với gradient */}
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <svg width={48} height={48} viewBox="0 0 48 48" className="absolute inset-0">
                          <defs>
                            <linearGradient id={`badge-${ind.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={colors.gradStop1} stopOpacity={0.25} />
                              <stop offset="100%" stopColor={colors.gradStop2} stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <rect x={0} y={0} width={48} height={48} rx={12} fill={`url(#badge-${ind.key})`} />
                          <rect x={0.5} y={0.5} width={47} height={47} rx={11.5} fill="none" stroke={colors.gradStop1} strokeOpacity={0.3} strokeWidth={1} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-lg leading-none ${colors.text}`} style={{ fontFamily: "serif" }}>{symbol}</span>
                          <span className={`text-xs font-bold ${colors.text} leading-none mt-0.5`}>{value}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{ind.label}</div>
                        <div className="text-xs text-slate-500 tracking-wide">{ind.sub}</div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed mb-3">
                      {desc?.summary}
                    </p>

                    {(lifePathData || desc?.strengths) && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : ind.key)}
                        className={`text-xs ${colors.text} hover:opacity-80 transition-opacity flex items-center gap-1`}
                      >
                        <span className="text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                        {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                      </button>
                    )}

                    {isExpanded && (lifePathData || desc) && (
                      <div className="mt-4 pt-4 space-y-3" style={{ borderTop: `1px solid ${colors.gradStop1}25` }}>
                        {(desc?.strengths || lifePathData?.strengths) && (
                          <div>
                            <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1.5">Điểm mạnh</div>
                            {(desc?.strengths || lifePathData?.strengths || []).map((s) => (
                              <div key={s} className="text-sm text-slate-300 flex items-start gap-2 mb-1">
                                <span className="text-teal-400 shrink-0 mt-0.5">+</span>{s}
                              </div>
                            ))}
                          </div>
                        )}
                        {(desc?.weaknesses || lifePathData?.weaknesses) && (
                          <div>
                            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Cần lưu ý</div>
                            {(desc?.weaknesses || lifePathData?.weaknesses || []).map((w) => (
                              <div key={w} className="text-sm text-slate-300 flex items-start gap-2 mb-1">
                                <span className="text-amber-400 shrink-0 mt-0.5">-</span>{w}
                              </div>
                            ))}
                          </div>
                        )}
                        {(desc?.careers || lifePathData?.careers) && (
                          <div>
                            <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1.5">Nghề nghiệp phù hợp</div>
                            <div className="flex flex-wrap gap-2">
                              {(desc?.careers || lifePathData?.careers || []).map((c) => (
                                <span key={c} className="text-xs bg-violet-500/10 text-violet-300 px-2.5 py-1 rounded-full border border-violet-500/20">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button onClick={handleReset} className="btn-ghost px-6 py-3 text-sm">
                Làm lại
              </button>
              {!saved ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-violet-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Lưu kết quả"}
                </button>
              ) : (
                <span className="px-6 py-3 text-sm text-teal-400 font-semibold">✓ Đã lưu thành công</span>
              )}
            </div>

            {error && (
              <div className="text-center text-red-400 text-sm mt-4">{error}</div>
            )}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
