# GSAP Infinite Vertical Carousel — Even-Count Boundary Spacing Fix

## Problem
In a vertical carousel with an **even number** of absolutely-positioned cards animated by GSAP, certain cards (near the array boundary) display with inconsistent spacing — some too close together, others with large gaps — while most cards space perfectly.

## Root Cause
The circular offset calculation uses two-sided boundary checks:
```js
if (offset > total / 2) offset -= total;
if (offset < -total / 2) offset += total;
```
With an even count (e.g., 14 cards), `total / 2 = 7`. When offset is exactly `7` or `-7`, **neither condition triggers** (`7 > 7` is false, `-7 < -7` is false). The card stays at the raw offset instead of wrapping, placing it at `7 * spacing = 910px` away from center — creating a visible gap.

Additionally, JavaScript's `%` operator returns negative values for negative operands, which can produce unexpected offsets.

## Fix
Replace two-sided wrap with proper modulo normalization + single-direction wrap:
```js
let offset = ((i - centerIndex) % total + total) % total;
if (offset > total / 2) offset -= total;
```
Also add `Math.round()` to prevent sub-pixel gaps and `force3D: true` for consistent GPU compositing.

## Categories
animation, gsap, carousel, layout, rendering
