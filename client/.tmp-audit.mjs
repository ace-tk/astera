import { chromium } from 'playwright';

const routes = [
  '/services/drafting',
  '/services/drafting/redaction-pv-cse-a-lacte',
  '/services/by-city/redaction-pv-cse-annecy',
  '/services/tarifs-infos',
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const route of routes) {
  await page.goto('http://localhost:5226' + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const name = route.replace(/\//g, '_') || 'root';
  await page.screenshot({ path: `/private/tmp/claude-501/-Users-tisha-astera/f18d2ba1-19ef-456f-a3cf-9976f60ba29d/scratchpad/pv-audit${name}_top.png` });
  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log(route, 'height=', height);
}

await browser.close();
