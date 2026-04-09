"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { startTest, submitAnswer, completeTest } from "@/lib/actions/test";

interface QuestionData {
  id: string;
  content: string;
  order: number;
  answers: { id: string; text: string; order: number }[];
}

export default function DISCTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load questions + start session
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function init() {
      try {
        // Fetch questions từ DB
        const res = await fetch("/api/test/disc/questions", { signal: controller.signal });
        const data = await res.json();
        if (cancelled) return;

        if (!data.success) {
          setError("Không thể tải câu hỏi");
          return;
        }
        setQuestions(data.data);

        // Start hoặc resume session
        const sessionResult = await startTest({ testType: "DISC" });
        if (cancelled) return;

        if (!sessionResult.success) {
          setError(sessionResult.error);
          return;
        }
        setSessionId(sessionResult.sessionId);

        // Resume từ câu đã trả lời
        if (sessionResult.answeredQuestionIds.length > 0) {
          const answeredSet = new Set(sessionResult.answeredQuestionIds);
          const nextUnanswered = data.data.findIndex(
            (q: QuestionData) => !answeredSet.has(q.id)
          );
          if (nextUnanswered >= 0) {
            setCurrent(nextUnanswered);
          } else {
            setCurrent(data.data.length - 1);
          }
        }
      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && err.name === "AbortError")) {
          setError("Đã có lỗi xảy ra");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
          <div className="text-slate-400">Đang tải bài test...</div>
        </div>
      </>
    );
  }

  if (error || questions.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
          <div className="glass p-8 text-center max-w-md">
            <div className="text-red-400 mb-2">{error || "Không có câu hỏi nào"}</div>
            <button onClick={() => router.push("/test")} className="btn-ghost text-sm">
              Quay lại
            </button>
          </div>
        </div>
      </>
    );
  }

  const progress = (current / questions.length) * 100;
  const question = questions[current];

  async function handleNext() {
    if (!selected || !sessionId || !question) return;
    setSubmitting(true);

    // Submit answer to DB
    const result = await submitAnswer({
      sessionId,
      questionId: question.id,
      answerId: selected,
    });

    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (current < questions.length - 1) {
      // Câu tiếp theo
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(current + 1);
        setSelected(null);
        setIsTransitioning(false);
        setSubmitting(false);
      }, 300);
    } else {
      // Hoàn thành → tính điểm + generate insight
      const completeResult = await completeTest({ sessionId });
      if (completeResult.success) {
        router.push(`/result/${sessionId}`);
      } else {
        setError(completeResult.error);
        setSubmitting(false);
      }
    }
  }

  return (
    <>
      <Header />
      <section className="relative min-h-[calc(100vh-60px)] flex items-center justify-center py-12 overflow-hidden">
        <div className="bg-orb w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent)] -top-32 -right-32 absolute" />
        <div className="bg-orb w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(124,58,237,0.08),transparent)] bottom-0 -left-20 absolute" />

        <div className="relative w-full max-w-2xl mx-auto px-6">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
              <span>DISC Test</span>
              <span>Câu {current + 1}/{questions.length}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className={`glass p-8 sm:p-10 transition-all duration-300 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-4">
              Câu hỏi {current + 1}
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-8 leading-relaxed">
              {question.content}
            </h2>

            <div className="space-y-3">
              {question.answers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => setSelected(answer.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                    selected === answer.id
                      ? "bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/5"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        selected === answer.id
                          ? "border-cyan-400 bg-cyan-400"
                          : "border-slate-600"
                      }`}
                    >
                      {selected === answer.id && (
                        <svg className="w-3.5 h-3.5 text-[#0B1120]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm leading-relaxed ${selected === answer.id ? "text-slate-200" : "text-slate-400"}`}>
                      {answer.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!selected || submitting}
                className={`px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selected && !submitting
                    ? "gradient-bg text-[#0B1120] hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5"
                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                }`}
              >
                {submitting
                  ? "Đang xử lý..."
                  : current < questions.length - 1
                    ? "Câu tiếp theo"
                    : "Xem kết quả"}
                {!submitting && (
                  <svg className="w-4 h-4 inline-block ml-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
