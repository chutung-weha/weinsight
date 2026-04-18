import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeScoreMeta } from "@/lib/scoring";
import { calculateAll } from "@/lib/numerology";
import { LIFE_PATH } from "@/lib/numerology-descriptions";
import type { DISCScores } from "@/types/test";
import type { TestType } from "@prisma/client";

// Validate totalScores đọc từ DB trước khi dùng — Prisma Json field không có
// runtime guarantee về shape, cast trực tiếp sẽ bug nếu session là LOGIC/SITUATION.
const discScoresSchema = z.object({
  D: z.number().finite().nonnegative(),
  I: z.number().finite().nonnegative(),
  S: z.number().finite().nonnegative(),
  C: z.number().finite().nonnegative(),
});

function parseDISCScores(value: unknown): DISCScores | null {
  const result = discScoresSchema.safeParse(value);
  return result.success ? result.data : null;
}

interface GenerateInsightInput {
  sessionId: string;
}

export interface InsightResult {
  summary: string;
  personalityProfile: string;
  numerologyInsight: string;
  strengths: string[];
  improvements: string[];
  suitableRoles: string[];
  developmentPlan: string[];
  recommendation: string;
}

interface GenerateInsightResult {
  insight: InsightResult;
  config: { tone: "DIRECT" | "GENTLE" | "COACH"; objective: "RECRUITMENT" | "TRAINING" | "EVALUATION" } | null;
}

interface InsightEligibilityInput {
  testType: TestType | string;
  status?: string;
  candidateName?: string | null;
  dateOfBirth?: Date | null;
  occupation?: string | null;
}

interface InsightEligibilityResult {
  eligible: boolean;
  reason: string | null;
}

function sanitizeForPrompt(input: string | null | undefined, maxLength = 200): string {
  if (typeof input !== "string" || !input) return "";
  return input
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/\n/g, " ")
    // Escape double quotes + backslashes để user input không thoát ra khỏi JSON-like
    // prompt structure. Bảo vệ chống prompt injection dạng:
    //   name = 'A", "role": "system'
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .trim()
    .slice(0, maxLength);
}

function redactError(error: unknown): string {
  if (error instanceof Error) return error.name + ": " + error.message.slice(0, 200);
  if (typeof error === "string") return error.slice(0, 200);
  return "Unknown error";
}

const discProfiles = {
  D: {
    title: "Dominance",
    summary: "quyết đoán, tập trung kết quả và thích thử thách",
    strengths: ["ra quyết định nhanh", "chịu áp lực tốt", "đẩy tiến độ mạnh", "thấy rõ mục tiêu"],
    risks: ["thiếu kiên nhẫn", "dễ áp lực hóa tập thể", "bỏ qua cảm xúc đồng đội"],
    roles: ["Trưởng nhóm kinh doanh", "Project Manager", "Business Development Lead"],
  },
  I: {
    title: "Influence",
    summary: "cởi mở, truyền cảm hứng và giàu năng lượng kết nối",
    strengths: ["giao tiếp thuyết phục", "tạo động lực", "xây quan hệ nhanh", "lan tỏa tinh thần tích cực"],
    risks: ["thiếu chiều sâu chi tiết", "dễ cảm tính", "khó bền ở việc lặp lại"],
    roles: ["Sales", "Marketing", "Account Manager"],
  },
  S: {
    title: "Steadiness",
    summary: "ổn định, kiên nhẫn và đáng tin cậy",
    strengths: ["lắng nghe tốt", "hợp tác bền", "giữ nhịp đội nhóm", "kiên trì theo quy trình"],
    risks: ["ngại thay đổi nhanh", "ít va chạm cần thiết", "khó phản biện mạnh"],
    roles: ["HRBP", "Customer Success", "Operations Coordinator"],
  },
  C: {
    title: "Conscientiousness",
    summary: "cẩn trọng, logic và ưu tiên chất lượng",
    strengths: ["phân tích sắc", "chuẩn hóa tốt", "kiểm soát rủi ro", "giữ chất lượng đầu ra"],
    risks: ["dễ cầu toàn", "quyết định chậm", "ngại môi trường mơ hồ"],
    roles: ["Data Analyst", "QA Engineer", "Finance Analyst"],
  },
} as const;

export function getInsightEligibility(input: InsightEligibilityInput): InsightEligibilityResult {
  if (input.testType !== "DISC") {
    return {
      eligible: false,
      reason: "AI insight tổng hợp hiện chỉ hỗ trợ bài DISC vì cần đối chiếu DISC + thần số học + nghề nghiệp.",
    };
  }

  if (input.status && input.status !== "COMPLETED") {
    return { eligible: false, reason: "Phiên test chưa hoàn thành." };
  }

  if (!sanitizeForPrompt(input.candidateName, 100)) {
    return { eligible: false, reason: "Thiếu họ tên để tính thần số học." };
  }

  if (!input.dateOfBirth) {
    return { eligible: false, reason: "Thiếu ngày sinh để tính thần số học." };
  }

  if (!sanitizeForPrompt(input.occupation, 100)) {
    return { eligible: false, reason: "Thiếu nghề nghiệp để AI đối chiếu mức độ phù hợp công việc." };
  }

  return { eligible: true, reason: null };
}

function analyzeDisc(scores: DISCScores) {
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0) || 1;
  const percentages = {
    D: Math.round(((scores.D || 0) / total) * 100),
    I: Math.round(((scores.I || 0) / total) * 100),
    S: Math.round(((scores.S || 0) / total) * 100),
    C: Math.round(((scores.C || 0) / total) * 100),
  };

  const ranking = Object.entries(percentages)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key as keyof typeof percentages);

  return {
    dominant: ranking[0],
    secondary: ranking[1],
    weakest: ranking[ranking.length - 1],
    percentages,
  };
}

function inferOccupationFamily(rawOccupation: string) {
  const occupation = rawOccupation.toLowerCase();

  if (/(kinh doanh|sales|sale|marketing|account|business development|tư vấn|chăm sóc khách hàng)/.test(occupation)) {
    return {
      label: "nhóm nghề thiên về giao tiếp và ảnh hưởng",
      preferredDisc: ["I", "D"],
      preferredLifePaths: [3, 5, 1],
    };
  }

  if (/(kỹ sư|engineer|developer|lập trình|data|phân tích|analyst|qa|kiểm thử|tài chính|kế toán)/.test(occupation)) {
    return {
      label: "nhóm nghề thiên về phân tích và độ chính xác",
      preferredDisc: ["C", "S"],
      preferredLifePaths: [4, 7, 11, 22],
    };
  }

  if (/(quản lý|manager|lead|trưởng|giám đốc|director|project|product)/.test(occupation)) {
    return {
      label: "nhóm nghề thiên về dẫn dắt và chịu trách nhiệm kết quả",
      preferredDisc: ["D", "I"],
      preferredLifePaths: [1, 8, 22],
    };
  }

  if (/(nhân sự|hr|operations|vận hành|hành chính|giáo viên|đào tạo|support|hỗ trợ)/.test(occupation)) {
    return {
      label: "nhóm nghề thiên về hỗ trợ con người và giữ ổn định hệ thống",
      preferredDisc: ["S", "I"],
      preferredLifePaths: [2, 6, 9],
    };
  }

  return {
    label: "nhóm nghề chưa được phân loại rõ",
    preferredDisc: [] as string[],
    preferredLifePaths: [] as number[],
  };
}

function uniqueStrings(items: string[], limit = 6) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))].slice(0, limit);
}

// Trích text an toàn từ unknown. Groq đôi khi trả field text dưới dạng
// object {text: "..."}, {content: "..."} thay vì string — nếu dùng String()
// sẽ ra "[object Object]" rồi lưu thẳng vào DB String field, không recover được.
// Helper này extract text từ nested object trước khi ép chuỗi.
export function toInsightText(val: unknown, maxDepth = 3): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (maxDepth <= 0) return "";
  if (Array.isArray(val)) {
    return val
      .map((item) => toInsightText(item, maxDepth - 1))
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  if (typeof val === "object") {
    const record = val as Record<string, unknown>;
    // Thử các key phổ biến Groq hay dùng
    for (const key of ["text", "content", "summary", "description", "value", "message"]) {
      const extracted = toInsightText(record[key], maxDepth - 1);
      if (extracted) return extracted;
    }
    // Fallback: join tất cả value (phòng khi Groq trả object lạ)
    const parts = Object.values(record)
      .map((item) => toInsightText(item, maxDepth - 1))
      .filter(Boolean);
    return parts.join(" ").trim();
  }
  return "";
}

function normalizeInsightResult(input: Partial<InsightResult>): InsightResult {
  return {
    summary: toInsightText(input.summary),
    personalityProfile: toInsightText(input.personalityProfile),
    numerologyInsight: toInsightText(input.numerologyInsight),
    strengths: uniqueStrings(Array.isArray(input.strengths) ? input.strengths.map((i) => toInsightText(i)) : [], 5),
    improvements: uniqueStrings(Array.isArray(input.improvements) ? input.improvements.map((i) => toInsightText(i)) : [], 5),
    suitableRoles: uniqueStrings(Array.isArray(input.suitableRoles) ? input.suitableRoles.map((i) => toInsightText(i)) : [], 5),
    developmentPlan: uniqueStrings(Array.isArray(input.developmentPlan) ? input.developmentPlan.map((i) => toInsightText(i)) : [], 5),
    recommendation: toInsightText(input.recommendation),
  };
}

function getSessionQuestionIds(answers: Array<{ questionId: string }>): string[] {
  return [...new Set(answers.map((answer) => answer.questionId).filter(Boolean))];
}

function buildFallbackInsight(input: {
  scores: DISCScores;
  candidateName: string;
  occupation: string;
  numerology: ReturnType<typeof calculateAll>;
}): InsightResult {
  const disc = analyzeDisc(input.scores);
  // Guard: nếu DISCScores toàn 0 hoặc dominant không nằm trong discProfiles (không nên xảy ra
  // vì analyzeDisc đã ép key D/I/S/C, nhưng defensive), fallback về D để tránh crash.
  const dominantKey = (disc.dominant in discProfiles ? disc.dominant : "D") as keyof typeof discProfiles;
  const secondaryKey = (disc.secondary in discProfiles ? disc.secondary : "I") as keyof typeof discProfiles;
  const dominantProfile = discProfiles[dominantKey];
  const secondaryProfile = discProfiles[secondaryKey];
  const lifePathData = LIFE_PATH[input.numerology.lifePath];
  const occupationFamily = inferOccupationFamily(input.occupation);

  const discFit = occupationFamily.preferredDisc.includes(dominantKey)
    ? `Profile DISC trội ${dominantKey} đang khá khớp với ${occupationFamily.label}.`
    : occupationFamily.preferredDisc.length > 0
      ? `Nghề nghiệp hiện tại thiên về ${occupationFamily.label}, trong khi DISC trội lại là ${dominantKey}; đây là điểm cần theo dõi để tránh lệch vai trò.`
      : `Nghề nghiệp hiện tại chưa đủ dữ liệu để đối chiếu sâu theo cụm nghề, nên mức độ phù hợp được đánh giá ở mức định hướng.`;

  const lifePathFit = occupationFamily.preferredLifePaths.includes(input.numerology.lifePath)
    ? `Số chủ đạo ${input.numerology.lifePath} cũng ủng hộ hướng phát triển nghề nghiệp hiện tại.`
    : `Số chủ đạo ${input.numerology.lifePath} cho thấy động lực cốt lõi có thể khác kỳ vọng của vai trò hiện tại, nên cần thiết kế công việc phù hợp hơn.`;

  const strengths = uniqueStrings([
    `Nổi bật ở chiều ${dominantKey} (${dominantProfile.summary}).`,
    ...dominantProfile.strengths.map((item) => `Có xu hướng ${item}.`),
    ...(lifePathData?.strengths || []).map((item) => `Theo thần số học, điểm mạnh nền là ${item.toLowerCase()}.`),
  ], 4);

  const improvements = uniqueStrings([
    ...dominantProfile.risks.map((item) => `Cần kiểm soát xu hướng ${item}.`),
    ...(lifePathData?.weaknesses || []).map((item) => `Theo thần số học, cần lưu ý ${item.toLowerCase()}.`),
    `Bổ sung thêm năng lực ở chiều ${disc.weakest} để profile làm việc cân bằng hơn.`,
  ], 4);

  const suitableRoles = uniqueStrings([
    ...dominantProfile.roles,
    ...(lifePathData?.careers || []),
    input.occupation,
  ], 4);

  const developmentPlan = uniqueStrings([
    `Trong 30-60 ngày, giao việc bám vào thế mạnh ${dominantProfile.title} nhưng có KPI rõ để kiểm chứng độ bền.`,
    `Trong 60-90 ngày, thêm một mục tiêu phát triển ở chiều ${disc.weakest} để tránh lệch một màu hành vi.`,
    `Thiết kế công việc theo hướng ${occupationFamily.label}, nhưng vẫn giữ không gian cho động lực lõi của số chủ đạo ${input.numerology.lifePath}.`,
  ], 4);

  return {
    summary: `${input.candidateName} có profile DISC trội ${dominantKey}/${secondaryKey}, kết hợp với số chủ đạo ${input.numerology.lifePath}. Tổng thể cho thấy phong cách làm việc ${dominantProfile.summary}, và mức phù hợp với nghề nghiệp hiện tại "${input.occupation}" ở mức ${occupationFamily.preferredDisc.includes(dominantKey) ? "tốt" : "cần hiệu chỉnh"}.`,
    personalityProfile: `DISC cho thấy chiều trội là ${dominantKey} (${dominantProfile.summary}), còn chiều phụ là ${secondaryKey} (${secondaryProfile.summary}). Điều này cho thấy cách làm việc tự nhiên của ${input.candidateName} nghiêng về ${dominantProfile.summary}, nhưng vẫn có lớp bổ trợ từ ${secondaryProfile.summary}. ${discFit}`,
    numerologyInsight: `Số chủ đạo ${input.numerology.lifePath}${lifePathData ? ` - ${lifePathData.title}` : ""} cho thấy động lực lõi thiên về ${lifePathData?.summary?.toLowerCase() || "phát triển bản thân và tạo giá trị"}. Chỉ số sứ mệnh ${input.numerology.expression}, linh hồn ${input.numerology.soulUrge}, và nhân cách ${input.numerology.personality} bổ sung góc nhìn về cách thể hiện năng lực ra bên ngoài. ${lifePathFit}`,
    strengths,
    improvements,
    suitableRoles,
    developmentPlan,
    recommendation: `${discFit} ${lifePathFit} Khuyến nghị là dùng nghề nghiệp hiện tại làm bối cảnh đánh giá, nhưng giao vai trò và KPI theo đúng thế mạnh DISC trội và động lực của số chủ đạo, thay vì chỉ nhìn vào chức danh hiện tại.`,
  };
}

export async function generateInsight({ sessionId }: GenerateInsightInput): Promise<GenerateInsightResult> {
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
    prisma.aIConfig.findFirst({ where: { active: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  if (!session || session.status !== "COMPLETED" || !session.totalScores) {
    throw new Error("Session chưa hoàn thành.");
  }

  const eligibility = getInsightEligibility({
    testType: session.testType,
    status: session.status,
    candidateName: session.candidateName,
    dateOfBirth: session.dateOfBirth,
    occupation: session.occupation,
  });

  if (!eligibility.eligible) {
    throw new Error(eligibility.reason || "Session không đủ điều kiện tạo AI insight.");
  }

  const scores = parseDISCScores(session.totalScores);
  if (!scores) {
    throw new Error("DISC scores không hợp lệ hoặc thiếu.");
  }
  const candidateName = sanitizeForPrompt(session.candidateName || session.user.name || "Ứng viên", 100);
  const occupation = sanitizeForPrompt(session.occupation, 100);
  const sessionDob = session.dateOfBirth as Date;
  const numerology = calculateAll(
    candidateName,
    sessionDob.getUTCDate(),
    sessionDob.getUTCMonth() + 1,
    sessionDob.getUTCFullYear()
  );
  const lifePathData = LIFE_PATH[numerology.lifePath];
  const disc = analyzeDisc(scores);
  const { maxScores } = await computeScoreMeta(session.testType, {
    questionIds: getSessionQuestionIds(session.answers),
  });

  if (!process.env.GROQ_API_KEY) {
    return { insight: buildFallbackInsight({ scores, candidateName, occupation, numerology }), config };
  }

  const toneMap = {
    DIRECT: "thẳng, rõ kết luận, tránh vòng vo",
    GENTLE: "mềm nhưng vẫn cụ thể, ưu tiên ngôn ngữ xây dựng",
    COACH: "đóng vai coach nhân sự cấp cao, cân bằng giữa phản biện và định hướng phát triển",
  };

  const objectiveMap = {
    RECRUITMENT: "ra quyết định tuyển dụng và phân vai thử việc",
    TRAINING: "thiết kế kế hoạch đào tạo và phát triển",
    EVALUATION: "đánh giá mức độ phù hợp vai trò hiện tại và định hướng tiếp theo",
  };

  const answersContext = session.answers
    .map((item) => `Q: ${sanitizeForPrompt(item.question.content, 400)}\nA: ${sanitizeForPrompt(item.answer.text, 400)}`)
    .join("\n\n");

  const prompt = `Bạn là chuyên gia đánh giá nhân sự cấp cao. Hãy đưa ra ĐÁNH GIÁ TỔNG THỂ dựa trên 3 nguồn duy nhất:
1. Nghề nghiệp hiện tại
2. Kết quả DISC
3. Thần số học Pythagoras

Nguyên tắc bắt buộc:
- Luôn gọi người được đánh giá là "bạn".
- Không được nói như thể đang đánh giá một bài LOGIC hay SITUATION; đây là bài DISC có đối chiếu thần số học và nghề nghiệp.
- Không được suy diễn vượt dữ liệu. Nếu có mâu thuẫn giữa nghề nghiệp hiện tại và profile, phải chỉ ra thẳng.
- Phần recommendation phải mang tính hành động, không chỉ mô tả.

Thông tin nhân sự:
- Tên: ${candidateName}
- Nghề nghiệp hiện tại: ${occupation}
- Đơn vị: ${sanitizeForPrompt(session.user.department, 100) || "Chưa xác định"}

Kết quả DISC:
- D: ${scores.D}/${maxScores.D || "?"} (${disc.percentages.D}%)
- I: ${scores.I}/${maxScores.I || "?"} (${disc.percentages.I}%)
- S: ${scores.S}/${maxScores.S || "?"} (${disc.percentages.S}%)
- C: ${scores.C}/${maxScores.C || "?"} (${disc.percentages.C}%)
- Chiều trội: ${disc.dominant}
- Chiều phụ: ${disc.secondary}

Kết quả thần số học:
- Số chủ đạo: ${numerology.lifePath}${lifePathData ? ` - ${lifePathData.title}` : ""}
- Chỉ số thái độ: ${numerology.attitude}
- Năng lực tự nhiên: ${numerology.naturalAbility}
- Chỉ số sứ mệnh: ${numerology.expression}
- Chỉ số linh hồn: ${numerology.soulUrge}
- Chỉ số nhân cách: ${numerology.personality}
${lifePathData ? `- Mô tả số chủ đạo: ${lifePathData.summary}` : ""}
${lifePathData ? `- Điểm mạnh numerology: ${lifePathData.strengths.join(", ")}` : ""}
${lifePathData ? `- Điểm yếu numerology: ${lifePathData.weaknesses.join(", ")}` : ""}
${lifePathData ? `- Nghề nghiệp numerology gợi ý: ${lifePathData.careers.join(", ")}` : ""}

Một số câu trả lời DISC:
${answersContext}

Mục tiêu đánh giá:
- Tone: ${toneMap[config?.tone || "COACH"]}
- Mục tiêu: ${objectiveMap[config?.objective || "EVALUATION"]}
${config?.customPrompt ? `- Hướng dẫn thêm: ${sanitizeForPrompt(config.customPrompt, 500)}` : ""}

Trả lời bằng JSON thuần với đúng format:
{"summary":"Tóm tắt 3-4 câu về mức độ phù hợp tổng thể giữa DISC, thần số học và nghề nghiệp hiện tại","personalityProfile":"Phân tích tích hợp DISC + nghề nghiệp: cách làm việc, điểm lệch, điểm phù hợp","numerologyInsight":"Phân tích riêng phần thần số học và cách nó bổ sung/điều chỉnh góc nhìn DISC","strengths":["..."],"improvements":["..."],"suitableRoles":["..."],"developmentPlan":["..."],"recommendation":"Khuyến nghị tổng hợp mang tính hành động, gắn với nghề nghiệp hiện tại"}
`;

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 30_000);

  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia đánh giá nhân sự. Bạn phản biện sắc nhưng công bằng, luôn bám dữ liệu, không tâng bốc vô căn cứ.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2048,
        temperature: 0.5,
      }),
      signal: abortController.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    console.error("[generate-insight] Groq fetch failed:", redactError(error));
    return { insight: buildFallbackInsight({ scores, candidateName, occupation, numerology }), config };
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    console.error("[generate-insight] Groq API non-2xx:", response.status);
    return { insight: buildFallbackInsight({ scores, candidateName, occupation, numerology }), config };
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    console.error("[generate-insight] Groq response is not valid JSON, using fallback");
    return { insight: buildFallbackInsight({ scores, candidateName, occupation, numerology }), config };
  }

  const content = (result as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content || "";

  try {
    const parsed = normalizeInsightResult(JSON.parse(content) as Partial<InsightResult>);
    // Siết required fields: summary, recommendation, personalityProfile, numerologyInsight
    // đều là text quan trọng user sẽ đọc. Arrays strengths/improvements cần >= 1 item.
    const missingText =
      !parsed.summary ||
      !parsed.recommendation ||
      !parsed.personalityProfile ||
      !parsed.numerologyInsight;
    const missingArrays =
      parsed.strengths.length === 0 ||
      parsed.improvements.length === 0 ||
      parsed.suitableRoles.length === 0;
    if (missingText || missingArrays) {
      throw new Error("Insight content is incomplete.");
    }
    return { insight: parsed, config };
  } catch {
    console.error("[generate-insight] Failed to parse Groq content, using fallback");
    return { insight: buildFallbackInsight({ scores, candidateName, occupation, numerology }), config };
  }
}

export async function generateAndSaveInsight(sessionId: string) {
  const { insight, config } = await generateInsight({ sessionId });

  return prisma.aIInsight.upsert({
    where: { sessionId },
    update: {
      summary: insight.summary,
      strengths: insight.strengths,
      improvements: insight.improvements,
      suitableRoles: insight.suitableRoles,
      recommendation: insight.recommendation,
      fullResponse: JSON.stringify(insight),
      tone: config?.tone || "COACH",
      objective: config?.objective || "EVALUATION",
    },
    create: {
      sessionId,
      summary: insight.summary,
      strengths: insight.strengths,
      improvements: insight.improvements,
      suitableRoles: insight.suitableRoles,
      recommendation: insight.recommendation,
      fullResponse: JSON.stringify(insight),
      tone: config?.tone || "COACH",
      objective: config?.objective || "EVALUATION",
    },
  });
}
