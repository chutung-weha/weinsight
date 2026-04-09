import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-logo",
});

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
    <html lang="vi" className={`${inter.variable} ${beVietnam.variable} antialiased`}>
      <body className="min-h-screen font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
