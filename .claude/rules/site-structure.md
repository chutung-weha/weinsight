---
paths:
  - "src/app/**/*"
  - "**/*.html"
---

# Site Structure & Pages

## User Side

1. **Trang chủ (Landing)** `/` — Hero, giới thiệu sản phẩm, CTA làm test
2. **Làm test** `/test` — Chọn loại test (DISC/Logic/Situation), giao diện glass card, progress bar
3. **Kết quả** `/ket-qua/[id]` — Radar chart, score cards, AI insight box (highlight quan trọng nhất)
4. **Hồ sơ** `/ho-so` — Lịch sử test, điểm tổng hợp, AI recommendations

## Admin Side (Config Engine)

5. **Dashboard** `/admin` — Danh sách user, điểm, rank, filter (đơn vị, điểm)
6. **Chi tiết user** `/admin/user/[id]` — Full câu trả lời, điểm từng phần, numerology, AI Insight
7. **Quản lý câu hỏi** `/admin/cau-hoi` — CRUD câu hỏi (DISC, Logic, Situation), mỗi câu: nội dung + 4 đáp án + mapping điểm
8. **Upload tri thức AI** `/admin/tri-thuc` — Drag & drop file (PDF/DOC/Text), list file đã upload, trạng thái xử lý (RAG)
9. **Cấu hình AI Prompt** `/admin/ai-config` — Chỉnh tone (thẳng/nhẹ/coach), mục tiêu (tuyển dụng/đào tạo/đánh giá)
10. **Cài đặt** `/admin/cai-dat` — Cấu hình chung

## Auth

11. **Đăng nhập** `/dang-nhap`
12. **Đăng ký** `/dang-ky`
