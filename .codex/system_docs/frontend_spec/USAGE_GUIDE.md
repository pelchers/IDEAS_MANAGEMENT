# Frontend Spec — Usage Guide

## Quick Start

### You Have a Design System (tokens + prototypes)
Do nothing — the hook auto-creates `frontend_spec.md` the first time any frontend file is written. It reads your tokens and prototype files automatically.

### You Have a Reference Site
Tell the agent in your message:
```
"build the navbar to match https://stripe.com/nav style"
```
The skill parses your message and creates a Type 2 spec with the URL.

### You Have Design Requirements in Mind
Describe them:
```
"round buttons, purple gradients, sans-serif font, smooth transitions"
```
The skill creates a Type 3 spec from your description.

### You Have an Existing Design Pass to Reference
Reference it:
```
"use brutalism pass-1 animations but adapt layout for our features"
```
The skill creates a Type 4 similarity match spec.

---

## Creating Specs by Type

### Type 1: Internal Prototype
**When:** You have HTML/CSS prototype files in the repo.
**How:** Automatic — the hook detects them at `.docs/planning/frontend/`.
**Manual override:**
```
/require-frontend-spec
> "Use the brutalism pass-1 prototypes in .docs/planning/frontend/"
```

### Type 2: External Reference
**When:** Your design reference is a URL, Figma file, or screenshot.
**How:** Include the URL in your message:
```
"design it exactly like https://linear.app"
"match the layout from this Figma: https://figma.com/file/abc123"
```
**What happens:** Skill creates spec with URL. Agent may use Playwright to screenshot the site for reference.

### Type 3: Chat-Prompted Spec
**When:** You know what you want and can describe it.
**How:** Describe the design in your message:
```
"dark theme, neon accents, monospace typography, card-based layout,
 4px borders, subtle hover animations, sticky header"
```
**What happens:** Skill captures your requirements verbatim into the spec.

### Type 4: Similarity Match
**When:** You want to base the design on an existing pass but diverge on specific elements.
**How:** Reference the pass and specify divergences:
```
"use brutalism pass-1 but with a persistent top navbar instead of FAB,
 keep everything else identical"
```
**What happens:** Skill creates spec with match target, keep-identical list, and divergence list.

### Combining Types
Multiple types can coexist:
```
"use brutalism pass-1 layout but match the color scheme from https://stripe.com"
```
Creates a spec with both Type 1 (layout from prototype) and Type 2 (colors from Stripe).

---

## When Questions Are Asked

### One-Shot (No Questions) — Most Cases
If you provide enough info, the spec is created immediately:
- "build it like https://stripe.com" → Type 2, no questions
- "round buttons, purple gradients" → Type 3, no questions
- "use pass-1 but with top navbar" → Type 4, no questions
- Project has tokens + prototypes → Type 1, no questions

### Batch Questions (All at Once) — Rare
Only when the request is genuinely ambiguous AND no design system exists:
```
User: "make it look nice"
Skill: "No design system detected. I need to create a frontend spec.
  1. Do you have a reference site or image? (URL or path)
  2. Color preferences? (dark/light, specific hex codes)
  3. Typography? (serif, sans-serif, monospace)
  4. Interaction style? (minimal, animated, brutalist)
  Please answer all at once."
```
ALL questions asked in ONE batch. Never intermittent follow-ups during the build.

### Never Asked
- When project has design tokens → auto-generates from filesystem
- When user provides a URL → spec created from URL
- When user describes the design → spec created from description
- When user references a design pass → spec created from pass reference

---

## The `frontend_spec.md` File Structure

Every spec file includes:

```markdown
<!-- Self-describing header: what this file is, where to find
     project context, how to use it, what to do if incomplete -->

# Frontend Specification Reference

## Project Context
- CLAUDE.md: <exists | not found>
- PRD: <path | not yet created>
- Tech Spec: <path | not yet created>
- Task List: <path | not yet created>
- ADR Status: <exists | not set up yet>

## Spec Source Type
- [x] <selected type(s)>

## Design System / Reference
<type-specific content>

## Coherence Rules
1-5 rules for maintaining design consistency

## Chat Spec (if Type 3)
<user's design requirements>
```

---

## Validation

### Checking Spec Status
```
/require-frontend-spec
```
Reports:
- Whether spec exists and where
- Which type(s) it uses
- Whether referenced files/URLs are valid
- Whether it's complete or needs input

### Auto-Detection
The hook auto-detects from the project:
- `packages/ui-tokens/src/tokens.ts` → colors (primary, secondary, accent)
- `.docs/planning/frontend/` → prototype HTML files
- `CLAUDE.md` → project conventions
- `.adr/orchestration/*/prd.md` → session requirements

---

## Troubleshooting

### "ACTION REQUIRED" in spec
The spec was auto-generated but no design system was found. Provide design requirements:
1. Run `/require-frontend-spec` and describe your design, OR
2. Edit `.adr/orchestration/frontend_spec.md` directly

### Agent built wrong design
1. Check if `frontend_spec.md` exists and has correct references
2. If spec is correct but agent ignored it → use `--orchestrated` mode for validation
3. If spec is wrong → update it and re-run the phase

### Spec references a file that doesn't exist
Run `/require-frontend-spec` to validate — it checks all referenced paths and reports missing files.
