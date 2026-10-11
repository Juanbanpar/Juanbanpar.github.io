import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    securityViolations: string[];
    injectedScriptRan?: boolean;
  }
}

const locales = [
  { language: 'en', prefix: '', home: 'Home', work: 'Work', about: 'About', writing: 'Blog', languageName: 'English' },
  { language: 'gl', prefix: '/gl', home: 'Inicio', work: 'Traballo', about: 'Sobre min', writing: 'Blog', languageName: 'Galego' },
  { language: 'es', prefix: '/es', home: 'Inicio', work: 'Trabajo', about: 'Sobre mí', writing: 'Blog', languageName: 'Español' },
];

for (const locale of locales) {
  test(`${locale.language}: core routes, metadata, navigation, and layout`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.securityViolations = [];
      document.addEventListener('securitypolicyviolation', (event) => window.securityViolations.push(event.effectiveDirective));
    });
    for (const section of ['', 'about/', 'work/', 'writing/']) {
      const response = await page.goto(`${locale.prefix}/${section}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.language);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'strict-origin-when-cross-origin');
      expect(await page.evaluate(() => window.securityViolations)).toEqual([]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://juanbanpar.github.io${locale.prefix}/${section}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await page.locator('body').innerText()).not.toMatch(/proton\.me|662245753|jbanga@|Home address/);
      await expect(page.locator('a[href$=".pdf"]')).toHaveCount(section === 'work/' ? 2 : section === '' ? 1 : 0);
    }
    await page.goto(`${locale.prefix}/`);
    await page.getByRole('navigation').first().getByRole('link', { name: locale.work, exact: true }).click();
    await expect(page).toHaveURL(`${locale.prefix}/work/`);
    await expect(page.locator('.main-nav a[aria-current="page"]')).toHaveText(locale.work);
    await page.locator('.language-menu summary').click();
    const label = await page.locator('.language-menu summary > span').boundingBox();
    const arrow = await page.locator('.language-chevron').boundingBox();
    expect(label).not.toBeNull();
    expect(arrow).not.toBeNull();
    expect(Math.abs(label!.y + label!.height / 2 - arrow!.y - arrow!.height / 2)).toBeLessThan(1);
    await page.locator('.language-menu').getByRole('link', { name: 'Galego', exact: true }).click();
    await expect(page).toHaveURL('/gl/work/');
    expect(errors).toEqual([]);
    await page.goto(`${locale.prefix}/`);
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(favicon).not.toBe('/favicon.svg');
    const icon = await page.request.get(favicon!);
    expect(icon.ok()).toBe(true);
    expect(await icon.text()).not.toMatch(/<text|<circle/);
    await page.screenshot({ path: testInfo.outputPath(`${locale.language}-home-light.png`), fullPage: true });
  });
}

test('CSP blocks injected scripts and inline event handlers', async ({ page }) => {
  await page.addInitScript(() => {
    window.securityViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => window.securityViolations.push(event.effectiveDirective));
  });
  await page.goto('/');
  const policy = await page.locator('meta[http-equiv="content-security-policy"]').getAttribute('content');
  expect(policy).toContain("default-src 'none'");
  expect(policy).not.toMatch(/unsafe-inline|unsafe-eval/);
  const blockedRequest = page.waitForEvent('requestfailed', {
    predicate: (request) => request.url() === 'https://untrusted.invalid/script.js',
  });
  await page.evaluate(() => {
    const inline = document.createElement('script');
    inline.textContent = 'window.injectedScriptRan = true';
    document.body.append(inline);
    const external = document.createElement('script');
    external.src = 'https://untrusted.invalid/script.js';
    document.body.append(external);
    const button = document.createElement('button');
    button.setAttribute('onclick', 'window.injectedScriptRan = true');
    document.body.append(button);
    button.click();
  });
  await expect.poll(() => page.evaluate(() => window.securityViolations.length)).toBe(3);
  expect(await page.evaluate(() => window.injectedScriptRan)).toBeUndefined();
  expect((await blockedRequest).failure()?.errorText).toMatch(/csp/i);
});

test('SRI rejects a modified stylesheet', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.route('**/_astro/*.css', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}\nbody { display: none !important; }` });
  });
  await page.goto('/');
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute('integrity', /^sha384-/);
  await expect(page.locator('h1')).toBeVisible();
  expect(errors.some((error) => /integrity/i.test(error))).toBe(true);
});

test('theme follows the device, can be overridden, persists, and can return to system', async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const bg = () => page.locator('html').evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await bg()).toBe('rgb(33, 31, 28)');
  await expect(page.locator('.theme-toggle')).toHaveAccessibleName('Color theme: System');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await bg()).toBe('rgb(250, 247, 240)');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: testInfo.outputPath('home-dark.png'), fullPage: true });
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  expect(await bg()).toBe('rgb(33, 31, 28)');
});

test('keyboard skip link and language menu focus work', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.locator('.language-menu summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.language-menu')).toHaveAttribute('open', '');
  await page.keyboard.press('Tab');
  await expect(page.locator('.language-menu a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.language-menu')).not.toHaveAttribute('open');
  await expect(page.locator('.language-menu summary')).toBeFocused();
});

test('core content and language switching work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('h1')).toContainText("Hi, I'm Juan.");
  await expect(page.locator('.theme-toggle')).toBeHidden();
  await page.locator('.language-menu summary').click();
  await page.locator('.language-menu').getByRole('link', { name: 'Español', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await context.close();
});

test('404 is useful and has its own title', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found · Juan Banga Pardo');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Page not found');
  await page.getByRole('link', { name: 'Return home' }).click();
  await expect(page).toHaveURL('/');
});

test('published fixture routes, code, translations, and archive fallback', async ({ page }, testInfo) => {
  test.skip(!process.env.SITE_FIXTURES, 'Temporary publishing fixtures are only present during test:site');
  await page.goto('/writing/check-english/');
  await expect(page.locator('.prose pre')).toBeVisible();
  await expect(page.locator('.prose pre [style]')).toHaveCount(0);
  await expect(page.locator('.prose pre .token.keyword').first()).toHaveCSS('color', 'rgb(49, 93, 168)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('post-long-content.png'), fullPage: true });
  await page.locator('.language-menu summary').click();
  const spanish = page.locator('.language-menu').getByRole('link', { name: /Español/ });
  await expect(spanish).toHaveAttribute('title', 'Blog archive; this entry is not translated');
  await spanish.click();
  await expect(page).toHaveURL('/es/writing/');
  await expect(page.locator('.writing-list a[lang="en"]')).toBeVisible();
  await page.goto('/writing/check-english/');
  await page.locator('.post-translations').getByRole('link', { name: 'Galego' }).click();
  await expect(page).toHaveURL('/gl/writing/check-galician/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'gl');
  await expect(page.locator('link[hreflang="es"]')).toHaveCount(0);
});
