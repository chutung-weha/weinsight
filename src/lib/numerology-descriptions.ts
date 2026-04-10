/**
 * Mô tả ý nghĩa cho các chỉ số Thần số học Pythagoras.
 * Mỗi số (1-9, 11, 22) có description riêng cho từng chỉ số.
 */

export interface NumberDescription {
  title: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  careers: string[];
}

// ─── SỐ CHỦ ĐẠO (Life Path) ──────────────────────────
export const LIFE_PATH: Record<number, NumberDescription> = {
  1: {
    title: "Người tiên phong",
    summary: "Bạn là người độc lập, sáng tạo và có tố chất lãnh đạo bẩm sinh. Bạn thích tự mình khai phá con đường riêng.",
    strengths: ["Quyết đoán và tự tin", "Sáng tạo, tiên phong", "Khả năng lãnh đạo mạnh"],
    weaknesses: ["Có thể quá bướng bỉnh", "Đôi khi ích kỷ hoặc độc đoán"],
    careers: ["CEO / Founder", "Quản lý dự án", "Chuyên gia tư vấn chiến lược"],
  },
  2: {
    title: "Người hòa giải",
    summary: "Bạn nhạy cảm, khéo léo và giỏi hợp tác. Bạn có khả năng kết nối con người và tạo sự hài hòa.",
    strengths: ["Ngoại giao tốt, giỏi lắng nghe", "Nhẫn nại và chu đáo", "Tinh thần đồng đội cao"],
    weaknesses: ["Dễ bị tổn thương", "Thiếu quyết đoán khi cần"],
    careers: ["HR Manager", "Mediator", "Chuyên viên chăm sóc khách hàng"],
  },
  3: {
    title: "Người sáng tạo",
    summary: "Bạn lạc quan, biểu cảm và tràn đầy năng lượng. Khả năng giao tiếp và truyền cảm hứng là thế mạnh lớn nhất.",
    strengths: ["Giao tiếp xuất sắc", "Sáng tạo và lạc quan", "Truyền cảm hứng cho người khác"],
    weaknesses: ["Dễ phân tán", "Đôi khi thiếu tập trung vào chi tiết"],
    careers: ["Marketing Manager", "Content Creator", "Trainer / Speaker"],
  },
  4: {
    title: "Người xây dựng",
    summary: "Bạn thực tế, kỷ luật và đáng tin cậy. Bạn là nền tảng vững chắc trong mọi tổ chức.",
    strengths: ["Có tổ chức và kỷ luật", "Kiên trì và đáng tin cậy", "Tư duy hệ thống"],
    weaknesses: ["Cứng nhắc", "Khó thích nghi với thay đổi đột ngột"],
    careers: ["Operations Manager", "Kế toán trưởng", "Project Manager"],
  },
  5: {
    title: "Người tự do",
    summary: "Bạn yêu tự do, thích khám phá và thay đổi. Khả năng thích nghi và linh hoạt là điểm nổi bật.",
    strengths: ["Linh hoạt và thích nghi nhanh", "Đa tài, hiếu kỳ", "Năng lượng dồi dào"],
    weaknesses: ["Dễ chán nản với sự đơn điệu", "Thiếu kiên nhẫn với công việc lặp lại"],
    careers: ["Business Development", "Travel / Event Manager", "Sales Director"],
  },
  6: {
    title: "Người chăm sóc",
    summary: "Bạn có trách nhiệm, yêu thương và luôn quan tâm đến người khác. Bạn tạo nên sự ấm áp trong tổ chức.",
    strengths: ["Tinh thần trách nhiệm cao", "Quan tâm và chăm sóc tốt", "Tạo sự hài hòa trong nhóm"],
    weaknesses: ["Hay lo lắng quá mức", "Đôi khi hy sinh bản thân quá nhiều"],
    careers: ["HR Business Partner", "Customer Success", "Team Lead chăm sóc nhân sự"],
  },
  7: {
    title: "Người phân tích",
    summary: "Bạn sâu sắc, hướng nội và có tư duy phân tích mạnh. Bạn tìm kiếm tri thức và sự thật.",
    strengths: ["Tư duy phân tích sắc bén", "Trực giác tốt", "Chuyên sâu và tỉ mỉ"],
    weaknesses: ["Có thể quá khép kín", "Khó chia sẻ cảm xúc"],
    careers: ["Data Analyst", "Research Specialist", "Strategy Consultant"],
  },
  8: {
    title: "Người quyền lực",
    summary: "Bạn tham vọng, có tầm nhìn kinh doanh và khả năng quản lý tài chính xuất sắc.",
    strengths: ["Tầm nhìn chiến lược", "Khả năng quản lý và lãnh đạo", "Quyết đoán trong kinh doanh"],
    weaknesses: ["Có thể quá tập trung vào vật chất", "Đôi khi áp đặt ý kiến"],
    careers: ["CEO / Giám đốc điều hành", "Finance Director", "Business Owner"],
  },
  9: {
    title: "Người nhân đạo",
    summary: "Bạn rộng lượng, giàu lòng trắc ẩn và có tầm nhìn rộng. Bạn muốn tạo ra sự thay đổi tích cực.",
    strengths: ["Rộng lượng và vị tha", "Tầm nhìn toàn cầu", "Truyền cảm hứng mạnh mẽ"],
    weaknesses: ["Đôi khi quá lý tưởng hóa", "Khó chấp nhận sự bất công"],
    careers: ["CSR Manager", "Đào tạo và phát triển", "Non-profit Leadership"],
  },
  11: {
    title: "Người giác ngộ (Master Number)",
    summary: "Số 11 là số bậc thầy. Bạn có trực giác phi thường, khả năng truyền cảm hứng và tầm nhìn vượt xa người thường.",
    strengths: ["Trực giác cực mạnh", "Khả năng truyền cảm hứng", "Tầm nhìn xa và sáng suốt"],
    weaknesses: ["Áp lực nội tâm lớn", "Dễ bị quá tải cảm xúc"],
    careers: ["Executive Coach", "Innovation Leader", "Spiritual Mentor"],
  },
  22: {
    title: "Nhà kiến tạo (Master Number)",
    summary: "Số 22 là số bậc thầy mạnh nhất. Bạn có khả năng biến ước mơ lớn thành hiện thực, kết hợp tầm nhìn với thực thi.",
    strengths: ["Biến tầm nhìn thành hiện thực", "Năng lực tổ chức phi thường", "Kết hợp lý tưởng và thực tế"],
    weaknesses: ["Kỳ vọng quá cao vào bản thân", "Dễ kiệt sức vì tham vọng lớn"],
    careers: ["CEO tập đoàn", "Kiến trúc sư hệ thống", "Founder doanh nghiệp xã hội"],
  },
};

// ─── CHỈ SỐ THÁI ĐỘ (Attitude) ───────────────────────
export const ATTITUDE: Record<number, string> = {
  1: "Tự tin và quyết đoán khi đối mặt tình huống mới. Bạn chủ động dẫn dắt.",
  2: "Nhẹ nhàng, ngoại giao. Bạn tìm cách hòa giải và hợp tác trước tiên.",
  3: "Lạc quan và nhiệt tình. Bạn mang năng lượng tích cực vào mọi tình huống.",
  4: "Thận trọng và có phương pháp. Bạn phân tích kỹ trước khi hành động.",
  5: "Linh hoạt và thích nghi nhanh. Bạn xem mọi thay đổi là cơ hội.",
  6: "Quan tâm và có trách nhiệm. Bạn nghĩ đến người khác trước tiên.",
  7: "Quan sát và phân tích. Bạn cần thời gian suy ngẫm trước khi phản hồi.",
  8: "Tự tin và thực tế. Bạn tập trung vào giải pháp hiệu quả nhất.",
  9: "Rộng lượng và bao dung. Bạn nhìn nhận vấn đề từ góc độ toàn diện.",
};

// ─── NĂNG LỰC TỰ NHIÊN (Natural Ability) ─────────────
export const NATURAL_ABILITY: Record<number, string> = {
  1: "Năng khiếu lãnh đạo bẩm sinh. Bạn tự tin khởi xướng và dẫn dắt.",
  2: "Năng khiếu ngoại giao và kết nối. Bạn giỏi làm việc nhóm một cách tự nhiên.",
  3: "Năng khiếu giao tiếp và biểu đạt. Ngôn ngữ là sức mạnh của bạn.",
  4: "Năng khiếu tổ chức và hệ thống hóa. Bạn giỏi lập kế hoạch chi tiết.",
  5: "Năng khiếu thích nghi và đa nhiệm. Bạn thoải mái trong môi trường thay đổi.",
  6: "Năng khiếu chăm sóc và nuôi dưỡng. Bạn tạo sự an toàn cho người xung quanh.",
  7: "Năng khiếu nghiên cứu và phân tích. Bạn đào sâu để tìm bản chất vấn đề.",
  8: "Năng khiếu quản lý và kinh doanh. Bạn có trực giác tốt về tài chính.",
  9: "Năng khiếu sáng tạo và nhân đạo. Bạn truyền cảm hứng cho cộng đồng.",
};

// ─── CHỈ SỐ SỨ MỆNH (Expression) ─────────────────────
export const EXPRESSION: Record<number, string> = {
  1: "Sứ mệnh của bạn là lãnh đạo và khai phá. Bạn sinh ra để dẫn đường.",
  2: "Sứ mệnh hòa giải và kết nối. Bạn là cầu nối giữa con người.",
  3: "Sứ mệnh sáng tạo và truyền đạt. Bạn mang đến niềm vui qua giao tiếp.",
  4: "Sứ mệnh xây dựng nền tảng. Bạn tạo ra cấu trúc bền vững.",
  5: "Sứ mệnh trải nghiệm và tự do. Bạn truyền cảm hứng về sự thay đổi.",
  6: "Sứ mệnh chăm sóc và phục vụ. Bạn tạo ra sự hài hòa trong cộng đồng.",
  7: "Sứ mệnh tìm kiếm tri thức. Bạn chia sẻ sự hiểu biết sâu sắc.",
  8: "Sứ mệnh thành tựu và quyền lực. Bạn biến tầm nhìn thành hiện thực.",
  9: "Sứ mệnh phụng sự và nhân đạo. Bạn nâng tầm cộng đồng.",
  11: "Sứ mệnh truyền cảm hứng tâm linh. Bạn là người dẫn đường cho người khác.",
  22: "Sứ mệnh kiến tạo vĩ đại. Bạn xây dựng di sản cho nhiều thế hệ.",
};

// ─── CHỈ SỐ LINH HỒN (Soul Urge) ─────────────────────
export const SOUL_URGE: Record<number, string> = {
  1: "Khao khát tự do và độc lập. Trong sâu thẳm, bạn muốn tự quyết định cuộc đời mình.",
  2: "Khao khát hòa bình và sự kết nối. Bạn tìm kiếm tình yêu và sự hài hòa.",
  3: "Khao khát biểu đạt và sáng tạo. Bạn muốn được thể hiện bản thân.",
  4: "Khao khát sự ổn định và an toàn. Bạn muốn xây dựng nền tảng vững chắc.",
  5: "Khao khát tự do và phiêu lưu. Bạn muốn trải nghiệm tất cả.",
  6: "Khao khát yêu thương và gia đình. Bạn muốn chăm sóc và được chăm sóc.",
  7: "Khao khát sự thật và tri thức. Bạn muốn hiểu bản chất sâu xa của vạn vật.",
  8: "Khao khát thành tựu và sự công nhận. Bạn muốn để lại dấu ấn.",
  9: "Khao khát phụng sự và ý nghĩa. Bạn muốn cuộc đời có ý nghĩa lớn lao.",
  11: "Khao khát giác ngộ và soi sáng. Bạn cảm nhận được sứ mệnh đặc biệt.",
  22: "Khao khát kiến tạo và di sản. Bạn muốn xây dựng thứ gì đó vĩ đại cho thế giới.",
};

// ─── CHỈ SỐ NHÂN CÁCH (Personality) ──────────────────
export const PERSONALITY: Record<number, string> = {
  1: "Người khác thấy bạn tự tin, mạnh mẽ và độc lập.",
  2: "Người khác thấy bạn dịu dàng, đáng tin cậy và dễ hợp tác.",
  3: "Người khác thấy bạn vui vẻ, duyên dáng và dễ gần.",
  4: "Người khác thấy bạn nghiêm túc, đáng tin và có trách nhiệm.",
  5: "Người khác thấy bạn năng động, quyến rũ và đầy năng lượng.",
  6: "Người khác thấy bạn ấm áp, chu đáo và luôn sẵn sàng giúp đỡ.",
  7: "Người khác thấy bạn bí ẩn, thông thái và sâu sắc.",
  8: "Người khác thấy bạn quyền lực, tự tin và thành đạt.",
  9: "Người khác thấy bạn rộng lượng, có tầm nhìn và truyền cảm hứng.",
  11: "Người khác thấy bạn đặc biệt, có sức hút tâm linh và trực giác nhạy bén.",
  22: "Người khác thấy bạn là người có tầm nhìn lớn và khả năng biến ý tưởng thành hiện thực.",
};

/** Lấy description cho một chỉ số + giá trị số */
export function getDescription(
  indicator: "lifePath" | "attitude" | "naturalAbility" | "expression" | "soulUrge" | "personality",
  value: number
): { title?: string; summary: string; strengths?: string[]; weaknesses?: string[]; careers?: string[] } {
  switch (indicator) {
    case "lifePath":
      return LIFE_PATH[value] || LIFE_PATH[reduceForLookup(value)];
    case "attitude":
      return { summary: ATTITUDE[value] || ATTITUDE[reduceForLookup(value)] || "" };
    case "naturalAbility":
      return { summary: NATURAL_ABILITY[value] || NATURAL_ABILITY[reduceForLookup(value)] || "" };
    case "expression":
      return { summary: EXPRESSION[value] || EXPRESSION[reduceForLookup(value)] || "" };
    case "soulUrge":
      return { summary: SOUL_URGE[value] || SOUL_URGE[reduceForLookup(value)] || "" };
    case "personality":
      return { summary: PERSONALITY[value] || PERSONALITY[reduceForLookup(value)] || "" };
  }
}

/** Fallback: nếu không tìm thấy description cho master number, reduce về 1-9 */
function reduceForLookup(n: number): number {
  let result = n;
  while (result > 9) {
    result = result.toString().split("").reduce((s, d) => s + parseInt(d), 0);
  }
  return result;
}
