/**
 * GSAP Infinite Vertical Carousel — Correct circular offset calculation
 *
 * Problem: Even-count arrays (e.g., 14 items) produce boundary ambiguity
 * when using two-sided wrap checks. Cards at exactly ±(total/2) don't wrap,
 * creating uneven spacing.
 *
 * Fix: Normalize with proper modulo first, then single-direction wrap.
 */

import { gsap } from 'gsap';

interface CarouselAnimationConfig {
  /** Array of card DOM elements */
  cards: (HTMLDivElement | null)[];
  /** Currently centered card index */
  centerIndex: number;
  /** Total number of cards */
  total: number;
  /** Pixel spacing between card centers (card height + gap) */
  spacing?: number;
  /** How many cards to show on each side of center */
  visibleRange?: number;
  /** Animation duration in seconds */
  duration?: number;
}

export function animateCarousel({
  cards,
  centerIndex,
  total,
  spacing = 130,
  visibleRange = 3,
  duration = 1,
}: CarouselAnimationConfig) {
  cards.forEach((card, i) => {
    if (!card) return;

    // === THE FIX ===
    // Step 1: Normalize to [0, total) using proper modulo
    //   JavaScript's % can return negatives, so (x % n + n) % n guarantees [0, n)
    // Step 2: Single-direction wrap — if offset > half, subtract total
    //   This eliminates the two-sided boundary ambiguity with even counts
    let offset = ((i - centerIndex) % total + total) % total;
    if (offset > total / 2) offset -= total;

    const isCenter = offset === 0;
    const absOffset = Math.abs(offset);
    const visible = absOffset <= visibleRange;

    gsap.to(card, {
      // Math.round prevents sub-pixel rendering gaps between cards
      y: Math.round(offset * spacing),
      scale: isCenter ? 1 : Math.max(0.9, 1 - absOffset * 0.05),
      opacity: visible ? (isCenter ? 1 : Math.max(0.15, 1 - absOffset * 0.3)) : 0,
      zIndex: 100 - absOffset,
      filter: isCenter ? 'blur(0px)' : `blur(${Math.min(absOffset * 2, 6)}px)`,
      duration,
      ease: 'power2.out',
      display: visible ? 'block' : 'none',
      // force3D keeps GPU compositing consistent across all cards
      force3D: true,
    });
  });
}

// === BROKEN VERSION (for reference) ===
// This is what causes uneven spacing with even-count arrays:
//
// let offset = i - centerIndex;
// if (offset > total / 2) offset -= total;   // 7 > 7 = FALSE (doesn't wrap!)
// if (offset < -total / 2) offset += total;  // -7 < -7 = FALSE (doesn't wrap!)
//
// The card at offset 7 stays at y = 7 * 130 = 910px instead of wrapping to -7
