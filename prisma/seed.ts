import "dotenv/config";
import { PrismaClient, TestType, Role, AITone, AIObjective } from "@prisma/client";
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

  // ─── Logic Questions (15 câu) ──────────────────────────
  // Scoring rubric:
  //   correct: 1 = đúng, 0 = sai
  //   reasoning: 3 = đúng + suy luận đầy đủ
  //              1 = sai nhưng thể hiện có suy luận (gần đúng, đúng hướng, chỉ sai 1 bước)
  //              0 = sai + không có dấu hiệu suy luận (random, hoàn toàn lạc hướng)
  const logicQuestions = [
    {
      order: 1,
      content: "Nếu tất cả A đều là B, và một số B là C, thì kết luận nào đúng?",
      answers: [
        { order: 1, text: "Tất cả A đều là C", scores: { correct: 0, reasoning: 1 } },
        { order: 2, text: "Một số A có thể là C", scores: { correct: 1, reasoning: 3 } },
        { order: 3, text: "Không A nào là C", scores: { correct: 0, reasoning: 1 } },
        { order: 4, text: "Tất cả C đều là A", scores: { correct: 0, reasoning: 0 } },
      ],
    },
    {
      order: 2,
      content: "Dãy số: 2, 6, 18, 54, ... Số tiếp theo là gì?",
      answers: [
        { order: 1, text: "108", scores: { correct: 0, reasoning: 1 } },
        { order: 2, text: "162", scores: { correct: 1, reasoning: 3 } },
        { order: 3, text: "148", scores: { correct: 0, reasoning: 0 } },
        { order: 4, text: "180", scores: { correct: 0, reasoning: 0 } },
      ],
    },
    {
      order: 3,
      content: "Một cửa hàng giảm giá 20%, sau đó tăng giá 20%. So với giá gốc, giá hiện tại:",
      answers: [
        { order: 1, text: "Bằng giá gốc", scores: { correct: 0, reasoning: 1 } },
        { order: 2, text: "Thấp hơn giá gốc 4%", scores: { correct: 1, reasoning: 3 } },
        { order: 3, text: "Cao hơn giá gốc 4%", scores: { correct: 0, reasoning: 1 } },
        { order: 4, text: "Thấp hơn giá gốc 2%", scores: { correct: 0, reasoning: 0 } },
      ],
    },
    {
      order: 4,
      content: "Nếu hôm nay là thứ Tư, thì 100 ngày sau là thứ mấy?",
      answers: [
        { order: 1, text: "Thứ Năm", scores: { correct: 0, reasoning: 1 } },
        { order: 2, text: "Thứ Sáu", scores: { correct: 1, reasoning: 3 } },
        { order: 3, text: "Thứ Bảy", scores: { correct: 0, reasoning: 1 } },
        { order: 4, text: "Chủ Nhật", scores: { correct: 0, reasoning: 0 } },
      ],
    },
    {
      order: 5,
      content: "Một dự án cần 6 người làm trong 10 ngày. Nếu chỉ có 4 người, cần bao nhiêu ngày?",
      answers: [
        { order: 1, text: "12 ngày", scores: { correct: 0, reasoning: 1 } },
        { order: 2, text: "15 ngày", scores: { correct: 1, reasoning: 3 } },
        { order: 3, text: "14 ngày", scores: { correct: 0, reasoning: 1 } },
        { order: 4, text: "16 ngày", scores: { correct: 0, reasoning: 0 } },
      ],
    },
    {
      order: 6,
      content: "Trong 5 hộp có 1 hộp nhẹ hơn. Cần ít nhất mấy lần cân để tìm ra hộp nhẹ?",
      answers: [
        { order: 1, text: "1 lần", scores: { correct: 0, reasoning: 0 } },
        { order: 2, text: "2 lần", scores: { correct: 1, reasoning: 3 } },
        { order: 3, text: "3 lần", scores: { correct: 0, reasoning: 1 } },
        { order: 4, text: "4 lần", scores: { correct: 0, reasoning: 0 } },
      ],
    },
    {
      order: 7,
      content: "Ba người A, B, C. A nói: 'Tôi không phải thủ phạm'. B nói: 'A nói thật'. C nói: 'B nói dối'. Nếu chỉ 1 người nói dối, ai là thủ phạm?",
      answers: [
        { order: 1, text: "A", scores: { correct: 0, reasoning: 1 } },
        { order: 2, text: "B", scores: { correct: 0, reasoning: 0 } },
        { order: 3, text: "C", scores: { correct: 1, reasoning: 3 } },
        { order: 4, text: "Không đủ thông tin", scores: { correct: 0, reasoning: 1 } },
      ],
    },
    {
      order: 8,
      content: "Một chiếc đồng hồ chậm 3 phút mỗi giờ. Nếu chỉnh đúng lúc 12:00, khi đồng hồ hiện 15:00, thời gian thực là mấy giờ?",
      answers: [
        { order: 1, text: "15:09", scores: { correct: 1, reasoning: 3 } },
        { order: 2, text: "15:12", scores: { correct: 0, reasoning: 1 } },
        { order: 3, text: "15:47", scores: { correct: 0, reasoning: 0 } },
        { order: 4, text: "15:03", scores: { correct: 0, reasoning: 1 } },
      ],
    },
    {
      order: 9,
      content: "Doanh thu Q1=100 triệu, Q4=150 triệu. Tỷ lệ tăng trưởng kép (CAGR) trung bình mỗi quý xấp xỉ:",
      answers: [
        { order: 1, text: "12.5%", scores: { correct: 0, reasoning: 1 } },
        { order: 2, text: "14.5%", scores: { correct: 1, reasoning: 3 } },
        { order: 3, text: "16.7%", scores: { correct: 0, reasoning: 1 } },
        { order: 4, text: "10%", scores: { correct: 0, reasoning: 0 } },
      ],
    },
    {
      order: 10,
      content: "Công ty có 3 phòng ban: A (40 người), B (30 người), C (30 người). Cần chọn 10 đại biểu theo tỷ lệ. Phòng A được bao nhiêu?",
      answers: [
        { order: 1, text: "3 người", scores: { correct: 0, reasoning: 1 } },
        { order: 2, text: "4 người", scores: { correct: 1, reasoning: 3 } },
        { order: 3, text: "5 người", scores: { correct: 0, reasoning: 1 } },
        { order: 4, text: "6 người", scores: { correct: 0, reasoning: 0 } },
      ],
    },
    {
      order: 11,
      content: "Nếu 'CLOUD' được mã hóa thành 'DMPVE', thì 'BRAIN' được mã hóa thành gì?",
      answers: [
        { order: 1, text: "CSBJO", scores: { correct: 1, reasoning: 3 } },
        { order: 2, text: "CSBKO", scores: { correct: 0, reasoning: 1 } },
        { order: 3, text: "BSAJO", scores: { correct: 0, reasoning: 0 } },
        { order: 4, text: "CSBJP", scores: { correct: 0, reasoning: 1 } },
      ],
    },
    {
      order: 12,
      content: "A nhanh hơn B, B nhanh hơn C, D chậm hơn A nhưng nhanh hơn C. Xếp hạng từ nhanh nhất:",
      answers: [
        { order: 1, text: "A > B > D > C", scores: { correct: 0, reasoning: 1 } },
        { order: 2, text: "A > D > B > C", scores: { correct: 0, reasoning: 1 } },
        { order: 3, text: "A > B > D > C hoặc A > D > B > C", scores: { correct: 1, reasoning: 3 } },
        { order: 4, text: "Không đủ thông tin", scores: { correct: 0, reasoning: 0 } },
      ],
    },
    {
      order: 13,
      content: "Một bể nước có 2 vòi: vòi A đầy trong 6 giờ, vòi B đầy trong 3 giờ. Mở cả hai, đầy trong bao lâu?",
      answers: [
        { order: 1, text: "2 giờ", scores: { correct: 1, reasoning: 3 } },
        { order: 2, text: "4.5 giờ", scores: { correct: 0, reasoning: 0 } },
        { order: 3, text: "3 giờ", scores: { correct: 0, reasoning: 1 } },
        { order: 4, text: "1.5 giờ", scores: { correct: 0, reasoning: 1 } },
      ],
    },
    {
      order: 14,
      content: "Trong một cuộc thi, có 32 đội tham gia đấu loại trực tiếp. Cần tổng cộng bao nhiêu trận đấu?",
      answers: [
        { order: 1, text: "31", scores: { correct: 1, reasoning: 3 } },
        { order: 2, text: "32", scores: { correct: 0, reasoning: 1 } },
        { order: 3, text: "16", scores: { correct: 0, reasoning: 0 } },
        { order: 4, text: "64", scores: { correct: 0, reasoning: 0 } },
      ],
    },
    {
      order: 15,
      content: "Bạn có 3 lọ: lọ 1 ghi 'Táo', lọ 2 ghi 'Cam', lọ 3 ghi 'Hỗn hợp'. Tất cả nhãn đều sai. Chỉ cần lấy 1 quả từ 1 lọ, bạn nên chọn lọ nào?",
      answers: [
        { order: 1, text: "Lọ 'Táo'", scores: { correct: 0, reasoning: 1 } },
        { order: 2, text: "Lọ 'Cam'", scores: { correct: 0, reasoning: 1 } },
        { order: 3, text: "Lọ 'Hỗn hợp'", scores: { correct: 1, reasoning: 3 } },
        { order: 4, text: "Lọ nào cũng được", scores: { correct: 0, reasoning: 0 } },
      ],
    },
  ];

  // ─── Situation Questions (10 câu) ─────────────────────
  const situationQuestions = [
    {
      order: 1,
      content: "Bạn phát hiện một đồng nghiệp thân đang gian lận báo cáo công việc. Bạn sẽ:",
      answers: [
        { order: 1, text: "Báo cáo ngay cho quản lý", scores: { leadership: 3, teamwork: 1, communication: 2, problemSolving: 2 } },
        { order: 2, text: "Nói chuyện riêng với đồng nghiệp trước, khuyên họ tự sửa", scores: { leadership: 2, teamwork: 4, communication: 4, problemSolving: 3 } },
        { order: 3, text: "Im lặng vì sợ ảnh hưởng mối quan hệ", scores: { leadership: 0, teamwork: 1, communication: 0, problemSolving: 0 } },
        { order: 4, text: "Thu thập bằng chứng rồi báo cáo qua kênh chính thức", scores: { leadership: 4, teamwork: 2, communication: 2, problemSolving: 4 } },
      ],
    },
    {
      order: 2,
      content: "Deadline dự án còn 2 ngày, team member quan trọng xin nghỉ vì lý do gia đình. Bạn sẽ:",
      answers: [
        { order: 1, text: "Từ chối cho nghỉ vì deadline quá gấp", scores: { leadership: 1, teamwork: 0, communication: 1, problemSolving: 1 } },
        { order: 2, text: "Cho nghỉ và tự mình gánh phần việc còn lại", scores: { leadership: 2, teamwork: 3, communication: 1, problemSolving: 2 } },
        { order: 3, text: "Cho nghỉ, phân bổ lại công việc cho cả team và xin gia hạn nếu cần", scores: { leadership: 4, teamwork: 4, communication: 4, problemSolving: 4 } },
        { order: 4, text: "Cho nghỉ nhưng yêu cầu làm remote nếu có thể", scores: { leadership: 3, teamwork: 2, communication: 3, problemSolving: 3 } },
      ],
    },
    {
      order: 3,
      content: "Hai thành viên trong team xung đột gay gắt, ảnh hưởng tiến độ dự án. Cách xử lý của bạn:",
      answers: [
        { order: 1, text: "Gặp từng người riêng để nghe quan điểm, sau đó tổ chức buổi hòa giải", scores: { leadership: 4, teamwork: 3, communication: 4, problemSolving: 4 } },
        { order: 2, text: "Tách 2 người ra không làm chung để tránh va chạm", scores: { leadership: 2, teamwork: 1, communication: 1, problemSolving: 2 } },
        { order: 3, text: "Để họ tự giải quyết, chỉ can thiệp khi quá nghiêm trọng", scores: { leadership: 0, teamwork: 1, communication: 0, problemSolving: 1 } },
        { order: 4, text: "Nhờ HR hoặc cấp trên xử lý", scores: { leadership: 1, teamwork: 2, communication: 2, problemSolving: 1 } },
      ],
    },
    {
      order: 4,
      content: "Sếp yêu cầu bạn triển khai một phương án mà bạn cho rằng sẽ thất bại. Bạn sẽ:",
      answers: [
        { order: 1, text: "Làm theo vì đó là chỉ thị của sếp", scores: { leadership: 0, teamwork: 2, communication: 0, problemSolving: 0 } },
        { order: 2, text: "Trình bày phân tích rủi ro kèm đề xuất phương án thay thế", scores: { leadership: 4, teamwork: 3, communication: 4, problemSolving: 4 } },
        { order: 3, text: "Từ chối thẳng vì biết chắc sẽ thất bại", scores: { leadership: 2, teamwork: 0, communication: 1, problemSolving: 1 } },
        { order: 4, text: "Thực hiện nhưng có backup plan phòng khi thất bại", scores: { leadership: 3, teamwork: 2, communication: 2, problemSolving: 3 } },
      ],
    },
    {
      order: 5,
      content: "Bạn vừa được promote lên quản lý, một số đồng nghiệp cũ tỏ ra không hợp tác. Bạn sẽ:",
      answers: [
        { order: 1, text: "Dùng quyền hạn mới để yêu cầu họ tuân thủ", scores: { leadership: 1, teamwork: 0, communication: 0, problemSolving: 1 } },
        { order: 2, text: "Gặp riêng từng người, lắng nghe lo ngại và xây dựng lại niềm tin", scores: { leadership: 4, teamwork: 4, communication: 4, problemSolving: 3 } },
        { order: 3, text: "Chứng minh năng lực qua kết quả công việc", scores: { leadership: 3, teamwork: 2, communication: 1, problemSolving: 3 } },
        { order: 4, text: "Bỏ qua, tập trung vào công việc, thời gian sẽ giải quyết", scores: { leadership: 1, teamwork: 1, communication: 0, problemSolving: 1 } },
      ],
    },
    {
      order: 6,
      content: "Khách hàng lớn phàn nàn về chất lượng sản phẩm và đe dọa hủy hợp đồng. Bạn sẽ:",
      answers: [
        { order: 1, text: "Lập tức xin lỗi và hứa sửa ngay", scores: { leadership: 2, teamwork: 1, communication: 3, problemSolving: 1 } },
        { order: 2, text: "Gặp khách hàng để hiểu rõ vấn đề, lập kế hoạch khắc phục có timeline", scores: { leadership: 4, teamwork: 3, communication: 4, problemSolving: 4 } },
        { order: 3, text: "Chuyển cho phòng chăm sóc khách hàng xử lý", scores: { leadership: 0, teamwork: 2, communication: 1, problemSolving: 0 } },
        { order: 4, text: "Giải thích nguyên nhân và đưa ra giải pháp bù đắp", scores: { leadership: 3, teamwork: 2, communication: 3, problemSolving: 3 } },
      ],
    },
    {
      order: 7,
      content: "Team bạn được giao KPI cao hơn 50% so với quý trước mà không thêm nhân sự. Bạn sẽ:",
      answers: [
        { order: 1, text: "Phản đối vì không khả thi", scores: { leadership: 1, teamwork: 1, communication: 2, problemSolving: 0 } },
        { order: 2, text: "Nhận KPI và ép team làm tăng ca", scores: { leadership: 1, teamwork: 0, communication: 0, problemSolving: 1 } },
        { order: 3, text: "Phân tích quy trình hiện tại, tìm cách tối ưu, đề xuất lộ trình thực hiện", scores: { leadership: 4, teamwork: 3, communication: 3, problemSolving: 4 } },
        { order: 4, text: "Thương lượng KPI hợp lý hơn dựa trên dữ liệu quý trước", scores: { leadership: 3, teamwork: 2, communication: 4, problemSolving: 3 } },
      ],
    },
    {
      order: 8,
      content: "Trong buổi họp, bạn phát hiện ý tưởng của mình bị một đồng nghiệp trình bày như của họ. Bạn sẽ:",
      answers: [
        { order: 1, text: "Im lặng để tránh xung đột", scores: { leadership: 0, teamwork: 1, communication: 0, problemSolving: 0 } },
        { order: 2, text: "Bổ sung thêm chi tiết vào ý tưởng để mọi người nhận ra đó là của bạn", scores: { leadership: 3, teamwork: 2, communication: 3, problemSolving: 3 } },
        { order: 3, text: "Nói thẳng trong cuộc họp: 'Đó là ý tưởng tôi đã chia sẻ trước đó'", scores: { leadership: 2, teamwork: 0, communication: 2, problemSolving: 1 } },
        { order: 4, text: "Nói chuyện riêng với đồng nghiệp sau cuộc họp", scores: { leadership: 2, teamwork: 3, communication: 3, problemSolving: 2 } },
      ],
    },
    {
      order: 9,
      content: "Bạn phải chọn giữa 2 ứng viên: A có kinh nghiệm 10 năm nhưng khó hòa nhập, B mới ra trường nhưng rất phù hợp văn hóa. Bạn chọn:",
      answers: [
        { order: 1, text: "A — kinh nghiệm quan trọng hơn", scores: { leadership: 2, teamwork: 1, communication: 1, problemSolving: 2 } },
        { order: 2, text: "B — văn hóa fit quan trọng hơn, kỹ năng có thể đào tạo", scores: { leadership: 3, teamwork: 4, communication: 3, problemSolving: 3 } },
        { order: 3, text: "Phỏng vấn thêm vòng nữa để đánh giá kỹ hơn", scores: { leadership: 3, teamwork: 2, communication: 2, problemSolving: 4 } },
        { order: 4, text: "Tuyển cả hai nếu budget cho phép", scores: { leadership: 2, teamwork: 3, communication: 2, problemSolving: 2 } },
      ],
    },
    {
      order: 10,
      content: "Dự án gần hoàn thành thì khách hàng thay đổi yêu cầu lớn. Team kiệt sức, bạn sẽ:",
      answers: [
        { order: 1, text: "Từ chối thay đổi vì ngoài scope ban đầu", scores: { leadership: 2, teamwork: 1, communication: 2, problemSolving: 1 } },
        { order: 2, text: "Nhận hết thay đổi để giữ khách hàng vui", scores: { leadership: 1, teamwork: 0, communication: 1, problemSolving: 0 } },
        { order: 3, text: "Đánh giá impact, thương lượng timeline/budget mới, bảo vệ team", scores: { leadership: 4, teamwork: 4, communication: 4, problemSolving: 4 } },
        { order: 4, text: "Chia thay đổi thành phases, làm phần critical trước", scores: { leadership: 3, teamwork: 3, communication: 3, problemSolving: 3 } },
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

  // Seed Logic questions
  for (const q of logicQuestions) {
    const existing = await prisma.question.findUnique({
      where: { testType_order: { testType: TestType.LOGIC, order: q.order } },
    });
    if (existing) continue;

    await prisma.question.create({
      data: {
        testType: TestType.LOGIC,
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

  // Seed Situation questions
  for (const q of situationQuestions) {
    const existing = await prisma.question.findUnique({
      where: { testType_order: { testType: TestType.SITUATION, order: q.order } },
    });
    if (existing) continue;

    await prisma.question.create({
      data: {
        testType: TestType.SITUATION,
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
  console.log("   - 15 Logic questions with answers");
  console.log("   - 10 Situation questions with answers");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
