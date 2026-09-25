// Inspecciona los dos casos restantes de ciszu en modo claro.
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.addInitScript(() => {
  localStorage.setItem('ciszu_preferences', JSON.stringify({ theme: 'light' }));
});
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2500);

const out = await page.evaluate(() => {
  const findText = (needle) => {
    for (const el of document.querySelectorAll('*')) {
      if (el.children.length) continue;
      if ((el.textContent || '').trim() === needle) return el;
    }
    return null;
  };
  const describe = (el) => {
    if (!el) return null;
    const chain = [];
    let node = el;
    for (let i = 0; i < 5 && node; i += 1) {
      const cs = getComputedStyle(node);
      chain.push({
        tag: node.tagName.toLowerCase(),
        cls: typeof node.className === 'string' ? node.className.slice(0, 100) : '',
        color: cs.color,
        bg: cs.backgroundColor,
        inline: node.getAttribute('style'),
      });
      node = node.parentElement;
    }
    return chain;
  };
  return { ciszugamens: describe(findText('Ciszugamens')), youtube: describe(findText('youtube')) };
});

console.log(JSON.stringify(out, null, 1));
await browser.close();
