import AxeBuilder from '@axe-core/playwright';
import { type Page, expect, test } from '@playwright/test';

const routes = [
  './',
  'getting-started/',
  'foundations/tokens/',
  'concepts/factory/',
  'components/overview/',
  'reference/exports/',
];

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('renders the docs shell and Mystique preview', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await page.goto('./');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'A small component surface with a complete styling core.',
    }),
  ).toBeVisible();
  await expect(page.locator('[data-mystique-preview]').first()).toBeVisible();
  await expect(
    page.locator('style[data-emotion^="mystique"]').first(),
  ).toBeAttached();
  await expect(page.getByRole('link', { name: 'Get started' })).toHaveAttribute(
    'href',
    '/mystique-mini/getting-started/',
  );

  const colorModeToggle = page.getByRole('button', {
    name: /Switch between dark and light mode/i,
  });
  await colorModeToggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(runtimeErrors).toEqual([]);
});

for (const route of routes) {
  test(`has no automated accessibility violations on ${route}`, async ({
    page,
  }) => {
    const runtimeErrors = collectRuntimeErrors(page);
    await page.goto(route);
    await expect(page.getByRole('main')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
    expect(runtimeErrors).toEqual([]);
  });
}
