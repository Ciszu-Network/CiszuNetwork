// ¿Qué reglas fijan el fondo de .bg-[#0a0a0f] y en qué orden aparecen?
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.addInitScript(() => {
  localStorage.setItem('ciszu_preferences', JSON.stringify({ theme: 'light' }));
});
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2500);

const out = await page.evaluate(() => {
  const el = document.querySelector('div[class~="bg-[#0a0a0f]"]');
  if (!el) return { error: 'no encontrado' };
  const hits = [];
  let index = 0;
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    const visit = (list, layer) => {
      for (const rule of list) {
        index += 1;
        if (rule.cssRules && !rule.selectorText) {
          visit(rule.cssRules, layer || rule.cssText.slice(0, 30));
          continue;
        }
        if (!rule.selectorText) continue;
        try {
          if (!el.matches(rule.selectorText)) continue;
        } catch {
          continue;
        }
        const bg = rule.style?.getPropertyValue('background-color');
        if (!bg) continue;
        hits.push({ order: index, layer, selector: rule.selectorText, bg, importance: rule.style.getPropertyPriority('background-color') });
      }
    };
    visit(rules, null);
  }
  return { htmlClass: document.documentElement.className, computed: getComputedStyle(el).backgroundColor, hits };
});

console.log(JSON.stringify(out, null, 1));
await browser.close();
