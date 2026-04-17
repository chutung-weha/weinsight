# WE INSIGHT

Hệ thống đánh giá nhân sự + AI Coach của **WEHA GROUP**.

User làm test (DISC, Logic, Situation) + Thần số học Pythagoras → AI phân tích → Insight & khuyến nghị nhân sự.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL + Prisma 6
- **Auth**: NextAuth v4 (Google OAuth, JWT)
- **AI**: Groq API (LLaMA 3.1) với rule-based fallback
- **Design**: Liquid Glass (Apple-style glassmorphism)

## Cài đặt

```bash
# Clone repo
git clone https://github.com/chutung-weha/weinsight.git
cd weinsight

# Cài dependencies
npm install

# Copy và cấu hình env
cp .env.example .env
# Điền các giá trị vào .env (xem phần Environment Variables)

# Khởi tạo database
npx prisma migrate dev
npx tsx prisma/seed.ts

# Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (hỗ trợ Supabase PgBouncer) |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection (cho migrations) |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` (dev) hoặc domain production |
| `GOOGLE_CLIENT_ID` | Yes | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Yes | Cùng nguồn với Client ID |
| `GROQ_API_KEY` | No | [console.groq.com/keys](https://console.groq.com/keys) — không có thì dùng rule-based fallback |

### Supabase Connection Notes

- `DATABASE_URL` phải dùng endpoint pooler của Supabase, ví dụ `aws-1-ap-southeast-1.pooler.supabase.com:6543`.
- `DIRECT_URL` phải dùng endpoint database trực tiếp, ví dụ `db.<project-ref>.supabase.co:5432`.
- Với Supabase, user của `DATABASE_URL` thường là `postgres.<project-ref>`, còn `DIRECT_URL` thường là `postgres`.
- Nếu password chứa ký tự như `@`, `:`, `/`, `?`, `#`, phải URL-encode trước khi đưa vào connection string.
  Ví dụ: `Weinsight@123` -> `Weinsight%40123`.
- Thêm `sslmode=require` cho cả hai URL.

`GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` là optional tại module load: nếu thiếu, GoogleProvider không được kích hoạt — build + runtime chung không fail, chỉ route đăng nhập báo "không có provider". Tất cả route khác vẫn chạy bình thường. Khi thực sự cần đăng nhập, set cả 2 biến này trong `.env.local` hoặc env của container.

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run lint` | ESLint quality gate (0 errors) |
| `npm run db:check` | Kiểm tra app runtime có kết nối DB được không |
| `npm run db:migrate` | Chạy Prisma migrations |
| `npm run db:seed` | Seed data (admin, demo user, 45 câu hỏi mẫu) |
| `npm run db:studio` | Mở Prisma Studio |

## Tính năng

### Bài test
- **DISC**: 20 câu đánh giá tính cách (D/I/S/C dimensions)
- **Logic**: 15 câu tư duy logic (rubric 0/1/3)
- **Situation**: 10 câu xử lý tình huống (4 chiều: leadership/teamwork/communication/problemSolving)
- **Thần số học**: 6 chỉ số Pythagoras từ họ tên + ngày sinh (chuẩn Pythagoras, hỗ trợ master numbers 11/22)

### AI Insight
- Groq API (LLaMA 3.1) phân tích kết quả test + thần số học
- Rule-based fallback khi không có API key
- Cấu hình tone (thẳng/nhẹ/coach) và mục tiêu (tuyển dụng/đào tạo/đánh giá)
- Output: summary, personality profile, numerology insight, strengths, improvements, suitable roles, development plan
- Duplicate prevention: không tạo insight mới nếu đã có
- Input sanitization chống prompt injection

### Auth & Security
- Google OAuth (tài khoản tự tạo lần đầu đăng nhập)
- JWT session + 1-phút role sync từ DB
- Disabled user: token invalidate ngay (không chờ hết JWT 7 ngày)
- Middleware route protection (test, result, admin)
- Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- CSRF Origin check trên POST API routes
- Rate limiting: 5 req/user/phút cho AI insight
- Input sanitization chống prompt injection
- `callbackUrl` validation chặn open redirect
- Env validation fail-fast

### Admin
- Dashboard với stats tổng quan (users, sessions, insights)
- Server-side auth guard (ADMIN/HR only)
- CRUD câu hỏi, quản lý users — đang phát triển

### SEO
- Sitemap XML (4 public routes)
- Robots.txt (disallow admin/api/result)

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (auth)/           # Đăng nhập (/dang-nhap), Đăng ký (/dang-ky)
│   ├── admin/            # Admin dashboard (ADMIN/HR only)
│   ├── api/              # Auth, test questions, result, insight APIs
│   ├── test/             # Test selection + DISC/Logic/Situation pages
│   ├── than-so-hoc/      # Thần số học Pythagoras
│   ├── result/[id]/      # Kết quả test + AI Insight
│   ├── sitemap.ts        # Sitemap generation
│   └── robots.ts         # Robots.txt generation
├── components/
│   ├── layout/           # Header, Footer, Logo
│   ├── numerology/       # NumerologyPage (form + result)
│   └── test/             # TestRunner (shared MCQ test component)
├── lib/
│   ├── actions/          # Server Actions (test flow, numerology)
│   ├── ai/               # AI insight generation (Groq API + fallback)
│   ├── validations/      # Zod schemas
│   ├── auth.ts           # NextAuth config (Google OAuth)
│   ├── env.ts            # Runtime env validation
│   ├── numerology.ts     # Pythagoras calculation engine
│   ├── prisma.ts         # Prisma client singleton
│   ├── rate-limit.ts     # In-memory rate limiter (LRU eviction)
│   └── scoring.ts        # Score computation (dynamic maxScores)
└── types/                # TypeScript types + NextAuth augmentation
```

## Deploy

### Option 1: Vercel
1. Import repo vào Vercel
2. Thêm tất cả env vars (`NEXTAUTH_URL` = production domain)
3. Vercel tự chạy `npm run build` (bao gồm `prisma generate`)

**Lưu ý**: Vercel Hobby timeout 10s — AI insight (30s) có thể fail. Cần Vercel Pro hoặc VPS.

### Option 2: GCP VPS (khuyến nghị cho production)
1. Tạo Compute Engine instance (e2-small, Ubuntu 22.04, asia-southeast1)
2. Cài Docker + Nginx + Certbot
3. Thêm `output: 'standalone'` vào `next.config.ts`
4. Đổi Prisma `binaryTargets` sang `debian-openssl-3.0.x`
5. Build Docker image + deploy
6. Setup Nginx reverse proxy + SSL

Chi tiết tại `CLAUDE.md` → Bước tiếp theo #1.

### Database
- **Production**: Supabase PostgreSQL (free tier 500MB) với PgBouncer
- **Alternative**: GCP Cloud SQL (cùng region → latency thấp hơn)

### Kiểm tra kết nối DB

```bash
npm run db:check
```

Script này dùng đúng Prisma Client của app để chạy `select current_database(), current_user`, nên phù hợp để kiểm tra nhanh xem `.env`/`.env.local` hiện tại có kết nối DB được không.

## License

Private — WEHA GROUP internal use.
