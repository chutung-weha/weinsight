"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { startTest, submitAnswer, completeTest } from "@/lib/actions/test";

interface QuestionData {
  id: string;
  content: string;
  order: number;
  answers: { id: string; text: string; order: number }[];
}

export interface TestTheme {
  testType: "DISC" | "LOGIC" | "SITUATION";
  label: string;
  questionLabel: string;
  progressGradient: string;
  buttonClass: string;
  orbs: [string, string];
  labelColor: string;
  selectedBg: string;
  selectedBorder: string;
  selectedShadow: string;
  radioBorderActive: string;
  radioBgActive: string;
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function isValidDate(d: number, m: number, y: number): boolean {
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function TestRunner({ theme, defaultCandidateName }: { theme: TestTheme; defaultCandidateName?: string }) {
  const router = useRouter();

  // Info form state
  const [step, setStep] = useState<"info" | "questions">("info");
  const [candidateName, setCandidateName] = useState(defaultCandidateName || "");
  const [day, setDay] = useState(0);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);
  const [occupation, setOccupation] = useState("");
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Questions state
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answeredMap, setAnsweredMap] = useState<Record<string, string>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Lưu handle setTimeout của transition để clear khi unmount hoặc chuyển
  // step → tránh setState on unmounted. Ref không trigger re-render.
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref giữ answeredMap mới nhất để callback trong setTimeout đọc đúng giá trị
  // (không bị stale closure khi setAnsweredMap chưa flush).
  const answeredMapRef = useRef<Record<string, string>>({});

  useEffect(() => {
    answeredMapRef.current = answeredMap;
  }, [answeredMap]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, []);

  const thisYear = new Date().getFullYear();
  const YEARS = Array.from({ length: thisYear - 1900 + 1 }, (_, i) => thisYear - i);

  // Fetch questions + start session after info form submitted
  useEffect(() => {
    if (step !== "questions") return;

    let cancelled = false;
    const controller = new AbortController();

    async function init() {
      setLoading(true);
      try {
        const qs = sessionId ? `?sessionId=${sessionId}` : "";
        const res = await fetch(`/api/test/${theme.testType.toLowerCase()}/questions${qs}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (cancelled) return;

        if (!data.success) {
          setError("Không thể tải câu hỏi");
          return;
        }
        setQuestions(data.data);

        // Resume: nếu đã có câu trả lời, nhảy tới câu tiếp theo chưa trả lời
        if (answeredIds.length > 0) {
          const answeredSet = new Set(answeredIds);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, theme.testType]);

  async function handleInfoSubmit() {
    setFormError("");
    const name = candidateName.trim();
    if (name.length < 2) { setFormError("Vui lòng nhập họ tên (ít nhất 2 ký tự)"); return; }
    if (!day || !month || !year) { setFormError("Vui lòng chọn đầy đủ ngày tháng năm sinh"); return; }
    if (!isValidDate(day, month, year)) { setFormError("Ngày sinh không hợp lệ"); return; }
    if (!occupation.trim()) { setFormError("Vui lòng nhập nghề nghiệp"); return; }

    setFormSubmitting(true);
    const dob = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const result = await startTest({
      testType: theme.testType,
      candidateName: name,
      dateOfBirth: dob,
      occupation: occupation.trim(),
    });

    setFormSubmitting(false);

    if (!result.success) {
      setFormError(result.error || "Không thể bắt đầu test");
      return;
    }

    setSessionId(result.sessionId);
    setAnsweredIds(result.answeredQuestionIds);

    // Nếu đã có answers (resume) → skip info, vào thẳng questions
    if (result.answeredQuestionIds.length > 0) {
      setStep("questions");
      return;
    }

    setStep("questions");
  }

  // ─── INFO FORM STEP ────────────────────────────────────
  if (step === "info") {
    return (
      <>
        <Header />
        <section className="relative min-h-[calc(100dvh-60px)] flex items-center justify-center py-12 overflow-hidden">
          <div
            className="bg-orb w-[500px] h-[500px] -top-32 -right-32 absolute"
            style={{ background: `radial-gradient(circle, ${theme.orbs[0]}, transparent)` }}
          />
          <div
            className="bg-orb w-[300px] h-[300px] bottom-0 -left-20 absolute"
            style={{ background: `radial-gradient(circle, ${theme.orbs[1]}, transparent)` }}
          />

          <div className="relative w-full max-w-lg mx-auto px-6">
            <div className="glass p-8 sm:p-10">
              <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${theme.labelColor}`}>
                {theme.label}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Thông tin cá nhân
              </h2>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                Vui lòng nhập thông tin để AI có thể phân tích chính xác hơn.
              </p>

              <div className="space-y-5">
                {/* Họ tên */}
                <div>
                  <label htmlFor="test-candidate-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Họ và tên
                  </label>
                  <input
                    id="test-candidate-name"
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.08] transition-all"
                  />
                </div>

                {/* Ngày sinh */}
                <div>
                  <span className="block text-sm font-medium text-slate-300 mb-1.5">
                    Ngày tháng năm sinh
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      aria-label="Ngày sinh"
                      value={day}
                      onChange={(e) => setDay(Number(e.target.value))}
                      className="px-3 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500/40 transition-all"
                    >
                      <option value={0} className="bg-[#0B1120]">Ngày</option>
                      {DAYS.map((d) => (
                        <option key={d} value={d} className="bg-[#0B1120]">{d}</option>
                      ))}
                    </select>
                    <select
                      aria-label="Tháng sinh"
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="px-3 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500/40 transition-all"
                    >
                      <option value={0} className="bg-[#0B1120]">Tháng</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m} className="bg-[#0B1120]">Tháng {m}</option>
                      ))}
                    </select>
                    <select
                      aria-label="Năm sinh"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="px-3 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500/40 transition-all"
                    >
                      <option value={0} className="bg-[#0B1120]">Năm</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y} className="bg-[#0B1120]">{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Nghề nghiệp */}
                <div>
                  <label htmlFor="test-occupation" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Nghề nghiệp
                  </label>
                  <input
                    id="test-occupation"
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="VD: Nhân viên kinh doanh, Kỹ sư phần mềm, Sinh viên..."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.08] transition-all"
                  />
                </div>

                {formError && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                    {formError}
                  </div>
                )}

                <button
                  onClick={handleInfoSubmit}
                  disabled={formSubmitting}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    formSubmitting
                      ? "bg-white/5 text-slate-600 cursor-not-allowed"
                      : `${theme.buttonClass} hover:-translate-y-0.5`
                  }`}
                >
                  {formSubmitting ? "Đang xử lý..." : "Bắt đầu làm test"}
                  {!formSubmitting && (
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

  // ─── LOADING STATE ─────────────────────────────────────
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

  // ─── ERROR STATE ───────────────────────────────────────
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

  // ─── QUESTIONS STEP ────────────────────────────────────
  const progress = ((current + 1) / questions.length) * 100;
  const question = questions[current];

  async function handleNext() {
    if (!selected || !sessionId || !question) return;
    setError("");
    setSubmitting(true);

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

    // Cập nhật cả state và ref để transition callback đọc ngay được giá trị mới.
    const nextAnsweredMap = { ...answeredMapRef.current, [question.id]: selected };
    answeredMapRef.current = nextAnsweredMap;
    setAnsweredMap(nextAnsweredMap);

    if (current < questions.length - 1) {
      const nextQuestion = questions[current + 1];
      const nextSelected = nextAnsweredMap[nextQuestion.id] ?? null;
      setIsTransitioning(true);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = setTimeout(() => {
        transitionTimeoutRef.current = null;
        setCurrent((c) => c + 1);
        setSelected(nextSelected);
        setIsTransitioning(false);
        setSubmitting(false);
      }, 300);
    } else {
      const completeResult = await completeTest({ sessionId });
      if (completeResult.success) {
        router.push(`/result/${sessionId}`);
      } else {
        setError(completeResult.error);
        setSubmitting(false);
      }
    }
  }

  function handleBack() {
    if (current === 0 || submitting) return;
    const prevQuestion = questions[current - 1];
    const prevSelected = answeredMapRef.current[prevQuestion.id] ?? null;
    setIsTransitioning(true);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      transitionTimeoutRef.current = null;
      setCurrent((c) => c - 1);
      setSelected(prevSelected);
      setIsTransitioning(false);
    }, 300);
  }

  return (
    <>
      <Header />
      <section className="relative min-h-[calc(100dvh-60px)] flex items-center justify-center py-12 overflow-hidden">
        <div
          className="bg-orb w-[500px] h-[500px] -top-32 -right-32 absolute"
          style={{ background: `radial-gradient(circle, ${theme.orbs[0]}, transparent)` }}
        />
        <div
          className="bg-orb w-[300px] h-[300px] bottom-0 -left-20 absolute"
          style={{ background: `radial-gradient(circle, ${theme.orbs[1]}, transparent)` }}
        />

        <div className="relative w-full max-w-2xl mx-auto px-6">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
              <span>{theme.label}</span>
              <span>Câu {current + 1}/{questions.length}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${theme.progressGradient} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className={`glass p-8 sm:p-10 transition-all duration-300 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme.labelColor}`}>
              {theme.questionLabel} {current + 1}
            </div>
            <h2 id={`question-${question.id}`} className="text-lg sm:text-xl font-bold mb-8 leading-relaxed">
              {question.content}
            </h2>

            <div
              role="radiogroup"
              aria-labelledby={`question-${question.id}`}
              className="space-y-3"
            >
              {question.answers.map((answer) => {
                const isSelected = selected === answer.id;
                return (
                  <button
                    key={answer.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected || (!selected && answer.order === 1) ? 0 : -1}
                    onClick={() => {
                      const next = { ...answeredMapRef.current, [question.id]: answer.id };
                      answeredMapRef.current = next;
                      setSelected(answer.id);
                      setAnsweredMap(next);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                        e.preventDefault();
                        const idx = question.answers.findIndex((a) => a.id === answer.id);
                        const nextAnswer = question.answers[(idx + 1) % question.answers.length];
                        const next = { ...answeredMapRef.current, [question.id]: nextAnswer.id };
                        answeredMapRef.current = next;
                        setSelected(nextAnswer.id);
                        setAnsweredMap(next);
                      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                        e.preventDefault();
                        const idx = question.answers.findIndex((a) => a.id === answer.id);
                        const prevAnswer = question.answers[(idx - 1 + question.answers.length) % question.answers.length];
                        const next = { ...answeredMapRef.current, [question.id]: prevAnswer.id };
                        answeredMapRef.current = next;
                        setSelected(prevAnswer.id);
                        setAnsweredMap(next);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? `${theme.selectedBg} ${theme.selectedBorder} shadow-lg ${theme.selectedShadow}`
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        aria-hidden="true"
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? `${theme.radioBorderActive} ${theme.radioBgActive}`
                            : "border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-[#0B1120]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm leading-relaxed ${isSelected ? "text-slate-200" : "text-slate-400"}`}>
                        {answer.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              {current > 0 ? (
                <button
                  onClick={handleBack}
                  disabled={submitting}
                  className={`flex items-center gap-1.5 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                    !submitting
                      ? `${theme.buttonClass} hover:-translate-y-0.5`
                      : "bg-white/5 text-slate-600"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Câu trước
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                disabled={!selected || submitting}
                className={`px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selected && !submitting
                    ? `${theme.buttonClass} hover:-translate-y-0.5`
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
