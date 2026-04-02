"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  detectOllama,
  pullModel,
  createCustomModel,
  getModelfileContent,
  detectOS,
  getOllamaDownloadUrl,
  getSetupScriptUrl,
  type OllamaStatus,
} from "@/lib/ollama-client";

type SetupStep = "checking" | "not_installed" | "installing" | "pulling" | "creating" | "ready" | "error";

interface OllamaSetupModalProps {
  open: boolean;
  onClose: () => void;
  onConnected: (status: OllamaStatus) => void;
}

const SYSTEM_PROMPT_FOR_MODELFILE = `You are an AI assistant for the IDEA-MANAGEMENT application. You help users manage their projects, ideas, kanban boards, schemas, whiteboards, and directory trees. When users ask you to perform actions, use the available tools. Be concise, friendly, and conversational.

RULES:
1. Most messages are just conversation — respond naturally. ONLY use tools when the user EXPLICITLY asks to add, create, update, delete, or modify something.
2. When you DO use a tool, fill in all fields intelligently — generate relevant descriptions, tags, and categories.
3. Before deleting anything, ask for confirmation.`;

export function OllamaSetupModal({ open, onClose, onConnected }: OllamaSetupModalProps) {
  const [step, setStep] = useState<SetupStep>("checking");
  const [progress, setProgress] = useState({ status: "", completed: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const os = typeof window !== "undefined" ? detectOS() : "windows";

  // Check Ollama status on open
  useEffect(() => {
    if (!open) return;
    setStep("checking");
    setErrorMsg("");

    detectOllama().then((status) => {
      if (status.running && status.hasCustomModel) {
        setStep("ready");
        onConnected(status);
      } else if (status.running && status.hasBaseModel) {
        // Has base model, just need to create custom model
        setStep("creating");
        createCustomModelFromBase().then((ok) => {
          if (ok) {
            detectOllama().then((s) => { setStep("ready"); onConnected(s); });
          } else {
            setStep("error");
            setErrorMsg("Failed to create custom model. Try running: ollama create ideamanagement -f Modelfile");
          }
        });
      } else if (status.running) {
        // Running but no model — need to pull
        setStep("pulling");
        pullAndCreate();
      } else {
        setStep("not_installed");
      }
    });

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open]);

  const createCustomModelFromBase = useCallback(async () => {
    const modelfile = getModelfileContent(SYSTEM_PROMPT_FOR_MODELFILE);
    return createCustomModel(modelfile);
  }, []);

  const pullAndCreate = useCallback(async () => {
    setStep("pulling");
    const ok = await pullModel("qwen3:32b", (status, completed, total) => {
      setProgress({ status, completed, total });
    });
    if (!ok) {
      setStep("error");
      setErrorMsg("Failed to pull qwen3:32b model. Check your internet connection and try again.");
      return;
    }

    setStep("creating");
    const created = await createCustomModelFromBase();
    if (created) {
      const status = await detectOllama();
      setStep("ready");
      onConnected(status);
    } else {
      setStep("error");
      setErrorMsg("Failed to create custom model.");
    }
  }, [createCustomModelFromBase, onConnected]);

  // Poll for Ollama after user clicks download
  const startPolling = useCallback(() => {
    setStep("installing");
    pollRef.current = setInterval(async () => {
      const status = await detectOllama();
      if (status.running) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;

        if (status.hasCustomModel) {
          setStep("ready");
          onConnected(status);
        } else if (status.hasBaseModel) {
          setStep("creating");
          const ok = await createCustomModelFromBase();
          if (ok) {
            const s = await detectOllama();
            setStep("ready");
            onConnected(s);
          }
        } else {
          setStep("pulling");
          pullAndCreate();
        }
      }
    }, 2000);
  }, [onConnected, createCustomModelFromBase, pullAndCreate]);

  if (!open) return null;

  const progressPct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-signal-black/50" onClick={onClose}>
      <div
        className="bg-creamy-milk border-4 border-signal-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-8 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="font-bold text-[1.2rem] uppercase tracking-wider">ENABLE LOCAL AI</h2>
          <button onClick={onClose} className="font-bold text-xl hover:text-watermelon">X</button>
        </div>

        {/* Step: Checking */}
        {step === "checking" && (
          <div className="text-center py-8">
            <div className="animate-pulse font-mono text-gray-mid">Checking for Ollama...</div>
          </div>
        )}

        {/* Step: Not Installed */}
        {step === "not_installed" && (
          <div>
            <p className="font-mono text-[0.85rem] text-gray-mid mb-4 leading-relaxed">
              Ollama is not detected on your machine. It&apos;s a free, open-source tool that runs AI models locally on your GPU.
            </p>

            <div className="mb-4 p-3 border-2 border-dashed border-cornflower bg-cornflower/10 font-mono text-[0.75rem]">
              <strong>Requirements:</strong> GPU with 20+ GB VRAM (RTX 3090/4090, etc.) and ~22 GB disk space.
            </div>

            {/* Option A: Setup Script (recommended) */}
            <div className="mb-4">
              <h3 className="font-bold text-[0.85rem] uppercase tracking-wider mb-2 text-malachite">OPTION 1: RUN SETUP SCRIPT (RECOMMENDED)</h3>
              <p className="font-mono text-[0.7rem] text-gray-mid mb-2">
                Downloads and runs a script that installs Ollama, configures CORS for our app, and creates the AI model.
                {os === "windows" ? " (PowerShell)" : " (Bash)"}
              </p>
              <a
                href={getSetupScriptUrl()}
                download
                className="nb-btn nb-btn--primary inline-block text-center"
                onClick={() => startPolling()}
              >
                DOWNLOAD SETUP SCRIPT
              </a>
              {os === "windows" && (
                <p className="font-mono text-[0.65rem] text-gray-mid mt-2">
                  After download: Right-click the .ps1 file &rarr; &quot;Run with PowerShell&quot;
                </p>
              )}
              {os !== "windows" && (
                <p className="font-mono text-[0.65rem] text-gray-mid mt-2">
                  After download: <code className="bg-white px-1">chmod +x setup-*.sh && ./setup-*.sh</code>
                </p>
              )}
            </div>

            {/* Option B: Manual */}
            <div className="border-t-2 border-signal-black/10 pt-4">
              <h3 className="font-bold text-[0.85rem] uppercase tracking-wider mb-2">OPTION 2: INSTALL MANUALLY</h3>
              <ol className="font-mono text-[0.75rem] text-gray-mid list-decimal list-inside space-y-1 mb-3">
                <li>Download Ollama from <a href={getOllamaDownloadUrl()} target="_blank" rel="noopener" className="underline font-bold text-cornflower">ollama.com</a></li>
                <li>Install and wait for it to start</li>
                <li>Come back here and click &quot;Retry&quot;</li>
              </ol>
              <button
                className="nb-btn"
                onClick={() => {
                  window.open(getOllamaDownloadUrl(), "_blank");
                  startPolling();
                }}
              >
                DOWNLOAD OLLAMA
              </button>
            </div>
          </div>
        )}

        {/* Step: Installing (polling) */}
        {step === "installing" && (
          <div className="text-center py-8">
            <div className="animate-pulse font-mono text-cornflower mb-2">Waiting for Ollama to start...</div>
            <p className="font-mono text-[0.75rem] text-gray-mid">
              Install Ollama, then this will auto-detect it.
            </p>
            <button className="nb-btn mt-4" onClick={() => { if (pollRef.current) clearInterval(pollRef.current); setStep("not_installed"); }}>
              CANCEL
            </button>
          </div>
        )}

        {/* Step: Pulling model */}
        {step === "pulling" && (
          <div className="py-4">
            <div className="font-mono text-[0.85rem] mb-3">Downloading AI model (~20 GB)...</div>
            <div className="w-full h-6 border-2 border-signal-black bg-white relative overflow-hidden">
              <div
                className="h-full bg-malachite transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[0.7rem] font-bold">
                {progressPct > 0 ? `${progressPct}%` : progress.status || "Starting..."}
              </span>
            </div>
            <p className="font-mono text-[0.65rem] text-gray-mid mt-2">
              {progress.total > 0
                ? `${(progress.completed / 1e9).toFixed(1)} / ${(progress.total / 1e9).toFixed(1)} GB`
                : "Preparing download..."}
            </p>
          </div>
        )}

        {/* Step: Creating custom model */}
        {step === "creating" && (
          <div className="text-center py-8">
            <div className="animate-pulse font-mono text-cornflower">Creating custom AI model...</div>
            <p className="font-mono text-[0.65rem] text-gray-mid mt-2">
              Configuring ideamanagement:latest with optimized settings.
            </p>
          </div>
        )}

        {/* Step: Ready */}
        {step === "ready" && (
          <div className="text-center py-6">
            <div className="text-[2rem] mb-2">&#9989;</div>
            <div className="font-bold text-[1rem] uppercase tracking-wider text-malachite mb-2">LOCAL AI READY</div>
            <p className="font-mono text-[0.8rem] text-gray-mid mb-4">
              Connected to your local Ollama. AI inference runs on your GPU — free and private.
            </p>
            <button className="nb-btn nb-btn--primary" onClick={onClose}>
              START CHATTING
            </button>
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="py-4">
            <div className="p-3 border-2 border-watermelon bg-watermelon/10 font-mono text-[0.8rem] text-watermelon mb-4">
              {errorMsg}
            </div>
            <div className="flex gap-2">
              <button className="nb-btn" onClick={() => { setStep("checking"); detectOllama().then((s) => { if (s.running) pullAndCreate(); else setStep("not_installed"); }); }}>
                RETRY
              </button>
              <button className="nb-btn" onClick={onClose}>
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
