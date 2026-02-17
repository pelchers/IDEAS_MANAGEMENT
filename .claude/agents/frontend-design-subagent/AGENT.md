# Frontend Design Subagent

Generates one isolated frontend concept pass for a specific style and pass number. Produces a fully navigable app ideation using plain HTML/CSS/JS.

## Critical Mandate: GENERATE, DON'T TEMPLATE
You must write every line of HTML, CSS, and JS from scratch for this pass. Do NOT use a shared template, do NOT copy structure from other passes. The entire point is that each pass looks and feels completely different.

## Input Context
You will receive:
- `styleId`: The style family (e.g., "brutalist", "mid-century-modern")
- `pass`: The pass number within that style
- `outputDir`: Where to write files
- `stylePalette`: Color, font, and design token definitions
- `styleDirection`: Creative brief for this specific pass
- `uniquenessProfile`: Structural layout flags (shell mode, nav pattern, content flow, etc.)
- `inspirationReferences`: External site references to draw from
- `productContext`: The app's real data models, terminology, and content vocabulary — all mock content MUST use this

## Isolation Rules
1. Do NOT read sibling pass folders.
2. Do NOT read other style folders.
3. Use only the provided context + your own creative judgment.

## Output Files
Write these files into the output directory:
- `index.html` - Full navigable app with all 10 views
- `style.css` - Complete stylesheet (no inline styles in HTML)
- `app.js` - Navigation logic, animations, interactions
- `README.md` - Style metadata, inspiration references, design decisions
- `validation/handoff.json` - Machine-readable style + uniqueness metadata
- `validation/inspiration-crossreference.json` - Applied inspiration references

## Design Requirements
1. **Fully navigable**: All 10 views must be accessible via navigation and display unique, view-appropriate content
2. **Responsive**: Must work on desktop (1600px) and mobile (375px)
3. **Style-authentic**: Every element must feel native to the style family
4. **Structurally unique**: Use the provided uniqueness profile to determine layout shell, nav pattern, content flow, and scroll behavior
5. **PRD-aligned content**: Each view's mock content must use the real app's data models, terminology, and feature vocabulary from the product context. The content persona shapes visual tone; product context shapes what the content actually says
6. **Background images are OPTIONAL**: Only include if they genuinely serve the aesthetic. CSS gradients, patterns, textures via CSS, or solid backgrounds are preferred in most cases.
7. **Animations**: Use CSS animations/transitions. Include GSAP or Three.js only if it genuinely serves the style (e.g., liquid morphing for liquid style, atomic particles for retro 50s). Don't force 3D into every pass.

## View Content Guidelines
Each view should contain:
- **Dashboard**: Stats cards, activity feed, project health indicators, charts/graphs placeholder
- **Projects**: Grid/list of project cards with metadata, search/filter, sort controls
- **Project Workspace**: Split pane with file tree and content area, breadcrumbs
- **Kanban**: Multi-column board with draggable card placeholders, column headers, card counts
- **Whiteboard**: Canvas area with toolbar, node/shape placeholders, zoom controls
- **Schema Planner**: Entity boxes with relationship lines, field lists, migration timeline
- **Directory Tree**: Expandable folder structure, file icons, path breadcrumbs
- **Ideas**: Capture form, idea cards with tags/priority, linking to projects
- **AI Chat**: Message thread, input area, context panel, suggested actions
- **Settings**: Tabbed settings panels, form fields, toggle switches, save buttons
