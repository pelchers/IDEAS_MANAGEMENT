# GSAP Infinite Vertical Carousel — Deep Dive

## Background
Vertical carousels position N cards absolutely, animating their `y` position relative to a center card. When the user scrolls, `centerIndex` changes and all cards reposition via GSAP. For infinite looping, cards that move past the edges must wrap around to the other side.

This is implemented by calculating a circular offset: each card's distance from center, wrapping at ±(total/2) to find the shortest path around the ring.

## The Bug in Detail

### Step 1: The offset calculation
```js
let offset = i - centerIndex;
```
For 14 cards with `centerIndex = 3`, card at `i = 10` gets `offset = 7`.

### Step 2: The wrapping (broken)
```js
if (offset > total / 2) offset -= total;   // 7 > 7.0 → false
if (offset < -total / 2) offset += total;  // not reached
```
With even counts, `total / 2` is an integer. The strict `>` check fails when offset equals exactly half — the card doesn't wrap.

### Step 3: The visual result
Card 10 stays at `y = 7 * 130 = 910px` below center instead of wrapping to `y = -7 * 130 = -910px` above. This creates a visible gap in the carousel where a card should be.

This only affects cards at the exact boundary — most cards wrap correctly, which is why the bug appears inconsistent (only 2-4 cards affected depending on `centerIndex`).

## Why the Fix Works

### Proper modulo normalization
```js
let offset = ((i - centerIndex) % total + total) % total;
```
- `(i - centerIndex) % total` — wraps to `(-total, total)`, but JS `%` can be negative
- `+ total) % total` — shifts negatives to positive, guaranteeing range `[0, total)`
- Result: offset is always `0` to `total - 1`

### Single-direction wrap
```js
if (offset > total / 2) offset -= total;
```
- Offsets `0` to `7` stay positive (cards below center)
- Offsets `8` to `13` become `-6` to `-1` (cards above center)
- The boundary case (`offset = 7`) consistently stays positive
- No ambiguity — every card gets exactly one position

### Sub-pixel prevention
```js
y: Math.round(offset * spacing)
```
Floating-point multiplication can produce values like `390.00000001`, causing 1px rendering gaps between cards. `Math.round()` snaps to integer pixels.

### GPU consistency
```js
force3D: true
```
Ensures all cards use GPU-accelerated transforms, preventing some cards from being compositor-promoted while others aren't — which can cause 1px rendering differences.

## Edge Cases
- **Odd counts**: The bug doesn't occur with odd counts since `total / 2` is not an integer, so `>` and `<` always have a clear winner
- **Very small counts** (< 4): With fewer than 4 cards, `visibleRange = 3` shows all cards and wrapping is less noticeable
- **Dynamic card addition/removal**: If `total` changes, the `cardRefs` array must be resized to match

## References
- [Going "Meta GSAP": The Quest for "Perfect" Infinite Scrolling — CSS-Tricks](https://css-tricks.com/going-meta-gsap-the-quest-for-perfect-infinite-scrolling/)
- [Mastering Carousels with GSAP — Codrops](https://tympanus.net/codrops/2025/04/21/mastering-carousels-with-gsap-from-basics-to-advanced-animation/)
- [GSAP Circular Carousel — CodePen](https://codepen.io/GreenSock/pen/qBPZELR)
- [GSAP Infinite Scrolling Cards — CodePen](https://codepen.io/GreenSock/pen/RwKwLWK)
