// opencode-voice: Speech-to-text and text-to-speech for OpenCode.
//
// STT: Record voice via sox, transcribe with whisper-cpp, normalize with
//      an OpenAI-compatible LLM, append to the TUI prompt.
//
// TTS: Auto-speak assistant responses (or read on demand) via Piper,
//      with LLM normalization for natural speech.
//
// Prerequisites:
//   STT: brew install whisper-cpp sox
//   TTS: Piper binary on PATH, voice models at ~/.local/share/piper-voices/
//
// Configuration via tui.json plugin options:
//   ["opencode-voice", { "endpoint": "...", "model": "...", "apiKeyEnv": "..." }]
//
// Runtime state (model, mic, voice, tts mode) persisted via api.kv.
//
// Commands (PC = -pc, móvil = -cel):
//   /stt-record-pc (ctrl+r)   - start/stop recording + transcribe (PC)
//   /stt-submit-pc (leader+r) - stop recording + transcribe + submit (PC)
//   /stt-stop-pc              - cancel recording
//   /stt-model-pc             - select whisper model
//   /stt-mic-pc               - select microphone
//   /stt-file-cel             - transcribe latest audio from SFTP inbox (mobile)
//   /stt-file-submit-cel      - transcribe latest inbox audio + submit (mobile)
//   /stt-record-cel           - transcribe latest audio pushed via ntfy (mobile)
//   /stt-submit-cel           - transcribe latest ntfy audio + submit (mobile)
//   /tts-speak-pc (leader+s)  - read last response aloud (PC)
//   /tts-mode-pc (leader+v)   - toggle auto TTS on/off
//   /tts-stop-pc (escape)     - stop playback
//   /tts-voice-pc             - select TTS voice
//   /tts-speak-cel            - send last response audio via ntfy push (mobile)

import fs from "node:fs";
import os from "node:os";
import { registerSTT } from "./lib/stt.js";
import { registerTTS } from "./lib/tts.js";
import { createClient } from "./lib/llm-client.js";
import { createLogger } from "./lib/logger.js";

function loadPromptFile(filePath, logger, name) {
  if (!filePath) return null;
  const resolved = filePath.replace(/^~(?=\/|$)/, os.homedir());
  try {
    const prompt = fs.readFileSync(resolved, "utf-8").trim() || null;
    logger?.log(
      "plugin",
      prompt ? `Loaded ${name} prompt: ${resolved}` : `Ignored empty ${name} prompt: ${resolved}`,
      "debug",
    );
    return prompt;
  } catch (err) {
    logger?.log("Plugin", `Failed to load ${name} prompt ${resolved}: ${err.message}`, "warn");
    return null;
  }
}

export default {
  id: "opencode-voice",
  tui: async (api, options) => {
    const { kv } = api;
    const logger = createLogger(api.client);
    logger.log("plugin", "Initializing", "debug");
    const { complete } = createClient(options, logger);

    const prompts = {
      stt: loadPromptFile(options?.sttPrompt, logger, "STT"),
      ttsAuto: loadPromptFile(options?.ttsAutoPrompt, logger, "TTS auto"),
      ttsManual: loadPromptFile(options?.ttsManualPrompt, logger, "TTS manual"),
    };

    const sttCommands = registerSTT(api, kv, complete, prompts, options, logger);
    const ttsCommands = registerTTS(api, kv, complete, prompts, logger);

    api.command.register(() => {
      return [...sttCommands, ...ttsCommands];
    });
  },
};
