import { Logo } from "./Logo";

const productLinks = [
  { href: "#features", label: "Tính năng" },
  { href: "#how", label: "Cách hoạt động" },
  { href: "#ai-insight", label: "AI Insight" },
  { href: "#", label: "Bảng giá" },
];

const ecosystemLinks = [
  { href: "#", label: "WEHA TECH" },
  { href: "#", label: "WEHA AI" },
  { href: "#", label: "WEHA MIND OS" },
  { href: "#", label: "WEHA MASTER" },
];

const contactLinks = [
  { href: "mailto:contact@wehagroup.vn", label: "contact@wehagroup.vn" },
  { href: "tel:0901234567", label: "0901 234 567" },
  { href: "#", label: "TP. Hồ Chí Minh, VN" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 pt-12 pb-8">
      <div className="max-w-[1128px] mx-auto px-6">
        <div className="flex flex-wrap justify-between gap-10 mb-10">
          <div className="max-w-[260px]">
            <Logo />
            <p className="text-sm text-slate-500 leading-relaxed mt-3">
              Hệ thống đánh giá nhân sự + AI Coach của WEHA GROUP. Hiểu người — Dùng đúng — Tăng trưởng.
            </p>
          </div>
          <div className="flex gap-14 flex-wrap">
            <FooterCol title="Sản phẩm" links={productLinks} />
            <FooterCol title="Hệ sinh thái" links={ecosystemLinks} />
            <FooterCol title="Liên hệ" links={contactLinks} />
          </div>
        </div>
        <div className="pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
          <p className="text-xs text-slate-600">&copy; 2026 WEHA GROUP. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{title}</h5>
      {links.map((link) => (
        <a key={link.label} href={link.href} className="block text-sm text-slate-500 mb-2.5 hover:text-cyan-300 transition-colors">
          {link.label}
        </a>
      ))}
    </div>
  );
}
