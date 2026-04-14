import { prisma } from "@/lib/prisma";
import { computeScoreMeta } from "@/lib/scoring";
import { calculateAll } from "@/lib/numerology";
import { LIFE_PATH } from "@/lib/numerology-descriptions";
import type { DISCScores, LogicScores, SituationScores } from "@/types/test";

interface GenerateInsightInput {
  sessionId: string;
}

interface InsightResult {
  summary: string;
  personalityProfile: string;
  numerologyInsight: string;
  strengths: string[];
  improvements: string[];
  suitableRoles: string[];
  developmentPlan: string[];
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
    prisma.aIConfig.findFirst({ where: { active: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  if (!session || session.status !== "COMPLETED" || !session.totalScores) {
    throw new Error("Session chưa hoàn thành");
  }

  const scores = session.totalScores as Record<string, number>;
  const tone = config?.tone || "COACH";
  const objective = config?.objective || "EVALUATION";
  const candidateName = session.candidateName || session.user.name;
  const sessionDob = session.dateOfBirth;
  const sessionOccupation = session.occupation;

  const { maxScores, questionCount } = await computeScoreMeta(session.testType);

  // Tính thần số học nếu có đủ thông tin
  let numerologyContext = "";
  if (candidateName && sessionDob) {
    const dob = new Date(sessionDob);
    const numResult = calculateAll(candidateName, dob.getDate(), dob.getMonth() + 1, dob.getFullYear());
    const lifePathDesc = LIFE_PATH[numResult.lifePath];
    numerologyContext = `
Kết quả Thần số học Pythagoras (tính từ họ tên + ngày sinh):
- Số chủ đạo (Life Path): ${numResult.lifePath} — "${lifePathDesc?.title || ""}" — ${lifePathDesc?.summary || ""}
- Chỉ số thái độ (Attitude): ${numResult.attitude}
- Năng lực tự nhiên (Natural Ability): ${numResult.naturalAbility}
- Chỉ số sứ mệnh (Expression): ${numResult.expression}
- Chỉ số linh hồn (Soul Urge): ${numResult.soulUrge}
- Chỉ số nhân cách (Personality): ${numResult.personality}
${lifePathDesc ? `\nĐiểm mạnh theo thần số học: ${lifePathDesc.strengths.join(", ")}\nĐiểm yếu theo thần số học: ${lifePathDesc.weaknesses.join(", ")}\nNghề nghiệp phù hợp theo thần số học: ${lifePathDesc.careers.join(", ")}` : ""}`;
  }

  // Nếu chưa có GROQ_API_KEY → dùng rule-based fallback
  if (!process.env.GROQ_API_KEY) {
    return { insight: generateFallbackInsight(scores, session.testType, candidateName, questionCount, maxScores), config };
  }

  // Gọi Gemini API
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

  const scoreDescriptions = getScoreDescriptions(session.testType);

  const answersContext = session.answers
    .map((a) => `Q: ${a.question.content}\nA: ${a.answer.text}`)
    .join("\n\n");

  const dobStr = sessionDob
    ? new Date(sessionDob).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "Chưa xác định";

  const systemMessage = `Bạn là chuyên gia đánh giá nhân sự cấp cao của WEHA GROUP. Bạn luôn xưng hô ngôi thứ hai là "bạn" khi nói về nhân sự được đánh giá. TUYỆT ĐỐI KHÔNG dùng "ông", "ông ta", "anh", "chị", "họ", "người này", "nhân sự này". Luôn dùng "bạn" (VD: "bạn có khả năng...", "bạn nên...", "Điểm mạnh của bạn là..."). Giọng văn thân thiện, gần gũi như đang coaching trực tiếp cho người đó.`;

  const prompt = `Hãy phân tích TOÀN DIỆN và CHI TIẾT kết quả DISC + Thần số học Pythagoras sau đây. Nhớ: LUÔN gọi người được đánh giá là "bạn", KHÔNG BAO GIỜ gọi là "ông", "ông ta", "anh ấy", "chị ấy" hay dùng tên riêng kèm ngôi thứ ba.

Thông tin nhân sự:
- Tên: ${candidateName}
- Ngày sinh: ${dobStr}
- Nghề nghiệp: ${sessionOccupation || "Chưa xác định"}
- Đơn vị: ${session.user.department || "Chưa xác định"}

═══ KẾT QUẢ DISC TEST (${questionCount} câu hỏi) ═══
${Object.entries(scores).map(([k, v]) => `- ${k} (${scoreDescriptions[k] || k}): ${v}/${maxScores[k] || "?"} điểm (${maxScores[k] ? Math.round((v / maxScores[k]) * 100) : "?"}%)`).join("\n")}
${numerologyContext ? `\n═══ KẾT QUẢ THẦN SỐ HỌC PYTHAGORAS ═══${numerologyContext}` : ""}

═══ CÂU TRẢ LỜI CHI TIẾT ═══
${answersContext}

Yêu cầu phân tích:
- Tone: ${toneMap[tone as keyof typeof toneMap]}
- Mục tiêu: ${objectiveMap[objective as keyof typeof objectiveMap]}
${sessionOccupation ? `- Cân nhắc nghề nghiệp "${sessionOccupation}" khi đưa ra nhận định` : ""}
${config?.customPrompt ? `- Hướng dẫn thêm: ${config.customPrompt}` : ""}
- KẾT HỢP cả DISC và Thần số học để phân tích toàn diện — tìm điểm tương đồng và bổ sung giữa 2 hệ thống
- Đưa ra nhận định sâu sắc, cụ thể, KHÔNG chung chung
- Mỗi mục strengths/improvements/developmentPlan phải có ít nhất 3-4 items chi tiết

Trả lời bằng JSON với format chính xác sau (KHÔNG có markdown, KHÔNG có code block):
{"summary":"Tóm tắt 3-4 câu tổng quan về profile nhân sự, kết hợp DISC + thần số học","personalityProfile":"Phân tích chi tiết tính cách: DISC profile chính + phụ kết hợp với số chủ đạo và các chỉ số thần số học cho thấy điều gì về con người này (3-5 câu)","numerologyInsight":"Phân tích riêng về thần số học: số chủ đạo + sứ mệnh + linh hồn cho thấy tiềm năng ẩn giấu gì, hướng phát triển tự nhiên (3-5 câu)","strengths":["Điểm mạnh 1 (chi tiết)","Điểm mạnh 2","Điểm mạnh 3","Điểm mạnh 4"],"improvements":["Cần cải thiện 1 (chi tiết)","Cần cải thiện 2","Cần cải thiện 3"],"suitableRoles":["Vai trò phù hợp 1","Vai trò 2","Vai trò 3"],"developmentPlan":["Bước 1: Hành động cụ thể trong 1-3 tháng","Bước 2: Mục tiêu 3-6 tháng","Bước 3: Định hướng dài hạn"],"recommendation":"Khuyến nghị tổng hợp chi tiết cho người này, kết hợp cả DISC + thần số học (3-5 câu)"}`;

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
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2048,
        temperature: 0.7,
      }),
      signal: abortController.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    console.error("Groq API timeout or network error:", err);
    return { insight: generateFallbackInsight(scores, session.testType, candidateName, questionCount, maxScores), config };
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    console.error("Groq API error:", response.status);
    return { insight: generateFallbackInsight(scores, session.testType, candidateName, questionCount, maxScores), config };
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(text) as InsightResult;
    return { insight: parsed, config };
  } catch {
    console.error("Failed to parse Groq response, using fallback");
    return { insight: generateFallbackInsight(scores, session.testType, candidateName, questionCount, maxScores), config };
  }
}

// Score descriptions cho mỗi loại test (dùng trong prompt)
function getScoreDescriptions(testType: string): Record<string, string> {
  switch (testType) {
    case "DISC":
      return discDescriptions;
    case "LOGIC":
      return {
        correct: "Số câu trả lời đúng",
        reasoning: "Điểm tư duy logic & suy luận",
      };
    case "SITUATION":
      return {
        leadership: "Khả năng lãnh đạo",
        teamwork: "Tinh thần đồng đội",
        communication: "Kỹ năng giao tiếp",
        problemSolving: "Giải quyết vấn đề",
      };
    default:
      return {};
  }
}

// Rule-based fallback khi không có API key
function generateFallbackInsight(
  scores: Record<string, number>,
  testType: string,
  userName: string,
  questionCount: number,
  maxScores: Record<string, number>,
): InsightResult {
  switch (testType) {
    case "DISC":
      return generateDISCFallback(scores as unknown as DISCScores, userName);
    case "LOGIC":
      return generateLogicFallback(scores as unknown as LogicScores, userName, questionCount, maxScores);
    case "SITUATION":
      return generateSituationFallback(scores as unknown as SituationScores, userName, maxScores);
    default:
      return {
        summary: `${userName} đã hoàn thành bài test ${testType}.`,
        personalityProfile: "Chưa có đủ dữ liệu để phân tích.",
        numerologyInsight: "Cần cấu hình GROQ_API_KEY để nhận phân tích chi tiết.",
        strengths: ["Đã hoàn thành bài test"],
        improvements: ["Cần thêm dữ liệu để đánh giá"],
        suitableRoles: ["Chưa xác định"],
        developmentPlan: ["Cấu hình GROQ_API_KEY để nhận kế hoạch phát triển"],
        recommendation: "Vui lòng cấu hình GROQ_API_KEY để nhận AI Insight chi tiết.",
      };
  }
}

function generateDISCFallback(scores: DISCScores, userName: string): InsightResult {
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
    personalityProfile: `Profile DISC chính: ${profile.title}. Chiều phụ: ${discDescriptions[secondary]?.split("—")[0]?.trim() || secondary}. Phong cách làm việc thiên về ${dominant === "D" ? "dẫn dắt, ra quyết định nhanh" : dominant === "I" ? "kết nối con người, truyền cảm hứng" : dominant === "S" ? "hỗ trợ, duy trì sự ổn định" : "phân tích, đảm bảo chất lượng"}.`,
    numerologyInsight: "Cần cấu hình GROQ_API_KEY để nhận phân tích thần số học chi tiết từ AI.",
    strengths: profile.strengths,
    improvements: profile.improvements,
    suitableRoles: profile.roles,
    developmentPlan: [
      `Phát triển kỹ năng ${sorted[sorted.length - 1][0]} trong 1-3 tháng tới`,
      `Tham gia các dự án đòi hỏi ${dominant === "D" ? "teamwork" : dominant === "I" ? "phân tích chi tiết" : dominant === "S" ? "ra quyết định nhanh" : "giao tiếp nhóm"}`,
      `Định hướng dài hạn: cân bằng profile DISC để trở thành nhân sự toàn diện`,
    ],
    recommendation: `Với profile ${dominant}${secondary}, ${userName} phù hợp nhất với các vai trò đòi hỏi ${dominant === "D" ? "khả năng lãnh đạo và ra quyết định" : dominant === "I" ? "giao tiếp và xây dựng quan hệ" : dominant === "S" ? "sự ổn định và hỗ trợ đồng đội" : "tư duy phân tích và đảm bảo chất lượng"}. Nên phát triển thêm kỹ năng từ chiều ${sorted[sorted.length - 1][0]} để cân bằng profile.`,
  };
}

function generateLogicFallback(
  scores: LogicScores,
  userName: string,
  questionCount: number,
  maxScores: Record<string, number>,
): InsightResult {
  const correctCount = scores.correct || 0;
  const reasoningScore = scores.reasoning || 0;
  const totalQuestions = maxScores.correct || questionCount || 1;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);
  const maxReasoning = maxScores.reasoning || 1;
  const reasoningPct = Math.round((reasoningScore / maxReasoning) * 100);

  let level: string;
  let strengths: string[];
  let improvements: string[];
  let roles: string[];

  if (accuracy >= 80) {
    level = "xuất sắc";
    strengths = [
      "Tư duy logic sắc bén, phân tích nhanh",
      "Khả năng suy luận trừu tượng mạnh",
      "Giải quyết vấn đề phức tạp hiệu quả",
      "Xử lý dữ liệu và con số chính xác",
    ];
    improvements = [
      "Cần cân bằng giữa phân tích và hành động",
      "Phát triển thêm kỹ năng giao tiếp để truyền đạt ý tưởng",
    ];
    roles = ["Data Analyst", "Software Engineer", "Strategy Consultant", "Finance Analyst"];
  } else if (accuracy >= 60) {
    level = "khá tốt";
    strengths = [
      "Nền tảng tư duy logic vững",
      "Khả năng nhận diện pattern cơ bản",
      "Xử lý được các bài toán trung bình",
    ];
    improvements = [
      "Cần rèn luyện thêm tư duy trừu tượng",
      "Tăng tốc độ phân tích và ra quyết định",
      "Luyện tập với các bài toán logic phức tạp hơn",
    ];
    roles = ["Project Coordinator", "Business Analyst", "Operations Specialist"];
  } else {
    level = "cần phát triển thêm";
    strengths = [
      "Có tiềm năng phát triển tư duy logic",
      "Kiên nhẫn hoàn thành bài test đầy đủ",
    ];
    improvements = [
      "Cần luyện tập tư duy logic thường xuyên",
      "Học cách chia nhỏ vấn đề phức tạp",
      "Rèn kỹ năng phân tích dữ liệu cơ bản",
      "Tập trung vào từng bước suy luận",
    ];
    roles = ["Customer Support", "Administrative Assistant", "Content Creator"];
  }

  return {
    summary: `${userName} đạt ${correctCount}/${questionCount} câu đúng (${accuracy}%) trong bài Logic Test — mức ${level}. Điểm tư duy suy luận: ${reasoningPct}%.`,
    personalityProfile: `Năng lực tư duy logic ở mức ${level}. Tỷ lệ chính xác ${accuracy}%, khả năng suy luận ${reasoningPct}%.`,
    numerologyInsight: "Cần cấu hình GROQ_API_KEY để nhận phân tích thần số học chi tiết.",
    strengths,
    improvements,
    suitableRoles: roles,
    developmentPlan: [
      accuracy >= 80 ? "Tham gia các dự án chiến lược đòi hỏi phân tích phức tạp" : "Luyện tập tư duy logic 15 phút mỗi ngày",
      "Tham gia khóa đào tạo tư duy phân tích nâng cao",
      "Áp dụng tư duy logic vào quyết định công việc hàng ngày",
    ],
    recommendation: accuracy >= 80
      ? `${userName} có tư duy logic rất tốt, phù hợp với các vị trí đòi hỏi phân tích dữ liệu và giải quyết vấn đề phức tạp. Nên khai thác thế mạnh này trong các dự án chiến lược.`
      : accuracy >= 60
        ? `${userName} có nền tảng logic ổn. Nên tham gia các khóa đào tạo tư duy phân tích để nâng cao khả năng ra quyết định dựa trên dữ liệu.`
        : `${userName} cần được hỗ trợ phát triển tư duy logic. Đề xuất tham gia chương trình đào tạo kỹ năng phân tích cơ bản và giải quyết vấn đề.`,
  };
}

function generateSituationFallback(
  scores: SituationScores,
  userName: string,
  maxScores: Record<string, number>,
): InsightResult {
  const dimensions = {
    leadership: { label: "Lãnh đạo", score: scores.leadership || 0 },
    teamwork: { label: "Đồng đội", score: scores.teamwork || 0 },
    communication: { label: "Giao tiếp", score: scores.communication || 0 },
    problemSolving: { label: "Giải quyết vấn đề", score: scores.problemSolving || 0 },
  };

  const totalScore = Object.values(dimensions).reduce((a, d) => a + d.score, 0) || 1;
  const totalMax = Object.keys(dimensions).reduce((a, k) => a + (maxScores[k] || 1), 0) || 1;
  const sorted = Object.entries(dimensions).sort((a, b) => b[1].score - a[1].score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const overallPct = Math.round((totalScore / totalMax) * 100);

  const dimensionProfiles: Record<string, { strengths: string[]; roles: string[] }> = {
    leadership: {
      strengths: ["Khả năng dẫn dắt và ra quyết định trong tình huống khó", "Chủ động đề xuất giải pháp", "Dám chịu trách nhiệm"],
      roles: ["Team Lead", "Project Manager", "Department Head"],
    },
    teamwork: {
      strengths: ["Phối hợp tốt với đồng đội", "Biết cân bằng lợi ích cá nhân và nhóm", "Xây dựng niềm tin trong team"],
      roles: ["Scrum Master", "HR Business Partner", "Customer Success Manager"],
    },
    communication: {
      strengths: ["Giao tiếp hiệu quả trong tình huống phức tạp", "Biết lắng nghe và thuyết phục", "Xử lý xung đột khéo léo"],
      roles: ["Account Manager", "Public Relations", "Business Development"],
    },
    problemSolving: {
      strengths: ["Phân tích tình huống một cách có hệ thống", "Tìm giải pháp sáng tạo và thực tế", "Đánh giá rủi ro tốt"],
      roles: ["Strategy Consultant", "Operations Manager", "Product Manager"],
    },
  };

  const strongProfile = dimensionProfiles[strongest[0]];
  const weakLabel = weakest[1].label;

  return {
    summary: `${userName} thể hiện năng lực xử lý tình huống ở mức ${overallPct >= 70 ? "tốt" : overallPct >= 50 ? "khá" : "cần phát triển"} (${overallPct}%). Điểm mạnh nhất: ${strongest[1].label} (${strongest[1].score} điểm). Cần cải thiện: ${weakLabel} (${weakest[1].score} điểm).`,
    personalityProfile: `Năng lực xử lý tình huống: ${strongest[1].label} là thế mạnh nổi bật, ${weakLabel} cần được phát triển thêm.`,
    numerologyInsight: "Cần cấu hình GROQ_API_KEY để nhận phân tích thần số học chi tiết.",
    strengths: strongProfile.strengths,
    developmentPlan: [
      `Tập trung cải thiện ${weakLabel.toLowerCase()} trong 1-3 tháng`,
      "Tham gia các buổi roleplay tình huống thực tế",
      `Phát huy thế mạnh ${strongest[1].label.toLowerCase()} trong các dự án nhóm`,
    ],
    improvements: [
      `Cần phát triển kỹ năng ${weakLabel.toLowerCase()}`,
      `Rèn luyện thêm qua các tình huống thực tế`,
      overallPct < 60 ? "Tham gia chương trình đào tạo kỹ năng mềm" : "Mentor hoặc coaching để nâng cao năng lực",
    ],
    suitableRoles: strongProfile.roles,
    recommendation: `${userName} có thế mạnh về ${strongest[1].label.toLowerCase()}, phù hợp với vai trò cần ${strongest[0] === "leadership" ? "khả năng dẫn dắt" : strongest[0] === "teamwork" ? "tinh thần hợp tác" : strongest[0] === "communication" ? "kỹ năng giao tiếp" : "tư duy giải quyết vấn đề"}. Nên tập trung phát triển thêm ${weakLabel.toLowerCase()} để trở thành nhân sự toàn diện hơn.`,
  };
}
