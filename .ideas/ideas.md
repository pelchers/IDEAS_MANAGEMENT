# Ideas Master List

This file is the master list for ideas captured in this repo. Keep entries titled, dated, and numbered. Each idea must have a same-name subfolder in `.ideas/`.

## 1. 2026-03-30 - Mobile SSH Repo Terminal Companion

**Status:** Captured

**Summary:** A React Native + Expo mobile app that connects to a PC over SSH, opens a remote terminal session suitable for Codex or Claude Code workflows, discovers repositories on the PC in the same spirit as `C:\App\REPOSAVER`, exposes list/table/grid repo views, and allows remote filesystem browsing from the `C:\` root.

**Planning Folder:** [`./Mobile SSH Repo Terminal Companion/`](./Mobile%20SSH%20Repo%20Terminal%20Companion/)

**Notes:**
- Emphasis is on a remotely equitable terminal experience, not just command forwarding.
- Repo discovery and remote filesystem operations are part of the core product, not add-ons.
- Authentication, session persistence, SSH safety, and mobile terminal fidelity are central risks.

## 2. 2026-04-14 - Bulk Domain Availability Checker

**Status:** Captured

**Summary:** A free, open-source tool that programmatically checks domain name availability in bulk using RDAP/WHOIS protocols. Takes a list of 50–400 domain names and returns availability status for each. Built with Node.js/TypeScript. Uses ICANN RDAP bootstrap for free registrar lookups (no paid API keys). Internal tool first, deployable as a paid SaaS web app later.

**Planning Folder:** [`./Bulk Domain Availability Checker/`](./Bulk%20Domain%20Availability%20Checker/)

**Notes:**
- Core features: bulk .com availability check, RDAP protocol queries, rate-limited queue, results export (JSON/CSV), web UI for manual checks.
- Revenue model: free tier (10 checks/day), paid tiers for bulk/API access.
- Uses ICANN's RDAP bootstrap file to map TLDs to registrar RDAP servers — no paid API dependency.
- Must handle rate limiting gracefully (registrar RDAP servers throttle aggressive queries).
- Internal use case: check 410+ brand name candidates from our naming research for .com availability across 6 vertical-prefixed variants.

## 3. 2026-04-14 - Domain Checker Claude Code Component

**Status:** Captured

**Summary:** An internal Claude Code component (command + skill + agent + hook) that lets you check domain availability directly from the Claude Code conversation via `/check-domain`. Uses the same RDAP protocol as Idea #2 but packaged as a Claude Code component following the component-creation-pipeline convention. Runs locally, no external dependencies.

**Planning Folder:** [`./Domain Checker Claude Code Component/`](./Domain%20Checker%20Claude%20Code%20Component/)

**Notes:**
- Command: `/check-domain BrandByte.com` or `/check-domain --file domains.txt` or `/check-domain --template "{Name}.com" --names names.txt`
- Returns formatted availability results directly in the conversation (table format)
- Follows component-creation-pipeline: agent + skill + hook + command + system docs + codex mirror + sync
- Uses Bash tool to execute Node.js script that queries RDAP
- Rate-limited queue built in (5 req/s with backoff)

## 4. 2026-04-14 - Domain Checker Claude Code Plugin (Marketplace)

**Status:** Captured

**Summary:** A publishable Claude Code plugin that packages the domain checker as a standalone installable plugin for the Claude Code marketplace (anthropics/claude-plugins-official on GitHub). Anyone with Claude Code can install it via `/plugin install domain-checker@marketplace` and use `/check-domain` in their own projects. Same RDAP-based availability checking, packaged with plugin.json metadata, commands, skills, and optional MCP server integration.

**Planning Folder:** [`./Domain Checker Claude Code Plugin/`](./Domain%20Checker%20Claude%20Code%20Plugin/)

**Notes:**
- Plugin structure: plugin.json + commands/ + skills/ + agents/ + hooks/
- Published to the Claude Code marketplace (GitHub-based: anthropics/claude-plugins-official or custom marketplace repo)
- Revenue model: free plugin (builds reputation + funnel to paid SaaS web app from Idea #2)
- Differentiation from the internal component (Idea #3): standalone, no project-specific dependencies, installable by anyone
- Could include MCP server integration for richer tool-use patterns
- Plugin marketplace is GitHub-based — submit PR to anthropics/claude-plugins-official OR create own marketplace repo

## 5. 2026-04-14 - Windows Taskbar Tab Mover

**Status:** Captured

**Summary:** A lightweight, non-invasive desktop utility that lets you independently reorder/move individual taskbar buttons of the same application type in Windows 11. Solves the problem where "Never Combine" mode shows separate tabs per window but Windows provides no way to rearrange individual tabs of the same app (e.g., 9 VS Code instances stuck in their original order). Runs as an ultra-efficient background service with minimal RAM/CPU/disk footprint.

**Planning Folder:** [`./Windows Taskbar Tab Mover/`](./Windows%20Taskbar%20Tab%20Mover/)

**Notes:**
- Core problem: Windows 11 "Never Combine" shows individual taskbar buttons per window, but provides zero ability to reorder buttons of the same app type independently.
- Must feel native to Windows — no ugly overlays, no jarring UX.
- Ultra-efficient: target <5 MB RAM, <0.1% CPU idle, <2 MB disk.
- Built with C++, Rust, or C# for minimal footprint.
- Core mechanism: Windows Shell hook or UI Automation API to intercept/modify taskbar button order.
- Revenue model: free open-source core, freemium with premium features (tab grouping, custom labels per window, pinning specific windows to positions, multi-monitor taskbar control).
- Potential distribution: GitHub releases, winget, Microsoft Store.

## 6. 2026-04-15 - Local Business Leads Generator (Claude Code Component)

**Status:** Captured

**Summary:** A Claude Code component (command + skill + agent + hooks) that generates ranked business leads reports for a defined geographic area and industry niche. Searches Google Maps/Business, analyzes each business's web presence (website quality, SEO score, Google reviews, search ranking), extracts contact info and location data, ranks leads against each other by opportunity score, and outputs both a markdown table file and a matching spreadsheet (.csv) in `.docs/audits/leads/`. Designed to help our agency identify restaurants and businesses that need our services — the ones with no website, bad websites, no Google Business listing, or poor reviews are our best prospects.

**Planning Folder:** [`./Local Business Leads Generator/`](./Local%20Business%20Leads%20Generator/)

**Notes:**
- Claude Code component: `/generate-leads "restaurants in Scottsdale, AZ"` or `/generate-leads "pizza shops in Brooklyn, NY"`
- Output location: `.docs/audits/leads/Leads-List-{Industry}-{Location}-{YYYY-MM-DD}.md` + matching `.csv`
- Data points per lead: business name, address, phone, website URL, website score (1-10), has Google Business listing (Y/N), review count, average star rating, Google Maps ranking position, industry/category, social media presence, contact email (if findable), opportunity score (composite)
- Opportunity score = weighted composite: no website (10pts) + bad website (1-5pts) + no Google Business (8pts) + few reviews (1-5pts) + low stars (1-5pts) + poor search ranking (1-5pts) = higher score = better lead for us
- Data sources: Google Maps API (or scraping), Google Places API, Lighthouse/PageSpeed Insights for website scoring, Google Search results for ranking position
- Must generate both `.md` (table format for Claude Code / GitHub viewing) and `.csv` (for Excel/Sheets/CRM import)
- Ranking: leads sorted by opportunity score descending (worst web presence = best prospect for our services)
- Component follows component-creation-pipeline: command + skill + agent + hook + system docs + codex mirror + sync
- Spreadsheet and markdown files are 1:1 named — same data, two formats

## 7. 2026-04-22 - Buyers Club Live Group Deals

**Status:** Captured

**Summary:** A Groupon-adjacent consumer marketplace where the discount grows in real time as more buyers commit during a campaign's live window. Unlike Groupon's binary "hit N buyers or deal dies" threshold, the discount scales continuously with buyer count — every committed buyer is incentivized to recruit more buyers, raising the final tier for everyone in the window. Sellers self-serve onboarding, campaign creation, and contract acceptance via Stripe Connect Express. Buyers commit with a manual-capture PaymentIntent and are charged at window-close at the final tier. Branded as `buyers.club` (target TLD `.club`, unvalidated).

**Planning Folder:** [`./Buyers Club Live Group Deals/`](./Buyers%20Club%20Live%20Group%20Deals/)

**Notes:**
- Core differentiator from Groupon: continuous-curve discount, not binary threshold — rewards virality past the original target.
- Seller side: Stripe Connect Express + identity verification + platform ToS e-sign + admin approval gate.
- Buyer side: card captured on commit via PaymentIntent `capture_method=manual`; captured at window-close at the final tier price.
- Referral mechanic surfaces per-buyer attribution — "your referrals raised the discount by X%" — no cash kickback in v1.
- Explicitly excludes autos (owned by the car-buying-concierge + floor-price projects).
- Invite-only seller launch until fulfillment + payout flows are proven.
- Risk: brand conflict with Groupon (differentiate positioning + run TESS before lock-in); `buyers.club` domain availability not yet validated.

## 8. 2026-04-22 - Floor Price Dealer No Haggle Platform

**Status:** Captured

**Summary:** A dealer-opt-in, approval-gated vehicle marketplace where dealerships post floor pricing (MSRP + out-the-door) with a buy-it-now reservation flow. Zero negotiation. **Brand: `floored.it`** (restored 2026-04-26 — the 2026-04-25 brief reassignment to `coupon.club` was reverted; user-confirmed `.it` availability on 2026-04-23). `floor.it` is owned by a third party — tracked as a possible future acquisition; redirect target on acquisition is `carbuyers.club` (the core concierge site) per D-FP-10 (revised). Architecturally entangled with the core concierge project (`carbuyers.club`) — this product owns the backend, and the concierge site consumes a read API to render a "Floor Deals" tab on its Explore page. The two products are complementary: the concierge handles dealers who don't opt in; the floor-price platform handles dealers who do.

**Planning Folder:** [`./Floor Price Dealer No Haggle Platform/`](./Floor%20Price%20Dealer%20No%20Haggle%20Platform/)

**Notes:**
- Hard gate: every dealer must apply, be screened, and be approved before posting. No dealer self-service onboarding.
- Posting-rule enforcement is server-side — OTD is required, price must be in a configured sanity band vs. MSRP, add-ons cannot be default-included, copy moderation (AI-assist + human review) flags hedge language like "call for price."
- Reservation: buy-it-now creates a refundable hold on the buyer's card; OTD is locked for a 24–72 hour window during paperwork (DocuSign / Dropbox Sign); transaction still consummates at the selling dealer — the platform is matchmaker + contract host, not dealer of record.
- Cross-site integration: public read API `GET /public/floor-listings` consumed by the concierge site's Explore page "Floor Deals" tab via a dedicated API key. Detailed contract in `./Floor Price Dealer No Haggle Platform/integration-with-current-site.md`.
- Same backend serves the standalone `floored.it` site AND the concierge-site (`carbuyers.club`) tab — no schema duplication across repos.
- Cannibalization of the concierge is intentional — the concierge targets dealers who won't opt in; floor-price targets dealers who will.
- Risks: state auto-sales / dealer-law exposure per nationwide launch (50-state legal review), reservation-hold dispute rates, read-API abuse (scraping), and brand fragility from any single dealer bait-and-switch event (mitigated by aggressive enforcement + transparent strike system).
- Domain locked: `floored.it` (restored 2026-04-26; previously confirmed available by user on 2026-04-23). Trademark pass (USPTO TESS, Classes 35 / 39 / 41) + social handle registration still to run before public launch — work consolidated in `.docs/planning/brand-identity.md` and tracked under `.adr/orchestration/0_BRAND_IDENTITY/` Phase 2. `floor.it` is separately registered — possible future acquisition, not required.

## 9. 2026-05-11 - Predator Identification Network (PIN)

**Status:** Captured

**Summary:** A platform branded as **PIN (Predator Identification Network)** that lets independent investigators ("poachers"), journalists, experts, legal representatives, politicians, content creators, and general users collaborate to identify and document predators. Features an explore page of known predators (with conviction status, ongoing prosecution, independently confirmed, etc.), per-predator profile pages with supporting documents/videos, a parallel explore page of poacher individuals and groups with their stats (convictions assisted, predators listed), AI-gated cross-confirmation before any predator is publicly listed (anti-doxing safeguard), a YouTube-style ToS that locates legal responsibility for posted content with the poster, a searchable content page with filter/sort/tier controls, premium-content subscriptions (per-poacher or sitewide), and equitable revenue distribution from sitewide subscriptions to participating poachers.

**Planning Folder:** [`./Predator Identification Network (PIN)/`](./Predator%20Identification%20Network%20%28PIN%29/)

**Notes:**
- Branding: `PIN` short-form, `Predator Identification Network` long-form. Domain not yet selected — placeholder during planning.
- User types (multi-role): expert, journalist, reporter, content creator, general user, politician, legal representative, law enforcement liaison, and the core "poacher" (independent or group). Some user types have elevated review weight (expert / legal / law enforcement).
- Predator status taxonomy: `POST_CONVICTION`, `CURRENTLY_PROSECUTED`, `CONFIRMED_BY_INDEPENDENT_INVESTIGATION`, `CONFIRMED_BY_PLATFORM_AI_REVIEW`, `ALLEGED_PENDING_REVIEW`, `CLEARED`, `DECEASED`. Status transitions are auditable and time-stamped.
- Anti-doxing gate (hard requirement): no predator profile is publicly listed until the submitter's documentation passes a multi-stage AI cross-confirmation pass against supporting evidence (court records, news links, independent investigation reports). Failed submissions are rejected with reason and never reach the public explore page.
- Group collaboration: poacher groups can be formed, with members, roles (lead investigator, contributor, viewer), shared investigation workspace, document vault, and per-group stats.
- Independent poacher explore page (separate from groups): individuals show their listed predators, status counts, content output, and supporter count.
- Content page: documents, videos, evidence packets, with search/sort/filter (predator, group, poacher, status, content type, tier). Some content is free, some is premium.
- Subscriptions: per-poacher subscription (unlocks that poacher's premium content), and sitewide subscription (unlocks all participating poachers' premium content). Sitewide subscription revenue is pooled and distributed to poachers via an equitable formula (engagement-weighted, configurable, transparent to subscribers and poachers).
- Legal posture: YouTube-style ToS framing — all posts and uploaded content are the sole responsibility and publishings of the poster. Platform acts as a host (Section 230-style framing in the US), with takedown procedures, counter-notice flow, and clear DMCA process. Legal review required per jurisdiction before public launch.
- Trust & safety: identity verification tiered by user role (poachers and experts require deeper verification than general users), strike system for false submissions, appeal flow, and an external review board option for contested status changes.
- Risks: legal exposure across jurisdictions (defamation, privacy, harassment), the possibility of bad actors weaponizing the platform against innocent parties (must be mitigated by AI gate + multi-source confirmation + appeal flow), brand-safety for payment processors and ad networks (premium-subscription revenue must be Stripe-compliant; some processors decline this category), and operational load of moderation at scale.
- Not in scope for v1: direct civil-suit assistance, vigilante coordination, real-world meet-ups, anonymous tip lines for active investigations (deferred to phase 2 with law-enforcement liaison framework).
