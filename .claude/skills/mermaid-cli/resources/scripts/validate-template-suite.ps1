param(
    [string]$TemplateDir = (Join-Path $PSScriptRoot "..\\templates\\diagrams"),
    [string]$OutputDir = (Join-Path $PSScriptRoot "..\\..\\.tmp\\mermaid-template-renders")
)

$resolvedTemplateDir = Resolve-Path -LiteralPath $TemplateDir
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$templates = Get-ChildItem -LiteralPath $resolvedTemplateDir -Filter "*.mmd" | Sort-Object Name
$failures = @()

foreach ($template in $templates) {
    $output = Join-Path $OutputDir ($template.BaseName + ".svg")
    Write-Host "Rendering $($template.Name) -> $output"
    & mmdc -i $template.FullName -o $output
    if ($LASTEXITCODE -ne 0) {
        $failures += $template.Name
    }
}

if ($failures.Count -gt 0) {
    Write-Error ("Failed templates: " + ($failures -join ", "))
    exit 1
}

Write-Host "All templates rendered successfully."
