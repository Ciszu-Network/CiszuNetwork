const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ALBUM_DIR = path.join(__dirname, '..', 'public', 'music', 'albums', 'genesis_neon');

const TRACKS = [
  { id: 'oled_darkness', name: 'OLED Darkness',   primary: '#59b4ff', secondary: '#68cfff', bg: '#000a1a' },
  { id: 'neon_dreams',   name: 'Neon Dreams',     primary: '#68cfff', secondary: '#4800ff', bg: '#00101a' },
  { id: 'digital_soul',  name: 'Digital Soul',    primary: '#b400ff', secondary: '#ff33cc', bg: '#0a0018' },
  { id: 'cyber_beat',    name: 'Cyber Beat',      primary: '#ff33cc', secondary: '#59b4ff', bg: '#1a0010' },
];

async function generateBanners() {
  for (const track of TRACKS) {
    const coverPath = path.join(ALBUM_DIR, track.id, 'cover.png');
    const bannerPath = path.join(ALBUM_DIR, track.id, 'banner.png');

    if (!fs.existsSync(coverPath)) {
      console.log(`  ${track.id}: cover.png not found, skipping banner`);
      continue;
    }

    // Center-crop cover to 1200x400
    await sharp(coverPath)
      .resize(1200, 400, { fit: 'cover', position: 'centre' })
      .toFile(bannerPath);
    console.log(`  ${track.id}: banner.png created (1200x400)`);
  }
}

function generateDiscSvg(track) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <defs>
    <radialGradient id="disc" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${track.bg}"/>
      <stop offset="35%" stop-color="${track.bg}"/>
      <stop offset="70%" stop-color="${track.secondary}33"/>
      <stop offset="90%" stop-color="${track.primary}66"/>
      <stop offset="100%" stop-color="${track.bg}"/>
    </radialGradient>
    <radialGradient id="label" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${track.primary}"/>
      <stop offset="100%" stop-color="${track.secondary}"/>
    </radialGradient>
  </defs>
  <circle cx="150" cy="150" r="140" fill="url(#disc)" stroke="${track.primary}" stroke-width="2"/>
  <circle cx="150" cy="150" r="40" fill="url(#label)" stroke="#fff" stroke-width="1.5"/>
  <circle cx="150" cy="150" r="8" fill="#fff"/>
  <circle cx="150" cy="150" r="4" fill="${track.bg}"/>
  <path d="M150 10 A140 140 0 0 1 290 150" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"/>
  <path d="M150 290 A140 140 0 0 1 10 150" stroke="rgba(255,255,255,0.05)" stroke-width="2" fill="none"/>
  <text x="150" y="148" text-anchor="middle" fill="white" font-size="6" font-weight="bold" font-family="monospace">${track.name.toUpperCase()}</text>
  <text x="150" y="160" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="5" font-family="monospace">CiszukoAntony</text>
</svg>`;

  const discPath = path.join(ALBUM_DIR, track.id, 'disc.svg');
  fs.writeFileSync(discPath, svg, 'utf-8');
  console.log(`  ${track.id}: disc.svg created`);
}

async function main() {
  console.log('=== Generating track banners (1200x400) ===');
  await generateBanners();

  console.log('\n=== Generating track disc SVGs ===');
  for (const track of TRACKS) {
    generateDiscSvg(track);
  }

  // Clean up album-level assets (now per-track)
  const albumDisc = path.join(ALBUM_DIR, 'disc.svg');
  const albumBanner = path.join(ALBUM_DIR, 'banner.png');
  const albumIcon = path.join(ALBUM_DIR, 'icon.svg');
  if (fs.existsSync(albumDisc)) {
    fs.unlinkSync(albumDisc);
    console.log('\nRemoved album-level disc.svg (now per-track)');
  }
  if (fs.existsSync(albumBanner)) {
    fs.unlinkSync(albumBanner);
    console.log('Removed album-level banner.png (now per-track)');
  }
  if (fs.existsSync(albumIcon)) {
    fs.unlinkSync(albumIcon);
    console.log('Removed album-level icon.svg (no icon at album level)');
  }

  console.log('\nDone!');
}

main().catch(console.error);
