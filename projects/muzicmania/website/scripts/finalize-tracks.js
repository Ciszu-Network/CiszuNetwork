const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const crypto = require('crypto');
const sharp = require('sharp');

const FFMPEG_PATH = 'C:\\Users\\fplay\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe';
const BASE_DIR = path.resolve(__dirname, '..');
const ALBUM_DIR = path.join(BASE_DIR, 'public', 'music', 'genesis_neon');

const ALBUM_INFO = {
  name: 'Genesis Neon',
  slug: 'genesis_neon',
  artist: 'CiszukoAntony',
  year: '2026',
  genre: 'Synthwave / Electronic',
  description: 'Cuatro pistas de synthwave instrumental que exploran la intersección entre la energía humana y la precisión digital. Desde texturas atmosféricas hasta ritmos de alta velocidad, Genesis Neon es un viaje a través de una metrópolis digital iluminada por neón.',
  coverHue: 260,
};

const TRACKS = [
  {
    id: 'oled_darkness',
    title: 'OLED Darkness',
    artist: ALBUM_INFO.artist,
    album: ALBUM_INFO.name,
    year: ALBUM_INFO.year,
    genre: 'Atmospheric Synthwave',
    bpm: 110,
    trackNumber: 1,
    duration: '5:01',
    durationSec: 301,
    description: 'Texturas atmosféricas y líneas de bajo profundas. Una pieza oscura y envolvente que evoca la inmensidad del espacio digital.',
    copyright: '© 2026 CiszukoAntony Music. All Rights Reserved.',
    coverHue: 210,
    coverShape: 'triangle',
  },
  {
    id: 'neon_dreams',
    title: 'Neon Dreams',
    artist: ALBUM_INFO.artist,
    album: ALBUM_INFO.name,
    year: ALBUM_INFO.year,
    genre: 'Synthwave',
    bpm: 124,
    trackNumber: 2,
    duration: '3:45',
    durationSec: 225,
    description: 'Una odisea synthwave profunda a través de una metrópolis digital. Ritmos envolventes y melodías brillantes.',
    copyright: '© 2026 CiszukoAntony Music. All Rights Reserved.',
    coverHue: 190,
    coverShape: 'diamond',
  },
  {
    id: 'digital_soul',
    title: 'Digital Soul',
    artist: ALBUM_INFO.artist,
    album: ALBUM_INFO.name,
    year: ALBUM_INFO.year,
    genre: 'Melodic Electronic',
    bpm: 128,
    trackNumber: 3,
    duration: '4:12',
    durationSec: 252,
    description: 'El corazón pulsante de la máquina. Melódico y emocional, fusionando la sensibilidad humana con la precisión digital.',
    copyright: '© 2026 CiszukoAntony Music. All Rights Reserved.',
    coverHue: 280,
    coverShape: 'circle',
  },
  {
    id: 'cyber_beat',
    title: 'Cyber Beat',
    artist: ALBUM_INFO.artist,
    album: ALBUM_INFO.name,
    year: ALBUM_INFO.year,
    genre: 'Cyberpunk Electronic',
    bpm: 140,
    trackNumber: 4,
    duration: '3:28',
    durationSec: 208,
    description: 'Energía rítmica de alta precisión para máxima concentración. El track más intenso del álbum.',
    copyright: '© 2026 CiszukoAntony Music. All Rights Reserved.',
    coverHue: 330,
    coverShape: 'hexagon',
  },
];

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
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

function shapePolygon(cx, cy, r, sides) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(0)},${(cy + Math.sin(a) * r).toFixed(0)}`);
  }
  return pts.join(' ');
}

async function generateCover(track, outputPath) {
  const W = 600, H = 600;
  const hue1 = track.coverHue;
  const hue2 = (hue1 + 45) % 360;
  const hue3 = (hue1 + 90) % 360;

  const c1 = hslToRgb(hue1, 85, 55);
  const c2 = hslToRgb(hue2, 70, 30);
  const cLight = hslToRgb(hue3, 60, 75);

  let shapeSvg = '';
  const cx = W/2, cy = H/2;

  switch (track.coverShape) {
    case 'triangle':
      shapeSvg = `<polygon points="${shapePolygon(cx, cy, 160, 3)}" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.25)" stroke-width="2"/>
        <polygon points="${shapePolygon(cx, cy, 110, 3)}" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.15)" stroke-width="1"/>
        <polygon points="${shapePolygon(cx, cy, 60, 3)}" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.1)" stroke-width="0.5"/>`;
      break;
    case 'diamond':
      shapeSvg = `<polygon points="${shapePolygon(cx, cy, 170, 4)}" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.25)" stroke-width="2"/>
        <polygon points="${shapePolygon(cx, cy, 115, 4)}" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.15)" stroke-width="1"/>
        <polygon points="${shapePolygon(cx, cy, 60, 4)}" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.1)" stroke-width="0.5"/>`;
      break;
    case 'circle':
      shapeSvg = `<circle cx="${cx}" cy="${cy}" r="165" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.25)" stroke-width="2"/>
        <circle cx="${cx}" cy="${cy}" r="115" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.15)" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="65" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.1)" stroke-width="0.5"/>`;
      break;
    case 'hexagon':
      shapeSvg = `<polygon points="${shapePolygon(cx, cy, 175, 6)}" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.25)" stroke-width="2"/>
        <polygon points="${shapePolygon(cx, cy, 120, 6)}" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.15)" stroke-width="1"/>
        <polygon points="${shapePolygon(cx, cy, 65, 6)}" fill="none" stroke="rgba(${cLight[0]},${cLight[1]},${cLight[2]},0.1)" stroke-width="0.5"/>`;
      break;
  }

  const svg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${c1[0]},${c1[1]},${c1[2]})"/>
          <stop offset="50%" style="stop-color:rgb(${c2[0]},${c2[1]},${c2[2]})"/>
          <stop offset="100%" style="stop-color:rgb(0,0,0)"/>
        </linearGradient>
        <linearGradient id="sh1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.12)"/>
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.4)"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect width="${W}" height="${H}" fill="url(#sh1)"/>
      ${shapeSvg}
      <line x1="120" y1="454" x2="480" y2="454" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <text x="300" y="420" text-anchor="middle" fill="white" font-size="26" font-family="Arial, sans-serif" font-weight="bold">${track.title}</text>
      <text x="300" y="445" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="15" font-family="Arial, sans-serif">${track.artist}</text>
      <text x="300" y="495" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="11" font-family="Arial, sans-serif">${track.album}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`  Cover: ${path.basename(outputPath)}`);
}

async function generateAlbumCover() {
  const W = 600, H = 600;
  const hue1 = ALBUM_INFO.coverHue;
  const hue2 = (hue1 + 120) % 360;
  const c1 = hslToRgb(hue1, 80, 50);
  const c2 = hslToRgb(hue2, 70, 25);

  const svg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${c1[0]},${c1[1]},${c1[2]})"/>
          <stop offset="100%" style="stop-color:rgb(${c2[0]},${c2[1]},${c2[2]})"/>
        </linearGradient>
        <linearGradient id="sh1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.1)"/>
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.3)"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect width="${W}" height="${H}" fill="url(#sh1)"/>
      <polygon points="${shapePolygon(300,300,190,8)}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <polygon points="${shapePolygon(300,300,130,8)}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
      <polygon points="${shapePolygon(300,300,70,8)}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
      <line x1="120" y1="444" x2="480" y2="444" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <text x="300" y="410" text-anchor="middle" fill="white" font-size="28" font-family="Arial, sans-serif" font-weight="bold">${ALBUM_INFO.name}</text>
      <text x="300" y="438" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="14" font-family="Arial, sans-serif">${ALBUM_INFO.artist}</text>
      <text x="300" y="480" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="11" font-family="Arial, sans-serif">${TRACKS.length} tracks \u00B7 ${ALBUM_INFO.genre}</text>
    </svg>
  `;

  const outPath = path.join(ALBUM_DIR, 'cover.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`  Album cover: cover.png`);
}

function wrap(str, width) {
  if (!str || str.length <= width) return str || '';
  const words = str.split(' ');
  let lines = '', line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > width) {
      lines += line.trim() + '\n';
      line = w + ' ';
    } else {
      line += w + ' ';
    }
  }
  return (lines + line.trim());
}

function createTrackDocs(track) {
  const dir = path.join(ALBUM_DIR, track.id);

  // license.md
  const licenseMD = `# License — ${track.title}

**Track:** ${track.title}
**Artist:** ${track.artist}
**Album:** ${track.album}
**Year:** ${track.year}
**Genre:** ${track.genre}
**Duration:** ${track.duration}
**BPM:** ${track.bpm}

---

${track.copyright}

This track is part of the "${track.album}" album by ${track.artist}.

**Terms:**
- All rights reserved.
- No part of this track may be reproduced, distributed, or transmitted in any form without prior written permission.
- This track was generated using ACE Music (ACE-Step 1.5) AI technology.
`;
  fs.writeFileSync(path.join(dir, 'license.md'), licenseMD);

  // about_readme.txt
  const aboutTxt = `================================================
  ${track.title}
================================================
  Artist  : ${track.artist}
  Album   : ${track.album}
  Year    : ${track.year}
  Genre   : ${track.genre}
  Duration : ${track.duration} (${track.durationSec}s)
  BPM     : ${track.bpm}
  Track # : ${track.trackNumber}
------------------------------------------------

${wrap(track.description, 48)}

------------------------------------------------
${track.copyright}

Generated with ACE Music (ACE-Step 1.5)
================================================
`;
  fs.writeFileSync(path.join(dir, 'about_readme.txt'), aboutTxt);

  // about_readme.md
  const aboutMD = `# ${track.title}

> *${track.artist}* — ${track.album}

## Details

| Property | Value |
|----------|-------|
| **Artist** | ${track.artist} |
| **Album** | ${track.album} |
| **Year** | ${track.year} |
| **Genre** | ${track.genre} |
| **Duration** | ${track.duration} (${track.durationSec}s) |
| **BPM** | ${track.bpm} |
| **Track #** | ${track.trackNumber} |

## Description

${wrap(track.description, 72)}

---

${track.copyright}

*Generated with ACE Music (ACE-Step 1.5)*
`;
  fs.writeFileSync(path.join(dir, 'about_readme.md'), aboutMD);

  // license.txt
  const licenseTxt = `LICENSE — ${track.title}
==============================
Track: ${track.title}
Artist: ${track.artist}
Album: ${track.album}
Year: ${track.year}
Genre: ${track.genre}
Duration: ${track.duration}
BPM: ${track.bpm}
------------------------------
${wrap(track.copyright, 56)}

Terms:
- All rights reserved.
- No part of this track may be reproduced, distributed, or transmitted
  in any form without prior written permission.
- Generated using ACE Music (ACE-Step 1.5)
==============================
`;
  fs.writeFileSync(path.join(dir, 'license.txt'), licenseTxt);

  console.log(`  Docs: about_readme.txt, about_readme.md, license.txt, license.md`);
}

function createAlbumDocs() {
  // license.md
  const licenseMD = `# License — ${ALBUM_INFO.name}

**Album:** ${ALBUM_INFO.name}
**Artist:** ${ALBUM_INFO.artist}
**Year:** ${ALBUM_INFO.year}
**Genre:** ${ALBUM_INFO.genre}
**Tracks:** ${TRACKS.length}

---

© 2026 ${ALBUM_INFO.artist}. All Rights Reserved.

This album and all its tracks are the property of ${ALBUM_INFO.artist}.

**Terms:**
- All rights reserved.
- No part of this album may be reproduced, distributed, or transmitted in any form without prior written permission.
- Tracks were generated using ACE Music (ACE-Step 1.5) AI technology.
`;
  fs.writeFileSync(path.join(ALBUM_DIR, 'license.md'), licenseMD);

  // license.txt
  const licenseTxt = `LICENSE — ${ALBUM_INFO.name}
==============================
Album: ${ALBUM_INFO.name}
Artist: ${ALBUM_INFO.artist}
Year: ${ALBUM_INFO.year}
Genre: ${ALBUM_INFO.genre}
Tracks: ${TRACKS.length}
------------------------------
© 2026 ${ALBUM_INFO.artist}. All Rights Reserved.

Terms:
- All rights reserved.
- No part of this album may be reproduced, distributed, or transmitted
  in any form without prior written permission.
- Tracks were generated using ACE Music (ACE-Step 1.5)
==============================
`;
  fs.writeFileSync(path.join(ALBUM_DIR, 'license.txt'), licenseTxt);

  // about_readme.md
  const aboutMD = `# ${ALBUM_INFO.name}

> *${ALBUM_INFO.artist}* — ${ALBUM_INFO.year}

## About

${wrap(ALBUM_INFO.description, 72)}

## Tracklist

| # | Track | Duration | BPM | Genre |
|---|-------|----------|-----|-------|
${TRACKS.map(t => `| ${t.trackNumber} | **${t.title}** | ${t.duration} | ${t.bpm} | ${t.genre} |`).join('\n')}

---

© 2026 ${ALBUM_INFO.artist}. All Rights Reserved.

*Generated with ACE Music (ACE-Step 1.5)*
`;
  fs.writeFileSync(path.join(ALBUM_DIR, 'about_readme.md'), aboutMD);

  // about_readme.txt
  const aboutTxt = `================================================
  ${ALBUM_INFO.name}
================================================
  Artist : ${ALBUM_INFO.artist}
  Year   : ${ALBUM_INFO.year}
  Genre  : ${ALBUM_INFO.genre}
------------------------------------------------

${wrap(ALBUM_INFO.description, 48)}

------------------------------------------------
  Tracklist
------------------------------------------------
${TRACKS.map(t => `  ${t.trackNumber}. ${t.title.padEnd(22)} ${t.duration}  ${t.bpm} BPM`).join('\n')}

------------------------------------------------
© 2026 ${ALBUM_INFO.artist}. All Rights Reserved.

Generated with ACE Music (ACE-Step 1.5)
================================================
`;
  fs.writeFileSync(path.join(ALBUM_DIR, 'about_readme.txt'), aboutTxt);

  // playlist.md
  const playlistMD = `# Playlist — ${ALBUM_INFO.name}

> Complete track listing

${TRACKS.map(t => `- **${t.trackNumber}. ${t.title}** — ${t.duration} (${t.bpm} BPM, ${t.genre})`).join('\n')}

---

*${TRACKS.length} tracks \u00B7 Total duration: ${TRACKS.reduce((s, t) => s + t.durationSec, 0)}s*
`;
  fs.writeFileSync(path.join(ALBUM_DIR, 'playlist.md'), playlistMD);

  // playlist.txt
  const playlistTxt = `PLAYLIST — ${ALBUM_INFO.name}
==============================
${TRACKS.map(t => `${t.trackNumber}. ${t.title} — ${t.duration} (${t.bpm} BPM)`).join('\n')}
------------------------------
${TRACKS.length} tracks
==============================
`;
  fs.writeFileSync(path.join(ALBUM_DIR, 'playlist.txt'), playlistTxt);

  console.log(`  Album docs: about_readme.txt/md, license.txt/md, playlist.txt/md`);
}

function embedMetadata(track, srcMp3, srcOgg, coverPath) {
  const dir = path.join(ALBUM_DIR, track.id);
  const finalMp3 = path.join(dir, `${track.id}.mp3`);
  const finalOgg = path.join(dir, `${track.id}.ogg`);

  // MP3 with embedded cover
  const mp3Args = [
    '-y', '-i', srcMp3, '-i', coverPath,
    '-map', '0:a', '-map', '1',
    '-c', 'copy', '-c:v', 'mjpeg',
    '-metadata', `title=${track.title}`,
    '-metadata', `artist=${track.artist}`,
    '-metadata', `album=${track.album}`,
    '-metadata', `date=${track.year}`,
    '-metadata', `genre=${track.genre}`,
    '-metadata', `track=${track.trackNumber}`,
    '-metadata', `TBPM=${track.bpm}`,
    '-metadata', `description=${track.description}`,
    '-metadata:s:v', 'title=Album cover',
    '-metadata:s:v', 'comment=Cover (front)',
    '-disposition:v', 'attached_pic',
    finalMp3,
  ];
  execFileSync(FFMPEG_PATH, mp3Args, { stdio: 'pipe', encoding: 'utf-8' });
  console.log(`  MP3: ${track.id}.mp3 (with embedded cover)`);

  // OGG with text metadata only (no cover support in OGG)
  const oggArgs = [
    '-y', '-i', srcOgg,
    '-c', 'copy',
    '-metadata', `title=${track.title}`,
    '-metadata', `artist=${track.artist}`,
    '-metadata', `album=${track.album}`,
    '-metadata', `date=${track.year}`,
    '-metadata', `genre=${track.genre}`,
    '-metadata', `track=${track.trackNumber}`,
    '-metadata', `description=${track.description}`,
    finalOgg,
  ];
  execFileSync(FFMPEG_PATH, oggArgs, { stdio: 'pipe', encoding: 'utf-8' });
  console.log(`  OGG: ${track.id}.ogg`);

  // Clean old audio.mp3 and audio.ogg
  const oldMp3 = path.join(dir, 'audio.mp3');
  const oldOgg = path.join(dir, 'audio.ogg');
  if (fs.existsSync(oldMp3)) fs.unlinkSync(oldMp3);
  if (fs.existsSync(oldOgg)) fs.unlinkSync(oldOgg);

  return { finalMp3, finalOgg };
}

async function main() {
  console.log('=== Finalizing track structure ===\n');

  // Generate album-level assets
  console.log('--- Album: genesis_neon ---');
  await generateAlbumCover();
  createAlbumDocs();

  // Process each track
  for (const track of TRACKS) {
    const dir = path.join(ALBUM_DIR, track.id);
    console.log(`\n--- ${track.title} ---`);

    // Generate cover
    const coverPath = path.join(dir, 'cover.png');
    await generateCover(track, coverPath);

    // The current files are audio.mp3 and audio.ogg (from previous step)
    const srcMp3 = path.join(dir, 'audio.mp3');
    const srcOgg = path.join(dir, 'audio.ogg');

    if (!fs.existsSync(srcMp3)) {
      console.log(`  ERROR: ${srcMp3} not found!`);
      continue;
    }

    // Convert OGG from MP3 if OGG missing
    if (!fs.existsSync(srcOgg)) {
      console.log('  Converting MP3 to OGG...');
      execFileSync(FFMPEG_PATH, ['-y', '-i', srcMp3, '-c:a', 'libvorbis', '-q:a', '5', srcOgg], { stdio: 'pipe' });
    }

    // Embed metadata and rename to track.id.ext
    embedMetadata(track, srcMp3, srcOgg, coverPath);

    // Create documentation
    createTrackDocs(track);
  }

  // Verify final structure
  console.log('\n=== Final Structure ===');
  console.log(`genesis_neon/`);
  console.log(`  cover.png`);
  console.log(`  about_readme.txt`);
  console.log(`  about_readme.md`);
  console.log(`  license.txt`);
  console.log(`  license.md`);
  console.log(`  playlist.txt`);
  console.log(`  playlist.md`);
  for (const track of TRACKS) {
    console.log(`  ${track.id}/`);
    console.log(`    ${track.id}.mp3`);
    console.log(`    ${track.id}.ogg`);
    console.log(`    cover.png`);
    console.log(`    about_readme.txt`);
    console.log(`    about_readme.md`);
    console.log(`    license.txt`);
    console.log(`    license.md`);
  }

  console.log('\n=== Done! ===');
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
