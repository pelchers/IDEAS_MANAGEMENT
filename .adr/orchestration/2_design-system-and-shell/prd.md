# PRD — 2_design-system-and-shell

## Summary
Convert the pass-1 CSS design system to Tailwind CSS configuration and build the app shell (navigation drawer, top bar, layout) as a faithful 1:1 reproduction of the pass-1 concept.

## Goals
- Every CSS custom property from pass-1 available as Tailwind utility
- AppShell visually identical to pass-1 navigation (hamburger, drawer, numbered links, slam animation)
- TopBar visually identical to pass-1 (title, search, notification bell)
- All 10 navigation routes wired and routing correctly

## Key Reference
- Pass-1 style.css: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/style.css`
- Pass-1 index.html (nav section): `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html`

## Success Criteria
- Side-by-side comparison of pass-1 screenshot vs live app shows identical navigation
- Slam animation timing matches pass-1 cubic-bezier(0.2, 0, 0, 1)
- All 10 numbered nav links visible and functional
- Styled scrollbars match pass-1 (14px, watermelon hover)
