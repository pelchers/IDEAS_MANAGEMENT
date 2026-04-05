# IDEA MANAGEMENT — Local AI Setup Script (Windows)
# This script installs Ollama, configures CORS, and creates our custom AI model.
# Run in PowerShell as Administrator.

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IDEA MANAGEMENT — Local AI Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Ollama is installed
Write-Host "[1/5] Checking for Ollama..." -ForegroundColor Yellow
$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollamaPath) {
    Write-Host "  Ollama not found. Downloading installer..." -ForegroundColor Yellow
    $installerUrl = "https://ollama.com/download/OllamaSetup.exe"
    $installerPath = "$env:TEMP\OllamaSetup.exe"
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
    Write-Host "  Running installer (you may see a UAC prompt)..." -ForegroundColor Yellow
    Start-Process -FilePath $installerPath -Wait
    Write-Host "  Waiting for Ollama service to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5

    # Wait for Ollama to be reachable
    $maxWait = 30
    $waited = 0
    while ($waited -lt $maxWait) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2
            if ($response.StatusCode -eq 200) { break }
        } catch {}
        Start-Sleep -Seconds 2
        $waited += 2
    }
    if ($waited -ge $maxWait) {
        Write-Host "  ERROR: Ollama did not start. Please start it manually and re-run." -ForegroundColor Red
        exit 1
    }
    Write-Host "  Ollama installed and running!" -ForegroundColor Green
} else {
    Write-Host "  Ollama already installed." -ForegroundColor Green
}

# Step 2: Configure CORS
Write-Host "[2/5] Configuring CORS origins..." -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "http://localhost:3000,https://*.railway.app", "User")
Write-Host "  OLLAMA_ORIGINS set to: http://localhost:3000,https://*.railway.app" -ForegroundColor Green

# Step 3: Restart Ollama to pick up new CORS
Write-Host "[3/5] Restarting Ollama service..." -ForegroundColor Yellow
Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
# Ollama auto-restarts as a service. If not, start it:
Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Step 4: Pull base model
Write-Host "[4/5] Pulling qwen3:32b model (~20GB download)..." -ForegroundColor Yellow
Write-Host "  This may take a while depending on your internet speed." -ForegroundColor Gray
ollama pull qwen3:32b

# Step 5: Create custom model
Write-Host "[5/5] Creating ideamanagement:latest custom model..." -ForegroundColor Yellow
$modelfilePath = "$env:TEMP\Modelfile.ideamanagement"
@"
FROM qwen3:32b
SYSTEM `"`"`"You are an AI assistant for the IDEA-MANAGEMENT application. You help users manage their projects, ideas, kanban boards, schemas, whiteboards, and directory trees. When users ask you to perform actions, use the available tools. Be concise, friendly, and conversational.

RULES:
1. Most messages are just conversation — respond naturally. ONLY use tools when the user EXPLICITLY asks to add, create, update, delete, or modify something.
2. When you DO use a tool, fill in all fields intelligently — generate relevant descriptions, tags, and categories.
3. Before deleting anything, ask for confirmation.

/no_think`"`"`"
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
PARAMETER num_predict -1
PARAMETER stop <|im_end|>
"@ | Out-File -FilePath $modelfilePath -Encoding UTF8

ollama create ideamanagement -f $modelfilePath
Remove-Item $modelfilePath -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "  Return to the app and click Connect." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
