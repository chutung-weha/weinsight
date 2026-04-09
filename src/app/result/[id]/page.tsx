"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface ResultData {
  id: string;
  testType: string;
  status: string;
  totalScores: Record<string, number> | null;
  completedAt: string | null;
  answers: { question: string; answer: string; order: number }[];
  aiInsight: {
    summary: string;
    strengths: string[];
    improvements: string[];
    suitableRoles: string[];
    recommendation: string;
  } | null;
}

const barGradients: Record<string, string> = {
  D: "from-cyan-500 to-cyan-300",
  I: "from-violet-500 to-violet-300",
  S: "from-blue-500 to-blue-300",
  C: "from-teal-500 to-teal-300",
};

const barLabels: Record<string, string> = {
  D: "Dominance",
  I: "Influence",
  S: "Steadiness",
  C: "Conscientiousness",
};

export default function ResultPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchResult() {
      try {
        const res = await fetch(`/api/result/${sessionId}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (cancelled) return;

        if (!json.success) {
          setError(json.error);
        } else {
          setData(json.data);
        }
      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && err.name === "AbortError")) {
          setError("Không thể tải kết quả");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchResult();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [sessionId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-4" />
            <div className="text-slate-400">AI đang phân tích kết quả...</div>
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass p-8 text-center max-w-md">
            <div className="text-red-400 mb-4">{error || "Không tìm thấy kết quả"}</div>
            <Link href="/test" className="btn-ghost text-sm">Quay lại danh sách test</Link>
          </div>
        </div>
      </>
    );
  }

  const scores = data.totalScores || {};
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const pct: Record<string, number> = {};
  for (const [k, v] of Object.entries(scores)) {
    pct[k] = Math.round((v / total) * 100);
  }

  // Overall score: trung bình % của các dimension, scale 0-100
  // Balanced profile → điểm cao hơn; lệch → điểm thấp hơn (phản ánh đa chiều)
  const dimensions = Object.values(pct);
  const avgPct = dimensions.length > 0 ? dimensions.reduce((a, b) => a + b, 0) / dimensions.length : 0;
  const maxPct = Math.max(...dimensions, 0);
  // Blend: 60% max dimension + 40% average → reward cả chuyên sâu lẫn cân bằng
  const overall = Math.round(maxPct * 0.6 + avgPct * 0.4);
  const dashOffset = 314 - (314 * overall) / 100;
  const insight = data.aiInsight;

  return (
    <>
      <Header />
      <div className="max-w-[1128px] mx-auto px-6 py-12 lg:py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[2px] uppercase text-cyan-400 mb-3">
            Kết quả {data.testType} Test
          </p>
          <h1 className="text-3xl font-extrabold mb-2">
            <span className="gradient-text">Báo cáo đánh giá</span>
          </h1>
          {insight && (
            <p className="text-sm text-slate-400 max-w-lg mx-auto">{insight.summary}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Score Ring + Bars */}
          <div className="glass p-8 text-center">
            <div className="flex justify-center mb-6">
              <svg width={140} height={140} viewBox="0 0 120 120">
                <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                <circle cx={60} cy={60} r={50} fill="none" stroke="url(#rg)" strokeWidth={8} strokeLinecap="round" strokeDasharray={314} strokeDashoffset={dashOffset} transform="rotate(-90 60 60)" />
                <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#06B6D4" /><stop offset="100%" stopColor="#7C3AED" /></linearGradient></defs>
                <text x={60} y={55} textAnchor="middle" fontSize={30} fontWeight={800} fill="#F1F5F9">{overall}</text>
                <text x={60} y={72} textAnchor="middle" fontSize={10} fill="#94A3B8">điểm tổng</text>
              </svg>
            </div>
            <div className="space-y-3.5">
              {Object.entries(pct).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">{barLabels[key] || key}</span>
                    <span className="font-semibold">{value}%</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill bg-gradient-to-r ${barGradients[key] || "from-cyan-500 to-cyan-300"}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          <div className="lg:col-span-2 glass p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <div className="font-bold">AI Insight</div>
                <div className="text-xs text-slate-500">Phân tích dựa trên kết quả bài test</div>
              </div>
            </div>

            {insight ? (
              <>
                {/* Vai trò phù hợp */}
                <div className="glass-sm p-5 bg-cyan-500/5 border-cyan-500/15 mb-6">
                  <div className="text-xs font-semibold text-cyan-300 mb-2">Vai trò phù hợp</div>
                  <div className="flex flex-wrap gap-2">
                    {insight.suitableRoles.map((role) => (
                      <span key={role} className="text-sm font-semibold bg-cyan-500/10 text-cyan-300 px-3 py-1 rounded-full">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Điểm mạnh & Cần phát triển */}
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <div>
                    <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-3">Điểm mạnh</div>
                    <div className="space-y-2">
                      {insight.strengths.map((s) => (
                        <div key={s} className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="text-teal-400">✓</span> {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Cần phát triển</div>
                    <div className="space-y-2">
                      {insight.improvements.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="text-amber-400">→</span> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Khuyến nghị */}
                <div className="glass-sm p-5 bg-violet-500/5 border-violet-500/15">
                  <div className="text-xs font-semibold text-violet-300 mb-2">Khuyến nghị</div>
                  <p className="text-sm text-slate-400 leading-relaxed">{insight.recommendation}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Chưa có AI Insight cho phiên test này.</p>
                <p className="text-xs mt-2">Vui lòng cấu hình ANTHROPIC_API_KEY để sử dụng AI.</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-10">
          <Link href="/test" className="btn-ghost px-6 py-3 text-sm">Làm bài test khác</Link>
          <Link href="/" className="btn-glow gradient-bg px-6 py-3 text-sm">Về trang chủ</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
