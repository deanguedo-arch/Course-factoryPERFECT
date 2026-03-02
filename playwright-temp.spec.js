import { test } from '@playwright/test';

test('repro left rail crash', async ({ page }) => {
  page.on('console', msg => console.log('console', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('pageerror', err.stack || err.message));
  await page.goto('http://localhost:5174/Course-factoryPERFECT/', { waitUntil: 'networkidle' });
  console.log('body-start');
  console.log((await page.textContent('body')).slice(0, 2000));
  console.log('body-end');
  await page.screenshot({ path: '/tmp/pw-home.png', fullPage: true });
});
