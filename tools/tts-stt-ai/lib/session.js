// Shared session helpers for OpenCode TUI plugin.

import { isBreakerOpen } from "./llm-client.js";

/**
 * Get the title of a specific session by ID. Returns "" if unknown or on error.
 */
export async function getSessionTitle(client, sessionID) {
  if (!sessionID) return "";
  try {
    const result = await client.session.list();
    const session = result.data?.find((s) => s.id === sessionID);
    return session?.title || "";
  } catch {
    return "";
  }
}

/**
 * Get the title of the most recently updated session. Returns "" on error or
 * when there are no sessions.
 */
export async function getActiveSessionTitle(client) {
  try {
    const result = await client.session.list();
    if (!result.data || result.data.length === 0) return "";
    const active = result.data.sort((a, b) => b.time.updated - a.time.updated)[0];
    return active?.title || "";
  } catch {
    return "";
  }
}

/**
 * Call `complete` with automatic retries for transient failures (429/5xx/network).
 * Returns the same shape as `complete` ({ text } or { error }).
 */
export async function completeWithRetry(complete, { system, prompt, config }, logger, label, attempts = 3) {
  let lastError = null;
  for (let i = 1; i <= attempts; i++) {
    if (isBreakerOpen()) {
      logger?.log?.(label, "Circuito LLM abierto — saltando intento", "debug");
      return { error: "LLM degradado por cuota — usando procesamiento local" };
    }
    const result = await complete({ system, prompt, config });
    if (!result.error) return result;
    lastError = result.error;
    logger?.log?.(label, `LLM attempt ${i}/${attempts} failed: ${result.error}`, "warn");
    if (i < attempts) {
      const waitMs = 1500 * i;
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  return { error: lastError };
}
