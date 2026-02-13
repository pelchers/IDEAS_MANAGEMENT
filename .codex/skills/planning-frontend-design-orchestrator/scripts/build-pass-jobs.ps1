param(
  [string]$ConfigPath = '.codex/skills/planning-frontend-design-orchestrator/references/style-config.json',
  [string]$OutPath = '.codex/skills/planning-frontend-design-orchestrator/references/pass-jobs.json'
)

$cfg = Get-Content -Raw -Path $ConfigPath | ConvertFrom-Json
$jobs = @()
$validationSubfolder = if ($cfg.orchestration.validationSubfolder) { $cfg.orchestration.validationSubfolder } else { 'validation' }
$screenshotsSubfolder = if ($cfg.orchestration.screenshotsSubfolder) { $cfg.orchestration.screenshotsSubfolder } else { 'validation/screenshots' }

foreach ($style in $cfg.styles) {
  foreach ($variant in $style.passVariants) {
    $outputDir = "$($cfg.outputRoot)/$($style.id)/pass-$($variant.pass)"
    $jobs += [PSCustomObject]@{
      styleId = $style.id
      styleLabel = $style.label
      pass = [int]$variant.pass
      variantSeed = $variant.variantSeed
      outputDir = $outputDir
      validationDir = "$outputDir/$validationSubfolder"
      screenshotsDir = "$outputDir/$screenshotsSubfolder"
      handoffFile = "$outputDir/$validationSubfolder/handoff.json"
      inspirationFile = "$outputDir/$validationSubfolder/inspiration-crossreference.json"
      flags = @(
        "--style-id $($style.id)",
        "--pass $($variant.pass)",
        "--output-dir $outputDir",
        "--variant-seed $($variant.variantSeed)"
      )
    }
  }
}

$jobs | ConvertTo-Json -Depth 6 | Set-Content -Path $OutPath
Write-Output "Wrote $($jobs.Count) jobs to $OutPath"
