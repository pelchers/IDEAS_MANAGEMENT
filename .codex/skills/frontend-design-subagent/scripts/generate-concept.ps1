param(
  [Parameter(Mandatory = $true)][string]$StyleId,
  [Parameter(Mandatory = $true)][int]$Pass,
  [Parameter(Mandatory = $true)][string]$VariantSeed,
  [Parameter(Mandatory = $true)][string]$OutputDir
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$validationDir = Join-Path $OutputDir "validation"
$screenshotsDir = Join-Path $validationDir "screenshots"
New-Item -ItemType Directory -Force -Path $validationDir | Out-Null
New-Item -ItemType Directory -Force -Path $screenshotsDir | Out-Null

$key = "$StyleId/pass-$Pass"

$templates = @{
  "signal-brutalist/pass-1" = @{
    title = "Signal Brutalist / Pass 1"; layoutMode = "brutal-grid"; sectionMode = "brutal-grid";
    bodyClass = "brutal-grid"; navClass = "blk-nav-btn"; sectionClass = "blk-card";
    colors = @{ bg = "#f2ead9"; text = "#111111"; surface = "#ffffff"; accent = "#ff4d00"; accent2 = "#0066ff"; border = "#111111" };
  };
  "signal-brutalist/pass-2" = @{
    title = "Signal Brutalist / Pass 2"; layoutMode = "brutal-stamp"; sectionMode = "brutal-stamp";
    bodyClass = "stamp-core"; navClass = "stamp-tab"; sectionClass = "stamp-card";
    colors = @{ bg = "#fffaf0"; text = "#161616"; surface = "#ffffff"; accent = "#d72638"; accent2 = "#2552d8"; border = "#131313" };
  };
  "aurora-glass/pass-1" = @{
    title = "Aurora Glass / Pass 1"; layoutMode = "glass-dock"; sectionMode = "glass-dock";
    bodyClass = "aurora-night"; navClass = "gls-dock-btn"; sectionClass = "gls-pane";
    colors = @{ bg = "#091224"; text = "#ecf7ff"; surface = "rgba(255,255,255,0.08)"; accent = "#53d8ff"; accent2 = "#7d7dff"; border = "rgba(149,220,255,0.5)" };
  };
  "aurora-glass/pass-2" = @{
    title = "Aurora Glass / Pass 2"; layoutMode = "glass-orbit"; sectionMode = "glass-orbit";
    bodyClass = "prism-orbit"; navClass = "prm-rail-btn"; sectionClass = "prm-node";
    colors = @{ bg = "#edf5ff"; text = "#1a2340"; surface = "rgba(255,255,255,0.8)"; accent = "#6794ff"; accent2 = "#bd7aff"; border = "#98abd4" };
  };
  "ledger-editorial/pass-1" = @{
    title = "Ledger Editorial / Pass 1"; layoutMode = "editorial-broadsheet"; sectionMode = "editorial-broadsheet";
    bodyClass = "broadsheet"; navClass = "news-toc-btn"; sectionClass = "news-story";
    colors = @{ bg = "#f1eadf"; text = "#1b1715"; surface = "#fffdf8"; accent = "#7d5938"; accent2 = "#2f5f88"; border = "#2b241f" };
  };
  "ledger-editorial/pass-2" = @{
    title = "Ledger Editorial / Pass 2"; layoutMode = "editorial-ledger"; sectionMode = "editorial-ledger";
    bodyClass = "legal-notebook"; navClass = "notebook-tab"; sectionClass = "note-page";
    colors = @{ bg = "#f7f7f7"; text = "#131313"; surface = "#ffffff"; accent = "#111111"; accent2 = "#d86060"; border = "#1f1f1f" };
  };
  "industrial-terminal/pass-1" = @{
    title = "Industrial Terminal / Pass 1"; layoutMode = "terminal-crt"; sectionMode = "terminal-crt";
    bodyClass = "crt-room"; navClass = "crt-cmd"; sectionClass = "crt-screen";
    colors = @{ bg = "#020702"; text = "#76ff90"; surface = "#071007"; accent = "#2f8f42"; accent2 = "#8affac"; border = "#1f5e2d" };
  };
  "industrial-terminal/pass-2" = @{
    title = "Industrial Terminal / Pass 2"; layoutMode = "terminal-scada"; sectionMode = "terminal-scada";
    bodyClass = "scada-wall"; navClass = "scada-switch"; sectionClass = "scada-module";
    colors = @{ bg = "#16100a"; text = "#ffd79a"; surface = "#23180f"; accent = "#ffb567"; accent2 = "#67b9ff"; border = "#6b421f" };
  };
  "playful-clay/pass-1" = @{
    title = "Playful Clay / Pass 1"; layoutMode = "clay-studio"; sectionMode = "clay-studio";
    bodyClass = "clay-board"; navClass = "clay-chip"; sectionClass = "clay-blob";
    colors = @{ bg = "#fff5fb"; text = "#2f2155"; surface = "#ffffff"; accent = "#ff7f90"; accent2 = "#7454d1"; border = "#d8c6ff" };
  };
  "playful-clay/pass-2" = @{
    title = "Playful Clay / Pass 2"; layoutMode = "clay-comic"; sectionMode = "clay-comic";
    bodyClass = "comic-shell"; navClass = "comic-bubble"; sectionClass = "comic-panel";
    colors = @{ bg = "#fff6df"; text = "#23193c"; surface = "#ffffff"; accent = "#ff7a59"; accent2 = "#3f2f74"; border = "#23193c" };
  };
}

if (-not $templates.ContainsKey($key)) {
  throw "Unknown style/pass: $key"
}

$t = $templates[$key]

$views = @(
  @{ id = "dashboard"; title = "Dashboard"; desc = "Cross-project velocity, risk, and delivery state." },
  @{ id = "projects"; title = "Projects"; desc = "Drive-style browser for project directories and metadata." },
  @{ id = "project-workspace"; title = "Project Workspace"; desc = "File tree and descriptor model from project.json." },
  @{ id = "kanban"; title = "Kanban"; desc = "Backlog, in-progress, blocked, and done lanes." },
  @{ id = "whiteboard"; title = "Whiteboard"; desc = "Container-rich ideation board with media inserts." },
  @{ id = "schema-planner"; title = "Schema Planner"; desc = "Entity relationship and migration planning." },
  @{ id = "directory-tree"; title = "Directory Tree"; desc = "Scaffold generation and folder governance." },
  @{ id = "ideas"; title = "Ideas"; desc = "Capture queue with prioritization and linking." },
  @{ id = "ai-chat"; title = "AI Chat"; desc = "Actionable assistant with project-wide file context." },
  @{ id = "settings"; title = "Settings"; desc = "Authentication, subscription, and environment controls." }
)

function Get-NavButtons {
  param([string]$ClassName, [string]$Prefix)
  return ($views | ForEach-Object -Begin { $i = 0 } -Process {
    $i++
    "<button class='$ClassName' data-view='$($_.id)'><span>$Prefix$('{0:d2}' -f $i)</span>$($_.title)</button>"
  }) -join "`n"
}

function Get-Sections {
  param([string]$Mode, [string]$ClassName)
  switch ($Mode) {
    "brutal-grid" {
      return ($views | ForEach-Object -Begin { $i = 0 } -Process {
        $i++
        "<article class='$ClassName' data-page='$($_.id)'><header><span class='blk-index'>$('{0:d2}' -f $i)</span><h2>$($_.title)</h2></header><p>$($_.desc)</p><div class='blk-rail'>MODULE $($_.id.ToUpper().Replace('-','_'))</div></article>"
      }) -join "`n"
    }
    "brutal-stamp" {
      return ($views | ForEach-Object {
        "<section class='$ClassName' data-page='$($_.id)'><div class='stamp-head'><span>$($_.id.Replace('-',' '))</span><h2>$($_.title)</h2></div><p>$($_.desc)</p><ul><li>Requirement framing</li><li>Workflow impact</li><li>Integration hooks</li></ul></section>"
      }) -join "`n"
    }
    "glass-dock" {
      return ($views | ForEach-Object {
        "<article class='$ClassName' data-page='$($_.id)'><h2>$($_.title)</h2><p>$($_.desc)</p><div class='gls-meta'>Synchronized project context and cross-tool continuity.</div></article>"
      }) -join "`n"
    }
    "glass-orbit" {
      return ($views | ForEach-Object -Begin { $i = 0 } -Process {
        $i++
        $lane = (($i - 1) % 3) + 1
        $n = (($i - 1) % 5) + 1
        "<section class='$ClassName n$n' data-page='$($_.id)'><h2>$($_.title)</h2><p>$($_.desc)</p><small>Prismatic lane $lane</small></section>"
      }) -join "`n"
    }
    "editorial-broadsheet" {
      return ($views | ForEach-Object -Begin { $i = 0 } -Process {
        $i++
        "<article class='$ClassName' data-page='$($_.id)'><p class='kicker'>Section $i</p><h2>$($_.title)</h2><p>$($_.desc)</p><div class='pull'>`"Execution detail follows planning discipline.`"</div></article>"
      }) -join "`n"
    }
    "editorial-ledger" {
      return ($views | ForEach-Object {
        "<section class='$ClassName' data-page='$($_.id)'><h2>$($_.title)</h2><p>$($_.desc)</p><ol><li>Intent</li><li>Constraints</li><li>Definition of done</li></ol></section>"
      }) -join "`n"
    }
    "terminal-crt" {
      return ($views | ForEach-Object {
        "<section class='$ClassName' data-page='$($_.id)'><h2>> $($_.title.ToUpper())</h2><p>$($_.desc)</p><pre>status: ONLINE`nlatency: 21ms`nsync: nominal</pre></section>"
      }) -join "`n"
    }
    "terminal-scada" {
      return ($views | ForEach-Object -Begin { $i = 10 } -Process {
        $i++
        $n = (($i - 11) % 4) + 1
        "<article class='$ClassName m$n' data-page='$($_.id)'><h2>$($_.title)</h2><p>$($_.desc)</p><div class='scada-foot'>sector $i</div></article>"
      }) -join "`n"
    }
    "clay-studio" {
      return ($views | ForEach-Object -Begin { $i = 0 } -Process {
        $i++
        $b = (($i - 1) % 5) + 1
        $spark = (($i - 1) % 4) + 1
        "<section class='$ClassName b$b' data-page='$($_.id)'><h2>$($_.title)</h2><p>$($_.desc)</p><div class='clay-tag'>spark $spark</div></section>"
      }) -join "`n"
    }
    "clay-comic" {
      return ($views | ForEach-Object -Begin { $i = 101 } -Process {
        $i++
        $p = (($i - 102) % 6) + 1
        "<article class='$ClassName p$p' data-page='$($_.id)'><h2>$($_.title)</h2><p>$($_.desc)</p><footer>Issue #$i</footer></article>"
      }) -join "`n"
    }
    default { throw "Unsupported section mode: $Mode" }
  }
}

$nav = Get-NavButtons -ClassName $t.navClass -Prefix "N-"
$sections = Get-Sections -Mode $t.sectionMode -ClassName $t.sectionClass

$fontLink = "<link rel='preconnect' href='https://fonts.googleapis.com'><link rel='preconnect' href='https://fonts.gstatic.com' crossorigin><link href='https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Baloo+2:wght@400;700&family=Bebas+Neue&family=Bricolage+Grotesque:wght@400;600;800&family=Chivo+Mono:wght@400;700&family=Cormorant+Garamond:wght@500;700&family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;500&family=Fredoka:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;600;700&family=Instrument+Serif&family=JetBrains+Mono:wght@400;700&family=Manrope:wght@400;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,600&family=Nunito:wght@400;700&family=Oswald:wght@400;600&family=Outfit:wght@400;600;700&family=Playfair+Display:wght@500;700&family=Quicksand:wght@400;600;700&family=Rajdhani:wght@500;700&family=Share+Tech+Mono&family=Source+Serif+4:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&family=Space+Mono:wght@400;700&family=Syne:wght@500;700&family=VT323&display=swap' rel='stylesheet'>"

function Get-Layout {
  param([string]$Mode, [string]$Title, [string]$Seed, [string]$NavButtons, [string]$Sections, [string]$BodyClass)
  switch ($Mode) {
    "brutal-grid" {
      return "<body class='$BodyClass' data-theme-root><div class='paper-noise'></div><section class='blk-shell'><aside class='blk-nav'><h1>Signal Grid Ops</h1><p>Poster-scale command surface for project planning.</p><nav>$NavButtons</nav></aside><main class='blk-stage'><div class='blk-hero'><p>Variant Seed: $Seed</p><h2>Hard-edge layout with uncompromising hierarchy</h2></div><section class='blk-panels'>$Sections</section></main></section></body>"
    }
    "brutal-stamp" {
      return "<body class='$BodyClass' data-theme-root><header class='stamp-top'><h1>Stamped Tactical Ops</h1><p>Variant Seed: $Seed</p></header><nav class='stamp-bar'>$NavButtons</nav><main class='stamp-grid'>$Sections</main></body>"
    }
    "glass-dock" {
      return "<body class='$BodyClass' data-theme-root><div class='aurora-cloud a'></div><div class='aurora-cloud b'></div><main class='gls-shell'><header><h1>Aurora Dock Suite</h1><p>$Seed</p></header><section class='gls-window'>$Sections</section></main><nav class='gls-dock'>$NavButtons</nav></body>"
    }
    "glass-orbit" {
      return "<body class='$BodyClass' data-theme-root><div class='prm-halo'></div><aside class='prm-rail'>$NavButtons</aside><main class='prm-center'><header><h1>Prism Orbital Console</h1><p>Variant Seed: $Seed</p></header><div class='prm-orbit'>$Sections</div></main></body>"
    }
    "editorial-broadsheet" {
      return "<body class='$BodyClass' data-theme-root><header class='news-masthead'><h1>Project Ledger Times</h1><p>$Seed</p></header><section class='news-layout'><nav class='news-toc'>$NavButtons</nav><main class='news-copy'>$Sections</main><aside class='news-brief'><h3>Edition Notes</h3><p>A publication-centric product shell tuned for planning depth.</p></aside></section></body>"
    }
    "editorial-ledger" {
      return "<body class='$BodyClass' data-theme-root><div class='spine'></div><main class='note-shell'><header><h1>Monochrome Notebook Ops</h1><p>$Seed</p></header><nav class='note-tabs'>$NavButtons</nav><section class='note-sheet'>$Sections</section></main></body>"
    }
    "terminal-crt" {
      return "<body class='$BodyClass' data-theme-root><div class='scanlines'></div><section class='crt-shell'><aside class='crt-console'><h1>Vector Command Core</h1><p>$Seed</p>$NavButtons</aside><main class='crt-output'>$Sections</main></section></body>"
    }
    "terminal-scada" {
      return "<body class='$BodyClass' data-theme-root><header><h1>Rack Operations Wallboard</h1><p>$Seed</p></header><section class='scada-layout'><nav class='scada-switches'>$NavButtons</nav><main class='scada-grid'>$Sections</main></section></body>"
    }
    "clay-studio" {
      return "<body class='$BodyClass' data-theme-root><header><h1>Tactile Studio Board</h1><p>$Seed</p></header><nav class='clay-rack'>$NavButtons</nav><main class='clay-canvas'>$Sections</main></body>"
    }
    "clay-comic" {
      return "<body class='$BodyClass' data-theme-root><header><h1>Comic Motion Workspace</h1><p>$Seed</p></header><nav class='comic-nav'>$NavButtons</nav><section class='comic-grid'>$Sections</section></body>"
    }
    default { throw "Unsupported layout mode: $Mode" }
  }
}

$bodyMarkup = Get-Layout -Mode $t.layoutMode -Title $t.title -Seed $VariantSeed -NavButtons $nav -Sections $sections -BodyClass $t.bodyClass

$html = "<!doctype html><html lang='en'><head><meta charset='UTF-8' /><meta name='viewport' content='width=device-width, initial-scale=1.0' /><title>$($t.title)</title>$fontLink<link rel='stylesheet' href='./style.css' /></head>$bodyMarkup<script src='./app.js'></script></html>"

$cssBase = @"
:root{--bg:$($t.colors.bg);--text:$($t.colors.text);--surface:$($t.colors.surface);--accent:$($t.colors.accent);--accent2:$($t.colors.accent2);--border:$($t.colors.border)}
*{box-sizing:border-box}html,body{margin:0;min-height:100%}
button{font:inherit}
[data-page]{display:none}
[data-page].active{display:block}
"@

switch ($t.layoutMode) {
  "brutal-grid" {
    $cssLayout = @"
.brutal-grid{background:var(--bg);color:var(--text);font-family:"Space Grotesk",sans-serif}.paper-noise{position:fixed;inset:0;background-image:radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px);background-size:4px 4px;pointer-events:none}.blk-shell{display:grid;grid-template-columns:320px 1fr;min-height:100vh}.blk-nav{border-right:4px solid var(--border);padding:20px;background:#fff7e6}.blk-nav-btn{border:3px solid var(--border);background:#fff;padding:10px 12px;text-align:left;font-weight:700;font-family:"IBM Plex Mono",monospace;display:grid;gap:4px;cursor:pointer}.blk-nav-btn.active{transform:translate(-6px,-4px);box-shadow:6px 4px 0 var(--accent)}.blk-stage{padding:22px;display:grid;gap:16px}.blk-hero{border:4px solid var(--border);padding:18px;background:linear-gradient(130deg,#fff 0%,#ffe8cf 100%)}.blk-panels{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.blk-card{border:4px solid var(--border);padding:14px;background:#fff;box-shadow:10px 10px 0 var(--accent2)}.blk-index{font-family:"Anton",sans-serif;font-size:1.8rem;color:var(--accent)}@media (max-width:1024px){.blk-shell{grid-template-columns:1fr}.blk-nav{border-right:none;border-bottom:2px solid var(--border)}.blk-panels{grid-template-columns:1fr}}
"@
  }
  "brutal-stamp" {
    $cssLayout = @"
.stamp-core{background:var(--bg);color:var(--text);font-family:"Chivo Mono",monospace}.stamp-top{display:flex;justify-content:space-between;align-items:end;padding:22px;border-bottom:4px double var(--border);background:#fff}.stamp-bar{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-bottom:2px solid var(--border)}.stamp-tab{border:none;border-right:2px solid var(--border);background:#fff;padding:12px 10px;text-align:left;font-family:"Space Grotesk",sans-serif;font-weight:700;display:grid;gap:4px;cursor:pointer}.stamp-tab strong{font-size:.75rem;color:var(--accent)}.stamp-tab.active{background:var(--border);color:#fff}.stamp-grid{padding:18px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.stamp-card{border:3px solid var(--border);background:#fff;padding:14px}.stamp-head{display:flex;justify-content:space-between;align-items:start;gap:8px}@media (max-width:1024px){.stamp-bar{grid-template-columns:repeat(2,minmax(0,1fr))}.stamp-grid{grid-template-columns:1fr}}
"@
  }
  "glass-dock" {
    $cssLayout = @"
.aurora-night{background:radial-gradient(circle at 10% 20%,#13253a 0%,#070b18 60%,#05060f 100%);color:var(--text);font-family:"Manrope",sans-serif;overflow-x:hidden}.aurora-cloud{position:fixed;border-radius:999px;filter:blur(50px);opacity:.45;pointer-events:none}.aurora-cloud.a{width:35vw;height:35vw;left:-8vw;top:-9vw;background:var(--accent)}.aurora-cloud.b{width:30vw;height:30vw;right:-6vw;bottom:-8vw;background:var(--accent2)}.gls-shell{max-width:1180px;margin:0 auto;padding:28px 18px 170px;position:relative;z-index:1}.gls-window{margin-top:18px;border:1px solid var(--border);backdrop-filter:blur(22px);background:var(--surface);border-radius:22px;padding:20px;min-height:420px}.gls-pane{background:rgba(13,28,48,.62);border:1px solid var(--border);border-radius:18px;padding:16px}.gls-dock{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;width:min(1200px,calc(100% - 24px));background:rgba(9,20,36,.78);border:1px solid var(--border);border-radius:20px;padding:10px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;backdrop-filter:blur(12px)}.gls-dock-btn{border:1px solid var(--border);border-radius:12px;background:rgba(29,53,88,.45);color:var(--text);padding:10px 8px;font-size:.78rem;cursor:pointer}.gls-dock-btn.active{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#041018;font-weight:700}@media (max-width:1024px){.gls-dock{position:static;transform:none;width:auto;grid-template-columns:repeat(2,minmax(0,1fr));margin:0 10px 12px}}
"@
  }
  "glass-orbit" {
    $cssLayout = @"
.prism-orbit{background:linear-gradient(135deg,#edf5ff 0%,#dae6ff 52%,#fde9ff 100%);font-family:"DM Sans",sans-serif;color:var(--text);display:grid;grid-template-columns:240px 1fr}.prm-halo{position:fixed;width:48vw;height:48vw;left:50%;top:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#7fd8ff55 0%,#b689ff33 42%,transparent 70%);pointer-events:none}.prm-rail{padding:18px;border-right:1px solid var(--border);background:#ffffffbb;backdrop-filter:blur(10px);display:grid;gap:8px;align-content:start}.prm-rail-btn{display:flex;gap:10px;align-items:center;border:1px solid var(--border);background:#f6f8ff;border-radius:10px;padding:8px 10px;cursor:pointer;font-weight:600;color:#24325a}.prm-rail-btn.active{background:#2e3e72;color:#f2f6ff;border-color:#2e3e72}.prm-center{padding:20px 24px;position:relative;z-index:1}.prm-orbit{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}.prm-node{padding:16px;border-radius:18px;border:1px solid var(--border);background:#ffffffb8;backdrop-filter:blur(8px)}.prm-node.active{grid-column:span 8}@media (max-width:1024px){.prism-orbit{grid-template-columns:1fr}.prm-rail{border-right:none;border-bottom:2px solid var(--border);grid-template-columns:repeat(2,minmax(0,1fr))}.prm-node.active{grid-column:span 12}}
"@
  }
  "editorial-broadsheet" {
    $cssLayout = @"
.broadsheet{background:var(--bg);color:var(--text);font-family:"Source Serif 4",serif}.news-masthead{display:flex;justify-content:space-between;align-items:baseline;padding:18px 20px;border-bottom:3px solid var(--border);background:#fffaf2}.news-layout{display:grid;grid-template-columns:220px 1fr 260px;gap:14px;padding:16px}.news-toc{display:grid;gap:8px;align-content:start}.news-toc-btn{border:1px solid var(--border);background:#fffdf8;padding:10px;text-align:left;font-family:"Newsreader",serif;cursor:pointer}.news-toc-btn.active{background:#1f1a17;color:#fffdf8}.news-copy{columns:2;column-gap:16px}.news-story{break-inside:avoid;border:1px solid #3a312c;background:#fffdf8;padding:12px;margin-bottom:14px}@media (max-width:1024px){.news-layout{grid-template-columns:1fr}.news-copy{columns:1}}
"@
  }
  "editorial-ledger" {
    $cssLayout = @"
.legal-notebook{background:repeating-linear-gradient(#f7f7f7 0 34px,#ededed 34px 35px);font-family:"Newsreader",serif;color:var(--text);display:grid;grid-template-columns:80px 1fr}.spine{background:linear-gradient(#1c1c1c,#373737);box-shadow:inset -6px 0 0 #555}.note-shell{padding:20px 24px}.note-shell header{display:flex;justify-content:space-between;align-items:end;border-bottom:2px solid var(--border);padding-bottom:8px}.note-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0}.notebook-tab{background:#fff;border:1px solid var(--border);padding:10px 12px;text-align:left;font-family:"IBM Plex Sans",sans-serif;font-weight:600;cursor:pointer}.notebook-tab.active{background:#111;color:#fff}.note-sheet{border:2px solid var(--border);background:#fff;padding:14px;min-height:380px;position:relative}.note-sheet::before{content:"";position:absolute;left:16px;top:0;bottom:0;width:2px;background:var(--accent2)}.note-page{padding-left:26px}@media (max-width:1024px){.legal-notebook{grid-template-columns:1fr}.spine{display:none}.note-tabs{grid-template-columns:1fr}}
"@
  }
  "terminal-crt" {
    $cssLayout = @"
.crt-room{background:var(--bg);color:var(--text);font-family:"VT323",monospace}.scanlines{position:fixed;inset:0;pointer-events:none;background:linear-gradient(rgba(0,0,0,.22) 50%,transparent 50%);background-size:100% 4px;opacity:.5}.crt-shell{display:grid;grid-template-columns:300px 1fr;min-height:100vh;position:relative;z-index:1}.crt-console{border-right:1px solid var(--border);padding:18px;background:#081208}.crt-cmd{display:block;width:100%;margin-bottom:8px;border:1px solid var(--accent);background:#0d1f0e;color:var(--accent2);text-align:left;padding:8px 10px;font-size:1.15rem;cursor:pointer}.crt-cmd.active{background:var(--accent2);color:#042408}.crt-output{padding:18px;display:grid;gap:12px}.crt-screen{border:1px solid var(--accent);background:var(--surface);padding:12px}@media (max-width:1024px){.crt-shell{grid-template-columns:1fr}.crt-console{border-right:none;border-bottom:2px solid var(--border)}}
"@
  }
  "terminal-scada" {
    $cssLayout = @"
.scada-wall{background:var(--bg);color:var(--text);font-family:"Rajdhani",sans-serif}.scada-wall>header{display:flex;justify-content:space-between;align-items:end;padding:16px 20px;border-bottom:2px solid var(--border);background:#1f1610}.scada-layout{display:grid;grid-template-columns:280px 1fr;min-height:calc(100vh - 82px)}.scada-switches{padding:14px;border-right:2px solid var(--border);display:grid;gap:8px;align-content:start;background:#19120d}.scada-switch{border:1px solid var(--border);background:#281b12;color:var(--text);padding:9px 10px;text-align:left;font-weight:700;cursor:pointer}.scada-switch.active{background:var(--accent);color:#281807}.scada-grid{padding:14px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.scada-module{border:2px solid var(--border);padding:12px;background:var(--surface)}@media (max-width:1024px){.scada-layout{grid-template-columns:1fr}.scada-switches{border-right:none;border-bottom:2px solid var(--border);grid-template-columns:repeat(2,minmax(0,1fr))}.scada-grid{grid-template-columns:1fr}}
"@
  }
  "clay-studio" {
    $cssLayout = @"
.clay-board{background:linear-gradient(180deg,#fff5fb 0%,#f2f6ff 52%,#f0fff7 100%);font-family:"Nunito",sans-serif;color:var(--text)}.clay-board>header{display:flex;justify-content:space-between;align-items:end;padding:18px 20px}.clay-rack{display:flex;flex-wrap:wrap;gap:8px;padding:0 20px 16px}.clay-chip{border:none;border-radius:999px;background:#fff;box-shadow:0 8px 14px rgba(73,59,143,.15);padding:10px 14px;font-weight:700;color:#3d2c63;cursor:pointer}.clay-chip.active{background:var(--accent);color:#fff}.clay-canvas{padding:10px 20px 24px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.clay-blob{padding:16px;border-radius:28px;background:#fff;border:2px solid var(--border);box-shadow:0 14px 24px rgba(92,74,177,.18)}@media (max-width:1024px){.clay-canvas{grid-template-columns:1fr}}
"@
  }
  "clay-comic" {
    $cssLayout = @"
.comic-shell{background:var(--bg);color:var(--text);font-family:"Quicksand",sans-serif;background-image:radial-gradient(circle,#00000022 1px,transparent 1px);background-size:10px 10px}.comic-shell>header{display:flex;justify-content:space-between;align-items:end;padding:18px 20px;border-bottom:4px solid var(--border);background:#ffe9ac}.comic-nav{display:flex;flex-wrap:wrap;gap:10px;padding:14px 20px}.comic-bubble{border:3px solid var(--border);border-radius:999px;background:#fff;padding:8px 12px;font-weight:700;cursor:pointer;box-shadow:4px 4px 0 var(--border)}.comic-bubble.active{background:var(--accent);color:#fff}.comic-grid{padding:8px 20px 24px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.comic-panel{border:4px solid var(--border);border-radius:16px;padding:12px;box-shadow:8px 8px 0 var(--border)}.p1{background:#ffd3d9}.p2{background:#cff5ff}.p3{background:#dcffd8}.p4{background:#ffe9bf}.p5{background:#e3dbff}.p6{background:#fff}@media (max-width:1024px){.comic-grid{grid-template-columns:1fr}}
"@
  }
  default {
    throw "Unsupported layout mode for css: $($t.layoutMode)"
  }
}

$css = $cssBase + "`n" + $cssLayout

$js = @"
(() => {
  const buttons = Array.from(document.querySelectorAll("button[data-view]"));
  const pages = Array.from(document.querySelectorAll("[data-page]"));
  function activate(id) {
    buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === id));
    pages.forEach((page) => page.classList.toggle("active", page.dataset.page === id));
    const root = document.querySelector("[data-theme-root]") || document.body;
    root.setAttribute("data-active-view", id);
    const url = new URL(window.location.href);
    url.hash = id;
    history.replaceState({}, "", url);
  }
  buttons.forEach((btn) => btn.addEventListener("click", () => activate(btn.dataset.view)));
  activate(window.location.hash ? window.location.hash.slice(1) : "dashboard");
})();
"@

$catalogPath = ".codex/skills/frontend-design-subagent/references/external-inspiration-catalog.json"
if (-not (Test-Path $catalogPath)) {
  throw "Missing inspiration catalog: $catalogPath"
}
$catalogObj = Get-Content -Raw -Path $catalogPath | ConvertFrom-Json
$catalog = @{}
$catalogObj.PSObject.Properties | ForEach-Object {
  $catalog[$_.Name] = $_.Value
}
if (-not $catalog.ContainsKey($key)) {
  throw "Missing inspiration cross-reference entry for $key"
}
$inspiration = $catalog[$key]

$handoff = [PSCustomObject]@{
  styleId = $StyleId
  pass = $Pass
  variantSeed = $VariantSeed
  outputDir = $OutputDir
  template = $t.title
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
  script = ".codex/skills/frontend-design-subagent/scripts/generate-concept.ps1"
}
$inspirationLog = [PSCustomObject]@{
  key = $key
  styleId = $StyleId
  pass = $Pass
  direction = $inspiration.direction
  references = $inspiration.references
  appliedAt = (Get-Date).ToUniversalTime().ToString("o")
}

$readmeRefs = ($inspiration.references | ForEach-Object {
  "- $($_.name): $($_.url) (traits: $([string]::Join(', ', $_.traits)))"
}) -join "`n"

$readme = @"
# $($t.title)

- style-id: $StyleId
- pass: $Pass
- variant-seed: $VariantSeed

## External Inspiration Cross-Reference
$readmeRefs

## Included Views
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

Validation artifacts are written to:
- validation/handoff.json
- validation/inspiration-crossreference.json
- validation/report.playwright.json
- validation/screenshots/*.png
"@

Set-Content -Path (Join-Path $OutputDir "index.html") -Value $html
Set-Content -Path (Join-Path $OutputDir "style.css") -Value $css
Set-Content -Path (Join-Path $OutputDir "app.js") -Value $js
Set-Content -Path (Join-Path $OutputDir "README.md") -Value $readme
Set-Content -Path (Join-Path $validationDir "handoff.json") -Value ($handoff | ConvertTo-Json -Depth 6)
Set-Content -Path (Join-Path $validationDir "inspiration-crossreference.json") -Value ($inspirationLog | ConvertTo-Json -Depth 8)

Write-Output "Generated $OutputDir"
