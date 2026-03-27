param(
    [Parameter(Mandatory = $true)]
    [string]$InputDir,

    [switch]$Recurse,

    [string]$ConfigPath,

    [string]$CssPath,

    [string]$PuppeteerConfigPath
)

$resolvedInputDir = Resolve-Path -LiteralPath $InputDir
$files = Get-ChildItem -LiteralPath $resolvedInputDir -Filter "*.md" -File -Recurse:$Recurse |
    Where-Object { $_.Name -notlike "*.rendered.md" } |
    Sort-Object FullName

foreach ($file in $files) {
    $outputPath = Join-Path $file.DirectoryName ($file.BaseName + ".rendered.md")
    $artefactsPath = Join-Path $file.DirectoryName ($file.BaseName + ".artefacts")

    $args = @(
        "-i", $file.FullName,
        "-o", $outputPath,
        "-a", $artefactsPath
    )

    if ($ConfigPath) {
        $args += @("-c", (Resolve-Path -LiteralPath $ConfigPath))
    }

    if ($CssPath) {
        $args += @("-C", (Resolve-Path -LiteralPath $CssPath))
    }

    if ($PuppeteerConfigPath) {
        $args += @("-p", (Resolve-Path -LiteralPath $PuppeteerConfigPath))
    }

    Write-Host "Rendering $($file.Name) -> $outputPath"
    & mmdc @args
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
