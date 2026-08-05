// generate-music.js — generación de música IA (uso GLOBAL, no solo muzicmania).
// Empaqueta cada pista con la ESTRUCTURA de muzicmania (albums/genesis_neon):
//   <out>/<slug>/
//     <slug>.wav            master sin pérdida
//     <slug>.mp3            192k CBR + ID3 (title/artist/album/genre/date/track) + cover integrada
//     <slug>.ogg            Vorbis q5 + metadatos
//     cover.png             portada 1024x1024 (--cover o generada por ffmpeg)
//     banner.png            imagen 16:9 (para web)
//     disc.svg              (omitido si no hay --disc)
//     about_readme.md/.txt  descripción de la pista
//     license.md/.txt       licencia
//     <slug>.json           LOG de generación (proveedor, modelo, prompt, etc.)
//
// Uso:
//   node tools/opencode-ai/generate-music.js --genres "synthwave" --title "Neon Runner" \
//       --album "Genesis Zero" --duration 30 --cover cover.png
//
// Flags:
//   --provider <hf|suno>   (default: hf = MusicGen gratis; suno requiere SUNO_API_KEY)
//   --model <id>           override del modelo.
//   --title <texto>        título (default: untitled).
//   --album <texto>        álbum (default: singles).
//   --artist <texto>       artista (default: CiszukoAntony).
//   --genre <texto>        género para metadatos (default: primer --genre).
//   --genres <csv>         géneros para el prompt musical (same como --genre si solo uno).
//   --year <yyyy>          año (default: actual).
//   --track <n>            número de pista (metadatos).
//   --lyrics <texto>       (suno) letras opcionales.
//   --duration <sec>       duración aprox (hf max ~30s).
//   --count <n>            cuántas pistas.
//   --out <dir>            base de salida (default downloads/test).
//   --cover <path>         portada existente (si no, generada con ffmpeg procedural).
//   --no-cover             no generar cover (solo audio).
//   --no-log               no escribir el JSON.
//
// Claves (vault): HF_TOKEN, SUNO_API_KEY. ffmpeg → tools/opencode-voice/runtime.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { ROOT, readEnvFiles, parseArgs, slugify, slugifyModel, withRetry, findFfmpeg } = require('./lib');

const DEFAULT_OUT = path.join(ROOT, 'downloads', 'test');
const NEON_BG = '0x000230';
const NEON_CYAN = '0x34E2E2';
const NEON_PINK = '0xFF5C90';
const FONTS = ['C:\\Windows\\Fonts\\arialbd.ttf', 'C:\\Windows\\Fonts\\arial.ttf'];

let InferenceClient = null;
try {
  ({ InferenceClient } = require('@huggingface/inference'));
} catch {
  InferenceClient = null;
}

function makeCoverPng(powershell, outPath, title, subtitle, w, h) {
  // Portada/banner vía GDI+ (PowerShell) — sin dependencias ni red
  const script = `
param([string]$Title, [string]$Subtitle, [string]$Out, [int]$W, [int]$H)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap -ArgumentList $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$rect = New-Object System.Drawing.Rectangle -ArgumentList 0, 0, $W, $H
$c1 = [System.Drawing.Color]::FromArgb(0, 2, 48)
$c2 = [System.Drawing.Color]::FromArgb(18, 10, 46)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList $rect, $c1, $c2, 45
$g.FillRectangle($brush, $rect)
$fontTitle = New-Object System.Drawing.Font -ArgumentList 'Arial', ([single]($H/14)), ([System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font -ArgumentList 'Arial', ([single]($H/30)), ([System.Drawing.FontStyle]::Regular)
$cyan = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(52, 226, 226))
$pink = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(255, 92, 144))
$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = [System.Drawing.StringAlignment]::Center
$fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
$titleRect = New-Object System.Drawing.RectangleF -ArgumentList 40, ([single]($H*0.36)), ([single]($W-80)), ([single]($H*0.22))
$g.DrawString($Title, $fontTitle, $cyan, $titleRect, $fmt)
if ($Subtitle) {
  $subRect = New-Object System.Drawing.RectangleF -ArgumentList 40, ([single]($H*0.62)), ([single]($W-80)), ([single]($H*0.1))
  $g.DrawString($Subtitle, $fontSub, $pink, $subRect, $fmt)
}
$y = [int]($H*0.9)
$pen = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(90, 52, 226, 226)), 3
$g.DrawLine($pen, [int]($W*0.2), $y, [int]($W*0.8), $y)
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
`;
  const tmp = path.join(require('os').tmpdir ? path.resolve(ROOT, '.opencode-tmp') : '', 'cover-gen.ps1');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, script, 'utf8');
  try {
    const { spawnSync } = require('child_process');
    const r = spawnSync(powershell, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tmp, '-Title', title, '-Subtitle', subtitle || '', '-Out', outPath, '-W', String(w), '-H', String(h)], { encoding: 'utf8', timeout: 60000 });
    if (r.status !== 0) throw new Error((r.stderr || r.stdout || 'ps fail').slice(0, 200));
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
  return fs.existsSync(outPath) ? outPath : null;
}

async function generateHfMusic(token, prompt, model) {
  if (!InferenceClient) throw new Error('@huggingface/inference no instalado (pnpm install)');
  const client = new InferenceClient(token);
  const out = await withRetry(
    async () =>
      client.textToAudio({
        model: model || 'facebook/musicgen-small',
        inputs: prompt,
        parameters: { max_new_tokens: 256 },
      }),
    `HF textToAudio (${model || 'musicgen'})`
  );
  const blob = Array.isArray(out) ? out[out.length - 1] : out;
  if (!(blob instanceof Blob)) throw new Error(`Respuesta HF inesperada: ${typeof blob}`);
  return Buffer.from(await blob.arrayBuffer());
}

function powershellPath() {
  const p = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  return fs.existsSync(p) ? p : 'powershell';
}

function makeCover(ffmpeg, dir, title, artist) {
  return makeCoverPng(powershellPath(), path.join(dir, 'cover.png'), title, artist, 1024, 1024);
}

function makeBanner(ffmpeg, dir, title) {
  return makeCoverPng(powershellPath(), path.join(dir, 'banner.png'), title, 'CISZU NETWORK', 1600, 900);
}

function escMeta(s) {
  return String(s).replace(/[\\'":]/g, 'x');
}

function writeTextFiles(dir, slug, meta) {
  const { title, artist, album, genre, year, track, provider } = meta;
  const md = `# ${title}\n\n- **Artista**: ${artist}\n- **Álbum**: ${album}\n- **Género**: ${genre}\n- **Año**: ${year}\n- **Pista**: ${track}\n- **Proveedor**: ${provider}\n\n---\nGenerado con Ciszu Network AI (tools/opencode-ai).\n`;
  fs.writeFileSync(path.join(dir, 'about_readme.md'), md);
  fs.writeFileSync(path.join(dir, 'about_readme.txt'), md);
  const lic = 'CC BY-NC 4.0 — CiszukoAntony (Ciszu Network).\n';
  fs.writeFileSync(path.join(dir, 'license.md'), lic);
  fs.writeFileSync(path.join(dir, 'license.txt'), lic);
}

function audioMetaArgs(meta) {
  return [
    '-metadata', `title=${escMeta(meta.title)}`,
    '-metadata', `artist=${escMeta(meta.artist)}`,
    '-metadata', `album=${escMeta(meta.album)}`,
    '-metadata', `genre=${escMeta(meta.genre)}`,
    '-metadata', `date=${meta.year}`,
    '-metadata', `track=${meta.track}`,
    '-metadata', `comment=${escMeta(meta.comment)}`,
  ];
}

function buildMp3(ffmpeg, wav, cover, outPath, meta) {
  const args = ['-v', 'error', '-i', wav];
  if (cover) args.push('-i', cover);
  args.push('-map', '0:a');
  if (cover) args.push('-map', '1:v');
  args.push('-c:a', 'libmp3lame', '-b:a', '192k');
  if (cover) args.push('-c:v', 'mjpeg', '-id3v2_version', '3', '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)');
  args.push(...audioMetaArgs(meta));
  args.push('-metadata', `TBPM=${meta.tbpm}`);
  args.push('-y', outPath);
  execFileSync(ffmpeg, args, { stdio: 'ignore' });
}

function buildOgg(ffmpeg, wav, outPath, meta) {
  const args = ['-v', 'error', '-i', wav, '-c:a', 'libvorbis', '-q:a', '5', ...audioMetaArgs(meta), '-y', outPath];
  execFileSync(ffmpeg, args, { stdio: 'ignore' });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const provider = (args.provider || 'hf').toLowerCase();
  const title = args.title || 'untitled';
  const album = args.album || 'singles';
  const artist = args.artist || 'CiszukoAntony';
  const musicModel = args.model || (provider === 'hf' ? 'facebook/musicgen-small' : 'suno');
  const genres = (args.genres || args.genre || '').split(',').map((s) => s.trim()).filter(Boolean);
  const genre = args.genre || genres[0] || 'Electronic';
  const year = args.year || new Date().getFullYear();
  const duration = args.duration !== undefined ? Number(args.duration) : 20;
  const count = Number(args.count) || 1;
  const outDir = path.resolve(ROOT, args.out || DEFAULT_OUT);
  const coverArg = args.cover || null;
  const wantArt = !args.noCover;
  const noLog = !!args.noLog;
  const lyrics = args.lyrics || null;

  const env = readEnvFiles();
  const tokens = {
    hf: process.env.HF_TOKEN || env.HF_TOKEN,
    suno: process.env.SUNO_API_KEY || env.SUNO_API_KEY,
  };

  if (!['hf', 'suno'].includes(provider)) {
    console.error(`Proveedor desconocido: ${provider} (hf|suno)`);
    process.exit(1);
  }
  if (provider === 'hf' && !tokens.hf) {
    console.error('HF_TOKEN no configurado en el vault.');
    process.exit(1);
  }
  if (provider === 'suno' && !tokens.suno) {
    console.error('SUNO_API_KEY no configurada (suno.com → Account → API keys).');
    process.exit(1);
  }

  const { ffmpeg } = findFfmpeg();
  fs.mkdirSync(outDir, { recursive: true });
  const musicalPrompt = genres.length ? `${title}, ${genres.join(', ')}, immersive electronic` : `${title}, instrumental track`;
  console.log(`[${provider}] música → ${outDir}`);

  for (let i = 0; i < count; i++) {
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const rand = crypto.randomBytes(2).toString('hex');
    const slug = slugify(title) + (count > 1 ? `_${i + 1}` : '');
    const dir = path.join(outDir, slug);
    fs.mkdirSync(dir, { recursive: true });

    const meta = {
      title, artist, album, genre: genre || 'Electronic', year: String(year),
      track: String(args.track || i + 1), comment: `Generado ${new Date().toISOString()} con ${provider}`,
      tbpm: args.bpm || 120, slug,
    };

    let wavBuf;
    if (args.offline && fs.existsSync(args.offline)) {
      console.log(`  [offline] empaquetando ${path.basename(args.offline)}`);
      wavBuf = fs.readFileSync(args.offline);
    } else if (provider === 'hf') {
      wavBuf = await generateHfMusic(tokens.hf, musicalPrompt, args.model);
    } else {
      console.warn('  [suno] generación encolada en la nube — descarga desde el panel de Suno.');
      fs.writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify({ provider, title, note: 'async suno' }, null, 2));
      continue;
    }

    const wav = path.join(dir, `${slug}.wav`);
    fs.writeFileSync(wav, wavBuf);

    // portada
    let cover = null;
    if (wantArt) {
      if (coverArg && fs.existsSync(coverArg)) {
        cover = path.join(dir, 'cover.png');
        fs.copyFileSync(coverArg, cover);
      } else {
        cover = makeCover(ffmpeg, dir, title, artist, genre);
      }
      makeBanner(ffmpeg, dir, title);
    }

    // mp3 + ogg
    const mp3 = path.join(dir, `${slug}.mp3`);
    try { buildMp3(ffmpeg, wav, cover, mp3, meta); } catch { console.warn('  [warn] mp3 falló'); }
    const ogg = path.join(dir, `${slug}.ogg`);
    try { buildOgg(ffmpeg, wav, ogg, meta); } catch { console.warn('  [warn] ogg falló'); }

    writeTextFiles(dir, slug, { ...meta, provider });
    if (!noLog) {
      fs.writeFileSync(
        path.join(dir, `${slug}.json`),
        JSON.stringify(
          {
            audio: [`${slug}.wav`, `${slug}.mp3`, `${slug}.ogg`].filter((f) => fs.existsSync(path.join(dir, f))),
            cover: cover ? 'cover.png' : null,
            banner: fs.existsSync(path.join(dir, 'banner.png')) ? 'banner.png' : null,
            provider,
            model: musicModel,
            title,
            artist,
            album,
            genre,
            year,
            track: meta.track,
            prompt: musicalPrompt,
            duration_requested: duration,
            created_at: new Date().toISOString(),
            size_bytes: wavBuf.length,
            files: fs.readdirSync(dir),
          },
          null,
          2
        )
      );
    }
    console.log(`  ✓ ${slug}/ (${(wavBuf.length / 1024 / 1024).toFixed(1)} MB wav)`);
  }
  console.log('Listo.');
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});