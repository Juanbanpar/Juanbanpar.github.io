import { test, expect } from '@playwright/test';

const locales = [
  { language: 'en', prefix: '', home: 'Home', work: 'Work', about: 'About', writing: 'Writing', languageName: 'English' },
  { language: 'gl', prefix: '/gl', home: 'Inicio', work: 'Traballo', about: 'Sobre min', writing: 'Escritos', languageName: 'Galego' },
  { language: 'es', prefix: '/es', home: 'Inicio', work: 'Trabajo', about: 'Sobre mí', writing: 'Escritos', languageName: 'Español' },
];

for (const locale of locales) {
  test(`${locale.language}: core routes, metadata, navigation, and layout`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const section of ['', 'about/', 'work/', 'writing/']) {
      const response = await page.goto(`${locale.prefix}/${section}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.language);
      await expect(page.locator('h1')).toHaveCount(1);
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
    await page.locator('.language-menu').getByRole('link', { name: 'Galego', exact: true }).click();
    await expect(page).toHaveURL('/gl/work/');
    expect(errors).toEqual([]);
    await page.goto(`${locale.prefix}/`);
    await page.screenshot({ path: testInfo.outputPath(`${locale.language}-home-light.png`), fullPage: true });
  });
}

test('theme follows the device, can be overridden, persists, and can return to system', async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const bg = () => page.locator('html').evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await bg()).toBe('rgb(19, 25, 35)');
  await expect(page.locator('.theme-toggle')).toHaveAccessibleName('Color theme: System');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await bg()).toBe('rgb(247, 248, 252)');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: testInfo.outputPath('home-dark.png'), fullPage: true });
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  expect(await bg()).toBe('rgb(19, 25, 35)');
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
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('post-long-content.png'), fullPage: true });
  await page.locator('.language-menu summary').click();
  const spanish = page.locator('.language-menu').getByRole('link', { name: /Español/ });
  await expect(spanish).toHaveAttribute('title', 'Writing archive; this entry is not translated');
  await spanish.click();
  await expect(page).toHaveURL('/es/writing/');
  await expect(page.locator('.writing-list a[lang="en"]')).toBeVisible();
  await page.goto('/writing/check-english/');
  await page.locator('.post-translations').getByRole('link', { name: 'Galego' }).click();
  await expect(page).toHaveURL('/gl/writing/check-galician/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'gl');
  await expect(page.locator('link[hreflang="es"]')).toHaveCount(0);
});
