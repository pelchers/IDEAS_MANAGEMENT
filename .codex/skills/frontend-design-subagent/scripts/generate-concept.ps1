param(
  [Parameter(Mandatory=$true)][string]$StyleId,
  [Parameter(Mandatory=$true)][int]$Pass,
  [Parameter(Mandatory=$true)][string]$VariantSeed,
  [Parameter(Mandatory=$true)][string]$OutputDir
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$validationDir = Join-Path $OutputDir 'validation'
$screenshotsDir = Join-Path $validationDir 'screenshots'
New-Item -ItemType Directory -Force -Path $validationDir | Out-Null
New-Item -ItemType Directory -Force -Path $screenshotsDir | Out-Null

$themes = @{
  'signal-brutalist/pass-1'   = @{ title='Signal Brutalist / Pass 1';   tag='Raw Geometric Ops';        bg='#f6f1e7'; surface='#ffffff'; text='#0c0c0c'; muted='#4d4d4d'; border='#111111'; accent='#ff4f00'; accent2='#0a84ff'; body='"IBM Plex Sans", sans-serif'; heading='"Bebas Neue", "Arial Black", sans-serif'; mono='"IBM Plex Mono", monospace'; shell='shell-brutal-grid'; nav='side'; }
  'signal-brutalist/pass-2'   = @{ title='Signal Brutalist / Pass 2';   tag='Stamped Tactical';         bg='#fffdf8'; surface='#fff8e6'; text='#151515'; muted='#535353'; border='#1d1d1d'; accent='#d72638'; accent2='#204ecf'; body='"Space Grotesk", sans-serif'; heading='"Archivo Black", Impact, sans-serif'; mono='"JetBrains Mono", monospace'; shell='shell-brutal-stamp'; nav='side'; }
  'aurora-glass/pass-1'       = @{ title='Aurora Glass / Pass 1';       tag='Frosted Spectrum';         bg='#091b2b'; surface='rgba(255,255,255,0.15)'; text='#ecf7ff'; muted='#b7d7ea'; border='rgba(255,255,255,0.28)'; accent='#6df1ff'; accent2='#7ee787'; body='"Manrope", sans-serif'; heading='"Sora", sans-serif'; mono='"IBM Plex Mono", monospace'; shell='shell-glass-sidebar'; nav='side'; }
  'aurora-glass/pass-2'       = @{ title='Aurora Glass / Pass 2';       tag='Prism Dock';               bg='#0a1020'; surface='rgba(255,255,255,0.12)'; text='#f3f8ff'; muted='#c2d2f8'; border='rgba(152,176,255,0.4)'; accent='#50e3c2'; accent2='#6ea8ff'; body='"DM Sans", sans-serif'; heading='"Syne", sans-serif'; mono='"Fira Code", monospace'; shell='shell-glass-dock'; nav='dock'; }
  'ledger-editorial/pass-1'   = @{ title='Ledger Editorial / Pass 1';   tag='Broadsheet Desk';          bg='#f2ece2'; surface='#fffdfa'; text='#1e1a17'; muted='#6d645d'; border='#322a25'; accent='#9c4a21'; accent2='#2f5e8c'; body='"Source Serif 4", Georgia, serif'; heading='"Playfair Display", Georgia, serif'; mono='"Courier Prime", monospace'; shell='shell-editorial-columns'; nav='side'; }
  'ledger-editorial/pass-2'   = @{ title='Ledger Editorial / Pass 2';   tag='Monochrome Ledger';        bg='#f5f5f5'; surface='#ffffff'; text='#111111'; muted='#555555'; border='#1f1f1f'; accent='#000000'; accent2='#3d3d3d'; body='"Work Sans", sans-serif'; heading='"Cormorant Garamond", serif'; mono='"IBM Plex Mono", monospace'; shell='shell-editorial-mono'; nav='top'; }
  'industrial-terminal/pass-1'= @{ title='Industrial Terminal / Pass 1';tag='Green Vector Console';     bg='#050a05'; surface='#0d140d'; text='#7dff8f'; muted='#4fa35a'; border='#1f5f2a'; accent='#3dff72'; accent2='#36d4ff'; body='"IBM Plex Mono", monospace'; heading='"JetBrains Mono", monospace'; mono='"JetBrains Mono", monospace'; shell='shell-terminal-green'; nav='rail'; }
  'industrial-terminal/pass-2'= @{ title='Industrial Terminal / Pass 2';tag='Amber Rack Ops';           bg='#120d08'; surface='#1d140d'; text='#ffd18a'; muted='#c18a4a'; border='#7a4b1f'; accent='#ff9f40'; accent2='#5db0ff'; body='"Rajdhani", sans-serif'; heading='"Share Tech Mono", monospace'; mono='"Share Tech Mono", monospace'; shell='shell-terminal-amber'; nav='rail'; }
  'playful-clay/pass-1'       = @{ title='Playful Clay / Pass 1';       tag='Pastel Tactile Studio';    bg='#f6f0ff'; surface='#ffffff'; text='#281b3a'; muted='#6f5f87'; border='#c8b3ea'; accent='#ff6b6b'; accent2='#4ecdc4'; body='"Nunito", sans-serif'; heading='"Baloo 2", sans-serif'; mono='"Space Mono", monospace'; shell='shell-clay-soft'; nav='top'; }
  'playful-clay/pass-2'       = @{ title='Playful Clay / Pass 2';       tag='Comic Motion Bubbles';     bg='#fff8eb'; surface='#ffffff'; text='#2d2142'; muted='#7f6a9a'; border='#bfa6ea'; accent='#ff7f50'; accent2='#00b4d8'; body='"Quicksand", sans-serif'; heading='"Fredoka", sans-serif'; mono='"DM Mono", monospace'; shell='shell-clay-comic'; nav='top'; }
}

$key = "$StyleId/pass-$Pass"
if (-not $themes.ContainsKey($key)) { throw "Unknown style/pass: $key" }
$t = $themes[$key]

$handoff = [PSCustomObject]@{
  styleId = $StyleId
  pass = $Pass
  variantSeed = $VariantSeed
  outputDir = $OutputDir
  generatedAt = (Get-Date).ToUniversalTime().ToString('o')
  script = '.codex/skills/frontend-design-subagent/scripts/generate-concept.ps1'
}
$handoff | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $validationDir 'handoff.json')

$views = @(
  @{ id='dashboard'; title='Dashboard'; desc='Cross-project velocity, risk, and delivery state.' },
  @{ id='projects'; title='Projects'; desc='Drive-style browser for project directories and metadata.' },
  @{ id='project-workspace'; title='Project Workspace'; desc='File tree + descriptors from project.json.' },
  @{ id='kanban'; title='Kanban'; desc='Backlog, in-progress, blocked, and done swimlanes.' },
  @{ id='whiteboard'; title='Whiteboard'; desc='Container-rich visual ideation surface.' },
  @{ id='schema-planner'; title='Schema Planner'; desc='Entity and relationship planning workspace.' },
  @{ id='directory-tree'; title='Directory Tree'; desc='Scaffold preview and generation controls.' },
  @{ id='ideas'; title='Ideas'; desc='Capture queue and prioritization board.' },
  @{ id='ai-chat'; title='AI Chat'; desc='Assistant interface with file-writing actions.' },
  @{ id='settings'; title='Settings'; desc='Auth, billing, and feature preferences.' }
)

$navButtons = ($views | ForEach-Object { "<button class='nav-item' data-view='$($_.id)'>$($_.title)</button>" }) -join "`n"
$sections = ($views | ForEach-Object {
@"
<section class='view' id='view-$($_.id)' data-view='$($_.id)'>
  <header class='view-head'>
    <h2>$($_.title)</h2>
    <p>$($_.desc)</p>
  </header>
  <div class='view-grid'>
    <article class='panel'>
      <h3>Primary Surface</h3>
      <p>Variant seed: <strong>$VariantSeed</strong></p>
      <ul>
        <li>Navigable application-style structure</li>
        <li>Responsive desktop/mobile layout logic</li>
        <li>Distinct aesthetic direction for this pass</li>
      </ul>
    </article>
    <article class='panel'>
      <h3>Execution Notes</h3>
      <p>This concept is <strong>$StyleId pass $Pass</strong>.</p>
      <div class='chip-row'>
        <span class='chip'>Production-style frontend</span>
        <span class='chip'>No auth gating in concept mode</span>
        <span class='chip'>Playwright validation required</span>
      </div>
    </article>
  </div>
</section>
"@
}) -join "`n"

$fontLink = "<link rel='preconnect' href='https://fonts.googleapis.com'><link rel='preconnect' href='https://fonts.gstatic.com' crossorigin><link href='https://fonts.googleapis.com/css2?family=Archivo+Black&family=Baloo+2:wght@400;700&family=Bebas+Neue&family=Cormorant+Garamond:wght@500;700&family=Courier+Prime:wght@400;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;500&family=Fredoka:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Manrope:wght@400;600;700&family=Nunito:wght@400;700&family=Playfair+Display:wght@500;700&family=Quicksand:wght@400;600;700&family=Rajdhani:wght@500;700&family=Share+Tech+Mono&family=Sora:wght@400;600;700&family=Source+Serif+4:wght@400;600;700&family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&family=Syne:wght@500;700&family=Work+Sans:wght@400;600;700&display=swap' rel='stylesheet'>"

$html = @"
<!doctype html>
<html lang='en'>
<head>
<meta charset='UTF-8' />
<meta name='viewport' content='width=device-width, initial-scale=1.0' />
<title>$($t.title)</title>
$fontLink
<link rel='stylesheet' href='./style.css' />
</head>
<body class='$($t.shell) nav-$($t.nav)'>
<div class='ambient a'></div><div class='ambient b'></div>
<div class='app-shell'>
  <aside class='nav-shell'>
    <div class='brand'><div class='brand-top'>$($t.tag)</div><h1>Idea Management</h1><p>Full app frontend ideation for visual review before implementation.</p></div>
    <nav class='nav'>$navButtons</nav>
  </aside>
  <main class='content'>
    <section class='hero'>
      <div><h2>$($t.title)</h2><p>All core pages are navigable via this pass interface.</p></div>
      <div class='hero-meta'><span>style=$StyleId</span><span>pass=$Pass</span><span>seed=$VariantSeed</span></div>
    </section>
    $sections
  </main>
</div>
<script src='./app.js'></script>
</body>
</html>
"@

$css = @"
:root { --bg:$($t.bg); --surface:$($t.surface); --text:$($t.text); --muted:$($t.muted); --border:$($t.border); --accent:$($t.accent); --accent2:$($t.accent2); --body:$($t.body); --heading:$($t.heading); --mono:$($t.mono); }
*{box-sizing:border-box} html,body{margin:0;min-height:100%}
body{font-family:var(--body);background:var(--bg);color:var(--text);overflow-x:hidden}
.ambient{position:fixed;filter:blur(42px);opacity:.35;pointer-events:none;z-index:0}.ambient.a{width:30vw;height:30vw;top:-8vw;right:-8vw;background:var(--accent)}.ambient.b{width:26vw;height:26vw;bottom:-8vw;left:-8vw;background:var(--accent2)}
.app-shell{position:relative;z-index:1;display:grid;grid-template-columns:300px 1fr;min-height:100vh}
.nav-shell{border-right:2px solid var(--border);padding:20px;background:color-mix(in srgb,var(--surface) 84%,transparent);backdrop-filter:blur(8px)}
.brand-top{display:inline-block;padding:4px 8px;border:1px solid var(--border);font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.08em}
.brand h1{font-family:var(--heading);margin:8px 0;font-size:clamp(1.6rem,2vw,2.4rem)} .brand p{color:var(--muted);margin:0}
.nav{margin-top:16px;display:grid;gap:8px}
.nav-item{border:1px solid var(--border);background:color-mix(in srgb,var(--surface) 75%,transparent);color:var(--text);padding:10px 12px;text-align:left;border-radius:12px;font-family:var(--mono);font-size:12px;cursor:pointer;transition:.2s}
.nav-item:hover{transform:translateX(2px);border-color:var(--accent)} .nav-item.active{background:color-mix(in srgb,var(--accent) 18%,var(--surface));border-color:var(--accent)}
.content{padding:24px}
.hero,.view{border:2px solid var(--border);border-radius:16px;padding:16px;background:color-mix(in srgb,var(--surface) 88%,transparent)}
.hero{display:flex;justify-content:space-between;gap:16px;align-items:start}
.hero h2{margin:0 0 8px;font-family:var(--heading);font-size:clamp(1.4rem,2.4vw,2.6rem)} .hero p{margin:0;color:var(--muted)}
.hero-meta{display:grid;gap:8px} .hero-meta span{font-family:var(--mono);font-size:11px;border:1px dashed var(--border);padding:6px 8px;border-radius:10px}
.view{display:none;margin-top:16px;animation:fade .35s ease}.view.active{display:block}
.view-head h2{margin:0;font-family:var(--heading)} .view-head p{margin:8px 0 0;color:var(--muted)}
.view-grid{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.panel{border:1px solid var(--border);border-radius:12px;padding:12px;background:color-mix(in srgb,var(--surface) 94%,transparent)}
.panel h3{margin:0 0 8px;font-family:var(--heading)} .panel p,.panel li{color:var(--muted)}
.chip-row{display:flex;flex-wrap:wrap;gap:8px}.chip{border:1px solid var(--border);padding:4px 8px;border-radius:999px;font-family:var(--mono);font-size:11px;background:color-mix(in srgb,var(--accent2) 14%,transparent)}
.shell-brutal-grid .hero,.shell-brutal-grid .view,.shell-brutal-grid .panel{border-radius:0;box-shadow:8px 8px 0 var(--border);border-width:3px}
.shell-brutal-stamp .panel{border-style:dashed}.shell-brutal-stamp .hero{transform:rotate(-.25deg)}
.shell-glass-sidebar .hero,.shell-glass-sidebar .view,.shell-glass-sidebar .panel{backdrop-filter:blur(14px);box-shadow:0 18px 40px rgba(0,0,0,.26)}
.nav-dock .app-shell{grid-template-columns:1fr}.nav-dock .nav-shell{position:fixed;left:50%;transform:translateX(-50%);bottom:14px;top:auto;height:auto;width:min(1200px,calc(100% - 24px));display:grid;grid-template-columns:240px 1fr;border:1px solid var(--border);border-radius:18px;z-index:9}.nav-dock .nav{grid-template-columns:repeat(5,minmax(0,1fr))}.nav-dock .nav-item{text-align:center}.nav-dock .content{padding-bottom:180px}
.shell-editorial-columns .view-grid{grid-template-columns:2fr 1fr}.shell-editorial-mono .hero,.shell-editorial-mono .view,.shell-editorial-mono .panel{border-radius:4px}
.nav-rail .app-shell{grid-template-columns:92px 1fr}.nav-rail .brand p,.nav-rail .brand h1{display:none}.nav-rail .nav-shell{padding:14px}.nav-rail .nav-item{writing-mode:vertical-rl;text-orientation:mixed;min-height:84px;text-align:center}
.shell-terminal-green .hero,.shell-terminal-green .view,.shell-terminal-green .panel,.shell-terminal-amber .hero,.shell-terminal-amber .view,.shell-terminal-amber .panel{border-style:dotted}
.shell-clay-soft .hero,.shell-clay-soft .view,.shell-clay-soft .panel{box-shadow:0 12px 20px rgba(66,37,122,.15);border-color:color-mix(in srgb,var(--border) 70%,transparent)}
.shell-clay-comic .hero,.shell-clay-comic .view,.shell-clay-comic .panel{border-width:3px;border-radius:24px}.shell-clay-comic .nav-item{border-radius:999px}
@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media (max-width:1024px){.app-shell{grid-template-columns:1fr}.nav-shell{border-right:0;border-bottom:2px solid var(--border)}.view-grid{grid-template-columns:1fr}.nav-dock .nav-shell{position:static;transform:none;width:auto;border-radius:0;grid-template-columns:1fr}.nav-dock .nav{grid-template-columns:repeat(2,minmax(0,1fr))}.nav-dock .content{padding-bottom:24px}.nav-rail .app-shell{grid-template-columns:1fr}.nav-rail .nav-item{writing-mode:horizontal-tb;min-height:auto;text-align:left}}
"@

$js = @"
(function(){
  const buttons = Array.from(document.querySelectorAll('.nav-item'));
  const views = Array.from(document.querySelectorAll('.view'));
  function activate(id){
    buttons.forEach((b)=>b.classList.toggle('active', b.dataset.view===id));
    views.forEach((v)=>v.classList.toggle('active', v.dataset.view===id));
    const u = new URL(window.location.href); u.hash = id; history.replaceState({},'',u);
  }
  buttons.forEach((b)=>b.addEventListener('click',()=>activate(b.dataset.view)));
  activate(window.location.hash ? window.location.hash.slice(1) : 'dashboard');
})();
"@

$readme = @"
# $($t.title)

- style-id: $StyleId
- pass: $Pass
- variant-seed: $VariantSeed

This pass contains a fully navigable app ideation with views for:
- dashboard
- projects
- project-workspace
- kanban
- whiteboard
- schema-planner
- directory-tree
- ideas
- ai-chat
- settings

Validation artifacts should be captured in validation/:
- Screenshots: validation/screenshots/*.png
- Playwright report: validation/report.playwright.json
"@

Set-Content -Path (Join-Path $OutputDir 'index.html') -Value $html
Set-Content -Path (Join-Path $OutputDir 'style.css') -Value $css
Set-Content -Path (Join-Path $OutputDir 'app.js') -Value $js
Set-Content -Path (Join-Path $OutputDir 'README.md') -Value $readme
Write-Output "Generated $OutputDir"
