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

### 1. Database & Schema
- **Status**: ✅ Hoàn thành và đã đồng bộ với database thật
- Prisma schema hiện có 8 models: `User`, `Question`, `Answer`, `TestSession`, `TestAnswer`, `AIInsight`, `KnowledgeDoc`, `AIConfig`
- `TestType` gồm `DISC`, `LOGIC`, `SITUATION`, `NUMEROLOGY`
- `AIInsight` đã được chuyển sang quan hệ **1 session = 1 insight** (`sessionId @unique`)
- Migration `20260416100310_make_ai_insight_singleton_per_session` đã apply + commit vào repo
- Migration `20260416120000_add_selected_question_ids` đã apply + commit — thêm `selectedQuestionIds Json?` vào `TestSession`
- `npx prisma generate` hoạt động bình thường với schema hiện tại

### 2. Authentication (NextAuth + Google OAuth)
- **Status**: ✅ Hoàn thành, build-safe
- Google OAuth only, auto-create user lần đầu
- JWT session, sync role/active mỗi 1 phút
- Disabled user bị vô hiệu hóa ngay qua `token.disabled`
- `callbackUrl` đã được sanitize để chặn open redirect
- `env.ts` để `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` ở dạng optional (fallback `""`). `auth.ts` kiểm tra `googleEnabled` trước khi push GoogleProvider — nếu thiếu env, providers = [], module load không throw, các route khác vẫn chạy.

### 3. Test Flow (DISC / Logic / Situation)
- **Status**: ✅ Hoàn thành
- Shared `TestRunner` cho 3 loại test
- Resume session `IN_PROGRESS`
- Phát hiện stale session khi question bank thay đổi
- `completeTest()` dùng atomic update để chống double-submit
- `computeScoreMeta()` lấy max score động từ DB
- **Nút Back**: user có thể quay lại câu trước, đáp án cũ được phục hồi từ `answeredMap` state
- **DISC random 20 câu**: mỗi session Fisher-Yates shuffle toàn bộ 200 câu rồi lấy 20 câu đầu (không trùng), lưu vào `selectedQuestionIds`. Mỗi câu có 4 đáp án A/B/C/D mapping D/I/S/C → 20 câu đã tự phân bổ điểm cho cả 4 chiều, không cần chia bucket theo dimension.
- `parseSelectedQuestionIds()` helper đảm bảo type-safe khi đọc JSON field từ Prisma

### 4. Thần số học Pythagoras
- **Status**: ✅ Hoàn thành
- Route riêng `/than-so-hoc`
- 6 chỉ số numerology hoạt động đúng (lifePath, attitude, naturalAbility, expression, soulUrge, personality)
- Save numerology result đã chuẩn hóa `dateOfBirth` theo `Date.UTC` + validation ngày hợp lệ
- Có dedup tránh tạo session numerology trùng trong thời gian ngắn
- Tên được normalize whitespace + minimum 2 chars sau trim

### 5. AI Insight
- **Status**: ✅ Hoàn thành theo scope mới
- AI insight hiện **chỉ generate cho session DISC** khi đủ:
  - `candidateName`
  - `dateOfBirth`
  - `occupation`
- Logic mới của insight là **đánh giá tổng thể dựa trên DISC + thần số học + nghề nghiệp**
- Có `getInsightEligibility()` để kiểm tra điều kiện generate thống nhất giữa API, result page và server actions
- Có fallback rule-based nếu không có `GROQ_API_KEY`
- POST `/api/insight/[sessionId]` đã:
  - siết CSRF origin check đúng origin
  - rate limit
  - dùng `upsert`/singleton logic để tránh duplicate

### 6. Result Page
- **Status**: ✅ Hoàn thành
- `GET /api/result/[sessionId]` trả thêm:
  - `canGenerateAiInsight`
  - `aiInsightReason`
- Client chỉ auto-generate insight khi session đủ điều kiện
- UI thông báo rõ vì sao chưa generate insight thay vì retry mù
- **NUMEROLOGY result**: hiển thị đúng 6 chỉ số với labels tiếng Việt, bar width normalize `/22 * 100`, ring hiển thị số chủ đạo
- Null-safe guard cho `a.question?.content`, `a.answer?.text`, `a.question?.order` trong API route

### 7. Build / Runtime / Tooling
- **Status**: ✅ Ổn định
- Đã bỏ phụ thuộc `next/font/google`, nên `npm run build` không còn phụ thuộc mạng Google Fonts
- `npm run lint` pass
- `npm run build` pass
- Đã thêm `npm run db:check` để kiểm tra kết nối DB bằng đúng Prisma Client của app
- `README.md`, `.env.example`, `prisma.config.ts` đã cập nhật theo cấu hình Supabase thực tế

### 8. Supabase / Prisma Connection
- **Status**: ✅ Đã xử lý
- Password có ký tự `@` đã được URL-encode trong `.env.local`
- `DATABASE_URL` dùng pooler của Supabase
- `DIRECT_URL` dùng direct DB endpoint của Supabase
- Thêm `sslmode=require`
- `prisma.config.ts` đã ưu tiên nạp `.env.local`
- `psql`, `npm run db:check`, `prisma generate`, và `prisma migrate status` ngoài sandbox đều hoạt động

### 9. Favicon / Brand Identity
- **Status**: ✅ Hoàn thành
- `src/app/icon.png` (32×32) và `src/app/icon-192.png` (192×192) dùng logo WEHA đầy đủ (2 vòng tròn chồng nhau)
- Logo fit trong khung vuông với transparent padding — icon nhỏ gọn trên tab browser
- Nguồn: `public/weha-logo.png` (423×260) → sharp `resize fit:contain` + `extend` để thêm padding
- `src/app/layout.tsx` khai báo explicit `icons` metadata

## Trạng thái hiện tại

| Phần | Status | Ghi chú |
|------|--------|---------|
| Prisma schema | ✅ Done | Schema hiện khớp DB thật |
| Prisma migrations | ✅ Done | Cả 2 migration quan trọng đã apply + commit |
| Prisma CLI | ✅ Done | Hoạt động khi có network thực; trong sandbox có thể fail vì bị chặn mạng |
| Supabase connection | ✅ Done | `DATABASE_URL` = pooler, `DIRECT_URL` = direct DB |
| Google OAuth | ✅ Done | Runtime-ready, không làm fail build nữa |
| DISC flow | ✅ Done | 200 câu seeded, random 20/session (5/hạng mục), nút Back |
| Logic flow | ✅ Done | Câu hỏi chưa có trong DB; flow hoạt động nếu seed |
| Situation flow | ✅ Done | Câu hỏi chưa có trong DB; flow hoạt động nếu seed |
| Numerology | ✅ Done | Hoàn chỉnh, result page hiển thị đúng 6 chỉ số |
| AI insight tổng hợp | ✅ Done | Chỉ cho DISC + numerology + nghề nghiệp |
| AI insight cho Logic/Situation | ⛔ Intentionally disabled | Không đủ dữ liệu cho “đánh giá tổng thể” theo scope mới |
| Result page NUMEROLOGY | ✅ Done | Theme, labels, bar width, ring đều đúng |
| Favicon / Brand | ✅ Done | Logo WEHA đầy đủ 2 vòng tròn, padded, tab browser nhỏ gọn |
| Admin dashboard | ⚠️ Placeholder | Chỉ có stats page |
| Knowledge upload / RAG | ❌ Chưa làm | Schema có nhưng flow chưa có |
| `/ho-so` | ❌ Chưa làm | Route protected có trong middleware nhưng chưa có page |
| `/history` | ❌ Chưa làm | Tương tự |
| Test suite | ❌ Chưa có | Chưa có unit/integration tests |
| Deploy VPS / Docker | ⚠️ Chưa hoàn chỉnh | Có Dockerfile nhưng chưa chốt full deploy runbook trong repo |

## Bước tiếp theo cần làm

### Ưu tiên cao
1. **Admin dashboard thật sự usable**
   - CRUD question bank
   - quản lý users
   - cấu hình AI
   - review insight/session

2. **Viết test cho các phần lõi**
   - numerology calculation
   - `getInsightEligibility()`
   - scoring/meta computation
   - auth callback/middleware logic

3. **Hoàn thiện deploy documentation**
   - chốt runbook Docker/VPS
   - phân biệt rõ env cho dev / staging / prod
   - mô tả cách chạy Prisma ngoài môi trường CI/CD có network

### Ưu tiên trung bình
4. **Làm `/history` và `/ho-so`**
   - history list
   - profile view
   - gom các result session theo user

5. **Nâng cấp result page**
   - chuyển bớt fetch client-side sang server-side
   - giảm waterfall khi vào trang kết quả

6. **RAG / Knowledge upload**
   - upload docs
   - parse/chunk
   - inject context vào AI insight

### Ưu tiên thấp
7. **SEO nâng cao**
   - OG images
   - Twitter cards
   - metadataBase
   - JSON-LD

8. **Responsive / UX QA**
   - test kỹ mobile/tablet
   - review loading/error states ở tất cả route

## Quyết định quan trọng và lý do

| Quyết định | Lý do |
|------------|-------|
| **Bỏ `next/font/google`** | `next/font/google` làm build phụ thuộc mạng Google. Khi build server không resolve được `fonts.googleapis.com`, build fail. Chuyển sang font stack local/system để build deterministic hơn. |
| **AI insight chỉ áp dụng cho DISC** | Scope mới là “đánh giá tổng thể dựa trên DISC + thần số học + nghề nghiệp”. Logic/Situation không đủ cùng loại tín hiệu nên nếu cố generate sẽ tạo insight sai bản chất. |
| **`AIInsight` là singleton theo session** | Tránh duplicate, đơn giản hóa API/result page, và đảm bảo idempotent khi auto-generate hoặc double-submit. |
| **Dùng `upsert` cho insight** | Chặn race condition tốt hơn so với create + check tồn tại rời rạc. |
| **Origin check so sánh origin thật** | Cách cũ dùng `origin.includes(host)` có thể bị bypass. So sánh bằng `URL.origin` an toàn hơn. |
| **Auth env không fail build toàn cục** | Thiếu Google OAuth env không nên làm sập toàn bộ build; chỉ nên làm auth không hoạt động ở runtime. |
| **Supabase dùng 2 URL khác nhau** | `DATABASE_URL` nên đi qua pooler để app runtime ổn định; `DIRECT_URL` phải đi vào direct DB endpoint để Prisma migration/schema engine làm việc đúng. |
| **Password trong URL phải encode** | Password có `@` là hợp lệ, nhưng khi đưa vào URI phải encode (`%40`) để parser không cắt sai phần host/userinfo. |
| **Thêm `db:check` script** | Có một lệnh dùng đúng Prisma Client của app sẽ giúp phân biệt nhanh lỗi env, lỗi DB, và lỗi Prisma CLI/sandbox. |
| **Prisma ưu tiên `.env.local`** | Tránh Prisma CLI vô tình đọc `.env` local Postgres khi app runtime đang chạy bằng Supabase trong `.env.local`. |
| **DISC random 20/200 không chia bucket** | Mỗi câu DISC có 4 đáp án A=D, B=I, C=S, D=C, mỗi đáp án +1 điểm cho đúng 1 chiều. Dù bốc câu nào, user vẫn chạm cả 4 chiều qua các đáp án. Vì vậy random 20/200 thuần (không chia 5/dimension) vẫn đảm bảo đo đủ D/I/S/C. Fisher-Yates shuffle + slice(0, 20) đảm bảo không trùng câu trong cùng session. |
| **`parseSelectedQuestionIds()` thay vì `as string[]`** | Prisma JSON field trả về `JsonValue`, TypeScript cast không có runtime guarantee. Helper parse + validate tránh crash khi data không đúng format. |
| **Numerology bar width = value/22 * 100** | Chỉ số numerology là số tuyệt đối (1-9, 11, 22), không phải %. Normalize bằng max master number 22 để bar hiển thị proportional. |
| **Favicon dùng sharp `fit:contain` + transparent padding** | Logo WEHA là hình chữ nhật ngang (423×260). `fit:contain` giữ aspect ratio, `extend` thêm padding đều 4 phía tạo khung vuông — icon nhỏ gọn, không bị crop, nhìn cân đối trên tab. |
| **`answeredMap` state trong TestRunner** | Lưu `questionId → answerId` client-side để phục hồi đáp án khi Back. Không cần API call vì đáp án đã được upsert khi Next. Đơn giản hơn refetch. |

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
