import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * GET /api/setup/ollama-script?os=windows|mac|linux
 * Dynamically generates a setup script that installs Ollama,
 * configures CORS for our domain, and creates our custom model.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const os = url.searchParams.get("os") || "windows";

  const origins = [APP_URL, "https://*.railway.app", "http://localhost:3000"]
    .filter((v, i, a) => a.indexOf(v) === i) // dedupe
    .join(",");

  const modelfile = getModelfileContent();

  if (os === "windows") {
    return new NextResponse(generateWindowsScript(origins, modelfile), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": "attachment; filename=setup-ideamanagement-ai.ps1",
      },
    });
  }

  return new NextResponse(generateUnixScript(origins, modelfile), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename=setup-ideamanagement-ai.sh`,
    },
  });
}

function getModelfileContent(): string {
  return `FROM qwen3:32b
SYSTEM """You are an AI assistant for the IDEA-MANAGEMENT application. You help users manage their projects, ideas, kanban boards, schemas, whiteboards, and directory trees. When users ask you to perform actions, use the available tools. Be concise, friendly, and conversational.

RULES:
1. Most messages are just conversation — respond naturally. ONLY use tools when the user EXPLICITLY asks to add, create, update, delete, or modify something.
2. When you DO use a tool, fill in all fields intelligently — generate relevant descriptions, tags, and categories.
3. Before deleting anything, ask for confirmation.

/no_think"""
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
PARAMETER num_predict -1
PARAMETER stop <|im_end|>`;
}

function generateWindowsScript(origins: string, modelfile: string): string {
  // Escape the modelfile for PowerShell heredoc
  const escapedModelfile = modelfile.replace(/"/g, '`"');

  return `# IDEA MANAGEMENT — Local AI Setup Script (Windows)
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
    $installerPath = "$env:TEMP\\OllamaSetup.exe"
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
[System.Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "${origins}", "User")
Write-Host "  OLLAMA_ORIGINS set to: ${origins}" -ForegroundColor Green

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
$modelfilePath = "$env:TEMP\\Modelfile.ideamanagement"
@"
${escapedModelfile}
"@ | Out-File -FilePath $modelfilePath -Encoding UTF8

ollama create ideamanagement -f $modelfilePath
Remove-Item $modelfilePath -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "  Return to the app and click Connect." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
`;
}

function generateUnixScript(origins: string, modelfile: string): string {
  return `#!/bin/bash
# IDEA MANAGEMENT — Local AI Setup Script (macOS/Linux)
# This script installs Ollama, configures CORS, and creates our custom AI model.

set -e

echo ""
echo "========================================"
echo "  IDEA MANAGEMENT — Local AI Setup"
echo "========================================"
echo ""

# Step 1: Check if Ollama is installed
echo "[1/5] Checking for Ollama..."
if ! command -v ollama &> /dev/null; then
    echo "  Ollama not found. Installing..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo "  Waiting for Ollama to start..."
    sleep 5
    echo "  Ollama installed!"
else
    echo "  Ollama already installed."
fi

# Step 2: Configure CORS
echo "[2/5] Configuring CORS origins..."
mkdir -p ~/.ollama
echo 'OLLAMA_ORIGINS="${origins}"' > ~/.ollama/env
echo "  OLLAMA_ORIGINS set to: ${origins}"

# Step 3: Restart Ollama
echo "[3/5] Restarting Ollama..."
if [[ "$(uname)" == "Darwin" ]]; then
    # macOS — restart via launchd
    launchctl stop com.ollama.ollama 2>/dev/null || true
    sleep 2
    launchctl start com.ollama.ollama 2>/dev/null || ollama serve &
else
    # Linux — restart via systemd
    sudo systemctl restart ollama 2>/dev/null || ollama serve &
fi
sleep 3

# Step 4: Pull base model
echo "[4/5] Pulling qwen3:32b model (~20GB download)..."
echo "  This may take a while depending on your internet speed."
ollama pull qwen3:32b

# Step 5: Create custom model
echo "[5/5] Creating ideamanagement:latest custom model..."
MODELFILE_PATH=$(mktemp)
cat > "$MODELFILE_PATH" << 'MODELFILE_EOF'
${modelfile}
MODELFILE_EOF

ollama create ideamanagement -f "$MODELFILE_PATH"
rm -f "$MODELFILE_PATH"

echo ""
echo "========================================"
echo "  Setup complete!"
echo "  Return to the app and click Connect."
echo "========================================"
echo ""
`;
}
