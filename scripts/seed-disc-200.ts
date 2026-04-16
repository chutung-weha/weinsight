/**
 * Seed script: DISC 200 câu hỏi từ bộ WEHA
 * Chạy: npx tsx scripts/seed-disc-200.ts
 *
 * Mapping điểm: A=D, B=I, C=S, D=C (mỗi câu đóng góp 1 điểm)
 * Mỗi session test sẽ random 20 câu từ 200 câu này
 */

import "dotenv/config";
import { PrismaClient, TestType } from "@prisma/client";

const prisma = new PrismaClient();

// Scores chuẩn: A=D(1), B=I(1), C=S(1), D=C(1)
const SA = { D: 1, I: 0, S: 0, C: 0 };
const SB = { D: 0, I: 1, S: 0, C: 0 };
const SC = { D: 0, I: 0, S: 1, C: 0 };
const SD = { D: 0, I: 0, S: 0, C: 1 };

function lowerFirst(input: string): string {
  return input ? input.charAt(0).toLowerCase() + input.slice(1) : input;
}

const discQuestions = [
  // ─── 20 CÂU PHONG CÁCH (câu 1–20) ───────────────────────────────────────
  {
    order: 1,
    content: "Khi bắt đầu một dự án mới, bạn thường:",
    answers: [
      { order: 1, text: "Lao vào hành động ngay để chiếm lợi thế", scores: SA },
      { order: 2, text: "Rủ mọi người cùng bàn luận sôi nổi", scores: SB },
      { order: 3, text: "Từ từ tìm hiểu rồi mới triển khai", scores: SC },
      { order: 4, text: "Lập kế hoạch chi tiết trước khi bắt đầu", scores: SD },
    ],
  },
  {
    order: 2,
    content: "Trong cuộc họp, bạn có xu hướng:",
    answers: [
      { order: 1, text: "Đưa ra quyết định nhanh chóng", scores: SA },
      { order: 2, text: "Tạo bầu không khí vui vẻ", scores: SB },
      { order: 3, text: "Lắng nghe mọi người trước khi nói", scores: SC },
      { order: 4, text: "Ghi chép cẩn thận và phân tích", scores: SD },
    ],
  },
  {
    order: 3,
    content: "Khi gặp xung đột, phản ứng đầu tiên là:",
    answers: [
      { order: 1, text: "Đối mặt thẳng thắn", scores: SA },
      { order: 2, text: "Dùng sự hài hước để xoa dịu", scores: SB },
      { order: 3, text: "Tránh né để giữ hòa khí", scores: SC },
      { order: 4, text: "Phân tích nguyên nhân logic", scores: SD },
    ],
  },
  {
    order: 4,
    content: "Phong cách giao tiếp của bạn là:",
    answers: [
      { order: 1, text: "Ngắn gọn, đi thẳng vào vấn đề", scores: SA },
      { order: 2, text: "Nhiệt tình, nhiều cảm xúc", scores: SB },
      { order: 3, text: "Nhẹ nhàng, ân cần", scores: SC },
      { order: 4, text: "Chính xác, có số liệu", scores: SD },
    ],
  },
  {
    order: 5,
    content: "Điều bạn sợ nhất trong công việc:",
    answers: [
      { order: 1, text: "Mất kiểm soát", scores: SA },
      { order: 2, text: "Bị phớt lờ, không được ghi nhận", scores: SB },
      { order: 3, text: "Môi trường xáo trộn đột ngột", scores: SC },
      { order: 4, text: "Mắc sai sót vì thiếu dữ liệu", scores: SD },
    ],
  },
  {
    order: 6,
    content: "Khi được giao việc khó, bạn:",
    answers: [
      { order: 1, text: "Coi đó là thử thách để chinh phục", scores: SA },
      { order: 2, text: "Tìm đồng đội cùng làm", scores: SB },
      { order: 3, text: "Kiên trì làm từng bước", scores: SC },
      { order: 4, text: "Nghiên cứu kỹ quy trình", scores: SD },
    ],
  },
  {
    order: 7,
    content: "Đồng nghiệp mô tả bạn là:",
    answers: [
      { order: 1, text: "Mạnh mẽ, quyết liệt", scores: SA },
      { order: 2, text: "Vui vẻ, dễ mến", scores: SB },
      { order: 3, text: "Đáng tin, ổn định", scores: SC },
      { order: 4, text: "Cẩn thận, chính xác", scores: SD },
    ],
  },
  {
    order: 8,
    content: "Khi ra quyết định, bạn dựa vào:",
    answers: [
      { order: 1, text: "Trực giác và tốc độ", scores: SA },
      { order: 2, text: "Cảm xúc và mối quan hệ", scores: SB },
      { order: 3, text: "Sự ổn định và đồng thuận", scores: SC },
      { order: 4, text: "Dữ liệu và logic", scores: SD },
    ],
  },
  {
    order: 9,
    content: "Môi trường làm việc lý tưởng của bạn:",
    answers: [
      { order: 1, text: "Cạnh tranh, thử thách", scores: SA },
      { order: 2, text: "Sôi động, nhiều tương tác", scores: SB },
      { order: 3, text: "Thân thiện, ổn định", scores: SC },
      { order: 4, text: "Có quy trình rõ ràng", scores: SD },
    ],
  },
  {
    order: 10,
    content: "Khi bị phê bình, bạn:",
    answers: [
      { order: 1, text: "Phản biện lại ngay", scores: SA },
      { order: 2, text: "Cảm thấy tổn thương nhưng vẫn cười", scores: SB },
      { order: 3, text: "Im lặng suy nghĩ lâu", scores: SC },
      { order: 4, text: "Hỏi dẫn chứng cụ thể", scores: SD },
    ],
  },
  {
    order: 11,
    content: "Kiểu sếp bạn muốn làm việc cùng:",
    answers: [
      { order: 1, text: "Sếp giao quyền, để tự quyết", scores: SA },
      { order: 2, text: "Sếp vui vẻ, cởi mở", scores: SB },
      { order: 3, text: "Sếp ổn định, công bằng", scores: SC },
      { order: 4, text: "Sếp minh bạch, rõ ràng", scores: SD },
    ],
  },
  {
    order: 12,
    content: "Khi làm việc nhóm, bạn thường đảm nhận vai trò:",
    answers: [
      { order: 1, text: "Người dẫn dắt", scores: SA },
      { order: 2, text: "Người gắn kết", scores: SB },
      { order: 3, text: "Người hỗ trợ", scores: SC },
      { order: 4, text: "Người kiểm soát chất lượng", scores: SD },
    ],
  },
  {
    order: 13,
    content: "Điều khiến bạn tự hào nhất:",
    answers: [
      { order: 1, text: "Đạt được mục tiêu khó", scores: SA },
      { order: 2, text: "Được nhiều người yêu quý", scores: SB },
      { order: 3, text: "Được tin tưởng lâu dài", scores: SC },
      { order: 4, text: "Hoàn thành việc không sai sót", scores: SD },
    ],
  },
  {
    order: 14,
    content: "Khi gặp thay đổi bất ngờ, bạn:",
    answers: [
      { order: 1, text: "Thích nghi nhanh, tận dụng cơ hội", scores: SA },
      { order: 2, text: "Hào hứng khám phá", scores: SB },
      { order: 3, text: "Bối rối, cần thời gian", scores: SC },
      { order: 4, text: "Phân tích tác động trước khi hành động", scores: SD },
    ],
  },
  {
    order: 15,
    content: "Cách bạn giải quyết vấn đề:",
    answers: [
      { order: 1, text: "Hành động ngay", scores: SA },
      { order: 2, text: "Bàn bạc với người khác", scores: SB },
      { order: 3, text: "Kiên trì thử nhiều lần", scores: SC },
      { order: 4, text: "Phân tích có hệ thống", scores: SD },
    ],
  },
  {
    order: 16,
    content: "Khi thuyết trình, bạn:",
    answers: [
      { order: 1, text: "Tự tin, mạnh mẽ", scores: SA },
      { order: 2, text: "Lôi cuốn, truyền cảm hứng", scores: SB },
      { order: 3, text: "Nhẹ nhàng, chân thành", scores: SC },
      { order: 4, text: "Chi tiết, có bằng chứng", scores: SD },
    ],
  },
  {
    order: 17,
    content: "Bạn đánh giá cao nhất ở đồng nghiệp:",
    answers: [
      { order: 1, text: "Năng lực và hiệu quả", scores: SA },
      { order: 2, text: "Sự thân thiện", scores: SB },
      { order: 3, text: "Sự đáng tin", scores: SC },
      { order: 4, text: "Sự chuyên môn", scores: SD },
    ],
  },
  {
    order: 18,
    content: "Khi deadline gấp, bạn:",
    answers: [
      { order: 1, text: "Tăng tốc, ép tiến độ", scores: SA },
      { order: 2, text: "Rủ nhóm cùng chạy nước rút", scores: SB },
      { order: 3, text: "Bình tĩnh làm hết sức", scores: SC },
      { order: 4, text: "Ưu tiên việc quan trọng trước", scores: SD },
    ],
  },
  {
    order: 19,
    content: "Điểm yếu lớn nhất của bạn:",
    answers: [
      { order: 1, text: "Thiếu kiên nhẫn", scores: SA },
      { order: 2, text: "Thiếu tập trung chi tiết", scores: SB },
      { order: 3, text: "Ngại thay đổi", scores: SC },
      { order: 4, text: "Cầu toàn quá mức", scores: SD },
    ],
  },
  {
    order: 20,
    content: "Cách bạn học hiệu quả nhất:",
    answers: [
      { order: 1, text: "Thực hành trực tiếp", scores: SA },
      { order: 2, text: "Thảo luận với người khác", scores: SB },
      { order: 3, text: "Quan sát và bắt chước", scores: SC },
      { order: 4, text: "Đọc tài liệu, nghiên cứu", scores: SD },
    ],
  },

  // ─── 180 CÂU TÌNH HUỐNG (câu 21–200) ─────────────────────────────────────
  // Các tình huống lặp theo chu kỳ để đánh giá phản ứng nhất quán
  {
    order: 21,
    content: "Khi khách hàng khó tính phàn nàn, bạn:",
    answers: [
      { order: 1, text: "Đối đáp cứng rắn, bảo vệ lập trường", scores: SA },
      { order: 2, text: "Dùng sự duyên dáng xoa dịu", scores: SB },
      { order: 3, text: "Kiên nhẫn lắng nghe đến cùng", scores: SC },
      { order: 4, text: "Đưa ra giải pháp dựa trên dữ liệu", scores: SD },
    ],
  },
  {
    order: 22,
    content: "Khi cần thương lượng hợp đồng, bạn:",
    answers: [
      { order: 1, text: "Gây áp lực để đạt kết quả", scores: SA },
      { order: 2, text: "Tạo thiện cảm cá nhân", scores: SB },
      { order: 3, text: "Tìm điểm chung hai bên", scores: SC },
      { order: 4, text: "Phân tích điều khoản chi tiết", scores: SD },
    ],
  },
  {
    order: 23,
    content: "Khi nhân viên mắc lỗi, bạn:",
    answers: [
      { order: 1, text: "Phê bình thẳng thắn", scores: SA },
      { order: 2, text: "Động viên và khuyến khích", scores: SB },
      { order: 3, text: "Thông cảm, hướng dẫn lại", scores: SC },
      { order: 4, text: "Chỉ ra lỗi sai cụ thể", scores: SD },
    ],
  },
  {
    order: 24,
    content: "Khi sếp giao việc mơ hồ, bạn:",
    answers: [
      { order: 1, text: "Tự quyết làm theo cách mình", scores: SA },
      { order: 2, text: "Hỏi những vấn đề vui vẻ", scores: SB },
      { order: 3, text: "Hỏi nhẹ nhàng rồi làm", scores: SC },
      { order: 4, text: "Yêu cầu làm rõ yêu cầu chi tiết", scores: SD },
    ],
  },
  {
    order: 25,
    content: "Khi có ý tưởng mới, bạn:",
    answers: [
      { order: 1, text: "Triển khai ngay lập tức", scores: SA },
      { order: 2, text: "Chia sẻ hào hứng với mọi người", scores: SB },
      { order: 3, text: "Bàn với người thân thiết", scores: SC },
      { order: 4, text: "Viết ra và phân tích tính khả thi", scores: SD },
    ],
  },
  {
    order: 26,
    content: "Khi đi họp với khách hàng, bạn:",
    answers: [
      { order: 1, text: "Chủ động dẫn dắt", scores: SA },
      { order: 2, text: "Tạo không khí thân thiện", scores: SB },
      { order: 3, text: "Lắng nghe nhu cầu khách", scores: SC },
      { order: 4, text: "Chuẩn bị tài liệu kỹ lưỡng", scores: SD },
    ],
  },
  {
    order: 27,
    content: "Khi đồng nghiệp nhờ giúp, bạn:",
    answers: [
      { order: 1, text: "Giúp nhanh nếu có lợi", scores: SA },
      { order: 2, text: "Vui vẻ nhận lời", scores: SB },
      { order: 3, text: "Sẵn lòng dù bận", scores: SC },
      { order: 4, text: "Hỏi rõ yêu cầu trước", scores: SD },
    ],
  },
  {
    order: 28,
    content: "Khi công ty có thay đổi lớn, bạn:",
    answers: [
      { order: 1, text: "Chủ động dẫn đầu thay đổi", scores: SA },
      { order: 2, text: "Lan tỏa năng lượng tích cực", scores: SB },
      { order: 3, text: "Chấp nhận và thích nghi dần", scores: SC },
      { order: 4, text: "Tìm hiểu lý do và tác động", scores: SD },
    ],
  },
  {
    order: 29,
    content: "Trong bữa tiệc công ty, bạn:",
    answers: [
      { order: 1, text: "Nói chuyện với người quyền lực", scores: SA },
      { order: 2, text: "Là tâm điểm, pha trò", scores: SB },
      { order: 3, text: "Ngồi cùng nhóm thân quen", scores: SC },
      { order: 4, text: "Quan sát và ít nói", scores: SD },
    ],
  },
  {
    order: 30,
    content: "Khi đánh giá ứng viên, bạn nhìn vào:",
    answers: [
      { order: 1, text: "Kết quả và thành tích", scores: SA },
      { order: 2, text: "Thái độ và năng lượng", scores: SB },
      { order: 3, text: "Sự trung thành và bền bỉ", scores: SC },
      { order: 4, text: "Kỹ năng và kinh nghiệm", scores: SD },
    ],
  },
  {
    order: 31,
    content: "Khi bạn bị áp lực cao, bạn:",
    answers: [
      { order: 1, text: "Trở nên gắt gỏng", scores: SA },
      { order: 2, text: "Nói nhiều hơn", scores: SB },
      { order: 3, text: "Im lặng rút lui", scores: SC },
      { order: 4, text: "Soi xét chi tiết", scores: SD },
    ],
  },
  {
    order: 32,
    content: "Khi lập kế hoạch cá nhân, bạn:",
    answers: [
      { order: 1, text: "Đặt mục tiêu lớn", scores: SA },
      { order: 2, text: "Ghi chú cảm hứng", scores: SB },
      { order: 3, text: "Lên lịch đều đặn", scores: SC },
      { order: 4, text: "Chia nhỏ theo KPI", scores: SD },
    ],
  },
  {
    order: 33,
    content: "Khi đọc email, bạn:",
    answers: [
      { order: 1, text: "Lướt nhanh, chỉ đọc ý chính", scores: SA },
      { order: 2, text: "Phản hồi ngay theo cảm xúc", scores: SB },
      { order: 3, text: "Suy nghĩ kỹ trước khi trả lời", scores: SC },
      { order: 4, text: "Đọc kỹ từng chi tiết", scores: SD },
    ],
  },
  {
    order: 34,
    content: "Khi nhận feedback tiêu cực, bạn:",
    answers: [
      { order: 1, text: "Tranh luận ngay", scores: SA },
      { order: 2, text: "Cười trừ, chuyển chủ đề", scores: SB },
      { order: 3, text: "Tiếp thu âm thầm", scores: SC },
      { order: 4, text: "Yêu cầu ví dụ cụ thể", scores: SD },
    ],
  },
  {
    order: 35,
    content: "Khi cần sáng tạo, bạn:",
    answers: [
      { order: 1, text: "Đưa ý tưởng táo bạo", scores: SA },
      { order: 2, text: "Brainstorm cùng nhóm", scores: SB },
      { order: 3, text: "Cải tiến dần dần", scores: SC },
      { order: 4, text: "Dựa trên nghiên cứu", scores: SD },
    ],
  },
  {
    order: 36,
    content: "Khi làm báo cáo, bạn:",
    answers: [
      { order: 1, text: "Viết ngắn gọn, trọng tâm", scores: SA },
      { order: 2, text: "Thêm câu chuyện hấp dẫn", scores: SB },
      { order: 3, text: "Trình bày rõ ràng dễ hiểu", scores: SC },
      { order: 4, text: "Đầy đủ số liệu, dẫn chứng", scores: SD },
    ],
  },
  {
    order: 37,
    content: "Khi xử lý dự án thất bại, bạn:",
    answers: [
      { order: 1, text: "Tìm cách vực dậy nhanh", scores: SA },
      { order: 2, text: "Động viên đồng đội", scores: SB },
      { order: 3, text: "Kiên trì sửa chữa", scores: SC },
      { order: 4, text: "Phân tích nguyên nhân gốc", scores: SD },
    ],
  },
  {
    order: 38,
    content: "Khi được khen, bạn:",
    answers: [
      { order: 1, text: "Coi đó là xứng đáng", scores: SA },
      { order: 2, text: "Vui mừng chia sẻ", scores: SB },
      { order: 3, text: "Khiêm tốn đáp lại", scores: SC },
      { order: 4, text: "Đánh giá khen có đúng không", scores: SD },
    ],
  },
  {
    order: 39,
    content: "Khi lần đầu gặp người lạ, bạn:",
    answers: [
      { order: 1, text: "Đánh giá nhanh về họ", scores: SA },
      { order: 2, text: "Bắt chuyện ngay", scores: SB },
      { order: 3, text: "Giữ khoảng cách quan sát", scores: SC },
      { order: 4, text: "Hỏi kỹ thông tin nền", scores: SD },
    ],
  },
  // Câu 40–200: lặp lại chu kỳ 19 tình huống (câu 21–39)
  // nhưng thêm ngữ cảnh riêng để tránh trùng nội dung khi random hiển thị cho user
  ...Array.from({ length: 161 }, (_, i) => {
    const baseIdx = i % 19;
    const contextLeads = [
      "Trong giai đoạn thử việc",
      "Khi đội nhóm đang tăng tốc doanh số",
      "Trong tuần cao điểm vận hành",
      "Lúc dự án cần phối hợp liên phòng ban",
      "Khi công ty mở rộng quy mô",
      "Trong bối cảnh khách hàng thay đổi kỳ vọng liên tục",
      "Khi bạn phải cân bằng giữa tốc độ và chất lượng",
    ];
    const contextFocuses = [
      "với khối lượng việc tăng mạnh",
      "khi nguồn lực khá hạn chế",
      "trong môi trường áp lực cao",
      "khi phải phối hợp với người mới",
      "lúc deadline đang đến gần",
      "khi quy trình chưa thật ổn định",
      "khi có nhiều ý kiến trái chiều",
      "lúc cần bảo toàn trải nghiệm khách hàng",
      "khi tiêu chuẩn đánh giá rất rõ ràng",
      "lúc dữ liệu chưa đầy đủ ngay từ đầu",
      "khi sếp yêu cầu báo cáo tiến độ liên tục",
      "trong ca làm việc kéo dài",
      "khi ưu tiên công việc thay đổi liên tục",
      "lúc phải xử lý nhiều đầu việc song song",
      "khi nhóm đang thiếu một mắt xích quan trọng",
      "trong thời điểm cần giữ tinh thần đội ngũ",
      "khi phải bảo vệ quan điểm chuyên môn",
      "lúc chuẩn bị cho một quyết định lớn",
      "trong bối cảnh cần phản hồi thật nhanh",
      "khi tính nhất quán được đặt lên hàng đầu",
      "lúc phải vừa học vừa làm",
      "khi có rủi ro phát sinh ngoài dự kiến",
      "trong tình huống cần tạo niềm tin ngay lập tức",
    ];
    const bases = [
      {
        content: "Khi khách hàng khó tính phàn nàn, bạn:",
        a: "Đối đáp cứng rắn, bảo vệ lập trường",
        b: "Dùng sự duyên dáng xoa dịu",
        c: "Kiên nhẫn lắng nghe đến cùng",
        d: "Đưa ra giải pháp dựa trên dữ liệu",
      },
      {
        content: "Khi cần thương lượng hợp đồng, bạn:",
        a: "Gây áp lực để đạt kết quả",
        b: "Tạo thiện cảm cá nhân",
        c: "Tìm điểm chung hai bên",
        d: "Phân tích điều khoản chi tiết",
      },
      {
        content: "Khi nhân viên mắc lỗi, bạn:",
        a: "Phê bình thẳng thắn",
        b: "Động viên và khuyến khích",
        c: "Thông cảm, hướng dẫn lại",
        d: "Chỉ ra lỗi sai cụ thể",
      },
      {
        content: "Khi sếp giao việc mơ hồ, bạn:",
        a: "Tự quyết làm theo cách mình",
        b: "Hỏi hào hứng rồi làm",
        c: "Hỏi nhẹ nhàng rồi làm",
        d: "Yêu cầu làm rõ yêu cầu chi tiết",
      },
      {
        content: "Khi có ý tưởng mới, bạn:",
        a: "Triển khai ngay lập tức",
        b: "Chia sẻ hào hứng với mọi người",
        c: "Bàn với người thân thiết",
        d: "Viết ra và phân tích tính khả thi",
      },
      {
        content: "Khi đi họp với khách hàng, bạn:",
        a: "Chủ động dẫn dắt",
        b: "Tạo không khí thân thiện",
        c: "Lắng nghe nhu cầu khách",
        d: "Chuẩn bị tài liệu kỹ lưỡng",
      },
      {
        content: "Khi đồng nghiệp nhờ giúp, bạn:",
        a: "Giúp nhanh nếu có lợi",
        b: "Vui vẻ nhận lời",
        c: "Sẵn lòng dù bận",
        d: "Hỏi rõ yêu cầu trước",
      },
      {
        content: "Khi công ty có thay đổi lớn, bạn:",
        a: "Chủ động dẫn đầu thay đổi",
        b: "Lan tỏa năng lượng tích cực",
        c: "Chấp nhận và thích nghi dần",
        d: "Tìm hiểu lý do và tác động",
      },
      {
        content: "Trong bữa tiệc công ty, bạn:",
        a: "Nói chuyện với người quyền lực",
        b: "Là tâm điểm, pha trò",
        c: "Ngồi cùng nhóm thân quen",
        d: "Quan sát và ít nói",
      },
      {
        content: "Khi đánh giá ứng viên, bạn nhìn vào:",
        a: "Kết quả và thành tích",
        b: "Thái độ và năng lượng",
        c: "Sự trung thành và bền bỉ",
        d: "Kỹ năng và kinh nghiệm",
      },
      {
        content: "Khi bạn bị áp lực cao, bạn:",
        a: "Trở nên gắt gỏng",
        b: "Nói nhiều hơn",
        c: "Im lặng rút lui",
        d: "Soi xét chi tiết",
      },
      {
        content: "Khi lập kế hoạch cá nhân, bạn:",
        a: "Đặt mục tiêu lớn",
        b: "Ghi chú cảm hứng",
        c: "Lên lịch đều đặn",
        d: "Chia nhỏ theo KPI",
      },
      {
        content: "Khi đọc email, bạn:",
        a: "Lướt nhanh, chỉ đọc ý chính",
        b: "Phản hồi ngay theo cảm xúc",
        c: "Suy nghĩ kỹ trước khi trả lời",
        d: "Đọc kỹ từng chi tiết",
      },
      {
        content: "Khi nhận feedback tiêu cực, bạn:",
        a: "Tranh luận ngay",
        b: "Cười trừ, chuyển chủ đề",
        c: "Tiếp thu âm thầm",
        d: "Yêu cầu ví dụ cụ thể",
      },
      {
        content: "Khi cần sáng tạo, bạn:",
        a: "Đưa ý tưởng táo bạo",
        b: "Brainstorm cùng nhóm",
        c: "Cải tiến dần dần",
        d: "Dựa trên nghiên cứu",
      },
      {
        content: "Khi làm báo cáo, bạn:",
        a: "Viết ngắn gọn, trọng tâm",
        b: "Thêm câu chuyện hấp dẫn",
        c: "Trình bày rõ ràng dễ hiểu",
        d: "Đầy đủ số liệu, dẫn chứng",
      },
      {
        content: "Khi xử lý dự án thất bại, bạn:",
        a: "Tìm cách vực dậy nhanh",
        b: "Động viên đồng đội",
        c: "Kiên trì sửa chữa",
        d: "Phân tích nguyên nhân gốc",
      },
      {
        content: "Khi được khen, bạn:",
        a: "Coi đó là xứng đáng",
        b: "Vui mừng chia sẻ",
        c: "Khiêm tốn đáp lại",
        d: "Đánh giá khen có đúng không",
      },
      {
        content: "Khi lần đầu gặp người lạ, bạn:",
        a: "Đánh giá nhanh về họ",
        b: "Bắt chuyện ngay",
        c: "Giữ khoảng cách quan sát",
        d: "Hỏi kỹ thông tin nền",
      },
    ];

    const base = bases[baseIdx];
    const context = `${contextLeads[Math.floor(i / contextFocuses.length)]} ${contextFocuses[i % contextFocuses.length]}`;
    return {
      order: 40 + i,
      content: `${context}, ${lowerFirst(base.content)}`,
      answers: [
        { order: 1, text: base.a, scores: SA },
        { order: 2, text: base.b, scores: SB },
        { order: 3, text: base.c, scores: SC },
        { order: 4, text: base.d, scores: SD },
      ],
    };
  }),
];

const uniqueContents = new Set(discQuestions.map((question) => question.content));
if (uniqueContents.size !== discQuestions.length) {
  throw new Error(`DISC seed data contains duplicate question content: ${discQuestions.length - uniqueContents.size} duplicates found`);
}

async function main() {
  console.log("🌱 Seeding 200 DISC questions...");

  // Xóa tất cả DISC questions cũ trước khi seed mới
  const deleted = await prisma.question.deleteMany({
    where: { testType: TestType.DISC },
  });
  console.log(`🗑️  Deleted ${deleted.count} old DISC questions`);

  let created = 0;
  for (const q of discQuestions) {
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
    created++;
    if (created % 20 === 0) {
      console.log(`   ✓ ${created}/200 questions seeded`);
    }
  }

  console.log(`✅ Seeded ${created} DISC questions`);
  console.log("   Mỗi session test sẽ random chọn 20 trong 200 câu");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
