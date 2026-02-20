# Bar Chart — Pass 1

## Domain
Data Visualization (`data-vis`)

## Style
Grouped / Stacked bar chart with dark theme, gradient fills, and animated entrance.

## Library
Chart.js v4.4.7 (loaded from CDN, canvas rendering)

## Palette
| Role       | Hex       | Usage                            |
|------------|-----------|----------------------------------|
| Primary    | `#6366F1` | Indigo — Tasks Total bars        |
| Secondary  | `#EC4899` | Pink — Tasks Done bars           |
| Accent 1   | `#A78BFA` | Violet — Ideas Count bars        |
| Accent 2   | `#F9A8D4` | Rose — Collaborators bars        |
| Background | `#0F172A` | Dark navy page background        |
| Surface    | `#1E293B` | Dark slate cards and panels      |
| Text       | `#F8FAFC` | Near-white foreground text       |

## Mock Data
Six IDEA-MANAGEMENT projects compared across four metrics:
- **Tasks Total** — total task count per project
- **Tasks Done** — completed tasks
- **Ideas Count** — linked ideas
- **Collaborators** — team member count

## Features
1. Animated bar entrance with staggered delays per dataset and data point.
2. Grouped and stacked layout toggle (live switch, no page reload).
3. Dataset filter checkboxes to show/hide individual metrics.
4. Hover tooltips with project name and exact metric values.
5. Responsive design: labels shorten on small screens, chart resizes fluidly.
6. Gradient-filled bars with rounded corners.

## Files
| File                      | Purpose                          |
|---------------------------|----------------------------------|
| `index.html`              | Page structure and CDN script    |
| `style.css`               | Dark theme layout and controls   |
| `app.js`                  | Chart.js config, interactions    |
| `README.md`               | This file                        |
| `validation/handoff.json` | Generation metadata              |

## How to View
Open `index.html` in any modern browser. No build step required.
