# WE INSIGHT — Hệ thống đánh giá + AI Coach nhân sự

Nền tảng đánh giá nhân sự của WEHA Group. User làm test (DISC, Logic, Situation) + Thần số học → AI phân tích + tri thức doanh nghiệp (RAG) → Insight & khuyến nghị.

## Quick Reference

- **Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS 4, PostgreSQL, Prisma 6, Groq API
- **Design**: Liquid Glass (Apple style) — glassmorphism, blur, bo góc mềm, animation mượt
- **Logo**: WEHA-style circles icon + "WE INSIGHT" in Be Vietnam Pro 900
- **Language**: Vietnamese with diacritics for all user-facing text
- **Core flow**: Data Input → AI Brain → Decision Output
- **Auth**: Google OAuth only (NextAuth v4, JWT)
- **Repo**: https://github.com/chutung-weha/weinsight

## Đã hoàn thành

### 1. Database & Schema (Prisma + PostgreSQL)
- **Status**: ✅ Hoàn thành
- 8 models: User, Question, Answer, TestSession, TestAnswer, AIInsight, KnowledgeDoc, AIConfig
- 7 enums: Role, TestType (DISC/LOGIC/SITUATION/NUMEROLOGY), SessionStatus (IN_PROGRESS/COMPLETED/ABANDONED), DocStatus, AITone, AIObjective
- Seed data: admin user, demo user, 20 câu DISC, 15 câu Logic, 10 câu Situation, AI config mặc định
- Prisma client output: `src/generated/prisma` (gitignored, generate khi cài)
- Indexes: `(testType, active)`, `(userId, testType)`, `(status)`, `(sessionId)`, `(uploadedById)`

### 2. Authentication (NextAuth v4 + Google OAuth)
- **Status**: ✅ Hoàn thành + Hardened
- Google OAuth provider (tài khoản tự tạo lần đầu đăng nhập via upsert)
- JWT session strategy, 7-day max age
- Role sync từ DB mỗi **1 phút** (phát hiện user bị deactivate)
- **Disabled user handling**: JWT callback xóa sạch token data + set `disabled` flag → middleware reject ngay
- Middleware route protection: check `token.id` + `token.disabled` (không chỉ token exists)
- Auth routes (`/dang-nhap`), protected routes, admin routes (`/admin/*`)
- `callbackUrl` sanitization — chỉ chấp nhận relative path, chặn open redirect
- Role type: union `"ADMIN" | "HR" | "CANDIDATE"` (không dùng string)
- Runtime env validation (`src/lib/env.ts`) — fail-fast khi thiếu env vars bắt buộc

### 3. Test Flow (DISC + Logic + Situation)
- **Status**: ✅ Hoàn thành
- **Shared TestRunner component** — 3 test pages chỉ ~20 dòng mỗi file
- Questions API: `GET /api/test/[testType]/questions` — validate testType, không leak scores
- Server Actions: `startTest()`, `submitAnswer()`, `completeTest()`
- Resume support: quay lại session IN_PROGRESS, biết câu nào đã trả lời
- **Stale session detection**: nếu question bank thay đổi (question bị inactive) trong lúc user đang làm → auto abandon session cũ, tạo mới
- **Atomic `updateMany`** trong completeTest — chống race condition double-submit
- Score aggregation từ JSON answer scores, `computeScoreMeta()` dynamic từ DB
- Seed data: 20 DISC + 15 Logic (reasoning rubric 0/1/3) + 10 Situation (4 chiều năng lực)
- UX fixes: progress bar bắt đầu từ 1/N (không 0%), error clear trước retry, functional updater chống stale closure

### 4. Thần số học Pythagoras
- **Status**: ✅ Hoàn thành
- Route: `/than-so-hoc` (protected, cần đăng nhập)
- Input: Họ tên khai sinh + ngày/tháng/năm sinh (3 selects)
- 6 chỉ số: Số chủ đạo, Thái độ, Năng lực tự nhiên, Sứ mệnh, Linh hồn, Nhân cách
- **Thuật toán chuẩn Pythagoras**: cộng tất cả chữ cái trước rồi reduce 1 lần (không reduce từng từ)
- **Master numbers 11, 22 giữ nguyên ở bước trung gian** Life Path (day/month/year reduce riêng với keepMaster=true)
- Strip dấu tiếng Việt (Đ→D + NFD normalize) trước khi quy đổi
- Validate ngày thực tế (chặn 31/02), chống double-click save
- **Dedup session**: match theo `candidateName` + `dateOfBirth` + 1 phút window (không chỉ tên)
- Server action lưu `candidateName` + `dateOfBirth` vào TestSession
- Score ring fill theo `value/22` (scale đến master number max, không cap ở 9)
- Descriptions Vietnamese cho 11 số (1-9, 11, 22) x 6 chỉ số

### 5. AI Insight
- **Status**: ✅ Hoàn thành (cần GROQ_API_KEY để dùng real AI)
- **Groq API** (LLaMA 3.1) với structured prompt — bao gồm maxScores context (score/max %)
- Rule-based fallback cho DISC, Logic, Situation (dynamic từ DB, không hardcode)
- **30s timeout** trên Groq API call (AbortController)
- **Rate limit** 5 requests/user/phút trên POST `/api/insight/[sessionId]`
- **Duplicate prevention**: check existing insight trước khi generate mới
- **CSRF protection**: Origin header check trên POST route
- **Input sanitization**: `sanitizeForPrompt()` cho candidateName, occupation, customPrompt, Q&A content — chống prompt injection
- `response.json()` wrapped trong try/catch — graceful fallback khi Groq trả non-JSON
- `candidateName` null safety: fallback "Ứng viên"
- API routes: `GET/POST /api/insight/[sessionId]`
- GET response không trả `fullResponse` (raw LLM output) — chỉ structured fields

### 6. Landing Page
- **Status**: ✅ Hoàn thành
- 6 sections: Hero, Features (6 cards), How it Works (3 steps), AI Insight Preview, Who is it for, CTA
- Liquid Glass design system trong `globals.css`
- Scroll animations: IntersectionObserver + `.reveal` / `.reveal-left` / `.reveal-right`
- Stagger delays: `.d1` tới `.d6` (0.1s–0.6s)
- `prefers-reduced-motion` support
- `@media (scripting: none)` fallback — hiện nội dung nếu JS không load
- Fonts: Inter (body) + Be Vietnam Pro (logo, chỉ load weight 900)

### 7. Result Page
- **Status**: ✅ Hoàn thành
- API: `GET /api/result/[sessionId]` — trả `totalScores` + `maxScores` + `questionCount`
- Dynamic theme per test type (DISC cyan, Logic violet, Situation blue)
- DISC: proportion (tỷ trọng), overall = maxPct, label "profile"
- Logic/Situation: absolute scores (score/maxPossible), overall = 60% max + 40% avg
- NUMEROLOGY: skip computeScoreMeta (không có questions)
- Permission check: owner hoặc HR/ADMIN mới xem được
- Loading text: "Đang tải kết quả..." (không "AI đang phân tích" khi chưa gọi AI)

### 8. Security Hardening
- **Status**: ✅ Hoàn thành
- **Security headers** (next.config.ts): HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Content-Security-Policy
- **CSP policy**: whitelist Google OAuth, Google Fonts, Google user avatars
- **CSRF Origin check** trên POST `/api/insight`
- In-memory sliding window rate limiter với LRU eviction (MAX_KEYS=10k), không dùng setInterval (serverless-compatible)
- **Prompt injection defense**: `sanitizeForPrompt()` trên tất cả user input đưa vào LLM
- Atomic updateMany chống double-submit trong completeTest
- 30s timeout cho Groq API call
- Token sync gap: 1 phút + disabled flag xóa sạch token
- **callbackUrl validation**: chỉ chấp nhận relative paths
- **Env validation** (`src/lib/env.ts`): fail-fast khi thiếu DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET. Warn khi NEXTAUTH_URL=localhost trong production
- `dateOfBirth` validation: regex `YYYY-MM-DD` + max length cho candidateName/occupation
- `next-auth@4.24.13` — fix CVE email misdelivery

### 9. Error Handling & Loading States
- **Status**: ✅ Hoàn thành
- Error boundaries: `src/app/error.tsx`, `src/app/test/error.tsx`, `src/app/result/error.tsx`
- Loading skeletons: `src/app/test/loading.tsx`, `src/app/result/loading.tsx`
- TestRunner: `loading` init `true` (không flash "Không có câu hỏi" trước khi fetch xong)
- `prefers-reduced-motion` CSS media query
- `aria-label` cho Logo SVG

### 10. Admin Dashboard (Placeholder)
- **Status**: ⚠️ Placeholder — cần phát triển thêm
- Layout với server-side auth guard (ADMIN/HR only)
- Dashboard page: stats tổng quan (users, sessions, insights)
- Chưa có: CRUD câu hỏi, quản lý users, AI config, knowledge upload

### 11. SEO & Meta
- **Status**: ✅ Cơ bản hoàn thành
- `sitemap.ts`: 4 public routes (/, /dang-nhap, /test, /than-so-hoc)
- `robots.ts`: disallow /admin, /api, /result, /ho-so, /history
- Root metadata: title + description tiếng Việt
- Chưa có: OpenGraph images, Twitter cards, metadataBase, structured data (JSON-LD)

### 12. Code Quality & Tooling
- **Status**: ✅ Hoàn thành
- ESLint config: ignores `.next/`, `node_modules/`, `prisma/`, `next-env.d.ts` → **0 errors** (dùng được như quality gate)
- TypeScript strict mode
- `npm run lint` clean
- README.md mô tả đầy đủ dự án
- `.env.example` với hướng dẫn
- Footer: không còn dead links `href="#"`, external links có `target="_blank" rel="noopener"`

## Trạng thái hiện tại

| Component | Status | Ghi chú |
|-----------|--------|---------|
| PostgreSQL | ✅ Running | Supabase (production), localhost (dev) |
| Prisma schema + migrations | ✅ Done | 3 migrations + ABANDONED enum |
| Seed data | ✅ Done | Admin + demo user, 45 câu hỏi |
| NextAuth Google OAuth | ✅ Done | JWT, env validation, disabled user handling |
| DISC test flow | ✅ Done | Full flow + stale session detection |
| Logic test flow | ✅ Done | 15 câu, reasoning rubric 0/1/3 |
| Situation test flow | ✅ Done | 10 câu, 4 chiều năng lực |
| Thần số học | ✅ Done | 6 chỉ số, chuẩn Pythagoras, dedup đúng |
| AI Insight (Groq) | ✅ Done | Cần GROQ_API_KEY. Fallback rule-based cho DISC/Logic/Situation |
| Landing page | ✅ Done | Liquid Glass, scroll animations, noscript fallback |
| Auth pages | ✅ Done | Google OAuth, callbackUrl sanitized |
| Result page | ✅ Done | Dynamic per test type, maxScores từ DB |
| Security | ✅ Done | Headers, CSP, CSRF, rate limit, prompt sanitize, env validation |
| ESLint | ✅ Done | 0 errors — quality gate hoạt động |
| Admin Dashboard | ⚠️ Placeholder | Stats page, chưa có CRUD |
| SEO | ⚠️ Cơ bản | sitemap + robots, chưa có OG/Twitter |
| Hồ sơ nhân sự `/ho-so` | ❌ Chưa làm | |
| Lịch sử test `/history` | ❌ Chưa làm | |
| Knowledge upload (RAG) | ❌ Chưa làm | |
| AI Insight cho Numerology | ⚠️ Chưa có fallback | Groq xử lý được, nhưng fallback rule-based chưa viết |
| Test suite | ❌ Chưa có | Không có *.test.*, *.spec.* |
| Docker / VPS deploy | ❌ Chưa có | Cần Dockerfile, docker-compose |
| Responsive testing | ⚠️ Chưa test kỹ | CSS mobile-first nhưng chưa verify |

## Bước tiếp theo

### Ưu tiên cao
1. **Deploy lên GCP VPS** — Tạo Dockerfile + docker-compose, đổi Prisma binaryTargets sang `debian-openssl-3.0.x`, thêm `output: 'standalone'` vào next.config.ts, setup Nginx + SSL
2. **Admin Dashboard đầy đủ** — CRUD câu hỏi, quản lý users, AI config, knowledge upload
3. **Test suite** — Vitest + Testing Library cho business logic (scoring, numerology, auth, session dedup)

### Ưu tiên trung bình
4. **AI Insight cho Numerology** — Thêm `generateNumerologyFallback()` trong `generate-insight.ts`
5. **Hồ sơ nhân sự** `/ho-so` — Profile page, lịch sử test, radar chart tổng hợp
6. **SEO nâng cao** — OpenGraph images, Twitter cards, metadataBase, JSON-LD structured data
7. **Result page SSR** — Refactor từ full client component sang partial Server Component (giảm waterfall)

### Ưu tiên thấp
8. **RAG / Knowledge upload** — PDF/DOC parsing, vector storage, AI context enrichment
9. **Responsive testing** — Verify mobile/tablet trên tất cả pages
10. **next-auth v5 migration** — Chuyển từ v4 sang Auth.js khi stable (breaking changes lớn)

## Quyết định quan trọng & Lý do

| Quyết định | Lý do |
|------------|-------|
| **Google OAuth only** (bỏ email/password) | Giảm attack surface (không cần bcrypt, timing attack). UX đơn giản hơn. Auto-create user lần đầu đăng nhập. |
| **NextAuth v4** (không v5) | v5 vẫn có breaking changes. v4 đã battle-tested với Next.js 15 (dù không officially supported). |
| **JWT session** (không database session) | Không cần Prisma Adapter, đơn giản hơn. Role sync mỗi 1 phút + disabled flag bù đắp. |
| **Groq API** (không Claude/Anthropic) | Free tier 14.400 req/ngày. LLaMA 3.1 đủ tốt cho HR analysis. Dễ đổi sang provider khác (OpenAI-compatible). |
| **Server Actions cho mutations** | Secure hơn API routes — tự validate CSRF. Dùng cho startTest, submitAnswer, completeTest, saveNumerology. |
| **API Routes cho GET** | Cần fetch từ client components (useEffect). Server Actions chỉ dùng cho mutations. |
| **Zod v4** (không react-hook-form) | Chỉ có 2-4 field forms, không cần library nặng. Zod validate cả client + server. |
| **JSON scores trên Answer** | Flexible scoring: DISC `{D:3,I:1}`, Logic `{correct:1,reasoning:3}`, Situation `{leadership:2}`. |
| **AIInsight tách khỏi TestSession** | Support re-analysis. POST endpoint check existing trước → không tạo duplicate. |
| **Dynamic maxScores từ DB** | Không hardcode số câu hỏi. `computeScoreMeta()` query max possible per dimension từ actual answers. |
| **Shared TestRunner component** | 3 test pages giảm từ ~235 dòng → ~20 dòng mỗi file. Fix bug 1 chỗ thay vì 3. |
| **Thần số học standalone `/than-so-hoc`** | Khác biệt cơ bản với MCQ tests (không có Q&A flow). Tách route riêng, UX phù hợp hơn. |
| **Numerology tính client-side, lưu server-side** | Instant UX (không chờ API), nhưng server recalculate để defense-in-depth. |
| **In-memory rate limiter** (không Redis) | MVP single-instance. Trên VPS persistent process hoạt động tốt. Upgrade Redis khi PM2 cluster mode. |
| **Stale session auto-abandon** | Nếu admin thay đổi question bank, user đang làm dở sẽ bị stuck. Auto abandon + recreate giải quyết. |
| **Token disabled flag** | Middleware check `token.id` + `!token.disabled`. User bị ban → token bị invalidate ngay, không phải chờ hết 7 ngày JWT. |
| **Insight duplicate prevention** | POST endpoint check existing insight trước. Nếu đã có → trả lại, không gọi AI lại. Tiết kiệm quota + tránh data rác. |
| **CSP header whitelist** | Google OAuth, Google Fonts, Google avatar images. Chặn inline script injection từ XSS. |
| **GCP VPS** (thay vì Vercel) | Vercel Hobby timeout 10s giết AI insight (30s). VPS không giới hạn. In-memory rate limiter hoạt động đúng. Chi phí dự đoán được ($7-15/tháng). Data sovereignty cho HR data nhạy cảm. |

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
│   ├── (auth)/              # Đăng nhập, đăng ký (Google OAuth)
│   ├── admin/               # Admin dashboard (layout + stats page)
│   ├── api/                 # Auth, test questions, result, insight
│   ├── test/                # Test selection + DISC/Logic/Situation pages
│   ├── than-so-hoc/         # Thần số học Pythagoras
│   ├── result/[id]/         # Kết quả test
│   ├── sitemap.ts           # Sitemap generation
│   ├── robots.ts            # Robots.txt generation
│   ├── error.tsx            # Root error boundary
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout (Inter + Be Vietnam Pro 900)
│   └── globals.css          # Liquid Glass design system + animations
├── components/
│   ├── layout/              # Header, Footer, Logo
│   ├── numerology/          # NumerologyPage (form + result)
│   ├── test/                # TestRunner (shared MCQ test component)
│   ├── providers/           # SessionProvider
│   └── ui/                  # ScrollReveal
├── lib/
│   ├── actions/             # Server Actions (test flow, numerology save)
│   ├── ai/                  # AI insight generation (Groq API + fallback + sanitize)
│   ├── validations/         # Zod schemas (test, numerology)
│   ├── auth.ts              # NextAuth config (Google OAuth, disabled user handling)
│   ├── auth-utils.ts        # getCurrentUser, requireAuth, requireRole
│   ├── env.ts               # Runtime env validation (fail-fast)
│   ├── numerology.ts        # Pythagoras calculation engine (chuẩn, master numbers)
│   ├── numerology-descriptions.ts  # Vietnamese descriptions per number
│   ├── prisma.ts            # Prisma client singleton
│   ├── rate-limit.ts        # In-memory sliding window rate limiter (LRU eviction)
│   ├── scoring.ts           # computeScoreMeta (dynamic maxScores from DB)
│   └── utils.ts             # cn() utility (clsx + tailwind-merge)
├── types/                   # TypeScript types (test, numerology, NextAuth augmentation)
└── middleware.ts             # Route protection (token.id + disabled check)
```
