// OpenAI-compatible LLM client for text normalization.
//
// Works with any OpenAI-compatible endpoint:
//   - Anthropic's OpenAI compatibility layer
//   - OpenAI directly
//   - Ollama, vLLM, LM Studio, etc.
//
// Configuration is passed from plugin options (tui.json):
//   ["@renjfk/opencode-voice", {
//     "endpoint": "https://api.anthropic.com/v1",
//     "model": "claude-haiku-4-5",
//     "apiKeyEnv": "ANTHROPIC_API_KEY",
//     "maxTokens": 2048,
//     "reasoningEffort": "low",
//     "chatTemplateKwargs": {"enable_thinking": false},
//     "retries": 2
//   }]

const DEFAULTS = {
  maxTokens: 2048,
  reasoningEffort: null,
  chatTemplateKwargs: null,
  retries: 2,
};

// Circuit breaker: cuánto tiempo (ms) nos quedamos sin llamar a la API tras
// errores de cuota/persistentes (429/401/403/400). TTS/STT caen a fallback local.
const BREAKER_TRIPS = new Set([400, 401, 403, 429]);
const DEGRADE_MS = 30 * 60 * 1000;

let breakerUntil = 0;

export function resetBreaker() {
  breakerUntil = 0;
}

export function isBreakerOpen() {
  return Date.now() < breakerUntil;
}

function normalizeRetries(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return DEFAULTS.retries;
  return Math.floor(parsed);
}

function normalizeChatTemplateKwargs(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function shouldRetry(status) {
  return status === 408 || status === 429 || status >= 500;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fallback al vault del repo (.env.local / services/supabase/.env) porque el
// server de opencode no expone esas variables en su entorno.
const REPO_ROOT = new URL("../../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
import fs from "node:fs";
import path from "node:path";
function readRepoEnv() {
  const vars = {};
  const files = [path.join(REPO_ROOT, ".env.local"), path.join(REPO_ROOT, "services", "supabase", ".env")];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
      const idx = line.indexOf("=");
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!(key in vars)) vars[key] = value;
    }
  }
  return vars;
}
const REPO_ENV = readRepoEnv();

/**
 * Create an LLM completion function.
 *
 * @param {object} [pluginOptions] - Static config from tui.json plugin options
 * @param {{ log?: (scope: string, message: string, level?: string) => void }} [logger]
 * @returns {{ complete: (opts: { system?: string, prompt: string, config?: object }) => Promise<{ text: string | null, error?: string }> }}
 */
export function createClient(pluginOptions, logger) {
  function getConfig() {
    return {
      endpoint: pluginOptions?.endpoint,
      model: pluginOptions?.model,
      apiKeyEnv: pluginOptions?.apiKeyEnv,
      maxTokens: pluginOptions?.maxTokens ?? DEFAULTS.maxTokens,
      reasoningEffort: pluginOptions?.reasoningEffort ?? DEFAULTS.reasoningEffort,
      chatTemplateKwargs: normalizeChatTemplateKwargs(
        pluginOptions?.chatTemplateKwargs ?? DEFAULTS.chatTemplateKwargs,
      ),
      retries: normalizeRetries(pluginOptions?.retries ?? DEFAULTS.retries),
    };
  }

  /**
   * Send a chat completion request to an OpenAI-compatible endpoint.
   *
   * @param {object} opts
   * @param {string} [opts.system]  - System prompt
   * @param {string} opts.prompt    - User message
   * @param {object} [opts.config]  - Per-call overrides (e.g. { maxTokens: 4096 })
   * @returns {Promise<{ text: string | null, error?: string }>}
   */
  async function complete({ system, prompt, config: overrides }) {
    const cfg = { ...getConfig(), ...overrides };
    if (!cfg.endpoint) {
      logger?.log?.("LLM", "completion skipped: endpoint not configured", "warn");
      return { text: null, error: "LLM endpoint not configured" };
    }
    if (!cfg.model) {
      logger?.log?.("LLM", "completion skipped: model not configured", "warn");
      return { text: null, error: "LLM model not configured" };
    }

    // Circuit breaker: si la API responde con cuota/errores persistentes,
    // degradamos durante DEGRADE_MS y usamos el fallback local (TTS/STT) sin
    // volver a golpear la API en cada llamada.
    const now = Date.now();
    if (now < breakerUntil) {
      logger?.log?.("LLM", `Circuito abierto (${Math.ceil((breakerUntil - now) / 1000)}s restantes), usando fallback local`, "debug");
      return { text: null, error: "LLM degradado por cuota — usando procesamiento local" };
    }

    const apiKey = cfg.apiKeyEnv ? process.env[cfg.apiKeyEnv] || REPO_ENV[cfg.apiKeyEnv] : null;

    const endpoint = cfg.endpoint.replace(/\/+$/, "") + "/chat/completions";

    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    const body = {
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      messages,
    };
    if (cfg.reasoningEffort) body.reasoning_effort = cfg.reasoningEffort;
    if (cfg.chatTemplateKwargs) body.chat_template_kwargs = cfg.chatTemplateKwargs;

    for (let attempt = 0; attempt <= cfg.retries; attempt++) {
      if (Date.now() < breakerUntil) {
        logger?.log?.("LLM", "Circuito abierto durante reintentos — abortando", "debug");
        return { text: null, error: "LLM degradado por cuota — usando procesamiento local" };
      }
      try {
        logger?.log?.(
          "LLM",
          `Completion request attempt=${attempt + 1} model=${cfg.model} maxTokens=${cfg.maxTokens} promptChars=${prompt.length}`,
          "debug",
        );
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: "Bearer " + apiKey } : {}),
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          let detail = "";
          try {
            detail = await response.text();
          } catch {}
          const short = detail.slice(0, 400);
          logger?.log?.(
            "LLM",
            `Completion response status=${response.status} body=${short}`,
            shouldRetry(response.status) ? "warn" : "error",
          );
          if (BREAKER_TRIPS.has(response.status)) {
            breakerUntil = Date.now() + DEGRADE_MS;
            logger?.log?.("LLM", `Circuito abierto ${DEGRADE_MS / 60000}min por status=${response.status}`, "warn");
          }
          if (attempt < cfg.retries && shouldRetry(response.status)) {
            await wait(250 * 2 ** attempt);
            continue;
          }
          return {
            text: null,
            error: `LLM request failed (${response.status}) ${short}`,
          };
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content || null;
        if (text) {
          logger?.log?.("LLM", `Completion succeeded chars=${text.length}`, "debug");
          return { text };
        }

        logger?.log?.("LLM", "Completion returned empty content", "warn");

        if (attempt < cfg.retries) {
          await wait(250 * 2 ** attempt);
          continue;
        }
        return { text: null, error: "Empty LLM response" };
      } catch (err) {
        logger?.log?.("LLM", `Completion error attempt=${attempt + 1}: ${err.message}`, "warn");
        if (attempt < cfg.retries) {
          await wait(250 * 2 ** attempt);
          continue;
        }
        return { text: null, error: `LLM error: ${err.message}` };
      }
    }

    return { text: null, error: "LLM request failed after retries" };
  }

  return { complete };
}
