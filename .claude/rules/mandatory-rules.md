# Mandatory Rules

These rules MUST be followed for every change in this project.

## 1. Screenshot Comparison

After every major visual change, take a screenshot and compare with the design reference screenshots. Ensure the result matches the intended design before moving on.

## 2. Mobile-Friendly

Website must be fully responsive and mobile-first. Every page must work well on mobile, tablet, and desktop. Always test responsive behavior.

## 3. Scroll Animations

Every section must have an animation when scrolling into viewport (fade-in, slide-up, slide-left/right, etc.). Use Intersection Observer API or Framer Motion. Animation classes:

- `.reveal` — fade-in from bottom
- `.reveal-left` — slide from left
- `.reveal-right` — slide from right
- Delay classes: `.d1`, `.d2`, `.d3` for staggered animations

## 4. Vietnamese with Diacritics

All user-facing text must be written in Vietnamese with proper diacritics (e.g., "Việc làm", not "Viec lam"). This applies to headings, paragraphs, labels, placeholders, buttons, and meta tags.

## 5. Hover Animations

All interactive elements (buttons, cards, links, pills) must have subtle hover animations:

- Buttons: `translateY(-2px)` + box-shadow on hover
- Cards: lift + shadow increase
- Links: color transition, arrow slides, underline animation
- Pills/tags: slight lift + shadow
