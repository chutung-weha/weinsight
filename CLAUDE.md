# WE INSIGHT — Hệ thống đánh giá + AI Coach nhân sự

Nền tảng đánh giá nhân sự của WEHA Group. User làm test (DISC, Logic, Situation) → AI phân tích + tri thức doanh nghiệp (RAG) → Insight & khuyến nghị.

## Quick Reference

- **Stack**: Next.js 14+, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Claude API
- **Design**: Liquid Glass (Apple style) — glassmorphism, blur, bo góc mềm, animation mượt
- **Logo**: WEHA-style circles icon + "WE INSIGHT" in Be Vietnam Pro 900
- **Language**: Vietnamese with diacritics for all user-facing text
- **Core flow**: Data Input → AI Brain → Decision Output

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
