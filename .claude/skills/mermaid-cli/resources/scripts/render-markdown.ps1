param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [string]$OutputPath,

    [string]$ArtefactsPath,

    [string]$ConfigPath,

    [string]$CssPath,

    [string]$PuppeteerConfigPath
)

$resolvedInput = Resolve-Path -LiteralPath $InputPath

if (-not $OutputPath) {
    $dir = Split-Path -Parent $resolvedInput
    $base = [System.IO.Path]::GetFileNameWithoutExtension($resolvedInput)
    $OutputPath = Join-Path $dir "$base.rendered.md"
}

$args = @(
    "-i", $resolvedInput,
    "-o", $OutputPath
)

if ($ArtefactsPath) {
    $args += @("-a", $ArtefactsPath)
}

if ($ConfigPath) {
    $args += @("-c", (Resolve-Path -LiteralPath $ConfigPath))
}

if ($CssPath) {
    $args += @("-C", (Resolve-Path -LiteralPath $CssPath))
}

if ($PuppeteerConfigPath) {
    $args += @("-p", (Resolve-Path -LiteralPath $PuppeteerConfigPath))
}

& mmdc @args
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
