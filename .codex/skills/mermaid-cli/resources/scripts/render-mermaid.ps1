param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [string]$OutputPath,

    [string]$Theme = "default",

    [string]$ConfigPath,

    [string]$CssPath,

    [string]$PuppeteerConfigPath,

    [string]$BackgroundColor = "white"
)

$resolvedInput = Resolve-Path -LiteralPath $InputPath

if (-not $OutputPath) {
    $OutputPath = [System.IO.Path]::ChangeExtension($resolvedInput, ".svg")
}

$args = @(
    "-i", $resolvedInput,
    "-o", $OutputPath,
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

& mmdc @args
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
