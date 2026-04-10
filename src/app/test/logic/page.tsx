import { TestRunner } from "@/components/test/TestRunner";

export default function LogicTestPage() {
  return (
    <TestRunner
      theme={{
        testType: "LOGIC",
        label: "Logic Test",
        questionLabel: "Câu hỏi",
        progressGradient: "from-violet-500 to-purple-400",
        buttonClass: "bg-gradient-to-r from-violet-500 to-purple-400 text-white hover:shadow-lg hover:shadow-violet-500/25",
        orbs: ["rgba(124,58,237,0.1)", "rgba(139,92,246,0.08)"],
        labelColor: "text-violet-400",
        selectedBg: "bg-violet-500/10",
        selectedBorder: "border-violet-500/30",
        selectedShadow: "shadow-violet-500/5",
        radioBorderActive: "border-violet-400",
        radioBgActive: "bg-violet-400",
      }}
    />
  );
}
