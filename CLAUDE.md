# WE INSIGHT — Hệ thống đánh giá + AI Coach nhân sự

Nền tảng đánh giá nhân sự của WEHA Group. User làm test (DISC, Logic, Situation) → AI phân tích + tri thức doanh nghiệp (RAG) → Insight & khuyến nghị.

## Quick Reference

- **Stack**: Next.js 16, TypeScript, Tailwind CSS 4, PostgreSQL, Prisma 6, Claude API
- **Design**: Liquid Glass (Apple style) — glassmorphism, blur, bo góc mềm, animation mượt
- **Logo**: WEHA-style circles icon + "WE INSIGHT" in Be Vietnam Pro 900
- **Language**: Vietnamese with diacritics for all user-facing text
- **Core flow**: Data Input → AI Brain → Decision Output
- **Repo**: https://github.com/chutung-weha/weinsight

## Đã hoàn thành

### 1. Database & Schema (Prisma + PostgreSQL)
- **Status**: ✅ Hoàn thành
- 8 models: User, Question, Answer, TestSession, TestAnswer, AIInsight, KnowledgeDoc, AIConfig
- 7 enums: Role, TestType, SessionStatus, DocStatus, AITone, AIObjective
- Seed data: admin user (admin@wehagroup.vn), demo user, 20 câu DISC, AI config mặc định
- Prisma client output: `src/generated/prisma` (gitignored, generate khi cài)

### 2. Authentication (NextAuth v4)
- **Status**: ✅ Hoàn thành
- Credentials provider (email + bcrypt password)
- JWT session strategy, 7-day max age
- Role sync từ DB mỗi 5 phút (phát hiện user bị deactivate)
- Middleware route protection: auth routes, protected routes, admin routes
- Đăng nhập `/dang-nhap`, đăng ký `/dang-ky` với Zod validation
- Race condition email duplicate: xử lý qua Prisma P2002 unique constraint

### 3. DISC Test Flow
- **Status**: ✅ Hoàn thành
- Questions API: `GET /api/test/[testType]/questions` — chỉ trả id, content, order (không leak scores)
- Server Actions: `startTest()`, `submitAnswer()`, `completeTest()`
- Resume support: quay lại session IN_PROGRESS, biết câu nào đã trả lời
- Score aggregation từ JSON answer scores
- Validation: kiểm tra đủ câu trả lời trước khi complete

### 4. AI Insight
- **Status**: ✅ Hoàn thành (cần ANTHROPIC_API_KEY để dùng real AI)
- Claude API integration với structured prompt
- Rule-based DISC fallback khi không có API key
- API routes: `GET/POST /api/insight/[sessionId]`
- Kết quả: summary, strengths, improvements, suitableRoles, recommendation

### 5. Landing Page
- **Status**: ✅ Hoàn thành
- 6 sections: Hero, Features (6 cards), How it Works (3 steps), AI Insight Preview, Who is it for, CTA
- Liquid Glass design system trong `globals.css`
- Scroll animations: IntersectionObserver + `.reveal` / `.reveal-left` / `.reveal-right`
- Fonts: Inter (body) + Be Vietnam Pro (logo)

### 6. Result Page
- **Status**: ✅ Hoàn thành
- API: `GET /api/result/[sessionId]` — dynamic, không phụ thuộc testType trong URL
- Score ring (SVG), DISC dimension bars, AI Insight display
- Overall score formula: 60% max dimension + 40% trung bình
- Permission check: owner hoặc HR/ADMIN mới xem được

## Trạng thái hiện tại

| Component | Status | Ghi chú |
|-----------|--------|---------|
| PostgreSQL local | ✅ Running | localhost:5432, db: weinsight |
| Prisma schema + migrations | ✅ Done | 1 migration (init) |
| Seed data | ✅ Done | Admin + demo user, 20 DISC questions |
| NextAuth credentials | ✅ Done | JWT, role sync, middleware |
| DISC test flow | ✅ Done | Full flow: start → submit → complete → result |
| Logic test | ❌ Chưa làm | Cần seed questions + tạo page |
| Situation test | ❌ Chưa làm | Cần seed questions + tạo page |
| AI Insight (Claude) | ⚠️ Cần API key | Fallback rule-based đang hoạt động |
| Landing page | ✅ Done | Liquid Glass, scroll animations |
| Auth pages | ✅ Done | Đăng nhập + đăng ký |
| Result page | ✅ Done | Dynamic, score ring, AI insight |
| Admin Dashboard | ❌ Chưa làm | Layout, sidebar, CRUD, settings |
| Hồ sơ nhân sự `/ho-so` | ❌ Chưa làm | |
| Lịch sử test `/history` | ❌ Chưa làm | |
| Knowledge upload (RAG) | ❌ Chưa làm | UploadThing integration |
| Responsive testing | ⚠️ Chưa test kỹ | CSS mobile-first nhưng chưa verify |

## Bước tiếp theo

1. **Admin Dashboard** — Layout + sidebar, quản lý users, questions CRUD, AI config, knowledge upload
2. **Logic + Situation tests** — Seed questions, tạo test pages (reuse DISC page pattern)
3. **Hồ sơ nhân sự** `/ho-so` — Profile page, lịch sử test, radar chart tổng hợp
4. **RAG / Knowledge upload** — UploadThing integration, PDF/DOC parsing, vector storage
5. **ANTHROPIC_API_KEY** — Cấu hình để bật real AI insight thay vì rule-based fallback
6. **Responsive testing** — Verify mobile/tablet trên tất cả pages
7. **Deploy Vercel** — Environment variables, production database (Neon/Supabase)

## Quyết định quan trọng & Lý do

| Quyết định | Lý do |
|------------|-------|
| **NextAuth v4** (không v5 beta) | v5 vẫn beta, không stable với Next.js 16 + React 19. v4 đã battle-tested. |
| **JWT session** (không database session) | Không cần Prisma Adapter, đơn giản hơn. Role sync mỗi 5 phút bù đắp. |
| **Credentials only** (không OAuth cho MVP) | MVP chỉ cần email/password. OAuth thêm sau khi core stable. |
| **Server Actions cho mutations** | Secure hơn API routes — không expose endpoints, tự validate CSRF. |
| **API Routes cho GET** | Cần fetch từ client components (useEffect), Server Actions chỉ dùng cho mutations. |
| **Zod v4** (không react-hook-form) | Chỉ có 2-4 field forms, không cần library nặng. Zod validate cả client + server. |
| **JSON scores trên Answer** | Flexible scoring: DISC dùng `{D:3,I:1}`, Logic dùng `{correct:1}`, Situation dùng `{leadership:2}`. |
| **AIInsight tách khỏi TestSession** | Support re-analysis: thay đổi AI config → generate insight mới mà không mất cái cũ. |
| **`/api/result/[sessionId]`** (không qua testType) | Result page chỉ biết sessionId, không biết testType. API mới tự query từ session. |
| **Overall score = 60% max + 40% avg** | Reward cả chuyên sâu (max cao) lẫn cân bằng (avg cao). Công bằng hơn formula cũ. |
| **P2002 catch thay vì findUnique+create** | Tránh race condition: 2 request đồng thời cùng email. Prisma unique constraint là atomic. |
| **Middleware file = `middleware.ts`** | Next.js 16 gọi là "proxy" nhưng vẫn đọc file `middleware.ts` + export `middleware()`. |
| **Header/Footer trên mỗi page** (chưa refactor) | Move vào layout group đòi hỏi restructure folders, risk break URLs. Sẽ refactor khi thêm pages. |

## Rules

Detailed rules are in `.claude/rules/`:

| File | Scope | Content |
|------|-------|---------|
| `project-overview.md` | Always | Tech stack, env vars, product vision |
| `design-system.md` | `**/*.html, **/*.css, **/*.tsx` | Liquid Glass UI, colors, typography |
| `site-structure.md` | `src/app/**/*` | All pages: user test, results, admin config |
| `ai-features.md` | `src/lib/ai/**/*`, `src/app/api/**/*` | DISC/Logic/Situation tests, RAG, AI insight |
| `company-info.md` | Always | WEHA Group details, culture, footer |
| `code-conventions.md` | `src/**/*` | Code style, folder structure |
| `mandatory-rules.md` | Always | Screenshot check, mobile-first, animations, Vietnamese diacritics, hover effects |

## Cấu trúc thư mục chính

```
src/
├── app/
│   ├── (auth)/          # Đăng nhập, đăng ký
│   ├── api/             # Auth, test questions, result, insight
│   ├── test/            # Test selection + DISC test page
│   ├── result/[id]/     # Kết quả test
│   ├── page.tsx         # Landing page
│   ├── layout.tsx       # Root layout (Inter + Be Vietnam Pro, SessionProvider)
│   └── globals.css      # Liquid Glass design system
├── components/
│   ├── layout/          # Header, Footer, Logo
│   ├── providers/       # SessionProvider
│   └── ui/              # ScrollReveal
├── lib/
│   ├── actions/         # Server Actions (test flow)
│   ├── ai/              # AI insight generation
│   ├── validations/     # Zod schemas (auth, test)
│   ├── auth.ts          # NextAuth config
│   ├── auth-utils.ts    # getCurrentUser, requireAuth, requireRole
│   └── prisma.ts        # Prisma client singleton
├── types/               # TypeScript types + NextAuth augmentation
└── middleware.ts         # Route protection
```
