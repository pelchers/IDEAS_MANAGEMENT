param(
  [string]$ConfigPath = '.codex/skills/planning-frontend-design-orchestrator/references/style-config.json',
  [string]$OutPath = '.codex/skills/planning-frontend-design-orchestrator/references/pass-jobs.json'
)

$cfg = Get-Content -Raw -Path $ConfigPath | ConvertFrom-Json
$jobs = @()

foreach ($style in $cfg.styles) {
  foreach ($variant in $style.passVariants) {
    $jobs += [PSCustomObject]@{
      styleId = $style.id
      styleLabel = $style.label
      pass = [int]$variant.pass
      variantSeed = $variant.variantSeed
      outputDir = "$($cfg.outputRoot)/$($style.id)/pass-$($variant.pass)"
      flags = @(
        "--style-id $($style.id)",
        "--pass $($variant.pass)",
        "--output-dir $($cfg.outputRoot)/$($style.id)/pass-$($variant.pass)",
        "--variant-seed $($variant.variantSeed)"
      )
    }
  }
}

$jobs | ConvertTo-Json -Depth 6 | Set-Content -Path $OutPath
Write-Output "Wrote $($jobs.Count) jobs to $OutPath"
