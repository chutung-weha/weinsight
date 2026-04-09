import { prisma } from "@/lib/prisma";
import type { DISCScores } from "@/types/test";

interface GenerateInsightInput {
  sessionId: string;
}

interface InsightResult {
  summary: string;
  strengths: string[];
  improvements: string[];
  suitableRoles: string[];
  recommendation: string;
}

// DISC profile descriptions cho AI prompt context
const discDescriptions: Record<string, string> = {
  D: "Dominance — Quyết đoán, tập trung kết quả, thích thách thức",
  I: "Influence — Cởi mở, nhiệt tình, giỏi giao tiếp",
  S: "Steadiness — Kiên nhẫn, đáng tin cậy, thích ổn định",
  C: "Conscientiousness — Cẩn thận, logic, tập trung chất lượng",
};

interface GenerateInsightResult {
  insight: InsightResult;
  config: { tone: "DIRECT" | "GENTLE" | "COACH"; objective: "RECRUITMENT" | "TRAINING" | "EVALUATION" } | null;
}

export async function generateInsight({ sessionId }: GenerateInsightInput): Promise<GenerateInsightResult> {
  // Fetch session + config
  const [session, config] = await Promise.all([
    prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        user: { select: { name: true, department: true } },
        answers: {
          include: {
            question: { select: { content: true } },
            answer: { select: { text: true } },
          },
        },
      },
    }),
    prisma.aIConfig.findFirst({ where: { active: true } }),
  ]);

  if (!session || session.status !== "COMPLETED" || !session.totalScores) {
    throw new Error("Session chưa hoàn thành");
  }

  const scores = session.totalScores as unknown as DISCScores;
  const tone = config?.tone || "COACH";
  const objective = config?.objective || "EVALUATION";

  // Nếu chưa có ANTHROPIC_API_KEY → dùng rule-based fallback
  if (!process.env.ANTHROPIC_API_KEY) {
    return { insight: generateFallbackInsight(scores, session.testType, session.user.name), config };
  }

  // Gọi Claude API
  const toneMap = {
    DIRECT: "thẳng thắn, ngắn gọn, tập trung vào kết luận",
    GENTLE: "nhẹ nhàng, khích lệ, tập trung điểm mạnh trước",
    COACH: "như một coach chuyên nghiệp, cân bằng giữa nhận định và khuyến nghị",
  };

  const objectiveMap = {
    RECRUITMENT: "đánh giá phù hợp cho vị trí tuyển dụng",
    TRAINING: "xác định nhu cầu đào tạo và phát triển",
    EVALUATION: "đánh giá hiệu suất và năng lực tổng thể",
  };

  const answersContext = session.answers
    .map((a) => `Q: ${a.question.content}\nA: ${a.answer.text}`)
    .join("\n\n");

  const prompt = `Bạn là chuyên gia đánh giá nhân sự của WEHA GROUP. Hãy phân tích kết quả test ${session.testType} sau đây.

Thông tin nhân sự:
- Tên: ${session.user.name}
- Phòng ban: ${session.user.department || "Chưa xác định"}

Kết quả điểm:
${Object.entries(scores).map(([k, v]) => `- ${k} (${discDescriptions[k] || k}): ${v} điểm`).join("\n")}

Câu trả lời chi tiết:
${answersContext}

Yêu cầu:
- Tone: ${toneMap[tone as keyof typeof toneMap]}
- Mục tiêu: ${objectiveMap[objective as keyof typeof objectiveMap]}
${config?.customPrompt ? `- Hướng dẫn thêm: ${config.customPrompt}` : ""}

Trả lời bằng JSON với format chính xác sau (KHÔNG có markdown, KHÔNG có code block):
{"summary":"Tóm tắt 2-3 câu về profile nhân sự","strengths":["Điểm mạnh 1","Điểm mạnh 2","Điểm mạnh 3"],"improvements":["Cần cải thiện 1","Cần cải thiện 2"],"suitableRoles":["Vai trò phù hợp 1","Vai trò phù hợp 2"],"recommendation":"Khuyến nghị hành động cụ thể cho nhân sự này"}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    console.error("Claude API error:", response.status);
    return { insight: generateFallbackInsight(scores, session.testType, session.user.name), config };
  }

  const result = await response.json();
  const text = result.content?.[0]?.text || "";

  try {
    const parsed = JSON.parse(text) as InsightResult;
    return { insight: parsed, config };
  } catch {
    console.error("Failed to parse AI response, using fallback");
    return { insight: generateFallbackInsight(scores, session.testType, session.user.name), config };
  }
}

// Rule-based fallback khi không có API key
function generateFallbackInsight(
  scores: DISCScores,
  testType: string,
  userName: string
): InsightResult {
  if (testType !== "DISC") {
    return {
      summary: `${userName} đã hoàn thành bài test ${testType}. Cần cấu hình AI API key để nhận phân tích chi tiết.`,
      strengths: ["Đã hoàn thành bài test"],
      improvements: ["Cần thêm dữ liệu để đánh giá"],
      suitableRoles: ["Chưa xác định"],
      recommendation: "Vui lòng cấu hình ANTHROPIC_API_KEY để nhận AI Insight chi tiết.",
    };
  }

  const total = scores.D + scores.I + scores.S + scores.C || 1;
  const pct = {
    D: Math.round((scores.D / total) * 100),
    I: Math.round((scores.I / total) * 100),
    S: Math.round((scores.S / total) * 100),
    C: Math.round((scores.C / total) * 100),
  };

  const sorted = Object.entries(pct).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const secondary = sorted[1][0];

  const profileData: Record<string, {
    title: string;
    strengths: string[];
    improvements: string[];
    roles: string[];
  }> = {
    D: {
      title: "Dominance — Người dẫn dắt",
      strengths: ["Ra quyết định nhanh chóng", "Tập trung vào mục tiêu", "Không ngại thách thức", "Dẫn dắt nhóm hiệu quả"],
      improvements: ["Cần lắng nghe nhiều hơn", "Kiên nhẫn với tiến độ của người khác"],
      roles: ["Team Lead", "Project Manager", "Business Director"],
    },
    I: {
      title: "Influence — Người truyền cảm hứng",
      strengths: ["Giao tiếp xuất sắc", "Tạo động lực cho team", "Sáng tạo trong giải pháp", "Xây dựng quan hệ tốt"],
      improvements: ["Cần chú ý đến chi tiết hơn", "Quản lý thời gian hiệu quả hơn"],
      roles: ["Business Development", "Sales Lead", "Marketing Manager"],
    },
    S: {
      title: "Steadiness — Người hỗ trợ",
      strengths: ["Kiên nhẫn và đáng tin cậy", "Lắng nghe tốt", "Tạo sự ổn định cho team", "Trung thành với tổ chức"],
      improvements: ["Cần chủ động hơn trong việc thể hiện ý kiến", "Thích nghi nhanh hơn với thay đổi"],
      roles: ["HR Manager", "Customer Success", "Operations Manager"],
    },
    C: {
      title: "Conscientiousness — Người phân tích",
      strengths: ["Phân tích sắc bén", "Chú ý đến chi tiết", "Đảm bảo chất lượng cao", "Tư duy hệ thống"],
      improvements: ["Cần linh hoạt hơn khi cần quyết định nhanh", "Tránh quá cầu toàn"],
      roles: ["Data Analyst", "QA Engineer", "Finance Controller"],
    },
  };

  const profile = profileData[dominant];

  return {
    summary: `${userName} có profile ${profile.title} với ${dominant} chiếm ưu thế (${pct[dominant as keyof typeof pct]}%). Kết hợp với ${discDescriptions[secondary]?.split("—")[1]?.trim() || secondary}, tạo nên phong cách làm việc ${dominant === "D" ? "quyết đoán và hiệu quả" : dominant === "I" ? "năng động và kết nối" : dominant === "S" ? "ổn định và đáng tin cậy" : "cẩn thận và chất lượng"}.`,
    strengths: profile.strengths,
    improvements: profile.improvements,
    suitableRoles: profile.roles,
    recommendation: `Với profile ${dominant}${secondary}, ${userName} phù hợp nhất với các vai trò đòi hỏi ${dominant === "D" ? "khả năng lãnh đạo và ra quyết định" : dominant === "I" ? "giao tiếp và xây dựng quan hệ" : dominant === "S" ? "sự ổn định và hỗ trợ đồng đội" : "tư duy phân tích và đảm bảo chất lượng"}. Nên phát triển thêm kỹ năng từ chiều ${sorted[sorted.length - 1][0]} để cân bằng profile.`,
  };
}
