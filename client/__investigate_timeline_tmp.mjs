import { chromium, firefox, webkit } from 'playwright';

const BASE = 'http://localhost:4190';
const viewports = [
  { name: '1920x1080', w: 1920, h: 1080 },
  { name: '1440x900', w: 1440, h: 900 },
  { name: '1366x768', w: 1366, h: 768 },
  { name: '1280x720', w: 1280, h: 720 },
  { name: 'tablet-834x1112', w: 834, h: 1112 },
  { name: 'mobile-390x844', w: 390, h: 844 },
];
const motionModes = ['no-preference', 'reduce'];
const engines = [
  { name: 'chromium', launcher: chromium },
  { name: 'firefox', launcher: firefox },
  { name: 'webkit', launcher: webkit },
];

const results = [];

for (const eng of engines) {
  let browser;
  try {
    browser = await eng.launcher.launch();
  } catch (e) {
    results.push({ engine: eng.name, launchError: String(e) });
    continue;
  }

  for (const motion of motionModes) {
    for (const vp of viewports) {
      let context, page;
      try {
        context = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, reducedMotion: motion });
        page = await context.newPage();

        const consoleErrors = [];
        const pageErrors = [];
        page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
        page.on('pageerror', (err) => pageErrors.push(String(err)));

        await page.goto(`${BASE}/atoopv`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(700);

        const data = await page.evaluate(() => {
          const bodyText = document.body.textContent;
          const heading = Array.from(document.querySelectorAll('h2')).find((h) => h.textContent.includes('Suivez vos PV') === false && h.textContent.includes('dépôt à la validation') === false);
          // find timeline by its known unique text
          const timelineHeading = Array.from(document.querySelectorAll('h2')).find((h) => bodyText.includes('niveau de restitution') && h.textContent.trim().length > 0 && document.body.innerHTML.includes('Live preview'));
          const section = Array.from(document.querySelectorAll('section')).find((s) => s.textContent.includes('Live preview'));
          const rect = section ? section.getBoundingClientRect() : null;
          const cs = section ? getComputedStyle(section) : null;
          return {
            sectionExistsInDom: !!section,
            liveTextPresent: bodyText.includes('Live preview'),
            downloadTextPresent: bodyText.includes('Download sample report'),
            railNamesPresent: ['CSE', 'CSEE', 'CSEC', 'CSSCT', 'CECO', 'QVCT'].every((n) => bodyText.includes(n)),
            sectionRect: rect ? { width: rect.width, height: rect.height, top: rect.top } : null,
            sectionDisplay: cs ? cs.display : null,
            sectionVisibility: cs ? cs.visibility : null,
            sectionOpacity: cs ? cs.opacity : null,
            bodyScrollWidth: document.body.scrollWidth,
            windowInnerWidth: window.innerWidth,
            hasOverflow: document.body.scrollWidth > window.innerWidth,
          };
        });

        results.push({ engine: eng.name, motion, viewport: vp.name, data, consoleErrors, pageErrors });
      } catch (e) {
        results.push({ engine: eng.name, motion, viewport: vp.name, error: String(e) });
      } finally {
        if (page) await page.close();
        if (context) await context.close();
      }
    }
  }

  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
