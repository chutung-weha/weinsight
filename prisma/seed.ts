import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { TestType, Role, AITone, AIObjective } from "../src/generated/prisma/enums";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminSeedPassword = process.env.SEED_ADMIN_PASSWORD;
  const demoSeedPassword = process.env.SEED_DEMO_PASSWORD;
  console.log("🌱 Seeding database...");

  // ─── AI Config mặc định ────────────────────────────────
  await prisma.aIConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      tone: AITone.COACH,
      objective: AIObjective.EVALUATION,
      customPrompt:
        "Hãy đánh giá nhân sự này theo tiêu chuẩn WEHA, đưa ra nhận định rõ ràng, không chung chung. Kết hợp kết quả test với tri thức doanh nghiệp để đưa ra insight.",
      active: true,
    },
  });

  // ─── Admin user ────────────────────────────────────────
  if (adminSeedPassword) {
    await prisma.user.upsert({
      where: { email: "admin@wehagroup.vn" },
      update: {},
      create: {
        email: "admin@wehagroup.vn",
        name: "WEHA Admin",
        passwordHash: await hash(adminSeedPassword, 12),
        role: Role.ADMIN,
        department: "Technology",
      },
    });
  }

  // ─── Demo candidate ───────────────────────────────────
  if (demoSeedPassword) {
    await prisma.user.upsert({
      where: { email: "demo@wehagroup.vn" },
      update: {},
      create: {
        email: "demo@wehagroup.vn",
        name: "Demo Candidate",
        passwordHash: await hash(demoSeedPassword, 12),
        role: Role.CANDIDATE,
        department: "Sales",
      },
    });
  }

  // ─── DISC Questions (20 câu) ──────────────────────────
  const discQuestions = [
    {
      order: 1,
      content: "Khi đối mặt với một vấn đề khó, bạn thường:",
      answers: [
        { order: 1, text: "Đưa ra quyết định nhanh chóng và hành động ngay", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Thảo luận với mọi người để tìm giải pháp sáng tạo", scores: { D: 1, I: 4, S: 1, C: 0 } },
        { order: 3, text: "Bình tĩnh phân tích và tham khảo ý kiến đồng đội", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Nghiên cứu kỹ dữ liệu trước khi đưa ra phương án", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 2,
      content: "Trong một cuộc họp nhóm, bạn thường:",
      answers: [
        { order: 1, text: "Dẫn dắt cuộc thảo luận và đưa ra hướng đi", scores: { D: 4, I: 2, S: 0, C: 0 } },
        { order: 2, text: "Truyền cảm hứng và khích lệ mọi người tham gia", scores: { D: 0, I: 4, S: 2, C: 0 } },
        { order: 3, text: "Lắng nghe và hỗ trợ khi cần thiết", scores: { D: 0, I: 0, S: 4, C: 2 } },
        { order: 4, text: "Ghi chép và tổng hợp thông tin chi tiết", scores: { D: 0, I: 0, S: 2, C: 4 } },
      ],
    },
    {
      order: 3,
      content: "Khi làm việc nhóm, điều bạn coi trọng nhất là:",
      answers: [
        { order: 1, text: "Kết quả cuối cùng và hiệu suất công việc", scores: { D: 4, I: 0, S: 1, C: 1 } },
        { order: 2, text: "Không khí vui vẻ và sự kết nối giữa mọi người", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Sự hòa thuận và hỗ trợ lẫn nhau", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Quy trình rõ ràng và chất lượng từng bước", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 4,
      content: "Khi gặp áp lực deadline, phản ứng tự nhiên của bạn là:",
      answers: [
        { order: 1, text: "Tập trung cao độ, cắt bỏ mọi thứ không cần thiết", scores: { D: 4, I: 0, S: 1, C: 1 } },
        { order: 2, text: "Động viên team và tìm cách làm việc vui hơn", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Giữ bình tĩnh, làm từ từ nhưng chắc chắn", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Lập danh sách chi tiết và kiểm tra từng hạng mục", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 5,
      content: "Mô tả nào phù hợp nhất với phong cách giao tiếp của bạn?",
      answers: [
        { order: 1, text: "Thẳng thắn, ngắn gọn, tập trung vào vấn đề chính", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Nhiệt tình, cởi mở, dễ kết nối với người khác", scores: { D: 1, I: 4, S: 1, C: 0 } },
        { order: 3, text: "Kiên nhẫn, nhẹ nhàng, biết lắng nghe", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Chính xác, logic, dựa trên sự kiện cụ thể", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 6,
      content: "Khi có xung đột trong nhóm, bạn thường:",
      answers: [
        { order: 1, text: "Đối mặt trực tiếp và giải quyết ngay", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Dùng sự hài hước để giảm căng thẳng", scores: { D: 1, I: 4, S: 1, C: 0 } },
        { order: 3, text: "Làm trung gian hòa giải giữa các bên", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Phân tích nguyên nhân gốc rễ trước khi can thiệp", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 7,
      content: "Bạn cảm thấy hào hứng nhất khi:",
      answers: [
        { order: 1, text: "Vượt qua thử thách lớn và đạt mục tiêu", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Được công nhận và truyền cảm hứng cho người khác", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Mọi người trong nhóm đều hài lòng và hợp tác tốt", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Hoàn thành công việc một cách hoàn hảo, không sai sót", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 8,
      content: "Phong cách lãnh đạo bạn hướng đến là:",
      answers: [
        { order: 1, text: "Quyết đoán, dẫn từ phía trước, chịu trách nhiệm", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Truyền lửa, tạo văn hóa tích cực, mọi người tự giác", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Hỗ trợ, lắng nghe, tạo môi trường an toàn", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Dựa trên dữ liệu, quy trình rõ ràng, công bằng", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 9,
      content: "Khi nhận feedback tiêu cực, phản ứng đầu tiên của bạn là:",
      answers: [
        { order: 1, text: "Phản bác nếu thấy không hợp lý", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Hơi buồn nhưng nhanh chóng lấy lại tinh thần", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Im lặng tiếp nhận và suy nghĩ kỹ", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Phân tích xem feedback đó có căn cứ không", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 10,
      content: "Trong một dự án mới, bạn thường đảm nhận vai trò:",
      answers: [
        { order: 1, text: "Người định hướng chiến lược và phân công", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Người kết nối, huy động nguồn lực và truyền thông", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Người thực thi ổn định, đảm bảo tiến độ", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Người kiểm soát chất lượng và rà soát rủi ro", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 11,
      content: "Điều gì khiến bạn stress nhất trong công việc?",
      answers: [
        { order: 1, text: "Bị kiểm soát quá nhiều hoặc không có quyền quyết định", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Làm việc một mình, không có tương tác", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Thay đổi liên tục, không có sự ổn định", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Quy trình lộn xộn, thiếu tiêu chuẩn rõ ràng", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 12,
      content: "Khi cần thuyết phục ai đó, bạn thường:",
      answers: [
        { order: 1, text: "Đưa ra kết quả và con số cụ thể để chứng minh", scores: { D: 4, I: 0, S: 1, C: 1 } },
        { order: 2, text: "Kể câu chuyện truyền cảm hứng và tạo sự đồng cảm", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Kiên nhẫn giải thích và cho họ thời gian suy nghĩ", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Chuẩn bị tài liệu chi tiết với bằng chứng rõ ràng", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 13,
      content: "Bạn đánh giá thành công dựa trên:",
      answers: [
        { order: 1, text: "Kết quả đạt được so với mục tiêu đề ra", scores: { D: 4, I: 0, S: 1, C: 1 } },
        { order: 2, text: "Mức độ ảnh hưởng tích cực đến người xung quanh", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Mọi người trong nhóm đều cảm thấy được hỗ trợ", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Chất lượng sản phẩm cuối cùng đạt tiêu chuẩn cao", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 14,
      content: "Môi trường làm việc lý tưởng của bạn là:",
      answers: [
        { order: 1, text: "Cạnh tranh, thử thách, có KPI rõ ràng", scores: { D: 4, I: 0, S: 0, C: 2 } },
        { order: 2, text: "Năng động, sáng tạo, nhiều hoạt động nhóm", scores: { D: 0, I: 4, S: 2, C: 0 } },
        { order: 3, text: "Ổn định, hỗ trợ, quan hệ đồng nghiệp tốt", scores: { D: 0, I: 2, S: 4, C: 0 } },
        { order: 4, text: "Chuyên nghiệp, có quy trình, coi trọng chất lượng", scores: { D: 2, I: 0, S: 0, C: 4 } },
      ],
    },
    {
      order: 15,
      content: "Khi được giao task mới mà chưa rõ yêu cầu, bạn sẽ:",
      answers: [
        { order: 1, text: "Tự quyết định cách làm và bắt tay vào ngay", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Hỏi ý kiến nhiều người và brainstorm cùng nhau", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Hỏi lại người giao để hiểu rõ kỳ vọng", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Tìm hiểu tài liệu và ví dụ trước khi bắt đầu", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 16,
      content: "Người khác thường nhận xét bạn là:",
      answers: [
        { order: 1, text: "Quyết đoán và mạnh mẽ", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Vui vẻ và dễ gần", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Đáng tin cậy và kiên nhẫn", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Cẩn thận và chi tiết", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 17,
      content: "Khi phải đưa ra quyết định quan trọng, bạn:",
      answers: [
        { order: 1, text: "Tin vào trực giác và kinh nghiệm, quyết nhanh", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Tham khảo ý kiến nhiều người rồi mới quyết", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Suy nghĩ kỹ, cân nhắc ảnh hưởng đến mọi người", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Thu thập đủ dữ liệu và phân tích pros/cons", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 18,
      content: "Điều bạn sợ nhất trong công việc là:",
      answers: [
        { order: 1, text: "Thất bại hoặc mất quyền kiểm soát", scores: { D: 4, I: 1, S: 0, C: 1 } },
        { order: 2, text: "Bị cô lập hoặc không được công nhận", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Mất đi sự ổn định hoặc xung đột trong nhóm", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Mắc sai lầm hoặc bị đánh giá là thiếu chuyên nghiệp", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 19,
      content: "Khi cần học một kỹ năng mới, bạn thường:",
      answers: [
        { order: 1, text: "Tự mày mò và thực hành ngay", scores: { D: 4, I: 0, S: 1, C: 1 } },
        { order: 2, text: "Học từ người khác, tham gia workshop nhóm", scores: { D: 0, I: 4, S: 1, C: 1 } },
        { order: 3, text: "Học từ từ, từng bước một, có hướng dẫn rõ ràng", scores: { D: 0, I: 1, S: 4, C: 1 } },
        { order: 4, text: "Đọc tài liệu chuyên sâu và nghiên cứu kỹ lưỡng", scores: { D: 1, I: 0, S: 1, C: 4 } },
      ],
    },
    {
      order: 20,
      content: "Nếu được chọn một từ để mô tả bản thân, bạn chọn:",
      answers: [
        { order: 1, text: "Quyết đoán", scores: { D: 4, I: 0, S: 0, C: 2 } },
        { order: 2, text: "Nhiệt huyết", scores: { D: 0, I: 4, S: 2, C: 0 } },
        { order: 3, text: "Chân thành", scores: { D: 0, I: 2, S: 4, C: 0 } },
        { order: 4, text: "Cẩn trọng", scores: { D: 2, I: 0, S: 0, C: 4 } },
      ],
    },
  ];

  // Seed DISC questions
  for (const q of discQuestions) {
    const existing = await prisma.question.findUnique({
      where: { testType_order: { testType: TestType.DISC, order: q.order } },
    });
    if (existing) continue;

    await prisma.question.create({
      data: {
        testType: TestType.DISC,
        content: q.content,
        order: q.order,
        answers: {
          create: q.answers.map((a) => ({
            text: a.text,
            order: a.order,
            scores: a.scores,
          })),
        },
      },
    });
  }

  console.log("✅ Seed completed!");
  console.log("   - 1 AI Config (default)");
  console.log(
    adminSeedPassword
      ? "   - 1 Admin user: admin@wehagroup.vn / <from SEED_ADMIN_PASSWORD>"
      : "   - Admin user skipped (set SEED_ADMIN_PASSWORD to seed)"
  );
  console.log(
    demoSeedPassword
      ? "   - 1 Demo user: demo@wehagroup.vn / <from SEED_DEMO_PASSWORD>"
      : "   - Demo user skipped (set SEED_DEMO_PASSWORD to seed)"
  );
  console.log("   - 20 DISC questions with answers");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
