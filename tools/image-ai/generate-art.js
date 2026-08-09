// generate-art.js — generación de arte IA siguiendo la biblia ART_GUIDE.md (§8).
// Estilo: clean anime illustration, Ghelber aesthetic (Artist G).
//
// Uso:
//   node scripts/generate-art.js --provider hf --subject "a cute cyberpunk female hacker" \
//       --outfit "wearing a fitted high-collar techwear jacket" \
//       --expression "dynamic standing pose with confident smirk"
//
// Flags:
//   --provider <hf|gemini|siliconflow>   proveedor (default: hf). hf = Hugging Face Inference
//                                        (FLUX.1-schnell); gemini = Google Gemini; siliconflow = SiliconFlow.
//   --subject <texto>                    placeholder [SUBJECT] (default: ejemplo oficial §8.4)
//   --outfit <texto>                     placeholder [OUTFIT_AND_ACCESSORIES]
//   --expression <texto>                 placeholder [EXPRESSION_AND_POSE]
//   --negative <texto>                   prompt negativo (default: §8.3 oficial)
//   --width <px>                         ancho (default: 1024)
//   --height <px>                        alto (default: 576, ratio 16:9)
//   --count <n>                          cuántas imágenes (default: 1)
//   --out <dir>                          carpeta de salida (default: test/art)
//   --name <base>                        nombre SOLO del PNG (default: nomenclatura técnica).
//                                        Con --name el PNG sale como <name>.png (p.ej. ciszuko_volcan.png)
//                                        y el JSON conserva la nomenclatura técnica completa:
//                                        <service>_<modelo_corto>_<name>_<fecha>_<hex4>.json
//   --model <id>                         override del modelo
//   --prompt <texto>                     prompt completo (overrides la plantilla §8.1 con placeholders)
//   --format <png|jpeg>                  formato de salida (default: png; jpeg requiere sharp instalado)
//   --transparent                        tras generar, encadena scripts/remove-bg.js (chroma) → <name>_transparent.png
//   --bg-method <chroma|birefnet>        método de remove-bg para --transparent (default: chroma)
//   --no-log                             no escribir el JSON de log por imagen
//
// Nomenclatura de salida (sin --name):
//   <service>_<modelo_corto>_<name>_<YYYYMMDDHHMMSS>_<hex4>.png
//   Ej.: hf_fluxschnell_hacker_20260805012529_3ba8.png
//   Service values: hf (Hugging Face), gemini (Google), siliconflow (SiliconFlow).
//
// Logs: junto a cada PNG se escribe <nombre>.json con prompt, negative, subject, outfit,
// expression, servicio, modelo completo, dimensiones y timestamp.
//
// Claves (vault services/supabase/.env o .env.local): HF_TOKEN, GEMINI_API_KEY, SILICONFLOW_API_KEY.
// Nota de red: HF Inference Providers requiere DNS estable (si falla, activar VPN).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_OUT = path.join(ROOT, 'test', 'art');

let InferenceClient = null;
try {
  ({ InferenceClient } = require('@huggingface/inference'));
} catch {
  InferenceClient = null;
}

const PROMPT_TEMPLATE =
  '[SUBJECT], [OUTFIT_AND_ACCESSORIES], [EXPRESSION_AND_POSE], full body shot, whole character visible from head to toe, not cropped, style of clean anime illustration, Ghelber aesthetic, bold clean lineart with varied line weight, T-junction emphasis, flat cel-shading with hard shadow edges, vibrant solid color blocks, expressive oversized anime eyes with vivid highlights, chunky hair style with sharp ends, professional character concept art, solid color horizontal background stripe';

const NEGATIVE_STANDARD =
  'photograph, 3d render, painterly, textured brushstrokes, soft shading, gradients, lowres, blurry, bad anatomy, deformed, extra limbs, watermark, sketchy lines, soft edges, realistic skin texture';

const DEFAULTS = {
  subject: 'a cute cyberpunk female hacker',
  outfit: 'wearing a fitted high-collar techwear jacket',
  expression: 'dynamic standing pose with confident smirk',
};

const PROVIDERS = {
  hf: {
    label: 'Hugging Face Inference',
    defaultModel: 'black-forest-labs/FLUX.1-schnell',
    modelShort: 'fluxschnell',
  },
  gemini: {
    label: 'Google Gemini',
    defaultModel: 'gemini-2.5-flash-preview-image',
    modelShort: 'gem25flash',
  },
  siliconflow: {
    label: 'SiliconFlow',
    defaultModel: 'black-forest-labs/FLUX.1-schnell',
    modelShort: 'fluxschnell',
  },
};

function slugifyModel(model) {
  return model
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 20) || 'model';
}

function readEnvFiles() {
  const files = [
    path.join(ROOT, '.env.local'),
    path.join(ROOT, 'services', 'supabase', '.env'),
  ];
  const vars = {};
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
      const idx = line.indexOf('=');
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in vars)) vars[key] = value;
    }
  }
  return vars;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

async function withRetry(fn, label, attempts = 4) {
  const delays = [2000, 6000, 15000];
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      const status = e?.status || e?.code || '';
      if (status === 404 || status === 401 || status === 403) throw e;
      if (attempt < delays.length) {
        console.warn(`  [retry ${attempt + 1}/${delays.length}] ${label}: ${status || e.message} → reintento en ${delays[attempt]}ms`);
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
  }
  throw new Error(`${label} falló tras ${attempts} intentos: ${lastError?.message || lastError}`);
}

async function generateHf(token, prompt, negative, width, height, model) {
  if (!InferenceClient) throw new Error('@huggingface/inference no instalado (pnpm install)');
  const client = new InferenceClient(token);
  const out = await withRetry(
    async () =>
      client.textToImage({
        model: model || 'black-forest-labs/FLUX.1-schnell',
        inputs: prompt,
        parameters: { width, height, negative_prompt: negative },
      }),
    'HF textToImage'
  );
  if (!(out instanceof Blob)) throw new Error(`Respuesta HF inesperada: ${typeof out}`);
  return Buffer.from(await out.arrayBuffer());
}

async function generateGemini(token, prompt, negative, width, height, model) {
  if (!token) throw new Error('GEMINI_API_KEY no configurada en el vault');
  const resolved = model || 'gemini-2.5-flash-preview-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolved}:generateContent?key=${token}`;
  const body = {
    contents: [{ parts: [{ text: `${prompt}\nNegative: ${negative}` }] }],
    generationConfig: { imageConfig: { aspectRatio: `${width}:${height}` } },
  };
  const res = await withRetry(
    async () => {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status });
      return r;
    },
    'Gemini generateContent'
  );
  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part?.inlineData?.data) throw new Error('Gemini no devolvió inlineData (¿quota limit: 0?)');
  return Buffer.from(part.inlineData.data, 'base64');
}

async function generateSiliconflow(token, prompt, negative, width, height, model) {
  if (!token) throw new Error('SILICONFLOW_API_KEY no configurada en el vault');
  const url = 'https://api.siliconflow.com/v1/images/generations';
  const body = {
    model: model || 'black-forest-labs/FLUX.1-schnell',
    prompt,
    negative_prompt: negative,
    image_size: `${width}x${height}`,
  };
  const res = await withRetry(
    async () => {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status} ${await r.text().catch(() => '')}`), { status: r.status });
      return r;
    },
    'SiliconFlow generations'
  );
  const data = await res.json();
  const b64 = data?.images?.[0]?.url;
  if (!b64) throw new Error(`SiliconFlow sin imagen: ${JSON.stringify(data).slice(0, 200)}`);
  const bin = await withRetry(
    async () => {
      const r = await fetch(b64);
      if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status });
      return Buffer.from(await r.arrayBuffer());
    },
    'SiliconFlow fetch imagen'
  );
  return bin;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const provider = (args.provider || 'hf').toLowerCase();
  const subject = args.subject || DEFAULTS.subject;
  const outfit = args.outfit || DEFAULTS.outfit;
  const expression = args.expression || DEFAULTS.expression;
  const negative = args.negative || NEGATIVE_STANDARD;
  const width = Number(args.width) || 1024;
  const height = Number(args.height) || 576;
  const count = Number(args.count) || 1;
  const outDir = path.resolve(ROOT, args.out || DEFAULT_OUT);
  const nameBase = args.name || 'art';
  const cleanName = args.name || null;
  const format = (args.format || 'png').toLowerCase();
  const wantTransparent = !!args.transparent;
  const bgMethod = (args['bg-method'] || 'chroma').toLowerCase();
  const noLog = !!args.noLog;

  if (!['png', 'jpeg'].includes(format)) {
    console.error(`Formato desconocido: ${format} (png|jpeg)`);
    process.exit(1);
  }
  if (wantTransparent && format === 'jpeg') {
    console.error('--transparent solo aplica a PNG (el JPEG no soporta alpha)');
    process.exit(1);
  }

  if (!['hf', 'gemini', 'siliconflow'].includes(provider)) {
    console.error(`Proveedor desconocido: ${provider} (hf|gemini|siliconflow)`);
    process.exit(1);
  }

  const env = readEnvFiles();
  const tokens = {
    hf: process.env.HF_TOKEN || env.HF_TOKEN,
    gemini: process.env.GEMINI_API_KEY || env.GEMINI_API_KEY,
    siliconflow: process.env.SILICONFLOW_API_KEY || env.SILICONFLOW_API_KEY,
  };

  const providerInfo = PROVIDERS[provider];
  const model = args.model || providerInfo.defaultModel;
  const modelShort = args.model ? slugifyModel(args.model) : providerInfo.modelShort;

  const prompt = args.prompt || PROMPT_TEMPLATE
    .replace('[SUBJECT]', subject)
    .replace('[OUTFIT_AND_ACCESSORIES]', outfit)
    .replace('[EXPRESSION_AND_POSE]', expression);

  fs.mkdirSync(outDir, { recursive: true });
  console.log(`[${provider}] generando ${count} imagen(es) ${width}x${height} → ${outDir}`);
  console.log(`  prompt: ${prompt.slice(0, 110)}…`);

  for (let i = 0; i < count; i++) {
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const rand = crypto.randomBytes(2).toString('hex');
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const technicalBase = `${provider}_${modelShort}_${nameBase}_${stamp}_${rand}`;
    const imageFile = cleanName ? `${cleanName}.${ext}` : `${technicalBase}.${ext}`;
    const logFile = `${technicalBase}.json`;
    let buf;
    if (provider === 'hf') {
      buf = await generateHf(tokens.hf, prompt, negative, width, height, model);
    } else if (provider === 'gemini') {
      buf = await generateGemini(tokens.gemini, prompt, negative, width, height, model);
    } else {
      buf = await generateSiliconflow(tokens.siliconflow, prompt, negative, width, height, model);
    }
    if (format === 'jpeg') {
      buf = await toJpeg(buf);
    }
    const imagePath = path.join(outDir, imageFile);
    fs.writeFileSync(imagePath, buf);
    if (!noLog) {
      fs.writeFileSync(
        path.join(outDir, logFile),
        JSON.stringify(
          {
            image: imageFile,
            created_at: new Date().toISOString(),
            service: providerInfo.label,
            provider,
            model,
            width,
            height,
            prompt,
            negative_prompt: negative,
            subject,
            outfit,
            expression,
            size_bytes: buf.length,
            transparent: wantTransparent,
          },
          null,
          2
        )
      );
    }
    console.log(`  ✓ ${imageFile} (${(buf.length / 1024).toFixed(0)} KB)` + (noLog ? ' (sin log)' : ` + ${logFile}`));
    if (wantTransparent) {
      const transparentFile = `${cleanName || technicalBase}_transparent.png`;
      execFileSync(
        process.execPath,
        [
          path.join(ROOT, 'tools', 'removebg-ai', 'remove-bg.js'),
          '--input',
          imagePath,
          '--output',
          path.join(outDir, transparentFile),
          '--method',
          bgMethod,
        ],
        { stdio: 'inherit' }
      );
    }
  }
  console.log('Listo.');
}

async function toJpeg(buf) {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.warn('  [warn] sharp no instalado → se guarda como PNG (--format jpeg requiere: pnpm add -w sharp)');
    return buf;
  }
  return await sharp(buf).jpeg({ quality: 92 }).toBuffer();
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});