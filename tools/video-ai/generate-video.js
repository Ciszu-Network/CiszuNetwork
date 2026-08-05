// generate-video.js — generación de vídeo IA (plan fase 1: HF serverless, gratis).
//
// Uso:
//   node tools/video-ai/generate-video.js --prompt "neon city rain, cyberpunk" \
//       --title "Neon Rain" --out downloads/test
//
// Flags:
//   --provider <hf>       solo HF por ahora (fase 1). API HTTP de HF Inference.
//   --model <id>          override (default: Wan-AI/Wan2.1-T2V-1.3B; fallback LTX-Video).
//   --prompt <texto>      descripción del vídeo (requerido).
//   --title <texto>       título (metadatos) (default: slug del prompt).
//   --album <texto>       álbum/colección (metadatos; default 'singles').
//   --artist <texto>      artista (default: CiszukoAntony).
//   --description <texto> descripción extra (metadatos).
//   --count <n>           cuántos vídeos (default 1).
//   --out <dir>           carpeta de salida (default downloads/test).
//   --no-poster           no extraer poster.png del vídeo.
//   --no-log              no escribir JSON de log.
//
// Salida por vídeo (estructura tipo muzicmania, adaptada a vídeo):
//   <out>/<slug>/<slug>.mp4      (h264+aac, con metadatos title/artist/album)
//   <out>/<slug>/poster.png      (frame 0 como thumbnail)
//   <out>/<slug>/<slug>.json     (log completo)
//   <out>/<slug>/about_readme.txt (info)
//
// Claves: HF_TOKEN (vault). Red: HF requiere DNS estable (si falla, VPN).
// Nota: los modelos de vídeo serverless pueden estar fríos (~1-3 min el primer hit) o
// en cola; el script hace retry y probar modelos de la lista en orden.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { ROOT, readEnvFiles, parseArgs, slugify, slugifyModel, withRetry, findFfmpeg } = require('../shared/lib');

const DEFAULT_OUT = path.join(ROOT, 'downloads', 'test');
const VIDEO_MODELS = [
  { id: 'Wan-AI/Wan2.1-T2V-1.3B', short: 'wan21' },
  { id: 'Lightricks/LTX-Video', short: 'ltx' },
];
const FAL_VIDEO_MODELS = [
  { id: 'fal-ai/wan-25-preview/text-to-video', short: 'wan25' },
];

async function generateFalVideo(key, model, prompt) {
  const url = `https://queue.fal.run/${model}/inference`;
  const info = { status: 'started', url: null };
  await withRetry(
    async () => {
      const r = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(120000),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) {
        const msg = data?.detail || data?.message || data?.error || `HTTP ${r.status}`;
        throw Object.assign(new Error(String(msg).slice(0, 220)), { status: r.status });
      }
      if (data?.status_url) info.url = data.status_url;
      else throw new Error('fal.ai no devolvió status_url');
      return data;
    },
    `fal submit (${model})`
  );

  let result = null;
  for (let attempt = 1; attempt <= 40; attempt++) {
    await new Promise((r) => setTimeout(r, 8000));
    const r = await fetch(info.url, {
      headers: { Authorization: `Key ${key}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(120000),
    });
    const data = await r.json().catch(() => null);
    if (!r.ok) throw new Error(`fal poll HTTP ${r.status}: ${JSON.stringify(data).slice(0, 200)}`);
    if (data?.status === 'ERROR' || data?.error) throw new Error(data?.error || 'fal status ERROR');
    if (data?.status === 'COMPLETED') {
      result = data;
      break;
    }
    if (data?.status !== 'IN_QUEUE' && data?.status !== 'IN_PROGRESS' && data?.status !== 'SUBMITTED') {
      throw new Error(`fal poll estado desconocido: ${JSON.stringify(data).slice(0, 150)}`);
    }
    process.stdout.write(`  …fal ${data.status} (${attempt * 8}s)\r`);
    if (attempt === 40) throw new Error('fal.ai tardó demasiado (5 min de poll)');
  }

  const videoUrl = result?.video?.url || result?.output?.video?.url || result?.url;
  if (!videoUrl) throw new Error(`fal.ai no devolvió url: ${JSON.stringify(result).slice(0, 200)}`);
  const bin = await withRetry(
    async () => {
      const r = await fetch(videoUrl);
      if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status });
      return Buffer.from(await r.arrayBuffer());
    },
    'descarga fal-bin'
  );
  return bin;
}

async function generateHfVideo(token, model, prompt, hfProvider) {
  const url = `https://router.huggingface.co/models/${model}`;
  const body = hfProvider ? { inputs: prompt, provider: hfProvider, parameters: {} } : { inputs: prompt, parameters: {} };
  const res = await withRetry(
    async () => {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(240000),
      });
      if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status} ${(await r.text().catch(() => '')).slice(0, 200)}`), { status: r.status });
      return r;
    },
    `HF video (${model})`
  );
  const data = await res.json();
  const videoUrl = data?.url || data?.video_url || (Array.isArray(data) && data[0]?.url);
  if (!videoUrl) throw new Error(`HF no devolvió url de vídeo: ${JSON.stringify(data).slice(0, 200)}`);
  const bin = await withRetry(
    async () => {
      const r = await fetch(videoUrl);
      if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status });
      return Buffer.from(await r.arrayBuffer());
    },
    'descarga mp4'
  );
  return bin;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const provider = (args.provider || 'hf').toLowerCase();
  const prompt = args.prompt;
  const title = args.title || slugify(prompt || 'video');
  const album = args.album || 'singles';
  const artist = args.artist || 'CiszukoAntony';
  const description = args.description || '';
  const count = Number(args.count) || 1;
  const outDir = path.resolve(ROOT, args.out || DEFAULT_OUT);
  const noPoster = !!args.noPoster;
  const noLog = !!args.noLog;
    const hfProvider = args.hfProvider || args['hf-provider'] || null;

  if (!prompt) {
    console.error('Falta --prompt (descripción del vídeo).');
    console.error('  node tools/video-ai/generate-video.js --prompt "un gato en la ciudad de noche, anime"');
    process.exit(1);
  }
  if (provider !== 'hf' && provider !== 'fal') {
    console.error(`Proveedor no soportado aún: ${provider} (solo hf|fal en fase 1).`);
    process.exit(1);
  }
  const env = readEnvFiles();
  const token = process.env.HF_TOKEN || env.HF_TOKEN;
  if (provider === 'hf' && !token) {
    console.error('HF_TOKEN no configurado en el vault.');
    process.exit(1);
  }
  const falKey = process.env.FAL_KEY || env.FAL_KEY;
  if (provider === 'fal' && !falKey) {
    console.error('FAL_KEY no configurada en el vault.');
    process.exit(1);
  }

  const { ffmpeg } = findFfmpeg();
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`[${provider}] vídeo (${count}) → ${outDir}`);
  console.log(`  prompt: ${prompt.slice(0, 110)}…`);

  for (let i = 0; i < count; i++) {
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const rand = crypto.randomBytes(2).toString('hex');
    const slug = slugify(title) + (count > 1 ? `_${i + 1}` : '');
    const dir = path.join(outDir, slug);
    fs.mkdirSync(dir, { recursive: true });

    const mp4 = path.join(dir, `${slug}.mp4`);
    const poster = path.join(dir, 'poster.png');
    let buf = null;
    let usedModel = args.model || null;

    if (args.model) {
      if (provider === 'fal') {
        const info = FAL_VIDEO_MODELS.find((m) => m.id === args.model) || { id: args.model, short: slugifyModel(args.model) };
        buf = await generateFalVideo(falKey, info.id, prompt);
        usedModel = info.id;
      } else {
        const info = VIDEO_MODELS.find((m) => m.id === args.model) || { id: args.model, short: slugifyModel(args.model) };
        buf = await generateHfVideo(token, info.id, prompt, hfProvider);
        usedModel = info.id;
      }
    } else {
      const candidates = provider === 'fal' ? FAL_VIDEO_MODELS : VIDEO_MODELS;
      for (const m of candidates) {
        console.log(`  [${m.short}] intentando ${m.id} …`);
        try {
          buf = provider === 'fal'
            ? await generateFalVideo(falKey, m.id, prompt)
            : await generateHfVideo(token, m.id, prompt, hfProvider);
          usedModel = m.id;
          break;
        } catch (e) {
          console.warn(`  ✗ ${m.id}: ${e.message.slice(0, 140)}`);
        }
      }
    }
    if (!buf) {
      console.error('  Ningún modelo devolvió vídeo (¿VPN? ¿modelo frío/gated?).');
      process.exit(1);
    }

    fs.writeFileSync(mp4, buf);

    // metadatos en el mp4 (ffmpeg remux rápido sin reencode)
    try {
      const meta = ['-i', mp4, '-c', 'copy'];
      meta.push('-metadata', `title=${title}`);
      meta.push('-metadata', `artist=${artist}`);
      meta.push('-metadata', `album=${album}`);
      if (description) meta.push('-metadata', `comment=${description}`);
      meta.push('-y', mp4);
      execFileSync(ffmpeg, meta, { stdio: 'ignore' });
    } catch {
      console.warn('  [warn] no se pudieron escribir metadatos mp4 (remux)');
    }

    // poster = frame 0
    if (!noPoster) {
      try {
        execFileSync(ffmpeg, ['-v', 'error', '-i', mp4, '-frames:v', '1', '-y', poster], { stdio: 'ignore' });
      } catch {
        console.warn('  [warn] no se pudo extraer poster');
      }
    }

    const metaFile = path.join(dir, `${slug}.json`);
    if (!noLog) {
      fs.writeFileSync(
        metaFile,
        JSON.stringify(
          {
            video: `${slug}.mp4`,
            poster: noPoster ? null : 'poster.png',
            provider,
            model: usedModel,
            title,
            artist,
            album,
            description,
            prompt,
            size_bytes: buf.length,
            created_at: new Date().toISOString(),
          },
          null,
          2
        )
      );
    }

    const readme = path.join(dir, 'about_readme.txt');
    fs.writeFileSync(
      readme,
      `${title}\nArtista: ${artist}\nÁlbum: ${album}\nModelo: ${usedModel}\nPrompt: ${prompt}\nGenerado: ${new Date().toISOString()}\n`
    );

    console.log(`  ✓ ${slug}/ (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);
  }
  console.log('Listo.');
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});