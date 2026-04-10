# WE INSIGHT — Hệ thống đánh giá + AI Coach nhân sự

Nền tảng đánh giá nhân sự của WEHA Group. User làm test (DISC, Logic, Situation) + Thần số học → AI phân tích + tri thức doanh nghiệp (RAG) → Insight & khuyến nghị.

## Quick Reference

- **Stack**: Next.js 15, TypeScript, Tailwind CSS 4, PostgreSQL, Prisma 6, Claude API
- **Design**: Liquid Glass (Apple style) — glassmorphism, blur, bo góc mềm, animation mượt
- **Logo**: WEHA-style circles icon + "WE INSIGHT" in Be Vietnam Pro 900
- **Language**: Vietnamese with diacritics for all user-facing text
- **Core flow**: Data Input → AI Brain → Decision Output
- **Repo**: https://github.com/chutung-weha/weinsight

## Đã hoàn thành

### 1. Database & Schema (Prisma + PostgreSQL)
- **Status**: ✅ Hoàn thành
- 8 models: User, Question, Answer, TestSession, TestAnswer, AIInsight, KnowledgeDoc, AIConfig
- 7 enums: Role, TestType (DISC/LOGIC/SITUATION/NUMEROLOGY), SessionStatus, DocStatus, AITone, AIObjective
- Seed data: admin user, demo user, 20 câu DISC, 15 câu Logic, 10 câu Situation, AI config mặc định
- Prisma client output: `src/generated/prisma` (gitignored, generate khi cài)
- Indexes: `(testType, active)`, `(userId, testType)`, `(status)`, `(sessionId)`, `(uploadedById)`

### 2. Authentication (NextAuth v4)
- **Status**: ✅ Hoàn thành + Hardened
- Credentials provider (email + bcrypt password)
- JWT session strategy, 7-day max age
- Role sync từ DB mỗi **1 phút** (phát hiện user bị deactivate nhanh hơn)
- Middleware route protection: auth routes, protected routes, admin routes, `/than-so-hoc`
- Đăng nhập `/dang-nhap`, đăng ký `/dang-ky` với Zod validation
- **Constant-time bcrypt compare** — chống timing attack email enumeration
- Password validation: min 8 ký tự + 1 chữ hoa + 1 số
- Race condition email duplicate: xử lý qua Prisma P2002 unique constraint

### 3. Test Flow (DISC + Logic + Situation)
- **Status**: ✅ Hoàn thành
- **Shared TestRunner component** — 3 test pages chỉ ~20 dòng mỗi file, delegate UI cho `TestRunner`
- Questions API: `GET /api/test/[testType]/questions` — validate testType, không leak scores
- Server Actions: `startTest()`, `submitAnswer()`, `completeTest()`
- Resume support: quay lại session IN_PROGRESS, biết câu nào đã trả lời
- **Atomic `updateMany`** trong completeTest — chống race condition double-submit
- Score aggregation từ JSON answer scores, `computeScoreMeta()` dynamic từ DB
- Seed data: 20 DISC + 15 Logic (reasoning rubric 0/1/3) + 10 Situation (4 chiều năng lực)

### 4. Thần số học Pythagoras
- **Status**: ✅ Hoàn thành
- Route: `/than-so-hoc` (protected, cần đăng nhập)
- Input: Họ tên khai sinh + ngày/tháng/năm sinh (3 selects)
- 6 chỉ số: Số chủ đạo, Thái độ, Năng lực tự nhiên, Sứ mệnh, Linh hồn, Nhân cách
- Strip dấu tiếng Việt (Đ→D + NFD normalize) trước khi quy đổi Pythagoras
- Master numbers 11, 22 giữ nguyên cho: Số chủ đạo, Sứ mệnh, Linh hồn, Nhân cách
- Validate ngày thực tế (chặn 31/02), chống double-click save, dedup session 1 phút
- Descriptions Vietnamese cho 11 số (1-9, 11, 22) x 6 chỉ số
- Server action lưu kết quả vào TestSession (NUMEROLOGY type)
- Score ring fill theo value/9

### 5. AI Insight
- **Status**: ✅ Hoàn thành (cần ANTHROPIC_API_KEY để dùng real AI)
- Claude API integration với structured prompt — **bao gồm maxScores context** (score/max %)
- Rule-based fallback cho DISC, Logic, Situation (dynamic từ DB, không hardcode)
- **30s timeout** trên Claude API call (AbortController)
- **Rate limit** 5 requests/user/phút trên POST `/api/insight/[sessionId]`
- API routes: `GET/POST /api/insight/[sessionId]`
- Kết quả: summary, strengths, improvements, suitableRoles, recommendation

### 6. Landing Page
- **Status**: ✅ Hoàn thành
- 6 sections: Hero, Features (6 cards), How it Works (3 steps), AI Insight Preview, Who is it for, CTA
- Liquid Glass design system trong `globals.css`
- Scroll animations: IntersectionObserver + `.reveal` / `.reveal-left` / `.reveal-right`
- `prefers-reduced-motion` support
- Fonts: Inter (body) + Be Vietnam Pro (logo)

### 7. Result Page
- **Status**: ✅ Hoàn thành
- API: `GET /api/result/[sessionId]` — trả `totalScores` + `maxScores` + `questionCount`
- Dynamic theme per test type (DISC cyan, Logic violet, Situation blue)
- DISC: proportion (tỷ trọng), overall = maxPct, label "profile"
- Logic/Situation: absolute scores (score/maxPossible), overall = 60% max + 40% avg
- NUMEROLOGY: skip computeScoreMeta (không có questions)
- Permission check: owner hoặc HR/ADMIN mới xem được

### 8. Security Hardening
- **Status**: ✅ Hoàn thành
- Constant-time bcrypt compare (chống timing attack)
- In-memory sliding window rate limiter (`src/lib/rate-limit.ts`)
- Atomic updateMany chống double-submit trong completeTest
- 30s timeout cho Claude API call
- Token sync gap giảm từ 5 phút → 1 phút
- Password validation: min 8 + uppercase + number
- Error boundaries (root, test, result) với retry button

### 9. Error Handling & Loading States
- **Status**: ✅ Hoàn thành
- Error boundaries: `src/app/error.tsx`, `src/app/test/error.tsx`, `src/app/result/error.tsx`
- Loading skeletons: `src/app/test/loading.tsx`, `src/app/result/loading.tsx`
- `prefers-reduced-motion` CSS media query
- `aria-label` cho Logo SVG

## Trạng thái hiện tại

| Component | Status | Ghi chú |
|-----------|--------|---------|
| PostgreSQL local | ✅ Running | localhost:5432, db: weinsight |
| Prisma schema + migrations | ✅ Done | 3 migrations (init, knowledge index, numerology enum) |
| Seed data | ✅ Done | Admin + demo user, 20 DISC + 15 Logic + 10 Situation questions |
| NextAuth credentials | ✅ Done | JWT, constant-time auth, 1-min role sync |
| DISC test flow | ✅ Done | Full flow: start → submit → complete → result |
| Logic test flow | ✅ Done | 15 câu, reasoning rubric 0/1/3 |
| Situation test flow | ✅ Done | 10 câu, 4 chiều: leadership/teamwork/communication/problemSolving |
| Thần số học | ✅ Done | 6 chỉ số Pythagoras, validate ngày, dedup save |
| AI Insight (Claude) | ⚠️ Cần API key | Fallback rule-based cho DISC/Logic/Situation. Numerology chưa có fallback. |
| Landing page | ✅ Done | Liquid Glass, scroll animations, reduced motion |
| Auth pages | ✅ Done | Đăng nhập + đăng ký, password strength |
| Result page | ✅ Done | Dynamic per test type, maxScores từ DB |
| Security | ✅ Done | Rate limit, timing attack fix, error boundaries |
| Test selection page | ✅ Done | 3 MCQ tests + section "Công cụ khác" cho Thần số học |
| Admin Dashboard | ❌ Chưa làm | Layout, sidebar, CRUD, settings |
| Hồ sơ nhân sự `/ho-so` | ❌ Chưa làm | |
| Lịch sử test `/history` | ❌ Chưa làm | |
| Knowledge upload (RAG) | ❌ Chưa làm | UploadThing integration |
| AI Insight cho Numerology | ⚠️ Chưa làm | Cần thêm fallback + prompt trong generate-insight.ts |
| Responsive testing | ⚠️ Chưa test kỹ | CSS mobile-first nhưng chưa verify |

## Bước tiếp theo

1. **AI Insight cho Numerology** — Thêm `generateNumerologyFallback()` + Claude prompt trong `generate-insight.ts`
2. **Admin Dashboard** — Layout + sidebar, quản lý users, questions CRUD, AI config, knowledge upload
3. **Hồ sơ nhân sự** `/ho-so` — Profile page, lịch sử test, radar chart tổng hợp
4. **RAG / Knowledge upload** — UploadThing integration, PDF/DOC parsing, vector storage
5. **ANTHROPIC_API_KEY** — Cấu hình để bật real AI insight thay vì rule-based fallback
6. **Responsive testing** — Verify mobile/tablet trên tất cả pages
7. **Deploy Vercel** — Environment variables, production database (Neon/Supabase)
8. **Test suite** — Vitest + Testing Library cho business logic (scoring, numerology, auth)

## Quyết định quan trọng & Lý do

| Quyết định | Lý do |
|------------|-------|
| **NextAuth v4** (không v5 beta) | v5 vẫn beta, không stable. v4 đã battle-tested. |
| **JWT session** (không database session) | Không cần Prisma Adapter, đơn giản hơn. Role sync mỗi 1 phút bù đắp. |
| **Credentials only** (không OAuth cho MVP) | MVP chỉ cần email/password. OAuth thêm sau khi core stable. |
| **Server Actions cho mutations** | Secure hơn API routes — không expose endpoints, tự validate CSRF. |
| **API Routes cho GET** | Cần fetch từ client components (useEffect), Server Actions chỉ dùng cho mutations. |
| **Zod v4** (không react-hook-form) | Chỉ có 2-4 field forms, không cần library nặng. Zod validate cả client + server. |
| **JSON scores trên Answer** | Flexible scoring: DISC `{D:3,I:1}`, Logic `{correct:1,reasoning:3}`, Situation `{leadership:2}`. |
| **AIInsight tách khỏi TestSession** | Support re-analysis: thay đổi AI config → generate insight mới mà không mất cái cũ. |
| **`/api/result/[sessionId]`** (không qua testType) | Result page chỉ biết sessionId. API tự query testType từ session. |
| **DISC overall = maxPct, Logic/Situation = blend** | DISC đo thiên hướng (proportion), Logic/Situation đo năng lực (absolute). Formula khác nhau. |
| **Dynamic maxScores từ DB** | Không hardcode số câu hỏi. `computeScoreMeta()` query max possible per dimension từ actual answers. |
| **Shared TestRunner component** | 3 test pages giảm từ ~235 dòng → ~20 dòng mỗi file. Fix bug 1 chỗ thay vì 3. |
| **Thần số học standalone `/than-so-hoc`** | Khác biệt cơ bản với MCQ tests (không có Q&A flow). Tách route riêng, UX phù hợp hơn. |
| **Numerology tính client-side, lưu server-side** | Instant UX (không chờ API round-trip), nhưng persist vào TestSession cho history. |
| **Constant-time bcrypt compare** | Chống timing attack enumeration email. Luôn chạy bcrypt kể cả user không tồn tại. |
| **In-memory rate limiter** (không Redis) | MVP single-instance. Upgrade sang Redis khi scale. Đủ cho internal HR tool. |
| **Atomic updateMany** (không $transaction) | Đơn giản hơn transaction. `WHERE status = IN_PROGRESS` là atomic guard — double-submit fail silently. |
| **P2002 catch thay vì findUnique+create** | Tránh race condition: 2 request đồng thời cùng email. Prisma unique constraint là atomic. |
| **Logic reasoning rubric 0/1/3** | 3=đúng, 1=sai nhưng có suy luận, 0=random. Document trong seed.ts. |
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
│   ├── (auth)/              # Đăng nhập, đăng ký
│   ├── api/                 # Auth, test questions, result, insight
│   ├── test/                # Test selection + DISC/Logic/Situation pages
│   ├── than-so-hoc/         # Thần số học Pythagoras
│   ├── result/[id]/         # Kết quả test
│   ├── error.tsx            # Root error boundary
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout (Inter + Be Vietnam Pro, SessionProvider)
│   └── globals.css          # Liquid Glass design system + prefers-reduced-motion
├── components/
│   ├── layout/              # Header, Footer, Logo (aria-label)
│   ├── numerology/          # NumerologyPage (form + result)
│   ├── test/                # TestRunner (shared MCQ test component)
│   ├── providers/           # SessionProvider
│   └── ui/                  # ScrollReveal
├── lib/
│   ├── actions/             # Server Actions (test flow, numerology save)
│   ├── ai/                  # AI insight generation (Claude API + fallback)
│   ├── validations/         # Zod schemas (auth, test, numerology)
│   ├── auth.ts              # NextAuth config (constant-time, 1-min sync)
│   ├── auth-utils.ts        # getCurrentUser, requireAuth, requireRole
│   ├── numerology.ts        # Pythagoras calculation engine
│   ├── numerology-descriptions.ts  # Vietnamese descriptions per number
│   ├── prisma.ts            # Prisma client singleton
│   ├── rate-limit.ts        # In-memory sliding window rate limiter
│   ├── scoring.ts           # computeScoreMeta (dynamic maxScores from DB)
│   └── utils.ts             # cn() utility (clsx + tailwind-merge)
├── types/                   # TypeScript types (test, numerology, NextAuth augmentation)
└── middleware.ts             # Route protection (test, result, than-so-hoc, admin)
```
