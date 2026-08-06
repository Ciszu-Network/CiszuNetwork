// Text-to-speech: LLM normalization, Piper synthesis, sox playback.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { getSessionTitle, completeWithRetry } from "./session.js";
import { buildAudioName, buildNtfyMeta } from "./ntfy-meta.js";

const VOICE_BASE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REPO_ROOT = path.resolve(VOICE_BASE, "..", "..");

const RUNTIME = path.join(VOICE_BASE, "runtime");
const BIN_PIPER = path.join(RUNTIME, "piper", "piper", process.platform === "win32" ? "piper.exe" : "piper");
const BIN_FFMPEG = path.join(RUNTIME, "ffmpeg-9.0-essentials_build", "bin", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
const BIN_FFPLAY = path.join(RUNTIME, "ffmpeg-9.0-essentials_build", "bin", process.platform === "win32" ? "ffplay.exe" : "ffplay");

// Lee NOTIFY_*/GEMINI_API_KEY de .env.local + services/supabase/.env porque el
// server de opencode arranca sin esas variables en su entorno.
const ENV_FILES = [
  path.join(REPO_ROOT, ".env.local"),
  path.join(REPO_ROOT, "services", "supabase", ".env"),
];

function readRepoEnv() {
  const vars = {};
  for (const file of ENV_FILES) {
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
const NOTIFY_TOPIC = process.env.NOTIFY_TOPIC || REPO_ENV.NOTIFY_TOPIC || "";
const NOTIFY_TOKEN = process.env.NOTIFY_TOKEN || REPO_ENV.NOTIFY_TOKEN || "";
const NOTIFY_SERVER = process.env.NOTIFY_SERVER || REPO_ENV.NOTIFY_SERVER || "https://ntfy.sh";

const VOICES_DIR =
  process.platform === "win32"
    ? path.join(VOICE_BASE, "runtime", "piper-voices")
    : path.join(os.homedir(), ".local", "share", "piper-voices");

const TTS_VOICES = {
  daniela: { label: "Daniela (high, ES-AR - female)", file: "es_AR-daniela-high.onnx" },
  sharvard: { label: "Sharvard (medium, ES - female)", file: "es_ES-sharvard-medium.onnx", speaker: 1 },
  amy: { label: "Amy (medium, EN - female)", file: "en_US-amy-medium.onnx" },
  ryan: { label: "Ryan (high, EN)", file: "en_US-ryan-high.onnx" },
  bryce: { label: "Bryce (medium, EN)", file: "en_US-bryce-medium.onnx" },
  davefx: { label: "Davefx (medium, ES - male)", file: "es_ES-davefx-medium.onnx" },
};
const DEFAULT_TTS_VOICE = "sharvard";

// ---- Politica de identidad (6 ago 2026) ----
// Si el prompt del usuario EMPIEZA con un nombre/alias de la IA (CiszuAi,
// Yarbis, Intelligence, Krypta u otros genericos), la respuesta debe ir en audio
// y nombrar siempre al usuario: Francisco García, alias Ciszuko Antony.
// Abreviaciones validas: Cisco/Fran → Francisco; Ciszu/Ciszuko → Ciszuko.
const IA_ALIASES_RE =
  /^(?:ciszuai|ciszu ai|yarbis|intelligence|krypta|ai\b|asistente|bot\b|maquina|computadora)/i;
const USER_GREETINGS = [
  "Francisco",
  "Cisco",
  "Fran",
  "Francisco García",
  "Ciszuko",
  "Cisco Francisco",
];

const PIPER_RATE = 22050;
const PIPER_BITS = 16;
const PIPER_CHANNELS = 1;

const AUDIO_DIR = process.platform === "win32" ? path.join(VOICE_BASE, "tmp") : os.tmpdir();

// ---- System prompts ----

const SYSTEM_AUTO = `You are a text-to-speech narrator for a coding assistant CLI. Your job is to convert the assistant's markdown output into natural spoken text that is useful and pleasant to listen to.

You have three modes depending on the content complexity:

1. NARRATE - For simple explanations, short answers, and conversational responses. Convert to natural spoken text, normalizing code references for speech.
   - camelCase/PascalCase identifiers: split into words (parseConfig -> "parse config")
   - File paths: use just the filename (src/utils/helpers.ts -> "helpers dot ts")
   - Short code snippets in backticks: read them naturally
   - Keep the narrative flow intact

2. SUMMARIZE - For responses with significant code blocks, multiple file changes, or complex technical details. Provide a brief spoken summary of what was done and tell the user to check the screen.
   - Mention what was changed and why
   - Do not try to describe code blocks verbatim
   - End with something like "check the details on your screen" or "take a look at the output for the specifics"

3. NOTIFY - For very short confirmations, status updates, or acknowledgments. Keep it to one brief sentence.

Choose the appropriate mode based on the content. Most responses with code blocks should use SUMMARIZE mode. Simple Q&A or short explanations use NARRATE. Build results, "done", confirmations use NOTIFY.

Output ONLY the spoken text. Nothing else. No mode labels. No commentary.`;

const SYSTEM_MANUAL = `You are a text-to-speech reader for a coding assistant. The user has explicitly requested this text be read aloud. Read the prose content faithfully and in detail.

Rules:
- Read all prose text naturally and completely
- Code identifiers: split camelCase/PascalCase/snake_case into words (parseConfig -> "parse config", my_variable -> "my variable")
- File paths: read just the filename with extension (src/utils/helpers.ts -> "helpers dot ts")
- Line references: keep as is ("line 42")
- URLs: say "a link" or just the domain name
- Code blocks: skip entirely, just say "code block" or "code snippet"
- Error codes: expand naturally (ECONNREFUSED -> "connection refused")
- Shell commands: read them naturally (npm test -> "npm test")
- List items: read each item
- Remove markdown formatting but preserve all the informational content
- Do NOT summarize. Do NOT say "check the screen". Read everything that is prose.
- Output ONLY the spoken text`;

// ---- Session helpers ----

async function getTurnAssistantText(client, api) {
  const route = api.route.current;
  if (route.name !== "session") return null;

  const sessionID = route.params.sessionID;
  const stateMessages = api.state.session.messages(sessionID);
  if (!stateMessages || stateMessages.length === 0) return null;

  const assistantIDs = [];
  for (let i = stateMessages.length - 1; i >= 0; i--) {
    if (stateMessages[i].role === "user") break;
    if (stateMessages[i].role === "assistant") {
      assistantIDs.unshift(stateMessages[i].id);
    }
  }
  if (assistantIDs.length === 0) return null;

  const allText = [];
  for (const msgID of assistantIDs) {
    try {
      const fullMsg = await client.session
        .message({ sessionID, messageID: msgID }, { throwOnError: true })
        .then((r) => r.data);

      const textParts = (fullMsg?.parts || []).filter((p) => p.type === "text");
      const text = textParts
        .map((p) => p.text || "")
        .join("\n\n")
        .trim();
      if (text) allText.push(text);
    } catch {
      // Skip messages that fail to fetch
    }
  }

  if (allText.length === 0) return null;

  return {
    lastMessageID: assistantIDs[assistantIDs.length - 1],
    text: allText.join("\n\n"),
  };
}

// Palíndromo informativo del usuario: devuelve el texto del último mensaje del
// usuario para aplicar la política de identidad (alias → audio + saludo).
async function getTurnUserText(client, api) {
  const route = api.route.current;
  if (route.name !== "session") return "";

  const sessionID = route.params.sessionID;
  const stateMessages = api.state.session.messages(sessionID);
  if (!stateMessages || stateMessages.length === 0) return "";

  for (let i = stateMessages.length - 1; i >= 0; i--) {
    const m = stateMessages[i];
    if (m.role !== "user") continue;
    try {
      const fullMsg = await client.session
        .message({ sessionID, messageID: m.id }, { throwOnError: true })
        .then((r) => r.data);
      const textParts = (fullMsg?.parts || []).filter((p) => p.type === "text");
      const text = textParts.map((p) => p.text || "").join("\n").trim();
      if (text) return text;
    } catch {
      continue;
    }
  }
  return "";
}

// ¿El prompt usa un alias/nombre de la IA? (política de identidad)
function usedAIAlias(userText) {
  if (!userText || typeof userText !== "string") return false;
  const firstLine = userText.trim().slice(0, 60);
  return IA_ALIASES_RE.test(firstLine);
}

// Saludo de audio dirigido al usuario (Francisco García / Ciszuko Antony).
function personalizedGreeting(index) {
  const name = USER_GREETINGS[index % USER_GREETINGS.length];
  return `Hola ${name}.`;
}

// ---- Public API for TUI plugin ----

export function registerTTS(api, kv, complete, prompts, logger) {
  const client = api.client;
  const systemAuto = prompts?.ttsAuto || SYSTEM_AUTO;
  const systemManual = prompts?.ttsManual || SYSTEM_MANUAL;

  function toast(message, variant = "info") {
    api.ui.toast({ message, variant, duration: 3000 });
  }

  function getVoiceModel() {
    const voice = kv.get("tts.voice", DEFAULT_TTS_VOICE);
    const entry = TTS_VOICES[voice] || TTS_VOICES[DEFAULT_TTS_VOICE];
    return { file: path.join(VOICES_DIR, entry.file), speaker: entry.speaker };
  }

  // Politica de identidad: si el ultimo prompt del usuario comienza con un
  // alias/nombre de la IA (CiszuAi, Yarbis, Intelligence, Krypta...), el audio
  // de la respuesta debe saludar siempre a Francisco García (alias Ciszuko
  // Antony) por su nombre, rotando entre variantes (Francisco, Cisco, Fran...).
  async function buildPolicyGreeting(api, kv) {
    try {
      const userText = await getTurnUserText(client, api);
      if (!usedAIAlias(userText)) return "";
      const idx = Number(kv.get("tts.greetIdx", 0)) || 0;
      kv.set("tts.greetIdx", idx + 1);
      return personalizedGreeting(idx);
    } catch {
      return "";
    }
  }

  function piperArgs(voiceModel) {
    const args = ["-m", voiceModel.file, "--output_raw"];
    if (voiceModel.speaker !== undefined) args.push("-s", String(voiceModel.speaker));
    return args;
  }

  function piperOnPath() {
    return fs.existsSync(BIN_PIPER) || (() => {
      const pathDirs = (process.env.PATH || "").split(path.delimiter).filter(Boolean);
      const isWin = process.platform === "win32";
      return pathDirs.some(
        (dir) =>
          fs.existsSync(path.join(dir, "piper")) ||
          (isWin && fs.existsSync(path.join(dir, "piper.exe"))),
      );
    })();
  }

  function binFor(name) {
    if (name === "piper" && fs.existsSync(BIN_PIPER)) return BIN_PIPER;
    if (name === "ffplay" && fs.existsSync(BIN_FFPLAY)) return BIN_FFPLAY;
    if (name === "ffmpeg" && fs.existsSync(BIN_FFMPEG)) return BIN_FFMPEG;
    return name;
  }

  function cleanFallback(text) {
    return text
      .replace(/```[\s\S]*?```/g, " code block. ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  async function normalizeForSpeech(text, systemPrompt) {
    logger?.log?.("TTS", `Normalizing speech chars=${text.length}`, "debug");
    const result = await completeWithRetry(
      complete,
      {
        system: systemPrompt,
        prompt: `Convert for text-to-speech:\n\n${text}`,
        config: { maxTokens: 4096 },
      },
      logger,
      "TTS",
    );
    if (result.text) return result;
    logger?.log?.("TTS", `LLM normalization failed (${result.error}), using local fallback`, "warn");
    return { text: cleanFallback(text), fallback: true };
  }

  // ---- Audio pipeline ----

  let piperProc = null;
  let playProc = null;

  function killProcs() {
    if (piperProc) {
      try {
        piperProc.kill("SIGKILL");
      } catch {}
      piperProc = null;
    }
    if (playProc) {
      try {
        playProc.kill("SIGKILL");
      } catch {}
      playProc = null;
    }
  }

  function speak(text) {
    if (!text) return Promise.resolve();
    const line = text.replace(/\n/g, " ").trim();
    if (!line) return Promise.resolve();

    killProcs();

    const voiceModel = getVoiceModel();
    logger?.log?.("TTS", `Speak requested chars=${line.length} voice=${voiceModel.file}`, "debug");
    if (!piperOnPath()) {
      logger?.log?.("TTS", `Piper binary not found on PATH`, "warn");
      toast(`Piper binary not found on PATH`, "warning");
      return Promise.resolve();
    }
    if (!fs.existsSync(voiceModel.file)) {
      logger?.log?.("TTS", `Voice model not found: ${voiceModel.file}`, "warn");
      toast(`Voice model not found: ${voiceModel.file}`, "warning");
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let piperStderr = "";
      let playStderr = "";
      playProc =
        process.platform === "win32"
          ? spawn(
              binFor("ffplay"),
              [
                "-f", "s16le",
                "-ar", String(PIPER_RATE),
                "-ch_layout", "mono",
                "-nodisp", "-autoexit",
                "-loglevel", "quiet",
                "-i", "-",
              ],
              { stdio: ["pipe", "ignore", "pipe"] },
            )
          : spawn(
              "play",
              [
                "-t",
                "raw",
                "-r",
                String(PIPER_RATE),
                "-e",
                "signed",
                "-b",
                String(PIPER_BITS),
                "-c",
                String(PIPER_CHANNELS),
                "-q",
                "-",
              ],
              { stdio: ["pipe", "ignore", "pipe"] },
            );

      piperProc = spawn(binFor("piper"), piperArgs(voiceModel), {
        stdio: ["pipe", "pipe", "pipe"],
      });

      piperProc.stderr.on("data", (chunk) => {
        piperStderr += chunk.toString();
      });
      playProc.stderr.on("data", (chunk) => {
        playStderr += chunk.toString();
      });

      piperProc.stdout.on("data", (chunk) => {
        if (playProc?.stdin && !playProc.stdin.destroyed) {
          playProc.stdin.write(chunk);
        }
      });

      piperProc.on("close", (code) => {
        if (code !== 0 && code !== null) {
          logger?.log?.("TTS", `piper exited code=${code} stderr=${piperStderr.trim()}`, "error");
        }
        if (playProc?.stdin && !playProc.stdin.destroyed) {
          playProc.stdin.end();
        }
      });

      playProc.on("close", (code) => {
        if (code !== 0 && code !== null) {
          logger?.log?.("TTS", `play exited code=${code} stderr=${playStderr.trim()}`, "error");
        } else {
          logger?.log?.("TTS", "playback finished", "debug");
        }
        piperProc = null;
        playProc = null;
        resolve();
      });

      piperProc.on("error", (err) => {
        logger?.log?.("TTS", `piper error: ${err.message}`, "error");
        killProcs();
        resolve();
      });
      playProc.on("error", (err) => {
        logger?.log?.("TTS", `play error: ${err.message}`, "error");
        killProcs();
        resolve();
      });

      if (piperProc?.stdin && !piperProc.stdin.destroyed) {
        piperProc.stdin.write(line + "\n");
        piperProc.stdin.end();
      }
    });
  }

  // ---- Session-prefixed announcements ----

  async function speakWithSessionPrefix(sessionID, message, suffix) {
    const parts = [];
    if (kv.get("tts.announceSession", false)) {
      const sessionTitle = await getSessionTitle(client, sessionID);
      if (sessionTitle) parts.push(`Session: ${sessionTitle}.`);
    }
    parts.push(message);
    if (suffix) parts.push(suffix);
    await speak(parts.join(" "));
  }

  function stopSpeech() {
    const wasPlaying = piperProc !== null || playProc !== null;
    killProcs();
    return wasPlaying;
  }

  // ---- Auto mode ----

  let lastSpokenMessageID = null;
  let wasBusy = false;

  api.event.on("session.status", (event) => {
    if (event.properties?.status?.type === "busy") wasBusy = true;
  });

  api.event.on("session.idle", async (event) => {
    if (kv.get("tts.mode", "off") !== "on") return;
    if (!wasBusy) return;
    wasBusy = false;

    const sessionID = event.properties?.sessionID;
    const result = await getTurnAssistantText(client, api);
    if (!result || !result.text) return;

    if (result.lastMessageID === lastSpokenMessageID) return;
    lastSpokenMessageID = result.lastMessageID;

    toast("Normalizing response...");
    const llmResult = await normalizeForSpeech(result.text, systemAuto);
    if (!llmResult.text) {
      logger?.log?.("TTS", `Auto normalization failed: ${llmResult.error}`, "warn");
      toast(`TTS normalization failed: ${llmResult.error}`, "warning");
      return;
    }

    logger?.log?.("TTS", `Auto normalization succeeded chars=${llmResult.text.length}`, "debug");
    const greeting = await buildPolicyGreeting(api, kv);
    const textToSpeak = greeting ? `${greeting} ${llmResult.text}` : llmResult.text;
    await speakWithSessionPrefix(sessionID, textToSpeak, "Listo, esperando tu entrada.");
  });

  api.event.on("permission.asked", async (event) => {
    if (kv.get("tts.mode", "off") !== "on") return;
    await speakWithSessionPrefix(
      event.properties?.sessionID,
      "Permiso solicitado. Revisa tu pantalla.",
    );
  });

  api.event.on("question.asked", async (event) => {
    if (kv.get("tts.mode", "off") !== "on") return;
    await speakWithSessionPrefix(
      event.properties?.sessionID,
      "Tienes una pregunta pendiente. Revisa tu pantalla.",
    );
  });

  // ---- Manual mode ----

  async function speakLastResponse() {
    const result = await getTurnAssistantText(client, api);
    if (!result || !result.text) {
      toast("No assistant response to speak", "warning");
      return;
    }

    toast("Normalizing response...");
    const llmResult = await normalizeForSpeech(result.text, systemManual);
    if (!llmResult.text) {      logger?.log?.("TTS", `Manual normalization failed: ${llmResult.error}`, "warn");
      toast(`TTS normalization failed: ${llmResult.error}`, "warning");
      return;
    }

    logger?.log?.("TTS", `Manual normalization succeeded chars=${llmResult.text.length}`, "debug");
    const greeting = buildPolicyGreeting(api, kv);
    const textToSpeak = greeting ? `${greeting} ${llmResult.text}` : llmResult.text;
    toast("Speaking last response");
    await speak(textToSpeak);
  }

  // ---- Phone delivery (ntfy audio attachment) ----

  const MOTIVO_TITLES = {
    respuesta: "Ciszu · Respuesta por voz",
    auto: "Ciszu · Tarea terminada",
    notificar: "Ciszu · Aviso",
    deploy: "Ciszu · Deploy",
    check: "Ciszu · Check",
    alerta: "Ciszu · Alerta",
  };

  async function sendToNtfy(mp3, topic, logger, meta = {}) {
    try {
      const buf = fs.readFileSync(mp3);
      // PUT + query params: el server ntfy.sh IGNORA el filename del multipart
      // (siempre "attachment.mp3") y decodifica los headers como latin1 (tildes rotas).
      // Con query params (UTF-8) conserva metadata Y nombre via parámetro `f`.
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(meta)) {
        if (key !== "filename" && value !== undefined && value !== null && value !== "") {
          params.set(key, String(value));
        }
      }
      if (meta.filename) params.set("f", meta.filename);
      const headers = { "Content-Type": "audio/mpeg" };
      if (NOTIFY_TOKEN) headers["Authorization"] = "Bearer " + NOTIFY_TOKEN;
      const resp = await fetch(`${NOTIFY_SERVER}/${topic}?${params}`, {
        method: "PUT",
        headers,
        body: buf,
      });
      logger?.log?.("TTS", `ntfy audio send status=${resp.status}`, resp.ok ? "debug" : "error");
      return resp.ok;
    } catch (err) {
      logger?.log?.("TTS", `ntfy audio send failed: ${err.message}`, "error");
      return false;
    } finally {
      try {
        fs.unlinkSync(mp3);
        fs.unlinkSync(mp3.replace(/\.mp3$/, ".wav"));
      } catch {}
    }
  }

  function synthToNtfy(text, logger, ctx = {}) {
    const topic = NOTIFY_TOPIC;
    if (!topic) {
      logger?.log?.("TTS", "NOTIFY_TOPIC not set, cannot send to phone", "warn");
      toast("NOTIFY_TOPIC not set", "warning");
      return Promise.resolve(false);
    }
    const voiceModel = getVoiceModel();
    if (!fs.existsSync(voiceModel.file)) {
      toast(`Voice model not found: ${voiceModel.file}`, "warning");
      return Promise.resolve(false);
    }

    const motivo = ctx.motivo || "respuesta";
    const filename = buildAudioName({
      tipo: "tts",
      motivo,
      sesion: ctx.sesion || "",
      texto: text,
    });
    const meta = buildNtfyMeta({
      filename,
      title: ctx.title || MOTIVO_TITLES[motivo] || `Ciszu · ${motivo}`,
      message: ctx.message || text.slice(0, 300),
      tags: ctx.tags,
      priority: ctx.priority,
      click: ctx.click,
      icon: ctx.icon,
      actions: ctx.actions,
    });
    const wav = path.join(AUDIO_DIR, filename.replace(/\.mp3$/, ".wav"));
    const mp3 = wav.replace(/\.wav$/, ".mp3");

    return new Promise((resolve) => {
      let finished = false;
      function finish(ok) {
        if (finished) return;
        finished = true;
        resolve(ok);
      }

      const piper = spawn(binFor("piper"), [...piperArgs(voiceModel), "-f", wav], {
        stdio: ["pipe", "ignore", "pipe"],
      });
      piper.stderr.on("data", () => {});
      piper.on("error", () => finish(false));
      piper.on("close", (code) => {
        if (code !== 0 || !fs.existsSync(wav)) {
          finish(false);
          return;
        }
        const conv = spawn(
          binFor("ffmpeg"),
          ["-y", "-hide_banner", "-loglevel", "error", "-i", wav, "-codec:a", "libmp3lame", "-q:a", "6", mp3],
          { stdio: "ignore" },
        );
        conv.on("error", () => finish(false));
        conv.on("close", (c) => {
          if (c !== 0 || !fs.existsSync(mp3)) {
            finish(false);
            return;
          }
          sendToNtfy(mp3, topic, logger, meta).then(finish);
        });
      });
      if (piper.stdin) {
        piper.stdin.write(text.replace(/\n/g, " ").trim() + "\n");
        piper.stdin.end();
      }
    });
  }

  // ---- Commands ----

  return [
    {
      title: "TTS: speak last response",
      value: "tts.speak-last",
      description: "Read the last assistant response aloud (detailed)",
      keybind: "<leader>s",
      slash: { name: "tts-speak-pc" },
      onSelect() {
        speakLastResponse();
      },
    },
    {
      title: "TTS: toggle",
      value: "tts.mode",
      description: "Toggle auto text-to-speech on/off",
      keybind: "<leader>v",
      slash: { name: "tts-mode-pc" },
      onSelect() {
        const current = kv.get("tts.mode", "off");
        const next = current === "on" ? "off" : "on";
        kv.set("tts.mode", next);
        if (next === "off") stopSpeech();
        const voice =
          TTS_VOICES[kv.get("tts.voice", DEFAULT_TTS_VOICE)] || TTS_VOICES[DEFAULT_TTS_VOICE];
        toast(next === "on" ? `TTS on (${voice.label})` : "TTS off");
      },
    },
    {
      title: "TTS: stop playback",
      value: "tts.stop",
      description: "Stop current TTS playback",
      keybind: "escape",
      slash: { name: "tts-stop-pc" },
      onSelect() {
        if (stopSpeech()) toast("TTS stopped");
      },
    },
    {
      title: "TTS: select voice",
      value: "tts.voice",
      description: "Choose TTS voice",
      slash: { name: "tts-voice-pc" },
      onSelect() {
        const current = kv.get("tts.voice", DEFAULT_TTS_VOICE);
        api.ui.dialog.replace(() =>
          api.ui.DialogSelect({
            title: "Select voice",
            current,
            options: Object.entries(TTS_VOICES).map(([key, v]) => ({
              title: v.label,
              value: key,
              onSelect() {
                kv.set("tts.voice", key);
                toast(`Voice: ${v.label}`);
                api.ui.dialog.clear();
              },
            })),
          }),
        );
      },
    },
    {
      title: "TTS: send last response to phone (ntfy)",
      value: "tts.phone",
      description: "Synthesize last response and push the audio to your phone via ntfy",
      slash: { name: "tts-speak-cel" },
      async onSelect() {
        const result = await getTurnAssistantText(client, api);
        if (!result || !result.text) {
          toast("No assistant response to speak", "warning");
          return;
        }
        toast("Normalizing response...");
        const llmResult = await normalizeForSpeech(result.text, systemManual);
        if (!llmResult.text) {
          toast(`TTS normalization failed: ${llmResult.error}`, "warning");
          return;
        }
        const greeting = await buildPolicyGreeting(api, kv);
        const textToSend = greeting ? `${greeting} ${llmResult.text}` : llmResult.text;
        toast("Synthesizing and sending...");
        const sessionID = api.route.current?.params?.sessionID;
        const sesion = (await getSessionTitle(client, sessionID)) || "";
        const ok = await synthToNtfy(textToSend, logger, {
          motivo: "respuesta",
          sesion,
          tags: ["robot"],
          priority: 3,
        });
        toast(ok ? "Audio enviado a tu móvil" : "Error enviando el audio", ok ? "success" : "error");
      },
    },
  ];
}
