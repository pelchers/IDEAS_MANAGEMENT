param(
  [string]$ConfigPath = '.codex/skills/planning-frontend-design-orchestrator/references/style-config.json',
  [switch]$Sequential
)

$ErrorActionPreference = 'Stop'
$cfg = Get-Content -Raw -Path $ConfigPath | ConvertFrom-Json
$buildJobsScript = (Resolve-Path '.codex/skills/planning-frontend-design-orchestrator/scripts/build-pass-jobs.ps1').Path
$jobsManifestPath = '.codex/skills/planning-frontend-design-orchestrator/references/pass-jobs.json'
$generateScript = (Resolve-Path '.codex/skills/frontend-design-subagent/scripts/generate-concept.ps1').Path
$validateScript = (Resolve-Path '.codex/skills/frontend-design-subagent/scripts/validate-concepts-playwright.mjs').Path
$outputRoot = $cfg.outputRoot
$concurrency = if ($cfg.orchestration.concurrency) { [int]$cfg.orchestration.concurrency } else { 5 }
$validationSubfolder = if ($cfg.orchestration.validationSubfolder) { $cfg.orchestration.validationSubfolder } else { 'validation' }
$requireValidation = if ($null -ne $cfg.orchestration.requireValidation) { [bool]$cfg.orchestration.requireValidation } else { $true }

$runId = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
$runLogRoot = Join-Path $outputRoot "_orchestration/$runId"
New-Item -ItemType Directory -Force -Path $runLogRoot | Out-Null

& $buildJobsScript -ConfigPath $ConfigPath -OutPath $jobsManifestPath
if ($LASTEXITCODE -ne 0) {
  throw "Failed to build pass jobs manifest."
}

$jobs = @()
foreach ($style in $cfg.styles) {
  foreach ($variant in $style.passVariants) {
    $outputDir = "$outputRoot/$($style.id)/pass-$($variant.pass)"
    $jobs += [PSCustomObject]@{
      jobId = "$($style.id)-pass-$($variant.pass)"
      styleId = $style.id
      pass = [int]$variant.pass
      variantSeed = $variant.variantSeed
      outputDir = $outputDir
      validationDir = "$outputDir/$validationSubfolder"
      handoffFile = "$outputDir/$validationSubfolder/handoff.json"
    }
  }
}

Write-Output "Starting orchestration run $runId with $($jobs.Count) jobs. Mode: $(if ($Sequential) { 'sequential' } else { 'concurrent' })"

$results = @()
if ($Sequential) {
  foreach ($job in $jobs) {
    $start = (Get-Date).ToUniversalTime().ToString('o')
    & $generateScript -StyleId $job.styleId -Pass $job.pass -VariantSeed $job.variantSeed -OutputDir $job.outputDir
    $exitCode = $LASTEXITCODE
    $end = (Get-Date).ToUniversalTime().ToString('o')
    if ($exitCode -ne 0) {
      throw "Generation failed for $($job.jobId) with exit code $exitCode"
    }
    $results += [PSCustomObject]@{
      jobId = $job.jobId
      styleId = $job.styleId
      pass = $job.pass
      outputDir = $job.outputDir
      handoffFile = $job.handoffFile
      status = 'completed'
      mode = 'sequential'
      startedAt = $start
      endedAt = $end
    }
  }
} else {
  $active = @()
  $submitted = @()
  foreach ($job in $jobs) {
    while (@($active | Where-Object { $_.State -eq 'Running' }).Count -ge $concurrency) {
      Start-Sleep -Milliseconds 200
      $active = @($active | Where-Object { $_.State -eq 'Running' })
    }
    $psJob = Start-Job -Name $job.jobId -ScriptBlock {
      param($generateScriptPath, $styleId, $pass, $variantSeed, $outputDir)
      $ErrorActionPreference = 'Stop'
      $startedAt = (Get-Date).ToUniversalTime().ToString('o')
      & $generateScriptPath -StyleId $styleId -Pass $pass -VariantSeed $variantSeed -OutputDir $outputDir
      $endedAt = (Get-Date).ToUniversalTime().ToString('o')
      if ($LASTEXITCODE -ne 0) {
        throw "Generation script failed with exit code $LASTEXITCODE"
      }
      [PSCustomObject]@{
        styleId = $styleId
        pass = $pass
        outputDir = $outputDir
        startedAt = $startedAt
        endedAt = $endedAt
        pid = $PID
      }
    } -ArgumentList $generateScript, $job.styleId, $job.pass, $job.variantSeed, $job.outputDir
    $active += $psJob
    $submitted += $psJob
  }

  Wait-Job -Job $submitted | Out-Null
  foreach ($run in $submitted) {
    if ($run.State -ne 'Completed') {
      $err = Receive-Job -Job $run -ErrorAction SilentlyContinue
      throw "Job $($run.Name) failed with state $($run.State). $err"
    }
    $payload = Receive-Job -Job $run
    Remove-Job -Job $run | Out-Null
    $handoffFile = "$($payload.outputDir)/$validationSubfolder/handoff.json"
    $results += [PSCustomObject]@{
      jobId = $run.Name
      styleId = $payload.styleId
      pass = $payload.pass
      outputDir = $payload.outputDir
      handoffFile = $handoffFile
      status = 'completed'
      mode = 'concurrent'
      startedAt = $payload.startedAt
      endedAt = $payload.endedAt
      processId = $payload.pid
    }
  }
}

$results | ConvertTo-Json -Depth 6 | Set-Content -Path (Join-Path $runLogRoot 'handoff-results.json')

if ($requireValidation) {
  Write-Output "Running Playwright validation..."
  node $validateScript --concept-root $outputRoot
  if ($LASTEXITCODE -ne 0) {
    throw "Playwright validation failed with exit code $LASTEXITCODE"
  }
}

foreach ($r in $results) {
  if (-not (Test-Path $r.handoffFile)) {
    throw "Missing handoff file: $($r.handoffFile)"
  }
  $passValidationDir = Join-Path $r.outputDir $validationSubfolder
  if (-not (Test-Path (Join-Path $passValidationDir 'report.playwright.json'))) {
    throw "Missing validation report: $(Join-Path $passValidationDir 'report.playwright.json')"
  }
  if (-not (Test-Path (Join-Path $passValidationDir 'screenshots'))) {
    throw "Missing screenshots folder: $(Join-Path $passValidationDir 'screenshots')"
  }
}

$summary = [PSCustomObject]@{
  runId = $runId
  mode = if ($Sequential) { 'sequential' } else { 'concurrent' }
  concurrency = if ($Sequential) { 1 } else { $concurrency }
  totalJobs = $results.Count
  validationRequired = $requireValidation
  generatedAt = (Get-Date).ToUniversalTime().ToString('o')
  results = $results
}

$summaryPath = Join-Path $runLogRoot 'summary.json'
$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $summaryPath
Write-Output "Local orchestration complete. Summary: $summaryPath"
