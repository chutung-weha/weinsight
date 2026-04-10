import { TestRunner } from "@/components/test/TestRunner";

export default function DISCTestPage() {
  return (
    <TestRunner
      theme={{
        testType: "DISC",
        label: "DISC Test",
        questionLabel: "Câu hỏi",
        progressGradient: "from-cyan-500 to-teal-400",
        buttonClass: "gradient-bg text-[#0B1120] hover:shadow-lg hover:shadow-cyan-500/25",
        orbs: ["rgba(6,182,212,0.1)", "rgba(124,58,237,0.08)"],
        labelColor: "text-cyan-400",
        selectedBg: "bg-cyan-500/10",
        selectedBorder: "border-cyan-500/30",
        selectedShadow: "shadow-cyan-500/5",
        radioBorderActive: "border-cyan-400",
        radioBgActive: "bg-cyan-400",
      }}
    />
  );
}
