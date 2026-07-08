const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const BASE_DIR = path.resolve(__dirname, '..');
const MUSIC_DIR = path.join(BASE_DIR, 'public', 'music');
const OLD_ALBUM_DIR = path.join(MUSIC_DIR, 'album1');
const NEW_ALBUM_DIR = path.join(MUSIC_DIR, 'genesis_neon');

const TRACKS = [
  {
    id: 'oled_darkness',
    title: 'OLED Darkness',
    artist: 'CiszukoAntony',
    album: 'Genesis Neon',
    year: '2026',
    genre: 'Synthwave',
    genreCode: 65,
    bpm: 110,
    trackNumber: 1,
    description: 'Texturas atmosféricas y líneas de bajo profundas.',
    coverHue: 210,
    icon: '🌑',
  },
  {
    id: 'neon_dreams',
    title: 'Neon Dreams',
    artist: 'CiszukoAntony',
    album: 'Genesis Neon',
    year: '2026',
    genre: 'Synthwave',
    genreCode: 65,
    bpm: 124,
    trackNumber: 2,
    description: 'Una odisea synthwave profunda a través de una metrópolis digital.',
    coverHue: 190,
    icon: '🌃',
  },
  {
    id: 'digital_soul',
    title: 'Digital Soul',
    artist: 'CiszukoAntony',
    album: 'Genesis Neon',
    year: '2026',
    genre: 'Synthwave',
    genreCode: 65,
    bpm: 128,
    trackNumber: 3,
    description: 'El corazón pulsante de la máquina. Melódico y emocional.',
    coverHue: 280,
    icon: '💜',
  },
  {
    id: 'cyber_beat',
    title: 'Cyber Beat',
    artist: 'CiszukoAntony',
    album: 'Genesis Neon',
    year: '2026',
    genre: 'Synthwave',
    genreCode: 65,
    bpm: 140,
    trackNumber: 4,
    description: 'Energía rítmica de alta precisión para máxima concentración.',
    coverHue: 320,
    icon: '⚡',
  },
];

const FFMPEG_PATH = 'C:\\Users\\fplay\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe';

function exec(cmd) {
  const fullCmd = cmd.replace('"ffmpeg"', `"${FFMPEG_PATH}"`);
  console.log(`  >> ${fullCmd}`);
  return execSync(fullCmd, { stdio: 'pipe', encoding: 'utf-8' });
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) { const v = l * 255; return [v, v, v]; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

async function generateCover(track, outputPath) {
  const W = 600, H = 600;
  const hue1 = track.coverHue;
  const hue2 = (hue1 + 60) % 360;

  const c1Rgb = hslToRgb(hue1, 80, 50);
  const c2Rgb = hslToRgb(hue2, 70, 30);

  const svgGradient = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${c1Rgb[0]},${c1Rgb[1]},${c1Rgb[2]})"/>
          <stop offset="100%" style="stop-color:rgb(${c2Rgb[0]},${c2Rgb[1]},${c2Rgb[2]})"/>
        </linearGradient>
        <linearGradient id="sh1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.15)"/>
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.3)"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect width="${W}" height="${H}" fill="url(#sh1)"/>
      <circle cx="${W/2}" cy="${H/2}" r="180" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
      <circle cx="${W/2}" cy="${H/2}" r="130" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
      <circle cx="${W/2}" cy="${H/2}" r="80" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
    </svg>
  `;

  const textSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title { fill: white; font-size: 28px; font-family: Arial, sans-serif; font-weight: bold; text-anchor: middle; }
        .artist { fill: rgba(255,255,255,0.7); font-size: 16px; font-family: Arial, sans-serif; text-anchor: middle; }
        .decor { fill: none; stroke: rgba(255,255,255,0.2); stroke-width: 1; }
      </style>
      <line x1="120" y1="454" x2="480" y2="454" class="decor"/>
      <text x="300" y="420" class="title">${track.title}</text>
      <text x="300" y="445" class="artist">${track.artist}</text>
      <text x="300" y="500" class="artist" font-size="11" fill="rgba(255,255,255,0.35)">${track.album}</text>
    </svg>
  `;

  await sharp(Buffer.from(svgGradient))
    .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
    .png()
    .toFile(outputPath);

  console.log(`  Cover generated: ${outputPath}`);
}

async function processTrack(track) {
  const trackDir = path.join(NEW_ALBUM_DIR, track.id);
  const oldMp3 = path.join(OLD_ALBUM_DIR, `${track.id}.mp3`);
  const newMp3 = path.join(trackDir, 'audio.mp3');
  const newOgg = path.join(trackDir, 'audio.ogg');
  const coverPath = path.join(trackDir, 'cover.png');
  const licensePath = path.join(trackDir, 'license.txt');

  // Create directory
  fs.mkdirSync(trackDir, { recursive: true });
  console.log(`\n=== Processing: ${track.title} ===`);

  // Copy MP3
  fs.copyFileSync(oldMp3, newMp3);
  console.log(`  MP3 copied to ${newMp3}`);

  // Generate cover
  await generateCover(track, coverPath);

  // Convert to OGG
  console.log('  Converting to OGG...');
  exec(`"ffmpeg" -i "${newMp3}" -c:a libvorbis -q:a 5 -y "${newOgg}"`);

  // Add metadata + cover art to MP3
  console.log('  Adding metadata to MP3...');
  const metadataCmd = [
    `"ffmpeg" -i "${newMp3}" -i "${coverPath}"`,
    '-map 0:a -map 1',
    '-c copy -c:v mjpeg',
    `-metadata title="${track.title}"`,
    `-metadata artist="${track.artist}"`,
    `-metadata album="${track.album}"`,
    `-metadata date="${track.year}"`,
    `-metadata genre="${track.genre}"`,
    `-metadata track="${track.trackNumber}"`,
    `-metadata description="${track.description}"`,
    `-metadata:s:v title="Album cover"`,
    `-metadata:s:v comment="Cover (front)"`,
    `-disposition:v attached_pic`,
    `-y "${newMp3}.tmp.mp3"`,
  ].join(' ');
  exec(metadataCmd);
  fs.renameSync(`${newMp3}.tmp.mp3`, newMp3);

  // Add text metadata to OGG (Vorbis comments - no embedded cover, OGG doesn't support it)
  console.log('  Adding metadata to OGG...');
  const oggMetaCmd = [
    `"ffmpeg" -i "${newOgg}"`,
    '-c copy',
    `-metadata title="${track.title}"`,
    `-metadata artist="${track.artist}"`,
    `-metadata album="${track.album}"`,
    `-metadata date="${track.year}"`,
    `-metadata genre="${track.genre}"`,
    `-metadata track="${track.trackNumber}"`,
    `-metadata description="${track.description}"`,
    `-y "${newOgg}.tmp.ogg"`,
  ].join(' ');
  exec(oggMetaCmd);
  fs.renameSync(`${newOgg}.tmp.ogg`, newOgg);

  // Create license file
  const license = `Track: ${track.title}
Artist: ${track.artist}
Album: ${track.album}
Year: ${track.year}
Genre: ${track.genre}
BPM: ${track.bpm}

Copyright: © ${track.year} CiszukoAntony Music
License: All Rights Reserved

Generated with ACE Music (ACE-Step 1.5)
`;
  fs.writeFileSync(licensePath, license, 'utf-8');
  console.log(`  License created: ${licensePath}`);

  // Verify files
  const mp3Size = fs.statSync(newMp3).size;
  const oggSize = fs.statSync(newOgg).size;
  const coverSize = fs.statSync(coverPath).size;
  console.log(`  Files: audio.mp3 (${(mp3Size/1024).toFixed(0)} KB), audio.ogg (${(oggSize/1024).toFixed(0)} KB), cover.png (${(coverSize/1024).toFixed(0)} KB)`);
}

async function main() {
  console.log('=== Restructuring audio files ===\n');

  // Create new album directory
  fs.mkdirSync(NEW_ALBUM_DIR, { recursive: true });

  // Process each track
  for (const track of TRACKS) {
    await processTrack(track);
  }

  // Remove old album directory
  if (fs.existsSync(OLD_ALBUM_DIR)) {
    fs.rmSync(OLD_ALBUM_DIR, { recursive: true, force: true });
    console.log(`\nRemoved old directory: ${OLD_ALBUM_DIR}`);
  }

  console.log('\n=== Restructuring complete! ===');
  console.log(`New structure: ${NEW_ALBUM_DIR}/`);
  for (const track of TRACKS) {
    console.log(`  ${track.id}/`);
    console.log(`    audio.mp3`);
    console.log(`    audio.ogg`);
    console.log(`    cover.png`);
    console.log(`    license.txt`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
