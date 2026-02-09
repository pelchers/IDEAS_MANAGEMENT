param(
  [string]$QueueFile = "C:\\coding\\docs\\Hytale\\.codex\\orchestration\\queue\\next_phase.json"
)

if (-not (Test-Path $QueueFile)) {
  exit 0
}

try {
  $payload = Get-Content -LiteralPath $QueueFile -Raw | ConvertFrom-Json
} catch {
  Write-Host "Orchestrator: failed to parse queue file."
  exit 1
}

if (-not $payload.autoSpawn) {
  Write-Host "Orchestrator: autoSpawn=false; skipping."
  exit 0
}

$prompt = $payload.prompt
if (-not $prompt) {
  Write-Host "Orchestrator: missing prompt; skipping."
  exit 1
}

$workdir = $payload.workdir
if (-not $workdir) {
  $workdir = (Get-Location).Path
}

$fullAuto = $payload.fullAuto
$dryRun = $payload.dryRun
$agent = $payload.agent

$command = "codex exec --cd `"$workdir`""
if ($fullAuto) {
  $command += " --full-auto"
}
if ($agent) {
  $prompt = "Use agent file: .codex/agents/$agent/AGENT.md. " + $prompt
}
$command += " `"$prompt`""

if ($dryRun) {
  Write-Host "Orchestrator dry run: $command"
} else {
  Start-Process -FilePath "powershell" -ArgumentList "-NoProfile", "-Command", $command
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$historyDir = "C:\\coding\\docs\\Hytale\\.codex\\orchestration\\history"
$dest = Join-Path $historyDir "next_phase_$timestamp.json"
Move-Item -Force $QueueFile $dest
