import { test, expect } from '@playwright/test';

test.describe('Process Scheduler Simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('CPU-Scheduling Simulator');
  });

  test('should display all three algorithm options', async ({ page }) => {
    await expect(page.locator('select')).toBeVisible();
    const options = await page.locator('select option').allTextContents();
    expect(options).toContain('FCFS');
    expect(options).toContain('SRTF');
    expect(options).toContain('RR');
  });

  test('should load a scenario', async ({ page }) => {
    // Click on FCFS example scenario
    await page.getByText('FCFS Beispiel').click();

    // Check that simulation initializes
    await expect(page.getByRole('button', { name: 'Simulation starten' })).toBeEnabled();
  });

  test('should run a simulation and show Gantt chart', async ({ page }) => {
    // Load FCFS example
    await page.getByText('FCFS Beispiel').click();

    // Start simulation
    await page.getByRole('button', { name: 'Simulation starten' }).click();

    // Progress should show events
    await expect(page.getByText(/\d+ \/ \d+/)).toBeVisible();
  });

  test('should step through simulation', async ({ page }) => {
    // Load scenario
    await page.getByText('FCFS Beispiel').click();
    await page.getByRole('button', { name: 'Simulation starten' }).click();

    // Step button should be visible and clickable
    const stepButton = page.getByTitle('Nächster Schritt');
    await expect(stepButton).toBeEnabled();

    // Click step a few times
    await stepButton.click();
    await stepButton.click();
    await stepButton.click();
  });

  test('should switch modes', async ({ page }) => {
    // Check mode buttons exist
    await expect(page.getByRole('button', { name: 'Schritt' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Auto' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Übung' })).toBeVisible();

    // Switch to practice mode
    await page.getByRole('button', { name: 'Übung' }).click();
    await expect(page.getByText('Übungsmodus')).toBeVisible();
  });

  test('should display queues', async ({ page }) => {
    await page.getByText('FCFS Beispiel').click();
    await page.getByRole('button', { name: 'Simulation starten' }).click();

    // Queues should be visible
    await expect(page.getByText('Ready Queue')).toBeVisible();
    await expect(page.getByText('Blocked Queue (I/O)')).toBeVisible();
    await expect(page.getByText('Running')).toBeVisible();
  });

  test('should show metrics after completion', async ({ page }) => {
    // Load simple scenario
    await page.getByText('FCFS Beispiel').click();
    await page.getByRole('button', { name: 'Simulation starten' }).click();

    // Fast forward through simulation by clicking step until end
    const stepButton = page.getByTitle('Nächster Schritt');
    for (let i = 0; i < 20; i++) {
      const isDisabled = await stepButton.isDisabled();
      if (isDisabled) break;
      await stepButton.click();
    }

    // Metrics should show averages
    await expect(page.getByText('Durchschn. Waiting Time')).toBeVisible();
    await expect(page.getByText('Durchschn. Turnaround Time')).toBeVisible();
  });
});

test.describe('Practice Mode', () => {
  test('should allow user to make scheduling decisions', async ({ page }) => {
    await page.goto('/');

    // Load scenario and switch to practice mode
    await page.getByText('FCFS Beispiel').click();
    await page.getByRole('button', { name: 'Übung' }).click();
    await page.getByRole('button', { name: 'Simulation starten' }).click();

    // Practice mode instructions should be visible
    await expect(page.getByText('Wählen Sie den nächsten Prozess')).toBeVisible();
  });
});
