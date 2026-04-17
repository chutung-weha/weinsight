import type { Metadata } from "next";

// Result page chứa thông tin nhân sự riêng tư (tên, ngày sinh, nghề nghiệp,
// điểm DISC/thần số học). Chặn search engine index và cache.
export const metadata: Metadata = {
  title: "Kết quả đánh giá | WE INSIGHT",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
