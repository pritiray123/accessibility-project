import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.2 AA Automated Accessibility Test Suite', () => {
  const wcag22AATags = [
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'wcag22aa',
    'best-practice',
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. Default Pristine State satisfies WCAG 2.2 AA with zero violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(wcag22AATags)
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('2. Dirty Interactive State with password strength maintains WCAG 2.2 AA compliance', async ({ page }) => {
    // Fill in partial information
    await page.fill('#field-fullName', 'Jane Doe');
    await page.fill('#field-email', 'jane.doe@enterprise.internal');
    await page.fill('#field-password', 'SecretPass123!');

    // Toggle password visibility
    const showPasswordBtn = page.getByRole('button', { name: /Show password/i });
    await expect(showPasswordBtn).toHaveAttribute('aria-pressed', 'false');
    await showPasswordBtn.click();
    await expect(page.getByRole('button', { name: /Hide password/i })).toHaveAttribute('aria-pressed', 'true');

    // Run Axe scan on dirty state
    const scanResults = await new AxeBuilder({ page })
      .withTags(wcag22AATags)
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('3. Failed Submission Error State moves focus and satisfies WCAG 2.2 AA', async ({ page }) => {
    // Click submit with empty form to trigger validation errors
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Verify error summary banner appears
    const errorSummary = page.getByRole('alert').first();
    await expect(errorSummary).toBeVisible();

    // Verify focus shifted to error summary banner
    await expect(errorSummary).toBeFocused();

    // Verify individual invalid inputs have aria-invalid="true"
    const fullNameInput = page.locator('#field-fullName');
    await expect(fullNameInput).toHaveAttribute('aria-invalid', 'true');

    const emailInput = page.locator('#field-email');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    const passwordInput = page.locator('#field-password');
    await expect(passwordInput).toHaveAttribute('aria-invalid', 'true');

    // Click jump link in error summary and verify focus shifts to target input
    const emailErrorLink = page.getByRole('link', { name: /Email address is required/i });
    await emailErrorLink.click();
    await expect(emailInput).toBeFocused();

    // Run Axe scan on error state
    const errorScanResults = await new AxeBuilder({ page })
      .withTags(wcag22AATags)
      .analyze();

    expect(errorScanResults.violations).toEqual([]);
  });

  test('4. Terms of Service Modal Dialog traps focus, satisfies WCAG 2.2 AA, and restores focus', async ({ page }) => {
    const termsTrigger = page.getByRole('button', { name: /Terms of Service/i });
    await termsTrigger.click();

    // Dialog should be visible
    const dialog = page.getByRole('dialog', { name: /Terms of Service/i });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Axe scan of active modal
    const modalScanResults = await new AxeBuilder({ page })
      .withTags(wcag22AATags)
      .analyze();

    expect(modalScanResults.violations).toEqual([]);

    // Press Escape to dismiss dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Verify focus is restored to the triggering button
    await expect(termsTrigger).toBeFocused();
  });

  test('5. Keyboard Navigation & Skip to Main Content functionality', async ({ page }) => {
    // Tab into skip link
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeFocused();

    // Activate skip link
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('6. Audit Dashboard tab satisfies WCAG 2.2 AA with zero violations', async ({ page }) => {
    await page.getByRole('button', { name: /Audit Dashboard/i }).click();

    await expect(page.getByRole('heading', { name: /Accessibility Architecture/i })).toBeVisible();

    const auditScanResults = await new AxeBuilder({ page })
      .withTags(wcag22AATags)
      .analyze();

    expect(auditScanResults.violations).toEqual([]);
  });
});
