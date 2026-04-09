import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const tests = [
  {
    id: "disc",
    title: "DISC",
    subtitle: "Đánh giá tính cách",
    desc: "Phân tích 4 chiều: Dominance, Influence, Steadiness, Conscientiousness. Hiểu rõ phong cách làm việc và giao tiếp.",
    questions: 20,
    time: "10 phút",
    gradient: "from-cyan-500 to-teal-400",
    iconBg: "bg-cyan-500/10 text-cyan-400",
    available: true,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    ),
  },
  {
    id: "logic",
    title: "Logic",
    subtitle: "Tư duy phân tích",
    desc: "Đo khả năng giải quyết vấn đề, tư duy trừu tượng và ra quyết định dựa trên dữ liệu.",
    questions: 15,
    time: "12 phút",
    gradient: "from-violet-500 to-purple-400",
    iconBg: "bg-violet-500/10 text-violet-400",
    available: false,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    ),
  },
  {
    id: "situation",
    title: "Situation",
    subtitle: "Xử lý tình huống",
    desc: "Đánh giá cách ứng xử trong các tình huống thực tế: xung đột, deadline, teamwork, leadership.",
    questions: 10,
    time: "8 phút",
    gradient: "from-blue-500 to-cyan-400",
    iconBg: "bg-blue-500/10 text-blue-400",
    available: false,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    ),
  },
];

export default function TestSelectionPage() {
  return (
    <>
      <Header />
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="bg-orb w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(6,182,212,0.12),transparent)] -top-20 -left-32 absolute" />
        <div className="max-w-[1128px] mx-auto px-6 relative">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[2px] uppercase text-cyan-400 mb-3">Chọn bài test</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              Bắt đầu đánh giá <span className="gradient-text">năng lực của bạn</span>
            </h1>
            <p className="mt-4 text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
              Mỗi bài test đo lường một khía cạnh khác nhau. Hiện tại hệ thống mới mở DISC, các bài còn lại sẽ được bật sau khi backend hoàn chỉnh.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test.id}
                className={`glass p-8 flex flex-col ${test.available ? "glass-hover group" : "opacity-70"}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${test.iconBg}`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    {test.icon}
                  </svg>
                </div>

                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-xl font-bold">{test.title}</h2>
                  <span className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {test.subtitle}
                  </span>
                  {!test.available && (
                    <span className="text-xs font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Sắp có
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-400 leading-relaxed mt-2 mb-6 flex-1">{test.desc}</p>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-5">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
                    {test.questions} câu hỏi
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ~{test.time}
                  </span>
                </div>

                {test.available ? (
                  <Link
                    href={`/test/${test.id}`}
                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${test.gradient} text-center text-sm font-semibold text-[#0B1120] group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-shadow`}
                  >
                    Bắt đầu làm test
                  </Link>
                ) : (
                  <div className="w-full py-3 rounded-xl bg-white/5 text-center text-sm font-semibold text-slate-500 cursor-not-allowed">
                    Chưa khai trương
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
