// Identifica el origen de los ✕ con poco contraste en modo claro.
import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://127.0.0.1:3001';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.addInitScript(() => {
  localStorage.setItem('ciszu_preferences', JSON.stringify({ theme: 'light' }));
});
await page.goto(url + '/', { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2500);

const out = await page.evaluate(() => {
  const res = [];
  for (const el of document.querySelectorAll('*')) {
    if (el.children.length) continue;
    if ((el.textContent || '').trim() !== '✕') continue;
    const btn = el.closest('button') || el;
    const cs = getComputedStyle(btn);
    res.push({
      inlineStyle: btn.getAttribute('style'),
      color: cs.color,
      bg: cs.backgroundColor,
      aria: btn.getAttribute('aria-label'),
      parentClass: (btn.parentElement?.className || '').slice(0, 120),
    });
  }
  return res.slice(0, 5);
});

console.log(JSON.stringify(out, null, 1));
await browser.close();
