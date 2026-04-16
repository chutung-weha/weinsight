import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "WE INSIGHT — Hệ thống đánh giá + AI Coach nhân sự",
  description:
    "Nền tảng đánh giá nhân sự thông minh của WEHA GROUP. DISC, Logic, Situation test + AI Insight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="antialiased">
      <body className="min-h-screen font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
