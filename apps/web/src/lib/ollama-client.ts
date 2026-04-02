/**
 * Browser-side Ollama client.
 * Detects, configures, and communicates with a user's local Ollama instance.
 * All functions run in the browser — no server involvement for detection/setup.
 */

const OLLAMA_BASE = "http://localhost:11434";
const CUSTOM_MODEL = "ideamanagement:latest";
const BASE_MODEL = "qwen3:32b";

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaStatus {
  running: boolean;
  hasCustomModel: boolean;
  hasBaseModel: boolean;
  models: OllamaModel[];
}

/**
 * Detect if Ollama is running and what models are available.
 */
export async function detectOllama(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { running: false, hasCustomModel: false, hasBaseModel: false, models: [] };

    const data = await res.json();
    const models: OllamaModel[] = (data.models || []).map((m: Record<string, unknown>) => ({
      name: String(m.name || ""),
      size: Number(m.size || 0),
      digest: String(m.digest || ""),
      modified_at: String(m.modified_at || ""),
    }));

    return {
      running: true,
      hasCustomModel: models.some((m) => m.name.startsWith("ideamanagement")),
      hasBaseModel: models.some((m) => m.name.startsWith("qwen3:32b") || m.name === "qwen3:32b"),
      models,
    };
  } catch {
    return { running: false, hasCustomModel: false, hasBaseModel: false, models: [] };
  }
}

/**
 * Pull a model via Ollama API. Streams progress updates.
 */
export async function pullModel(
  modelName: string,
  onProgress?: (status: string, completed: number, total: number) => void,
): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName, stream: true }),
    });

    if (!res.ok || !res.body) return false;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      for (const line of text.split("\n")) {
        if (!line.trim()) continue;
        try {
          const evt = JSON.parse(line);
          onProgress?.(
            evt.status || "downloading",
            evt.completed || 0,
            evt.total || 0,
          );
        } catch { /* skip malformed lines */ }
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Create a custom model from a Modelfile string via Ollama API.
 */
export async function createCustomModel(modelfileContent: string): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: CUSTOM_MODEL,
        modelfile: modelfileContent,
        stream: false,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get the Modelfile content for our preconfigured model.
 */
export function getModelfileContent(systemPrompt: string): string {
  return `FROM ${BASE_MODEL}

SYSTEM """${systemPrompt}

/no_think"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
PARAMETER num_predict -1
PARAMETER stop <|im_end|>`;
}

/**
 * Get the digest hash of a model for version checking.
 */
export async function getModelDigest(modelName: string): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/show`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.digest || null;
  } catch {
    return null;
  }
}

/**
 * Detect the user's operating system for setup script download.
 */
export function detectOS(): "windows" | "mac" | "linux" {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  return "linux";
}

/**
 * Get the Ollama download URL for the detected OS.
 */
export function getOllamaDownloadUrl(): string {
  const os = detectOS();
  switch (os) {
    case "windows": return "https://ollama.com/download/OllamaSetup.exe";
    case "mac": return "https://ollama.com/download/Ollama-darwin.zip";
    default: return "https://ollama.com/download/ollama-linux-amd64";
  }
}

/**
 * Get the URL for our preconfigured setup script.
 */
export function getSetupScriptUrl(): string {
  const os = detectOS();
  return `/api/setup/ollama-script?os=${os}`;
}

/**
 * Get the resolved model name — custom if available, base as fallback.
 */
export function getOllamaModelName(hasCustomModel: boolean): string {
  return hasCustomModel ? CUSTOM_MODEL : BASE_MODEL;
}

export { OLLAMA_BASE, CUSTOM_MODEL, BASE_MODEL };
