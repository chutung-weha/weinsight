---
name: weinsight
description: Skill tổng quan cho dự án WE INSIGHT — hệ thống đánh giá nhân sự + AI coach của WEHA Group. Sử dụng skill này mỗi khi làm việc với codebase WE INSIGHT, đặc biệt khi user nhắc đến test DISC/Logic/Situation, RAG knowledge upload, admin config engine, scoring, hoặc các thao tác liên quan đến hệ thống đánh giá nhân sự nội bộ WEHA.
---

# WE INSIGHT — Skill tổng quan

## Bản chất sản phẩm

WE INSIGHT là **web app nội bộ WEHA Group** dạng assessment platform có AI. Đây KHÔNG phải:
- Marketing site
- Recruitment portal
- Blog hay LMS
- App test miễn phí cho public

Đây là **decision tool** trả lời 1 câu hỏi: "Người này có phù hợp với vai trò X trong WEHA không?"

## Pipeline cốt lõi
User làm test → Scoring (DISC + Logic + Situation) → AI brain (RAG) → Structured insight → HR/CEO ra quyết định

## Stack chính

- **Framework:** Next.js 14+ App Router + TypeScript
- **Styling:** Tailwind CSS + Liquid Glass design system
- **Database:** PostgreSQL 16 + pgvector
- **ORM:** Prisma
- **Auth:** NextAuth v5 (Credentials provider)
- **AI:** Claude API (Sonnet prod, Haiku dev)
- **Embedding:** bge-m3 local (production)
- **Deploy:** VPS Ubuntu (Google Cloud) + Nginx + PM2 + Let's Encrypt

## 3 user types

| Role | Mục đích | Routes chính |
|---|---|---|
| USER | Làm test, xem kết quả cá nhân | /test, /result/[id], /history |
| HR | Review ứng viên, filter dashboard | /admin/dashboard, /admin/users/[id] |
| ADMIN | Cấu hình câu hỏi, upload tri thức, tune AI | /admin/questions, /admin/knowledge, /admin/ai-config |

## Mandatory rules (tuyệt đối không vi phạm)

1. **Tiếng Việt có dấu** cho mọi text user-facing
2. **AI output BẮT BUỘC structured JSON** validated bằng Zod
3. **RAG bắt buộc** cho mọi insight call (không gọi Claude "chay")
4. **Mobile-first responsive**
5. **Mọi thay đổi DB qua Prisma migration**
6. **AI_MODE=mock mặc định khi dev** để tránh đốt tiền
7. **Glass cards phải có background phía sau** (không glass trên nền trắng)
8. **Không commit .env, storage/, secrets**
9. **Type safety end-to-end** — không dùng `any`
10. **Comment 1 ngôn ngữ nhất quán per file**

## Khi user yêu cầu task, follow workflow này

### Nếu là task code mới
1. Đọc rule liên quan trong .claude/rules/ trước khi code
2. Liệt kê file sẽ tạo/sửa
3. ĐỢI user confirm
4. Code theo slice nhỏ, commit thường xuyên
5. Verify bằng test thủ công sau khi xong

### Nếu là task review/debug
1. Đọc code hiện tại trước
2. Đề xuất 2-3 nguyên nhân khả dĩ
3. KHÔNG sửa code đến khi user chọn nguyên nhân

### Nếu là task quyết định kiến trúc
1. Kiểm tra .claude/rules/ xem đã chốt chưa
2. Nếu chưa, triệu hồi sub-agent researcher
3. Đề xuất, KHÔNG quyết thay user

## Folder structure project

```
weinsight/
├── .claude/
│   ├── agents/           # Agent definitions (researcher.md)
│   ├── rules/            # Project rules (7 files)
│   └── skills/           # Skill definitions (weinsight.md)
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Prisma migrations
│   └── seed.ts           # Seed data (câu hỏi mẫu, tài liệu seed)
├── public/               # Static assets, images
├── storage/              # Uploaded knowledge files (RAG) — gitignored
├── src/
│   ├── app/
│   │   ├── (public)/     # Landing page, public routes
│   │   ├── (auth)/       # Login, register
│   │   ├── test/         # User test flow (DISC, Logic, Situation)
│   │   ├── result/[id]/  # User result view (radar chart, AI insight)
│   │   ├── history/      # User test history
│   │   ├── admin/
│   │   │   ├── dashboard/    # User list, scores, rank, filter
│   │   │   ├── users/[id]/   # User detail (answers, scores, AI insight)
│   │   │   ├── questions/    # CRUD câu hỏi (DISC/Logic/Situation)
│   │   │   ├── knowledge/    # Upload tri thức AI (RAG)
│   │   │   ├── ai-config/    # Cấu hình AI prompt (tone, mục tiêu)
│   │   │   └── settings/     # General settings
│   │   └── api/              # API routes
│   │       ├── auth/         # NextAuth endpoints
│   │       ├── test/         # Submit & score test
│   │       ├── insight/      # Trigger AI insight (RAG)
│   │       ├── knowledge/    # Upload & process knowledge files
│   │       └── admin/        # Admin CRUD endpoints
│   ├── components/
│   │   ├── ui/           # Base UI (Button, Card, Input, Glass components)
│   │   ├── layout/       # Header, Footer, Sidebar, AdminLayout
│   │   ├── test/         # TestCard, ProgressBar, QuestionCard, AnswerOption
│   │   ├── result/       # RadarChart, ScoreCard, InsightBox
│   │   ├── admin/        # DataTable, UserDetail, QuestionForm, KnowledgeUpload
│   │   └── ai/           # AIInsightCard, ScoreRing, DISCProfile
│   ├── lib/
│   │   ├── prisma.ts     # Prisma client singleton
│   │   ├── auth.ts       # NextAuth config
│   │   ├── utils.ts      # cn(), formatDate, etc.
│   │   └── ai/
│   │       ├── client.ts     # Claude API client wrapper
│   │       ├── rag.ts        # RAG: embed, search, context builder
│   │       ├── scoring.ts    # DISC/Logic/Situation scoring engine
│   │       ├── insight.ts    # Generate AI insight (prompt + RAG context)
│   │       └── prompts.ts    # Prompt templates (configurable tone/goal)
│   └── types/
│       ├── test.ts       # Test, Question, Answer types
│       ├── insight.ts    # AIInsight, Score, DISCProfile types
│       ├── user.ts       # User, Role types
│       └── api.ts        # API response types { success, data, error }
├── .env.local            # Environment variables — gitignored
├── .gitignore
├── CLAUDE.md             # Project overview for Claude Code
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
