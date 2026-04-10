import { TestRunner } from "@/components/test/TestRunner";

export default function SituationTestPage() {
  return (
    <TestRunner
      theme={{
        testType: "SITUATION",
        label: "Situation Test",
        questionLabel: "Tình huống",
        progressGradient: "from-blue-500 to-cyan-400",
        buttonClass: "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25",
        orbs: ["rgba(37,99,235,0.1)", "rgba(6,182,212,0.08)"],
        labelColor: "text-blue-400",
        selectedBg: "bg-blue-500/10",
        selectedBorder: "border-blue-500/30",
        selectedShadow: "shadow-blue-500/5",
        radioBorderActive: "border-blue-400",
        radioBgActive: "bg-blue-400",
      }}
    />
  );
}
