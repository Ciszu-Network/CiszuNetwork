// Speech-to-text: sox recording, whisper-cpp or API transcription, LLM normalization.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawn, execSync } from "node:child_process";
import { getActiveSessionTitle, completeWithRetry } from "./session.js";
import { isBlockedCall, blockedRefusalText } from "./policy.js";

const VOICE_BASE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

let sttApiEndpoint = null;
let sttApiModel = null;
let sttApiKeyEnv = null;

const DEVICE_CACHE_TTL = 30000;
let deviceCache = { at: 0, devices: null };

const WAV_FILE =
  process.platform === "win32"
    ? path.join(VOICE_BASE, "tmp", "opencode-stt.wav")
    : "/tmp/opencode-stt.wav";

const MODELS_DIRS =
  process.platform === "win32"
    ? [path.join(VOICE_BASE, "runtime", "models"), path.join(os.homedir(), ".local", "share", "whisper-cpp")]
    : [
        path.join(os.homedir(), ".local", "share", "whisper-cpp"),
        "/opt/homebrew/share/whisper-cpp/models",
        "/usr/local/share/whisper-cpp/models",
      ];

const MODELS = {
  "large-v3-turbo-q5_0": {
    label: "Large v3 Turbo Q5 (recommended)",
    file: "ggml-large-v3-turbo-q5_0.bin",
  },
  "large-v3-turbo-q8_0": { label: "Large v3 Turbo Q8", file: "ggml-large-v3-turbo-q8_0.bin" },
  "large-v3-turbo": { label: "Large v3 Turbo (full)", file: "ggml-large-v3-turbo.bin" },
  "small.en": { label: "Small English", file: "ggml-small.en.bin" },
  small: { label: "Small Multilingual", file: "ggml-small.bin" },
  "base.en": { label: "Base English", file: "ggml-base.en.bin" },
  base: { label: "Base Multilingual", file: "ggml-base.bin" },
  "tiny.en": { label: "Tiny English (fastest)", file: "ggml-tiny.en.bin" },
  tiny: { label: "Tiny Multilingual (fastest)", file: "ggml-tiny.bin" },
};
const DEFAULT_MODEL = "large-v3-turbo-q5_0";

export function isOpenRouterEndpoint(endpoint) {
  // Sin regex sobre input no controlado (evita ReDoS): parsear la URL y
  // comparar el hostname.
  if (!endpoint) return false;
  const candidate = String(endpoint).trim();
  const withScheme = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  try {
    const url = new URL(withScheme);
    const host = url.hostname.toLowerCase();
    return host === "openrouter.ai" || host.endsWith(".openrouter.ai");
  } catch {
    return false;
  }
}

function buildMultipartTranscriptionRequest(model, audioBuffer, apiKey) {
  const blob = new Blob([audioBuffer], { type: "audio/wav" });
  const form = new FormData();
  form.append("file", blob, "audio.wav");
  form.append("model", model);
  form.append("response_format", "json");

  const headers = {};
  if (apiKey) headers["Authorization"] = "Bearer " + apiKey;

  return {
    headers,
    body: form,
  };
}

export function buildOpenRouterTranscriptionRequest(model, audioBuffer, apiKey) {
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = "Bearer " + apiKey;

  const payload = {
    model,
    input_audio: {
      data: audioBuffer.toString("base64"),
      format: "wav",
    },
  };

  return {
    headers,
    body: JSON.stringify(payload),
  };
}

function getModelsDir() {
  for (const dir of MODELS_DIRS) {
    if (fs.existsSync(dir)) return dir;
  }
  return MODELS_DIRS[0];
}

function listInputDevices() {
  if (process.platform !== "win32") {
    try {
      const json = execSync("system_profiler SPAudioDataType -json 2>/dev/null", {
        encoding: "utf-8",
        timeout: 5000,
      });
      const data = JSON.parse(json);
      return (data.SPAudioDataType?.[0]?._items || [])
        .filter((d) => d.coreaudio_input_source != null)
        .map((d) => d.coreaudio_device_name || d._name);
    } catch {
      return [];
    }
  }

  const now = Date.now();
  if (deviceCache.devices && now - deviceCache.at < DEVICE_CACHE_TTL) {
    return deviceCache.devices;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const out = execSync("ffmpeg -hide_banner -list_devices true -f dshow -i dummy 2>&1", {
        encoding: "utf-8",
        timeout: 10000,
      });
      const devices = [];
      for (const m of out.matchAll(/"([^"]+)"\s+\(audio\)/g)) devices.push(m[1]);
      if (devices.length > 0) {
        deviceCache = { at: Date.now(), devices };
        return devices;
      }
      if (attempt < 3) {
        execSync("powershell -NoProfile -Command \"Start-Sleep -Milliseconds 500\"", {
          stdio: "ignore",
          timeout: 3000,
        });
      }
    } catch {
      if (attempt < 3) {
        execSync("powershell -NoProfile -Command \"Start-Sleep -Milliseconds 500\"", {
          stdio: "ignore",
          timeout: 3000,
        });
      }
    }
  }
  return [];
}

// ---- Recording state and control ----

let soxProc = null;
let soxStderr = "";
let recording = false;
let processing = false;

function forceKillSox(logger) {
  if (soxProc) {
    try {
      process.kill(soxProc.pid, "SIGKILL");
      logger?.log("STT", `Killed sox pid=${soxProc.pid}`, "debug");
    } catch {}
    soxProc = null;
  }
  if (process.platform !== "win32") {
    try {
      execSync("pkill -9 -f 'sox.*opencode-stt'", { stdio: "ignore" });
    } catch {}
  }
}

function startRecording(kv, toast, logger) {
  if (soxProc) {
    logger?.log("STT", "Start recording skipped: sox already running", "debug");
    return;
  }

  forceKillSox(logger);
  try {
    fs.unlinkSync(WAV_FILE);
  } catch {}

  soxStderr = "";
  const mic = kv.get("stt.mic", "") || null;
  logger?.log("STT", `Starting recording mic=${mic || "system default"}`, "debug");

  if (process.platform === "win32") {
    const device = mic || listInputDevices()[0] || "";
    if (!device) {
      logger?.log("STT", "No microphone found", "error");
      recording = false;
      toast("No microphone found", "error");
      return;
    }
    if (!mic) {
      try {
        kv.set("stt.mic", device);
        logger?.log("STT", `Saved default mic to kv: ${device}`, "debug");
      } catch {}
    }
    soxProc = spawn(
      "ffmpeg",
      [
        "-y", "-hide_banner", "-loglevel", "error",
        "-f", "dshow",
        "-i", `audio=${device}`,
        "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le",
        "-af", "silenceremove=stop_periods=-1:stop_duration=0.8:stop_threshold=-35dB",
        WAV_FILE,
      ],
      { stdio: ["pipe", "ignore", "pipe"] },
    );
    soxProc.stdin.on("error", () => {});
  } else {
    const inputArgs = mic ? ["-t", "coreaudio", mic] : ["-d"];
    soxProc = spawn(
      "sox",
      [...inputArgs, "-r", "16000", "-c", "1", "-b", "16", WAV_FILE, "silence", "1", "0.1", "1%"],
      {
        stdio: ["ignore", "ignore", "pipe"],
        detached: false,
      },
    );
  }

  soxProc.stderr.on("data", (chunk) => {
    soxStderr += chunk.toString();
  });

  soxProc.on("error", (err) => {
    soxProc = null;
    logger?.log("STT", `Recording failed: ${err.message}`, "error");
    if (recording) {
      recording = false;
      toast(`Recording failed: ${err.message}`, "error");
    }
  });

  soxProc.on("exit", (code) => {
    soxProc = null;
    logger?.log(
      "STT",
      `sox exited code=${code} stderr=${soxStderr.trim()}`,
      code === 0 || code === null ? "debug" : "warn",
    );
    if (recording && code !== 0 && code !== null && !processing) {
      recording = false;
      const errLine = soxStderr.trim().split("\n").pop();
      toast(`Recording error: ${errLine || `sox exited (code=${code})`}`, "error");
    }
  });

  recording = true;
}

function stopRecording(logger) {
  logger?.log("STT", "Stopping recording", "debug");
  if (!soxProc) return;
  if (process.platform === "win32" && soxProc.stdin && !soxProc.stdin.destroyed) {
    try {
      soxProc.stdin.write("q");
      soxProc.stdin.end();
    } catch {
      try {
        soxProc.kill("SIGKILL");
      } catch {}
    }
  } else {
    try {
      soxProc.kill("SIGINT");
    } catch {
      try {
        soxProc.kill("SIGKILL");
      } catch {}
    }
  }
}

async function waitForSoxExit(logger, timeoutMs = 2000) {
  const start = Date.now();
  while (soxProc && Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 100));
  }
  if (soxProc) {
    logger?.log("STT", "sox did not stop before timeout", "warn");
    forceKillSox(logger);
  }
}

function getModelName(kv) {
  const model = kv.get("stt.model", DEFAULT_MODEL);
  return MODELS[model] ? model : DEFAULT_MODEL;
}

function getModelPath(kv) {
  return path.join(getModelsDir(), MODELS[getModelName(kv)].file);
}

function transcribe(kv, logger, filePath = WAV_FILE) {
  const mp = getModelPath(kv);
  logger?.log("STT", `Local transcription requested model=${mp}`, "debug");
  if (!fs.existsSync(mp)) {
    logger?.log("STT", `Whisper model missing: ${mp}`, "error");
    return Promise.resolve({
      error: `Model not found: ${getModelName(kv)}. Download from huggingface.co/ggerganov/whisper.cpp`,
    });
  }
  if (!fs.existsSync(filePath)) {
    logger?.log("STT", `Audio file missing: ${filePath}`, "error");
    return Promise.resolve({ error: "Audio file missing - recording may have failed" });
  }
  if (fs.statSync(filePath).size <= 44) {
    logger?.log("STT", `Audio file empty: ${filePath}`, "warn");
    return Promise.resolve({ error: "Recording is empty - no audio captured" });
  }

  const cpus = os.cpus().length || 4;
  const threads = Math.min(cpus, 16);
  const args = ["-m", mp, "-f", filePath, "-np", "-nt", "-t", String(threads), "-p", String(cpus)];
  const lang = kv.get("stt.lang", "es");
  if (lang) args.push("-l", lang);
  logger?.log("STT", `whisper-cli threads=${threads} processors=${cpus} lang=${lang || "auto"}`, "debug");

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    const proc = spawn("whisper-cli", args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    logger?.log("STT", `Started whisper-cli pid=${proc.pid}`, "debug");

    try {
      os.setPriority(proc.pid, os.constants.priority.PRIORITY_ABOVE_NORMAL);
    } catch {
      try {
        os.setPriority(proc.pid, os.constants.priority.PRIORITY_NORMAL);
      } catch {}
    }

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("error", (err) => {
      logger?.log("STT", `whisper-cli error: ${err.message}`, "error");
      resolve({ error: `Transcription failed: ${err.message}` });
    });

    proc.on("exit", (code) => {
      if (code !== 0) {
        logger?.log("STT", `whisper-cli exited code=${code} stderr=${stderr.trim()}`, "error");
        resolve({ error: stderr.trim().split("\n").pop() || `whisper-cli exited (code=${code})` });
        return;
      }
      logger?.log("STT", `Local transcription succeeded stdoutChars=${stdout.length}`, "debug");
      resolve({
        text: stdout
          .replace(/\[.*?\]/g, "")
          .replace(/\(.*?\)/g, "")
          .replace(/\s+/g, " ")
          .trim(),
      });
    });
  });
}

const STT_SYSTEM_PROMPT = `You are a speech-to-text normalizer for a coding assistant CLI.

Clean up raw whisper transcription into a clear, well-punctuated prompt. Rules:
- Fix punctuation, capitalization, and grammar
- Remove filler words (um, uh, like, you know, etc.)
- Keep technical terms, file names, and code references exact
- If the user is dictating code, format it appropriately
- Use the session context above to resolve ambiguous references (e.g. "that function", "the file", "it")
- Output ONLY the cleaned text, nothing else
- Do not add any commentary or explanation
- Keep the user's intent and meaning intact

CRITICAL DOMAIN CORRECTIONS - Fix common STT homophone errors in software engineering contexts:
- "locks" -> "logs" (unless explicitly talking about mutexes/concurrency)
- "note" / "no" -> "node"
- "app and" -> "append"
- "sink" -> "sync"
- "a sink" -> "async"
- "doc" / "talker" -> "docker"
- "cash" -> "cache"
- "rap" -> "wrap"
- "Jason" -> "JSON"
- "get" -> "Git"
- "react" -> "React"
- "types creep" / "type script" -> "TypeScript"
- "bite" -> "byte"
- "string" -> "String"
- "int" -> "Int"
- "bullion" -> "boolean"

Rely heavily on context to fix words that sound similar to programming terminology.`;

async function normalizeTranscription(complete, rawText, sessionTitle, systemPrompt, logger) {
  const contextLine = sessionTitle ? ` The user is currently working on: "${sessionTitle}"` : "";
  const system = `${systemPrompt}${contextLine}`;

  logger?.log("STT", `Normalizing transcription chars=${rawText.length}`, "debug");
  return completeWithRetry(
    complete,
    {
      system,
      prompt: `Clean up this speech-to-text transcription:\n\n${rawText}`,
    },
    logger,
    "STT",
  );
}

async function getApiModels(logger) {
  if (!sttApiEndpoint) return [];
  try {
    const url = sttApiEndpoint.endsWith("/")
      ? `${sttApiEndpoint}models`
      : `${sttApiEndpoint}/models`;
    const headers = {};
    if (sttApiKeyEnv && process.env[sttApiKeyEnv]) {
      headers["Authorization"] = "Bearer " + process.env[sttApiKeyEnv];
    }
    const resp = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
    logger?.log("STT", `Fetched STT API models status=${resp.status}`, resp.ok ? "debug" : "warn");
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.data || [])
      .filter((m) => m.id && /whisper/i.test(m.id))
      .map((m) => ({ value: m.id, label: m.id }));
  } catch (err) {
    logger?.log("STT", `Failed to fetch STT API models: ${err.message}`, "error");
    return [];
  }
}

async function transcribeApi(kv, logger) {
  if (!sttApiEndpoint || !sttApiModel) {
    logger?.log("STT", "STT API transcription skipped: API not configured", "warn");
    return { error: "STT API not configured" };
  }
  const model = kv.get("stt.api.model") || sttApiModel;
  logger?.log("STT", `STT API transcription requested model=${model}`, "debug");

  if (!fs.existsSync(WAV_FILE)) {
    logger?.log("STT", `Recording file missing: ${WAV_FILE}`, "error");
    return { error: "No recording file - sox may have failed to capture audio" };
  }
  if (fs.statSync(WAV_FILE).size <= 44) {
    logger?.log("STT", `Recording file empty: ${WAV_FILE}`, "warn");
    return { error: "Recording is empty - no audio captured" };
  }

  try {
    const audioBuffer = await fs.promises.readFile(WAV_FILE);
    const apiKey = sttApiKeyEnv ? process.env[sttApiKeyEnv] : null;
    const useOpenRouterFormat = isOpenRouterEndpoint(sttApiEndpoint);

    const url = sttApiEndpoint.endsWith("/")
      ? `${sttApiEndpoint}audio/transcriptions`
      : `${sttApiEndpoint}/audio/transcriptions`;

    const request = useOpenRouterFormat
      ? buildOpenRouterTranscriptionRequest(model, audioBuffer, apiKey)
      : buildMultipartTranscriptionRequest(model, audioBuffer, apiKey);

    const resp = await fetch(url, {
      method: "POST",
      headers: request.headers,
      body: request.body,
      signal: AbortSignal.timeout(60000),
    });
    logger?.log("STT", `STT API response status=${resp.status}`, resp.ok ? "debug" : "error");

    if (!resp.ok) {
      const responseBody = await resp.text();
      let msg = `STT API error ${resp.status}`;
      try {
        const err = JSON.parse(responseBody);
        msg = err?.error?.message || msg;
      } catch {}
      return { error: msg };
    }

    let data;
    try {
      data = await resp.json();
    } catch (err) {
      logger?.log("STT", `STT API returned invalid JSON: ${err.message}`, "error");
      return { error: `STT API returned invalid JSON: ${err.message}` };
    }
    logger?.log("STT", `STT API transcription succeeded chars=${data.text?.length || 0}`, "debug");
    return { text: data.text?.trim() || "" };
  } catch (err) {
    logger?.log("STT", `STT API request failed: ${err.message}`, "error");
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return { error: "STT API request timed out (60s)" };
    }
    return { error: `STT API request failed: ${err.message}` };
  }
}

async function appendTranscription(client, text, submit) {
  if (isBlockedCall(text)) {
    throw new Error(
      `Palabra de bloqueo detectada ("${text.trim().slice(0, 60)}"). Interacción denegada: ${blockedRefusalText(text)}`,
    );
  }
  let appendResult = await client.tui.appendPrompt({ body: { text } });

  if (appendResult?.error?.data?.message === "Expected object, got undefined") {
    appendResult = await client.tui.appendPrompt({ text });
  }

  if (appendResult?.error) {
    throw new Error(
      `appendPrompt failed: ${appendResult.error.data?.message || appendResult.error.name}`,
    );
  }

  if (submit) {
    await client.tui.submitPrompt();
  }
}

async function doTranscribePipeline(
  kv,
  complete,
  client,
  toast,
  systemPrompt,
  submit = false,
  logger,
) {
  processing = true;
  try {
    logger?.log("STT", `Pipeline started submit=${submit}`, "debug");
    stopRecording(logger);
    await waitForSoxExit(logger);

    toast("Transcribing...");
    const result = sttApiEndpoint ? await transcribeApi(kv, logger) : await transcribe(kv, logger);

    if (result.error) {
      logger?.log("STT", `Transcription failed: ${result.error}`, "error");
      toast(result.error, "error");
      return;
    }
    if (!result.text) {
      logger?.log("STT", "Transcription produced no text", "warn");
      toast("No speech detected", "warning");
      return;
    }

    toast("Normalizing...");
    const sessionTitle = await getActiveSessionTitle(client);
    const llmResult = await normalizeTranscription(
      complete,
      result.text,
      sessionTitle,
      systemPrompt,
      logger,
    );

    if (!llmResult.text) {
      logger?.log("STT", `Normalization failed, using raw input: ${llmResult.error}`, "warn");
      await appendTranscription(client, result.text, submit);
      return;
    }

    await appendTranscription(client, llmResult.text, submit);
    logger?.log("STT", `Pipeline completed normalizedChars=${llmResult.text.length}`, "debug");
    toast(submit ? "Transcription submitted" : "Transcription added to prompt", "success");
  } catch (err) {
    logger?.log("STT", `Pipeline error: ${err.message}`, "error");
    toast(`STT error: ${err.message}`, "error");
  } finally {
    processing = false;
    recording = false;
  }
}

// ---- Inbox file transcription (phone uploads via Termius SFTP) ----

const INBOX_DIR =
  process.platform === "win32"
    ? path.join(VOICE_BASE, "tmp", "inbox")
    : path.join(os.tmpdir(), "opencode-voice-inbox");
const PROCESSED_DIR =
  process.platform === "win32"
    ? path.join(VOICE_BASE, "tmp", "processed")
    : path.join(os.tmpdir(), "opencode-voice-processed");

const AUDIO_EXTS = /\.(wav|mp3|flac|ogg|m4a|aac|opus|webm)$/i;

function newestInboxFile() {
  try {
    if (!fs.existsSync(INBOX_DIR)) return null;
    const files = fs.readdirSync(INBOX_DIR).filter((f) => AUDIO_EXTS.test(f));
    if (!files.length) return null;
    files.sort(
      (a, b) =>
        fs.statSync(path.join(INBOX_DIR, b)).mtimeMs - fs.statSync(path.join(INBOX_DIR, a)).mtimeMs,
    );
    return path.join(INBOX_DIR, files[0]);
  } catch {
    return null;
  }
}

function toWav(filePath, logger) {
  return new Promise((resolve) => {
    const out = path.join(INBOX_DIR, `_conv_${Date.now()}.wav`);
    const p = spawn(
      "ffmpeg",
      ["-y", "-hide_banner", "-loglevel", "error", "-i", filePath, "-ar", "16000", "-ac", "1", out],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    p.stderr.on("data", (c) => {
      logger?.log("STT", `ffmpeg conv: ${c.toString().trim()}`, "warn");
    });
    p.on("error", () => resolve(null));
    p.on("close", (code) => resolve(code === 0 && fs.existsSync(out) ? out : null));
  });
}

async function doFilePipeline(kv, complete, client, toast, systemPrompt, submit, logger) {
  processing = true;
  let conv = null;
  try {
    const file = newestInboxFile();
    if (!file) {
      toast("No audio files in inbox", "warning");
      return;
    }
    toast("Transcribing inbox file...");
    let target = file;
    if (!/\.wav$/i.test(file)) {
      conv = await toWav(file, logger);
      if (!conv) {
        toast("Failed to convert audio to WAV", "error");
        return;
      }
      target = conv;
    }
    const result = await transcribe(kv, logger, target);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    if (!result.text) {
      toast("No speech detected in file", "warning");
      return;
    }

    toast("Normalizing...");
    const sessionTitle = await getActiveSessionTitle(client);
    const llmResult = await normalizeTranscription(
      complete,
      result.text,
      sessionTitle,
      systemPrompt,
      logger,
    );
    const text = llmResult.text || result.text;
    if (!llmResult.text) {
      logger?.log("STT", `Normalization failed, using raw input: ${llmResult.error}`, "warn");
    }

    await appendTranscription(client, text, submit);
    toast(submit ? "Transcription submitted" : "Transcription added to prompt", "success");

    try {
      fs.mkdirSync(PROCESSED_DIR, { recursive: true });
      fs.renameSync(file, path.join(PROCESSED_DIR, path.basename(file)));
    } catch {}
  } catch (err) {
    logger?.log("STT", `Inbox pipeline error: ${err.message}`, "error");
    toast(`STT error: ${err.message}`, "error");
  } finally {
    if (conv) {
      try {
        fs.unlinkSync(conv);
      } catch {}
    }
    processing = false;
    recording = false;
  }
}

// ---- Ntfy audio (mobile publishes audio to the topic, PC transcribes) ----

async function fetchLatestNtfyAudio(kv, logger) {
  const topic = process.env.NOTIFY_TOPIC || "";
  if (!topic) {
    logger?.log("STT", "NOTIFY_TOPIC not set", "warn");
    return { error: "NOTIFY_TOPIC not set" };
  }
  const headers = {};
  const token = process.env.NOTIFY_TOKEN || "";
  if (token) headers["Authorization"] = "Bearer " + token;

  let resp;
  try {
    resp = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=all`, {
      headers,
      signal: AbortSignal.timeout(30000),
    });
    // FIX (8 ago 2026): token revierto/inválido → 401; el topic es público,
    // reintentar sin token para no bloquear el STT del móvil.
    if (resp.status === 401 && token) {
      logger?.log("STT", "ntfy token 401 -> refetch sin token (topic publico)", "warn");
      resp = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=all`, {
        signal: AbortSignal.timeout(30000),
      });
    }
  } catch (err) {
    return { error: `ntfy fetch failed: ${err.message}` };
  }
  if (!resp.ok) return { error: `ntfy HTTP ${resp.status}` };

  const text = await resp.text();
  const msgs = text
    .trim()
    .split(/\n/)
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter((m) => m && m.event === "message" && m.attachment);

  const audioMsgs = msgs.filter((m) => {
    const name = m.attachment?.name || "";
    const type = m.attachment?.type || "";
    return type.startsWith("audio/") || AUDIO_EXTS.test(name) || AUDIO_EXTS.test(m.attachment?.url || "");
  });
  if (!audioMsgs.length) return { error: "No hay audio en el topic" };

  const newest = audioMsgs[audioMsgs.length - 1];
  const lastId = kv.get("stt.ntfyLastId", "");
  if (lastId && newest.id === lastId) {
    return { error: "No hay audio nuevo en ntfy (ya transcrito)" };
  }

  let fileResp;
  try {
    fileResp = await fetch(newest.attachment.url, { headers, signal: AbortSignal.timeout(60000) });
  } catch (err) {
    return { error: `descarga fallo: ${err.message}` };
  }
  if (!fileResp.ok) return { error: `descarga HTTP ${fileResp.status}` };

  const buf = Buffer.from(await fileResp.arrayBuffer());
  fs.mkdirSync(INBOX_DIR, { recursive: true });
  const ext = (newest.attachment.name.match(/\.(\w+)$/)?.[1] || "wav").toLowerCase();
  const target = path.join(INBOX_DIR, `ntfy-${newest.id}.${ext}`);
  fs.writeFileSync(target, buf);
  kv.set("stt.ntfyLastId", newest.id);
  logger?.log(
    "STT",
    `ntfy audio downloaded: ${newest.attachment.name} (${buf.length} bytes) → ${target}`,
    "debug",
  );
  return { file: target, meta: newest };
}

async function doNtfyPipeline(kv, complete, client, toast, systemPrompt, submit, logger) {
  const res = await fetchLatestNtfyAudio(kv, logger);
  if (res.error) {
    toast(res.error, "warning");
    return;
  }
  toast(`Audio recibido de ntfy: ${res.meta.attachment.name || "?"}`);
  await doFilePipeline(kv, complete, client, toast, systemPrompt, submit, logger);
}

// ---- Public API for TUI plugin ----

export function registerSTT(api, kv, complete, prompts, opts, logger) {
  const client = api.client;
  const systemPrompt = prompts?.stt || STT_SYSTEM_PROMPT;
  function toast(message, variant = "info") {
    api.ui.toast({ message, variant, duration: 3000 });
  }

  if (opts?.sttEndpoint) {
    sttApiEndpoint = opts.sttEndpoint;
    sttApiModel = opts.sttModel || "whisper-large-v3-turbo";
    sttApiKeyEnv = opts.sttApiKeyEnv || null;
    logger?.log(
      "STT",
      `Configured STT API endpoint=${sttApiEndpoint} model=${sttApiModel}`,
      "debug",
    );
  }

  return [
    {
      title: sttApiEndpoint ? "STT: record/transcribe (API)" : "STT: record/transcribe",
      value: "stt.record",
      description: sttApiEndpoint
        ? "Toggle recording; press again to stop and transcribe via API"
        : "Toggle recording; press again to stop and transcribe",
      keybind: "ctrl+r",
      slash: { name: "stt-record-pc" },
      onSelect() {
        if (processing) {
          toast("STT busy, please wait...");
          return;
        }
        if (recording) {
          toast("Stopping, transcribing...");
          doTranscribePipeline(kv, complete, client, toast, systemPrompt, false, logger);
        } else {
          startRecording(kv, toast, logger);
          if (recording) toast("Recording... press again to transcribe");
        }
      },
    },
    {
      title: sttApiEndpoint ? "STT: submit recording (API)" : "STT: submit recording",
      value: "stt.submit",
      description: sttApiEndpoint
        ? "Stop recording, transcribe via API, and submit prompt"
        : "Stop recording, transcribe, and submit prompt",
      keybind: "<leader>r",
      slash: { name: "stt-submit-pc" },
      onSelect() {
        if (processing) {
          toast("STT busy, please wait...");
          return;
        }
        if (!recording) {
          toast("No recording in progress", "warning");
          return;
        }
        toast("Stopping, transcribing...");
        doTranscribePipeline(kv, complete, client, toast, systemPrompt, true, logger);
      },
    },
    {
      title: "STT: cancel recording",
      value: "stt.stop",
      description: "Cancel current recording",
      slash: { name: "stt-stop-pc" },
      onSelect() {
        if (recording) {
          recording = false;
          forceKillSox(logger);
          logger?.log("STT", "Recording cancelled", "debug");
          toast("Recording cancelled");
        }
      },
    },
    {
      title: sttApiEndpoint ? "STT: select model (API)" : "STT: select model",
      value: "stt.model",
      description: sttApiEndpoint ? "Choose whisper model via API" : "Choose whisper model",
      slash: { name: "stt-model-pc" },
      async onSelect() {
        if (sttApiEndpoint) {
          const current = kv.get("stt.api.model") || sttApiModel;
          const apiModels = await getApiModels(logger);
          const options = apiModels.length > 0 ? apiModels : [{ value: current, label: current }];
          api.ui.dialog.replace(() =>
            api.ui.DialogSelect({
              title: "Select whisper model (API)",
              current,
              options: options.map((m) => ({
                title: m.label,
                value: m.value,
                onSelect() {
                  kv.set("stt.api.model", m.value);
                  toast(`Whisper API model: ${m.label}`);
                  api.ui.dialog.clear();
                },
              })),
            }),
          );
        } else {
          const current = getModelName(kv);
          api.ui.dialog.replace(() =>
            api.ui.DialogSelect({
              title: "Select whisper model",
              current,
              options: Object.entries(MODELS).map(([key, v]) => ({
                title: v.label,
                value: key,
                onSelect() {
                  kv.set("stt.model", key);
                  toast(`Whisper model: ${v.label}`);
                  api.ui.dialog.clear();
                },
              })),
            }),
          );
        }
      },
    },
    {
      title: "STT: select microphone",
      value: "stt.mic",
      description: "Choose audio input device",
      slash: { name: "stt-mic-pc" },
      onSelect() {
        const current = kv.get("stt.mic", "");
        const devices = listInputDevices();
        if (devices.length === 0) {
          toast("No input devices found");
          return;
        }
        api.ui.dialog.replace(() =>
          api.ui.DialogSelect({
            title: "Select microphone",
            current,
            options: [
              {
                title: "System default",
                value: "",
                onSelect() {
                  kv.set("stt.mic", "");
                  toast("Mic: system default");
                  api.ui.dialog.clear();
                },
              },
              ...devices.map((name) => ({
                title: name,
                value: name,
                onSelect() {
                  kv.set("stt.mic", name);
                  toast(`Mic: ${name}`);
                  api.ui.dialog.clear();
                },
              })),
            ],
          }),
        );
      },
    },
    {
      title: "STT: transcribe inbox file",
      value: "stt.file",
      description:
        "Transcribe the newest audio file in E:/Ciszu Network/tools/tts-stt-ai/tmp/inbox (phone upload) and append to prompt",
      slash: { name: "stt-file-cel" },
      onSelect() {
        if (processing) {
          toast("STT busy, please wait...");
          return;
        }
        doFilePipeline(kv, complete, client, toast, systemPrompt, false, logger);
      },
    },
    {
      title: "STT: transcribe + submit inbox file",
      value: "stt.file-submit",
      description:
        "Transcribe the newest inbox file and submit the prompt",
      slash: { name: "stt-file-submit-cel" },
      onSelect() {
        if (processing) {
          toast("STT busy, please wait...");
          return;
        }
        doFilePipeline(kv, complete, client, toast, systemPrompt, true, logger);
      },
    },
    {
      title: "STT: transcribe audio from ntfy topic",
      value: "stt.ntfy",
      description:
        "Download the newest audio attachment from the ntfy topic (published from your phone) and append to prompt",
      slash: { name: "stt-record-cel" },
      onSelect() {
        if (processing) {
          toast("STT busy, please wait...");
          return;
        }
        doNtfyPipeline(kv, complete, client, toast, systemPrompt, false, logger);
      },
    },
    {
      title: "STT: transcribe + submit audio from ntfy topic",
      value: "stt.ntfy-submit",
      description:
        "Download the newest ntfy audio attachment and submit the prompt",
      slash: { name: "stt-submit-cel" },
      onSelect() {
        if (processing) {
          toast("STT busy, please wait...");
          return;
        }
        doNtfyPipeline(kv, complete, client, toast, systemPrompt, true, logger);
      },
    },
  ];
}
