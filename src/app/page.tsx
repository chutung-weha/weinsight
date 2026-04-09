import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const features = [
  { title: "Bài test DISC", desc: "Đánh giá tính cách theo 4 chiều: Dominance, Influence, Steadiness, Conscientiousness.", color: "cyan", icon: "sparkles" },
  { title: "Tư duy Logic", desc: "Đo năng lực giải quyết vấn đề, tư duy phân tích và khả năng ra quyết định.", color: "violet", icon: "bolt" },
  { title: "Xử lý tình huống", desc: "Đánh giá cách ứng xử trong các tình huống thực tế tại doanh nghiệp.", color: "blue", icon: "chat" },
  { title: "Upload tri thức (RAG)", desc: "Admin upload tài liệu nội bộ — AI đọc và đánh giá theo ngữ cảnh doanh nghiệp.", color: "teal", icon: "doc" },
  { title: "Cấu hình AI Prompt", desc: "Chỉnh tone (thẳng/nhẹ/coach) và mục tiêu (tuyển dụng/đào tạo/đánh giá).", color: "cyan", icon: "config" },
  { title: "Admin Dashboard", desc: "Xem danh sách, điểm, rank nhân sự. Filter theo phòng ban và click xem chi tiết.", color: "violet", icon: "chart" },
];

const iconMap: Record<string, React.ReactNode> = {
  sparkles: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />,
  bolt: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
  chat: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />,
  doc: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
  config: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />,
  chart: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
};

const colorMap: Record<string, string> = {
  cyan: "bg-cyan-500/10 text-cyan-400",
  violet: "bg-violet-500/10 text-violet-400",
  blue: "bg-blue-500/10 text-blue-400",
  teal: "bg-teal-500/10 text-teal-400",
};

export default function Home() {
  return (
    <>
      <Header />
      <ScrollReveal />

      {/* ===== HERO ===== */}
      <section className="relative py-24 lg:py-32 text-center overflow-hidden">
        <div className="bg-orb w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(6,182,212,0.15),transparent)] -top-24 -left-40 absolute" />
        <div className="bg-orb w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.1),transparent)] -bottom-20 -right-24 absolute" />
        <div className="relative max-w-[1128px] mx-auto px-6">
          <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-extrabold leading-tight tracking-tight">
            Hiểu người — Dùng đúng<br />
            <span className="gradient-text">Tăng trưởng bền vững</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Hệ thống đánh giá nhân sự + AI Coach. Phân tích DISC, tư duy logic, xử lý tình huống — kết hợp tri thức doanh nghiệp để đưa ra insight chính xác.
          </p>
          <div className="mt-9 flex gap-3.5 justify-center flex-wrap">
            <Link href="/test" className="btn-glow gradient-bg text-base px-8 py-3">Làm bài test ngay</Link>
            <a href="#ai-insight" className="btn-ghost text-base px-7 py-3">Xem demo</a>
          </div>
          <div className="mt-14 flex justify-center gap-12 flex-wrap">
            {[
              { value: "3", label: "Loại bài test" },
              { value: "AI", label: "Phân tích chuyên sâu", violet: true },
              { value: "RAG", label: "Tri thức doanh nghiệp" },
              { value: "50+", label: "Chuyên gia WEHA", violet: true },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-3xl font-extrabold ${s.violet ? "gradient-text-violet" : "gradient-text"}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative py-20">
        <div className="max-w-[1128px] mx-auto px-6">
          <p className="reveal text-xs font-semibold tracking-[2px] uppercase text-cyan-400 text-center mb-3">Tính năng</p>
          <h2 className="reveal d1 text-3xl font-bold text-center mb-4">Không chỉ test — mà là <span className="gradient-text">công cụ ra quyết định</span></h2>
          <p className="reveal d2 text-sm text-slate-400 text-center max-w-lg mx-auto mb-12 leading-relaxed">
            Kết hợp bài test đánh giá, tri thức doanh nghiệp và AI để đưa ra insight chính xác cho mọi quyết định nhân sự.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={f.title} className={`reveal d${i + 1} glass glass-hover p-7 flex flex-col gap-4`}>
                <div className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center ${colorMap[f.color]}`}>
                  <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">{iconMap[f.icon]}</svg>
                </div>
                <h3 className="text-base font-bold">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-20">
        <div className="max-w-[1128px] mx-auto px-6">
          <p className="reveal text-xs font-semibold tracking-[2px] uppercase text-cyan-400 text-center mb-3">Quy trình</p>
          <h2 className="reveal d1 text-3xl font-bold text-center mb-4">3 bước từ data đến <span className="gradient-text">quyết định</span></h2>
          <p className="reveal d2 text-sm text-slate-400 text-center mb-12">Data Input → AI Brain → Decision Output</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { num: "1", title: "Làm bài test", desc: "Ứng viên hoặc nhân sự hoàn thành bài test DISC, Logic hoặc Situation qua giao diện glass card mượt mà.", bg: "gradient-bg" },
              { num: "2", title: "AI phân tích", desc: "AI kết hợp kết quả test + tri thức doanh nghiệp (RAG) để đánh giá toàn diện theo tiêu chuẩn công ty.", bg: "bg-gradient-to-br from-violet-500 to-cyan-500" },
              { num: "3", title: "Nhận AI Insight", desc: "Xem báo cáo chi tiết: radar chart, điểm từng phần, nhận định vai trò phù hợp và khuyến nghị hành động.", bg: "bg-gradient-to-br from-cyan-500 to-blue-500" },
            ].map((s, i) => (
              <div key={s.num} className={`reveal d${i + 1} glass glass-hover p-9 text-center`}>
                <div className={`w-11 h-11 rounded-full ${s.bg} text-[#0B1120] font-extrabold text-lg flex items-center justify-center mx-auto mb-5`}>{s.num}</div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI INSIGHT PREVIEW ===== */}
      <section id="ai-insight" className="relative py-20">
        <div className="bg-orb w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.08),transparent)] top-0 -left-24 absolute" />
        <div className="max-w-[1128px] mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal-left">
              <p className="text-xs font-semibold tracking-[2px] uppercase text-cyan-400 mb-3">AI Insight</p>
              <h2 className="text-3xl font-bold leading-snug mb-5">Không chỉ điểm số —<br />mà là <span className="gradient-text">kết luận đúng</span></h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                AI đọc dữ liệu test kết hợp tài liệu nội bộ doanh nghiệp để đưa ra nhận định: người này hợp vai gì, có nên tuyển không, có nên promote không.
              </p>
              <div className="space-y-3">
                {[
                  { color: "bg-cyan-400", text: "Radar chart đa chiều (DISC profile)" },
                  { color: "bg-violet-400", text: "Điểm mạnh & điểm cần cải thiện" },
                  { color: "bg-blue-400", text: "Vai trò phù hợp trong tổ chức" },
                  { color: "bg-teal-400", text: "Khuyến nghị hành động cụ thể" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-sm text-slate-400">
                    <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Score Card Preview */}
            <div className="reveal-right glass p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm">Báo cáo AI Insight</div>
                  <div className="text-xs text-slate-500">Nguyễn Văn A — DISC Test</div>
                </div>
              </div>
              <div className="flex justify-center mb-6">
                <svg width={120} height={120} viewBox="0 0 120 120">
                  <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                  <circle cx={60} cy={60} r={50} fill="none" stroke="url(#sg)" strokeWidth={8} strokeLinecap="round" strokeDasharray={314} strokeDashoffset={47} transform="rotate(-90 60 60)" />
                  <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#06B6D4" /><stop offset="100%" stopColor="#7C3AED" /></linearGradient></defs>
                  <text x={60} y={55} textAnchor="middle" fontSize={28} fontWeight={800} fill="#F1F5F9">85</text>
                  <text x={60} y={72} textAnchor="middle" fontSize={10} fill="#94A3B8">điểm tổng</text>
                </svg>
              </div>
              <div className="space-y-3.5">
                {[
                  { label: "Dominance", value: 88, gradient: "from-cyan-500 to-cyan-300" },
                  { label: "Influence", value: 72, gradient: "from-violet-500 to-violet-300" },
                  { label: "Steadiness", value: 65, gradient: "from-blue-500 to-blue-300" },
                  { label: "Conscientiousness", value: 91, gradient: "from-teal-500 to-teal-300" },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">{bar.label}</span>
                      <span className="font-semibold">{bar.value}%</span>
                    </div>
                    <div className="bar-track">
                      <div className={`bar-fill bg-gradient-to-r ${bar.gradient}`} style={{ width: `${bar.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass-sm mt-5 p-4 bg-cyan-500/5 border-cyan-500/15">
                <div className="text-xs font-semibold text-cyan-300 mb-1.5">AI Nhận định</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Phù hợp vị trí <strong className="text-slate-200">Team Lead kỹ thuật</strong>. Tư duy logic mạnh, có khả năng ra quyết định. Cần phát triển thêm kỹ năng giao tiếp nhóm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHO IS IT FOR ===== */}
      <section id="about" className="py-20">
        <div className="max-w-[1128px] mx-auto px-6">
          <p className="reveal text-xs font-semibold tracking-[2px] uppercase text-cyan-400 text-center mb-3">Dành cho ai</p>
          <h2 className="reveal d1 text-3xl font-bold text-center mb-12">WE INSIGHT dành cho ai?</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { title: "CEO", desc: "Ra quyết định dùng người dựa trên data, không phải cảm tính. Tìm \"người phù hợp nhất\".", color: "cyan" },
              { title: "HR", desc: "Tuyển dụng và phân loại nhân sự hiệu quả. Dùng AI insight để đánh giá nhanh, chính xác.", color: "violet" },
              { title: "Nhân sự", desc: "Hiểu bản thân thông qua bài test và AI coaching. Biết điểm mạnh, điểm yếu và hướng phát triển.", color: "blue" },
            ].map((card, i) => (
              <div key={card.title} className={`reveal d${i + 1} glass glass-hover p-8 text-center`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colorMap[card.color]}`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20">
        <div className="max-w-[1128px] mx-auto px-6">
          <div className="reveal glass p-14 text-center relative overflow-hidden">
            <div className="bg-orb w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent)] -top-24 -right-24 absolute" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Sẵn sàng đưa ra quyết định<br /><span className="gradient-text">chính xác hơn?</span></h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                Bắt đầu sử dụng WE INSIGHT ngay hôm nay. Hệ thống đánh giá + AI Coach giúp bạn hiểu người, dùng đúng và tăng trưởng bền vững.
              </p>
              <div className="flex gap-3.5 justify-center flex-wrap">
                <Link href="/test" className="btn-glow gradient-bg text-base px-8 py-3">Bắt đầu miễn phí</Link>
                <a href="mailto:contact@wehagroup.vn" className="btn-ghost text-base px-7 py-3">Liên hệ tư vấn</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
