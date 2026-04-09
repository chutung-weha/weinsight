---
paths:
  - "**/*.html"
  - "**/*.css"
  - "**/*.tsx"
  - "**/*.jsx"
  - "src/components/**/*"
---

# Design System — Liquid Glass (Apple Style)

## Brand Identity

- **Product Name**: WE INSIGHT
- **Parent Company**: WEHA GROUP (wehagroup.vn)
- **Logo**: Two overlapping gradient circles (teal→cyan) with pixel "W" + "WE INSIGHT" in Be Vietnam Pro 900
- **Tagline**: "Hiểu người — Dùng đúng — Tăng trưởng"

## Liquid Glass UI

Core style: trong suốt (glass), blur nền, bo góc mềm, animation mượt.

```css
/* Glass card */
background: rgba(255, 255, 255, 0.12);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 20px;

/* Glass card on light bg */
background: rgba(255, 255, 255, 0.6);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.4);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
```

## Color Palette

- **Primary Cyan**: `#06B6D4` / `#00D4FF`
- **Teal**: `#14B8A6` / `#2DD4BF`
- **Violet accent**: `#7C3AED`
- **Blue accent**: `#2563EB`
- **Background gradient**: `linear-gradient(135deg, #0F172A, #1E293B, #0F172A)` (dark mode)
- **Background light**: `linear-gradient(135deg, #F0F9FF, #F5F3FF, #ECFEFF)` (light sections)
- **Glass white**: `rgba(255,255,255,0.1)` to `rgba(255,255,255,0.6)`
- **Text on dark**: `#F1F5F9` / `#CBD5E1`
- **Text on light**: `#1E293B` / `#64748B`

## Typography

- **Body font**: Inter
- **Logo font**: Be Vietnam Pro (weight 900)
- **Headings**: Inter 700/800, sometimes gradient text
- **Body**: Inter 400/500

## Component Patterns

- **Cards**: Glass effect, hover lift + glow
- **Buttons**: Rounded-full, glass or gradient, hover translateY(-2px) + glow shadow
- **Progress bars**: Rounded, gradient fill, smooth animation
- **Charts**: Radar chart for multi-dimensional scores
- **Score circles**: SVG with gradient stroke
- **Inputs**: Glass background, subtle border, focus glow
- **Tables (admin)**: Glass rows, hover highlight
