// Text-to-speech: LLM normalization, Piper synthesis, sox playback.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { getSessionTitle } from "./session.js";

const VOICE_BASE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const VOICES_DIR =
  process.platform === "win32"
    ? path.join(VOICE_BASE, "runtime", "piper-voices")
    : path.join(os.homedir(), ".local", "share", "piper-voices");

const TTS_VOICES = {
  amy: { label: "Amy (medium, EN - female)", file: "en_US-amy-medium.onnx" },
  ryan: { label: "Ryan (high, EN)", file: "en_US-ryan-high.onnx" },
  bryce: { label: "Bryce (medium, EN)", file: "en_US-bryce-medium.onnx" },
  sharvard: { label: "Sharvard (medium, ES - female)", file: "es_ES-sharvard-medium.onnx" },
  davefx: { label: "Davefx (medium, ES)", file: "es_ES-davefx-medium.onnx" },
};
const DEFAULT_TTS_VOICE = "sharvard";

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
    return path.join(VOICES_DIR, entry.file);
  }

  function piperOnPath() {
    const pathDirs = (process.env.PATH || "").split(path.delimiter).filter(Boolean);
    const isWin = process.platform === "win32";
    return pathDirs.some(
      (dir) =>
        fs.existsSync(path.join(dir, "piper")) ||
        (isWin && fs.existsSync(path.join(dir, "piper.exe"))),
    );
  }

  async function normalizeForSpeech(text, systemPrompt) {
    logger?.log?.("TTS", `Normalizing speech chars=${text.length}`, "debug");
    return complete({
      system: systemPrompt,
      prompt: `Convert for text-to-speech:\n\n${text}`,
      config: { maxTokens: 4096 },
    });
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
    logger?.log?.("TTS", `Speak requested chars=${line.length} voice=${voiceModel}`, "debug");
    if (!piperOnPath()) {
      logger?.log?.("TTS", `Piper binary not found on PATH`, "warn");
      toast(`Piper binary not found on PATH`, "warning");
      return Promise.resolve();
    }
    if (!fs.existsSync(voiceModel)) {
      logger?.log?.("TTS", `Voice model not found: ${voiceModel}`, "warn");
      toast(`Voice model not found: ${voiceModel}`, "warning");
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let piperStderr = "";
      let playStderr = "";
      playProc =
        process.platform === "win32"
          ? spawn(
              "ffplay",
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

      piperProc = spawn("piper", ["-m", voiceModel, "--output_raw"], {
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
    const sessionTitle = await getSessionTitle(client, sessionID);
    const parts = [];
    if (sessionTitle) parts.push(`Session: ${sessionTitle}.`);
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
    await speakWithSessionPrefix(sessionID, llmResult.text, "Ready for your input.");
  });

  api.event.on("permission.asked", async (event) => {
    if (kv.get("tts.mode", "off") !== "on") return;
    await speakWithSessionPrefix(
      event.properties?.sessionID,
      "Permission requested. Please check your screen.",
    );
  });

  api.event.on("question.asked", async (event) => {
    if (kv.get("tts.mode", "off") !== "on") return;
    await speakWithSessionPrefix(
      event.properties?.sessionID,
      "A question needs your answer. Please check your screen.",
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
    if (!llmResult.text) {
      logger?.log?.("TTS", `Manual normalization failed: ${llmResult.error}`, "warn");
      toast(`TTS normalization failed: ${llmResult.error}`, "warning");
      return;
    }

    logger?.log?.("TTS", `Manual normalization succeeded chars=${llmResult.text.length}`, "debug");
    toast("Speaking last response");
    await speak(llmResult.text);
  }

  // ---- Phone delivery (ntfy audio attachment) ----

  async function sendToNtfy(mp3, topic, logger) {
    try {
      const buf = fs.readFileSync(mp3);
      const form = new FormData();
      form.append("file", new Blob([buf], { type: "audio/mpeg" }), "opencode-voz.mp3");
      form.append("title", "opencode · respuesta por voz");
      const headers = {};
      const token = process.env.NOTIFY_TOKEN || "";
      if (token) headers["Authorization"] = "Bearer " + token;
      const resp = await fetch(`https://ntfy.sh/${topic}`, {
        method: "POST",
        headers,
        body: form,
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

  function synthToNtfy(text, logger) {
    const topic = process.env.NOTIFY_TOPIC || "";
    if (!topic) {
      logger?.log?.("TTS", "NOTIFY_TOPIC not set, cannot send to phone", "warn");
      toast("NOTIFY_TOPIC not set", "warning");
      return Promise.resolve(false);
    }
    const voiceModel = getVoiceModel();
    if (!fs.existsSync(voiceModel)) {
      toast(`Voice model not found: ${voiceModel}`, "warning");
      return Promise.resolve(false);
    }
    const wav = path.join(AUDIO_DIR, `tts_phone_${Date.now()}.wav`);
    const mp3 = wav.replace(/\.wav$/, ".mp3");

    return new Promise((resolve) => {
      let finished = false;
      function finish(ok) {
        if (finished) return;
        finished = true;
        resolve(ok);
      }

      const piper = spawn("piper", ["-m", voiceModel, "-f", wav], {
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
          "ffmpeg",
          ["-y", "-hide_banner", "-loglevel", "error", "-i", wav, "-codec:a", "libmp3lame", "-q:a", "6", mp3],
          { stdio: "ignore" },
        );
        conv.on("error", () => finish(false));
        conv.on("close", (c) => {
          if (c !== 0 || !fs.existsSync(mp3)) {
            finish(false);
            return;
          }
          sendToNtfy(mp3, topic, logger).then(finish);
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
      slash: { name: "tts-speak" },
      onSelect() {
        speakLastResponse();
      },
    },
    {
      title: "TTS: toggle",
      value: "tts.mode",
      description: "Toggle auto text-to-speech on/off",
      keybind: "<leader>v",
      slash: { name: "tts-mode" },
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
      slash: { name: "tts-stop" },
      onSelect() {
        if (stopSpeech()) toast("TTS stopped");
      },
    },
    {
      title: "TTS: select voice",
      value: "tts.voice",
      description: "Choose TTS voice",
      slash: { name: "tts-voice" },
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
      slash: { name: "tts-phone" },
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
        toast("Synthesizing and sending...");
        const ok = await synthToNtfy(llmResult.text, logger);
        toast(ok ? "Audio enviado a tu móvil" : "Error enviando el audio", ok ? "success" : "error");
      },
    },
  ];
}
