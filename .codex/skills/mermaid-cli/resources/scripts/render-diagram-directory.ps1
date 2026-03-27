param(
    [Parameter(Mandatory = $true)]
    [string]$InputDir,

    [string]$OutputDir,

    [string]$Format = "svg",

    [string]$Theme = "default",

    [string]$ConfigPath,

    [string]$CssPath,

    [string]$PuppeteerConfigPath,

    [string]$BackgroundColor = "white",

    [switch]$Recurse
)

$resolvedInputDir = Resolve-Path -LiteralPath $InputDir

if (-not $OutputDir) {
    $OutputDir = Join-Path $resolvedInputDir "rendered-$Format"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$files = Get-ChildItem -LiteralPath $resolvedInputDir -Filter "*.mmd" -File -Recurse:$Recurse | Sort-Object FullName

foreach ($file in $files) {
    $outFile = Join-Path $OutputDir ($file.BaseName + "." + $Format)
    $args = @(
        "-i", $file.FullName,
        "-o", $outFile,
        "-t", $Theme,
        "-b", $BackgroundColor
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

    Write-Host "Rendering $($file.Name) -> $outFile"
    & mmdc @args
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
