# Running Custom Playwright Code

Use `run-code` to execute arbitrary Playwright code for advanced scenarios.

## Syntax

```bash
playwright-cli run-code "async page => {
  // Your Playwright code here
}"
```

## Geolocation

```bash
playwright-cli run-code "async page => {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
}"
```

## Permissions

```bash
playwright-cli run-code "async page => {
  await page.context().grantPermissions(['geolocation', 'notifications', 'camera', 'microphone']);
}"
```

## Media Emulation

```bash
playwright-cli run-code "async page => { await page.emulateMedia({ colorScheme: 'dark' }); }"
playwright-cli run-code "async page => { await page.emulateMedia({ reducedMotion: 'reduce' }); }"
```

## Wait Strategies

```bash
playwright-cli run-code "async page => { await page.waitForLoadState('networkidle'); }"
playwright-cli run-code "async page => { await page.waitForSelector('.loading', { state: 'hidden' }); }"
playwright-cli run-code "async page => { await page.waitForFunction(() => window.appReady === true); }"
```

## Frames and Iframes

```bash
playwright-cli run-code "async page => {
  const frame = page.locator('iframe#my-iframe').contentFrame();
  await frame.locator('button').click();
}"
```

## File Downloads

```bash
playwright-cli run-code "async page => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('a.download-link')
  ]);
  await download.saveAs('./downloaded-file.pdf');
  return download.suggestedFilename();
}"
```

## Error Handling

```bash
playwright-cli run-code "async page => {
  try {
    await page.click('.maybe-missing', { timeout: 1000 });
    return 'clicked';
  } catch (e) {
    return 'element not found';
  }
}"
```
