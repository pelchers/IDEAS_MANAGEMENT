param(
    [Parameter(Mandatory = $true)]
    [string]$TemplateName,

    [Parameter(Mandatory = $true)]
    [string]$DestinationPath,

    [switch]$Force
)

$templateDir = Join-Path $PSScriptRoot "..\\templates\\diagrams"
$templateFile = Join-Path $templateDir ($TemplateName + ".mmd")

if (-not (Test-Path -LiteralPath $templateFile)) {
    throw "Template not found: $templateFile"
}

if ((Test-Path -LiteralPath $DestinationPath) -and -not $Force) {
    throw "Destination already exists. Use -Force to overwrite: $DestinationPath"
}

$destinationDir = Split-Path -Parent $DestinationPath
if ($destinationDir) {
    New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null
}

Copy-Item -LiteralPath $templateFile -Destination $DestinationPath -Force:$Force
Write-Host "Copied template $TemplateName to $DestinationPath"
