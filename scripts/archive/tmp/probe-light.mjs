// Sonda: ¿por qué este elemento no coge el color del modo claro?
import { chromium } from '@playwright/test';

const url = process.argv[2] ?? 'http://localhost:3000/reviews';
const needle = process.argv[3] ?? 'Relevancia';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  localStorage.setItem('ciszu_preferences', JSON.stringify({ theme: 'light' }));
  localStorage.setItem('theme', 'light');
});
await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
await page.waitForTimeout(2500);

const info = await page.evaluate((needle) => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let target = null;
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent?.trim() ?? '';
    if (text.includes(needle)) {
      target = walker.currentNode.parentElement;
      break;
    }
  }
  if (!target) return { error: 'no encontrado' };

  const chain = [];
  let node = target;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    chain.push({
      tag: node.tagName,
      cls: (node.className || '').toString().slice(0, 160),
      color: style.color,
      bg: style.backgroundColor,
      bgImage: style.backgroundImage.slice(0, 60),
    });
    node = node.parentElement;
  }
  return { text: target.textContent?.trim(), chain };
}, needle);

if (info.error) console.log(info.error);
else {
  console.log(`texto: "${info.text}"`);
  for (const row of info.chain) {
    console.log(`  <${row.tag}> color=${row.color} bg=${row.bg} bgImage=${row.bgImage}`);
    console.log(`        clase: ${row.cls}`);
  }
}

await browser.close();
