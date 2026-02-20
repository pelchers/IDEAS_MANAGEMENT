# Generative Geometry — Pass 1

## Recursive Circle Packing

A generative art composition built with **p5.js v1.11.3** that implements a recursive circle-packing algorithm. Circles of varying sizes fill the canvas, each large enough circle containing recursively packed smaller circles. Color varies by depth level, and a gentle breathing animation pulses all circles in and out.

## Palette

| Role       | Hex       | Usage                     |
|------------|-----------|---------------------------|
| Primary    | `#E11D48` | Depth 0 (rose)            |
| Secondary  | `#7C3AED` | Depth 1 (violet)          |
| Pink       | `#EC4899` | Depth 2                   |
| Gray Warm  | `#A8A29E` | Depth 3+                  |
| Gray Deep  | `#78716C` | Depth 4+                  |
| Background | `#FAFAF9` | Canvas / page background  |
| Surface    | `#F5F5F4` | Header / controls panel   |
| Text       | `#1C1917` | Typography                |

## Algorithm

1. Start with an empty list of placed circles.
2. Try random positions on the canvas; for each, compute the largest circle that fits without overlapping any existing circle or exceeding canvas bounds.
3. If the candidate radius exceeds `minRadius`, place the circle.
4. Repeat until the failure budget is exhausted.
5. For each placed circle with `radius > 30`, recursively pack smaller circles inside it (up to `maxDepth` levels).

## Controls

- **Regenerate** — Generates a new random seed and re-runs the packing algorithm.
- **Min Radius** slider (1-10 px) — Sets the smallest circle allowed.
- **Max Depth** slider (1-5) — Controls how many levels of recursive packing occur.
- **Seed display** — Shows the current random seed for reproducibility.

## Animation

All circles undergo a subtle breathing animation using `sin(frameCount * 0.02 + depthOffset)`, oscillating between 0.95x and 1.05x their base radius. Larger circles also display a small specular highlight for depth.

## Files

| File          | Purpose                                  |
|---------------|------------------------------------------|
| `index.html`  | Page structure, CDN imports              |
| `style.css`   | Layout, controls, responsive design      |
| `app.js`      | p5.js sketch: packing algorithm + render |
| `README.md`   | This file                                |
| `validation/handoff.json` | Validation metadata          |

## Usage

Open `index.html` in a browser. No build step required.
