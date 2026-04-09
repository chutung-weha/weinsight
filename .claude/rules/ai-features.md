---
paths:
  - "src/lib/ai/**/*"
  - "src/app/api/**/*"
  - "src/components/ai/**/*"
---

# AI Features — WE INSIGHT

## Loại test

1. **DISC**: Đánh giá tính cách (Dominance, Influence, Steadiness, Conscientiousness)
2. **Logic**: Tư duy logic, giải quyết vấn đề
3. **Situation**: Xử lý tình huống thực tế

Mỗi câu hỏi gồm: Nội dung + 4 đáp án + Mapping điểm

## RAG — Retrieval Augmented Generation (điểm cốt lõi)

Admin upload tri thức doanh nghiệp:
- PDF (tài liệu nội bộ)
- DOC (quy trình, văn hóa)
- Text guideline

Ví dụ: "Nhân sự sale giỏi là gì", "Leader cần phẩm chất gì", "Văn hóa WEHA"

AI đọc data test + tài liệu → trả lời:
- Người này hợp vai gì
- Có nên tuyển không
- Có nên promote không

## AI Prompt Config

Admin có thể chỉnh:
- **Tone**: thẳng / nhẹ / coach
- **Mục tiêu**: tuyển dụng / đào tạo / đánh giá

Ví dụ prompt: "Hãy đánh giá nhân sự này theo tiêu chuẩn WEHA, đưa ra nhận định rõ ràng, không chung chung"

## Output Structure

AI insight phải có structure rõ ràng:
- Điểm tổng + từng phần
- Nhận định tính cách (DISC profile)
- Điểm mạnh / điểm cần cải thiện
- Vai trò phù hợp
- Khuyến nghị hành động

## Rủi ro & xử lý

- AI nói linh tinh nếu data kém → Chuẩn hóa bộ câu hỏi trước
- Admin không biết upload gì → Seed sẵn tài liệu mẫu
- Câu hỏi dở → insight dở → AI output phải có structure
