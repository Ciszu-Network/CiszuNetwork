// ¿Qué regla gana sobre .bg-doc-dark en modo claro?
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.addInitScript(() => {
  localStorage.setItem('ciszu_preferences', JSON.stringify({ theme: 'light' }));
});
await page.goto('http://127.0.0.1:3003/', { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2500);

const out = await page.evaluate(() => {
  const el = document.querySelector('.bg-doc-dark');
  const matched = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of rules) {
      const text = rule.cssText || '';
      if (text.includes('bg-doc-dark')) matched.push(text.slice(0, 160));
    }
  }
  return {
    htmlClass: document.documentElement.className,
    bg: el ? getComputedStyle(el).backgroundColor : null,
    matched: matched.slice(0, 8),
  };
});

console.log(JSON.stringify(out, null, 1));
await browser.close();
