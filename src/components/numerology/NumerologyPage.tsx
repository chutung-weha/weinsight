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
const COLOR_CLASSES: Record<string, { ring: string; bg: string; text: string; border: string }> = {
  amber:  { ring: "from-amber-500 to-orange-300", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  cyan:   { ring: "from-cyan-500 to-cyan-300", bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  teal:   { ring: "from-teal-500 to-teal-300", bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/20" },
  violet: { ring: "from-violet-500 to-violet-300", bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  pink:   { ring: "from-pink-500 to-pink-300", bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
  blue:   { ring: "from-blue-500 to-blue-300", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
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
        <section className="relative min-h-[calc(100vh-60px)] flex items-center justify-center py-12 overflow-hidden">
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
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Họ và tên khai sinh
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Phạm Thị Mai"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.08] transition-all"
                />
              </div>

              {/* Ngày sinh */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Ngày tháng năm sinh (dương lịch)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="px-3 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500/30 transition-all"
                  >
                    <option value={0}>Ngày</option>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="px-3 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500/30 transition-all"
                  >
                    <option value={0}>Tháng</option>
                    {MONTHS.map((m) => <option key={m} value={m}>Tháng {m}</option>)}
                  </select>
                  <select
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
          <div
            className="bg-orb w-[600px] h-[600px] -top-40 -right-40 absolute"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.08), transparent)" }}
          />

          <div className="max-w-[1128px] mx-auto px-6 relative">
            {/* Hero: Life Path Number */}
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-[2px] uppercase text-amber-400 mb-3">
                Kết quả thần số học
              </p>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <svg width={140} height={140} viewBox="0 0 120 120">
                    <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                    <circle cx={60} cy={60} r={50} fill="none" stroke="url(#numRing)" strokeWidth={8} strokeLinecap="round" strokeDasharray={314} strokeDashoffset={314 - (314 * Math.min(result.lifePath, 9)) / 9} transform="rotate(-90 60 60)" />
                    <defs>
                      <linearGradient id="numRing" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#7C3AED" />
                      </linearGradient>
                    </defs>
                    <text x={60} y={55} textAnchor="middle" fontSize={36} fontWeight={800} fill="#F1F5F9">
                      {result.lifePath}
                    </text>
                    <text x={60} y={72} textAnchor="middle" fontSize={9} fill="#94A3B8">số chủ đạo</text>
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-1">
                {LIFE_PATH[result.lifePath]?.title || `Số ${result.lifePath}`}
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                {LIFE_PATH[result.lifePath]?.summary}
              </p>
            </div>

            {/* 6 Indicator Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {INDICATORS.map((ind) => {
                const value = result[ind.key];
                const desc = getDescription(ind.key, value);
                const colors = COLOR_CLASSES[ind.color];
                const isExpanded = expanded === ind.key;
                const lifePathData = ind.key === "lifePath" ? LIFE_PATH[value] : null;

                return (
                  <div key={ind.key} className={`glass p-6 transition-all duration-300 ${isExpanded ? "sm:col-span-2 lg:col-span-3" : ""}`}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center`}>
                        <span className={`text-xl font-extrabold ${colors.text}`}>{value}</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{ind.label}</div>
                        <div className="text-xs text-slate-500">{ind.sub}</div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed mb-3">
                      {desc?.summary}
                    </p>

                    {/* Expand/collapse for lifePath detailed info */}
                    {(lifePathData || desc?.strengths) && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : ind.key)}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                      </button>
                    )}

                    {isExpanded && (lifePathData || desc) && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                        {(desc?.strengths || lifePathData?.strengths) && (
                          <div>
                            <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1.5">Điểm mạnh</div>
                            {(desc?.strengths || lifePathData?.strengths || []).map((s) => (
                              <div key={s} className="text-sm text-slate-300 flex items-center gap-2">
                                <span className="text-teal-400">+</span> {s}
                              </div>
                            ))}
                          </div>
                        )}
                        {(desc?.weaknesses || lifePathData?.weaknesses) && (
                          <div>
                            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Cần lưu ý</div>
                            {(desc?.weaknesses || lifePathData?.weaknesses || []).map((w) => (
                              <div key={w} className="text-sm text-slate-300 flex items-center gap-2">
                                <span className="text-amber-400">-</span> {w}
                              </div>
                            ))}
                          </div>
                        )}
                        {(desc?.careers || lifePathData?.careers) && (
                          <div>
                            <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1.5">Nghề nghiệp phù hợp</div>
                            <div className="flex flex-wrap gap-2">
                              {(desc?.careers || lifePathData?.careers || []).map((c) => (
                                <span key={c} className="text-xs bg-violet-500/10 text-violet-300 px-2.5 py-1 rounded-full">{c}</span>
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
                <span className="px-6 py-3 text-sm text-teal-400 font-semibold">
                  Đã lưu thành công
                </span>
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
