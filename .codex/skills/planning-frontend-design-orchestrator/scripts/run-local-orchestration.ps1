param(
  [string]$ConfigPath = '.codex/skills/planning-frontend-design-orchestrator/references/style-config.json'
)

$cfg = Get-Content -Raw -Path $ConfigPath | ConvertFrom-Json
$subagentScript = '.codex/skills/frontend-design-subagent/scripts/generate-concept.ps1'

foreach ($style in $cfg.styles) {
  foreach ($variant in $style.passVariants) {
    & $subagentScript `
      -StyleId $style.id `
      -Pass ([int]$variant.pass) `
      -VariantSeed $variant.variantSeed `
      -OutputDir "$($cfg.outputRoot)/$($style.id)/pass-$($variant.pass)"
  }
}

Write-Output "Local orchestration complete."
