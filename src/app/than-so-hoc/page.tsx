import type { Metadata } from "next";
import { NumerologyPage } from "@/components/numerology/NumerologyPage";

export const metadata: Metadata = {
  title: "Thần số học Pythagoras — WE INSIGHT",
  description: "Khám phá số chủ đạo, chỉ số sứ mệnh, linh hồn, nhân cách qua họ tên và ngày sinh. Công cụ thần số học Pythagoras cho nhân sự.",
  openGraph: {
    title: "Thần số học Pythagoras — WE INSIGHT",
    description: "Khám phá con số định mệnh của bạn qua thần số học Pythagoras.",
  },
};

export default function ThanSoHocPage() {
  return <NumerologyPage />;
}
