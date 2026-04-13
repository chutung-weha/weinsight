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
  candidateName: string | null;
  dateOfBirth: string | null;
  occupation: string | null;
  maxScores: Record<string, number>;
  questionCount: number;
  completedAt: string | null;
  answers: { question: string; answer: string; order: number }[];
  aiInsight: {
    summary: string;
    personalityProfile?: string;
    numerologyInsight?: string;
    strengths: string[];
    improvements: string[];
    suitableRoles: string[];
    developmentPlan?: string[];
    recommendation: string;
  } | null;
}

const testThemes: Record<string, {
  gradients: Record<string, string>;
  labels: Record<string, string>;
  ringGradient: [string, string];
}> = {
  DISC: {
    gradients: {
      D: "from-cyan-500 to-cyan-300",
      I: "from-violet-500 to-violet-300",
      S: "from-blue-500 to-blue-300",
      C: "from-teal-500 to-teal-300",
    },
    labels: {
      D: "Năng lực dẫn dắt (D)",
      I: "Truyền cảm hứng (I)",
      S: "Đáng tin cậy (S)",
      C: "Tư duy hệ thống (C)",
    },
    ringGradient: ["#06B6D4", "#7C3AED"],
  },
  LOGIC: {
    gradients: {
      correct: "from-violet-500 to-violet-300",
      reasoning: "from-purple-500 to-purple-300",
    },
    labels: {
      correct: "Câu đúng",
      reasoning: "Tư duy suy luận",
    },
    ringGradient: ["#8B5CF6", "#A855F7"],
  },
  SITUATION: {
    gradients: {
      leadership: "from-blue-500 to-blue-300",
      teamwork: "from-cyan-500 to-cyan-300",
      communication: "from-teal-500 to-teal-300",
      problemSolving: "from-indigo-500 to-indigo-300",
    },
    labels: {
      leadership: "Lãnh đạo",
      teamwork: "Đồng đội",
      communication: "Giao tiếp",
      problemSolving: "Giải quyết vấn đề",
    },
    ringGradient: ["#2563EB", "#06B6D4"],
  },
};

export default function ResultPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
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
          // Nếu chưa có AI Insight → tự động gọi generate
          if (!json.data.aiInsight && json.data.status === "COMPLETED") {
            if (!cancelled) setInsightLoading(true);
            try {
              const genRes = await fetch(`/api/insight/${sessionId}`, { method: "POST" });
              const genJson = await genRes.json();
              if (genJson.success && !cancelled) {
                const reloadRes = await fetch(`/api/result/${sessionId}`);
                const reloadJson = await reloadRes.json();
                if (reloadJson.success && !cancelled) {
                  setData(reloadJson.data);
                }
              }
            } catch { /* best-effort */ }
            if (!cancelled) setInsightLoading(false);
          }
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
  const maxScores = data.maxScores || {};
  const theme = testThemes[data.testType] || testThemes.DISC;
  const isDISC = data.testType === "DISC";
  const pct: Record<string, number> = {};

  if (isDISC) {
    // DISC: tỷ trọng profile (proportion) — đúng nghiệp vụ vì DISC đo "thiên hướng"
    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    for (const [k, v] of Object.entries(scores)) {
      pct[k] = Math.round((v / total) * 100);
    }
  } else {
    // Logic + Situation: điểm năng lực tuyệt đối (score / maxPossible)
    // maxScores từ API — computed từ actual DB data, không hardcode
    for (const [k, v] of Object.entries(scores)) {
      const max = maxScores[k] || 1;
      pct[k] = Math.round((v / max) * 100);
    }
  }

  const dimensions = Object.values(pct);
  const avgPct = dimensions.length > 0 ? dimensions.reduce((a, b) => a + b, 0) / dimensions.length : 0;
  const maxPct = Math.max(...dimensions, 0);

  // Overall formula per test type:
  // - DISC (proportion): max dimension % — reward profile rõ ràng, không dùng blend vì proportion sum ≈ 100%
  // - Logic/Situation (absolute): 60% max + 40% avg — reward cả chuyên sâu lẫn cân bằng
  const overall = isDISC
    ? maxPct
    : Math.round(maxPct * 0.6 + avgPct * 0.4);
  const dashOffset = 314 - (314 * overall) / 100;
  const overallLabel = isDISC ? "Tổng Quan" : "Điểm Tổng";
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
          {data.candidateName && (
            <div className="flex items-center justify-center gap-3 mt-3 mb-2">
              <span className="text-base font-semibold text-slate-200">{data.candidateName}</span>
              {data.occupation && (
                <span className="text-xs text-slate-500 bg-white/5 px-2.5 py-0.5 rounded-full">{data.occupation}</span>
              )}
            </div>
          )}
          {insight && (
            <p className="text-sm text-slate-400 max-w-lg mx-auto">{String(insight.summary || "")}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Score Ring + Bars */}
          <div className="glass p-8 text-center">
            <div className="flex justify-center mb-6">
              <svg width={140} height={140} viewBox="0 0 120 120">
                <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                <circle cx={60} cy={60} r={50} fill="none" stroke="url(#rg)" strokeWidth={8} strokeLinecap="round" strokeDasharray={314} strokeDashoffset={dashOffset} transform="rotate(-90 60 60)" />
                <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={theme.ringGradient[0]} /><stop offset="100%" stopColor={theme.ringGradient[1]} /></linearGradient></defs>
                <text x={60} y={55} textAnchor="middle" fontSize={30} fontWeight={800} fill="#F1F5F9">{overall}</text>
                <text x={60} y={72} textAnchor="middle" fontSize={10} fill="#94A3B8">{overallLabel}</text>
              </svg>
            </div>
            <div className="space-y-3.5">
              {Object.entries(pct).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">{theme.labels[key] || key}</span>
                    <span className="font-semibold">{!isDISC && key === "correct" ? `${scores.correct || 0}/${maxScores.correct || "?"}` : `${value}%`}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill bg-gradient-to-r ${theme.gradients[key] || "from-cyan-500 to-cyan-300"}`}
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
                {/* Phân tích tính cách tổng hợp */}
                {insight.personalityProfile && (
                  <div className="glass-sm p-5 bg-cyan-500/5 border-cyan-500/15 mb-5">
                    <div className="text-xs font-semibold text-cyan-300 mb-2">Phân tích tính cách (DISC + Thần số học)</div>
                    <p className="text-sm text-slate-300 leading-relaxed">{String(insight.personalityProfile || "")}</p>
                  </div>
                )}

                {/* Thần số học insight */}
                {insight.numerologyInsight && (
                  <div className="glass-sm p-5 bg-amber-500/5 border-amber-500/15 mb-5">
                    <div className="text-xs font-semibold text-amber-300 mb-2">Thần số học Pythagoras</div>
                    <p className="text-sm text-slate-300 leading-relaxed">{insight.numerologyInsight}</p>
                  </div>
                )}

                {/* Vai trò phù hợp */}
                <div className="glass-sm p-5 bg-blue-500/5 border-blue-500/15 mb-5">
                  <div className="text-xs font-semibold text-blue-300 mb-2">Vai trò phù hợp</div>
                  <div className="flex flex-wrap gap-2">
                    {(insight.suitableRoles || []).map((role) => (
                      <span key={role} className="text-sm font-semibold bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Điểm mạnh & Cần phát triển */}
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-3">Điểm mạnh</div>
                    <div className="space-y-2">
                      {(insight.strengths || []).map((s) => (
                        <div key={s} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-teal-400 shrink-0">✓</span> {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">Cần phát triển</div>
                    <div className="space-y-2">
                      {(insight.improvements || []).map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-rose-400 shrink-0">→</span> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kế hoạch phát triển */}
                {Array.isArray(insight.developmentPlan) && insight.developmentPlan.length > 0 && (
                  <div className="glass-sm p-5 bg-teal-500/5 border-teal-500/15 mb-5">
                    <div className="text-xs font-semibold text-teal-300 mb-3">Kế hoạch phát triển</div>
                    <div className="space-y-2.5">
                      {insight.developmentPlan.map((step, i) => (
                        <div key={step} className="flex items-start gap-3 text-sm text-slate-300">
                          <span className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Khuyến nghị */}
                <div className="glass-sm p-5 bg-violet-500/5 border-violet-500/15">
                  <div className="text-xs font-semibold text-violet-300 mb-2">Khuyến nghị tổng hợp</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{String(insight.recommendation || "")}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                {insightLoading ? (
                  <>
                    <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-3" />
                    <p>AI đang phân tích kết quả DISC + Thần số học...</p>
                    <p className="text-xs mt-1">Có thể mất 10-20 giây</p>
                  </>
                ) : (
                  <>
                    <p>Chưa có AI Insight cho phiên test này.</p>
                    <p className="text-xs mt-2">Vui lòng cấu hình GROQ_API_KEY để sử dụng AI.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-10">
          <Link href="/test" className="btn-ghost px-6 py-3 text-sm">Làm lại bài test</Link>
          <Link href="/" className="btn-glow gradient-bg px-6 py-3 text-sm">Về trang chủ</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
