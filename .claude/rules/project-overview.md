# WE INSIGHT - Project Overview

WE INSIGHT là hệ thống đánh giá nhân sự + AI coach của WEHA Group. Không chỉ là app test — mà là công cụ ra quyết định nhân sự.

**Core**: Data Input → AI Brain → Decision Output

## Đối tượng

- **CEO**: Ra quyết định dùng người
- **HR**: Tuyển & phân loại nhân sự
- **Nhân sự**: Hiểu bản thân, định hướng phát triển

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript
- **Styling**: Tailwind CSS 3+ (Liquid Glass / Apple style)
- **Backend**: Next.js API Routes / Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (credentials + OAuth)
- **AI**: Claude API (Anthropic) — RAG with uploaded knowledge base
- **File Upload**: UploadThing for knowledge docs (PDF, DOC)
- **Charts**: Recharts (radar chart, score cards)
- **Deployment**: Vercel

## Environment Variables

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ANTHROPIC_API_KEY=
UPLOAD_SECRET=
```

## Nguyên tắc sản phẩm

1. **Đơn giản**: Không over-engineer, 1 flow = 1 mục tiêu
2. **Insight là vua**: Không phải test đẹp, mà là kết luận đúng
3. **Data > cảm tính**: Càng dùng → càng thông minh
4. **Tìm "người phù hợp nhất"**, không phải "người giỏi nhất"
