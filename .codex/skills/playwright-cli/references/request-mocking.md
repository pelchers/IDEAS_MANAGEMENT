# Request Mocking

## Basic Mocking

```bash
# Block images
playwright-cli route "**/*.jpg" --status=404

# Mock API response
playwright-cli route "https://api.example.com/**" --body='{"mock": true}'

# List active routes
playwright-cli route-list

# Remove specific route
playwright-cli unroute "**/*.jpg"

# Remove all routes
playwright-cli unroute
```

## URL Pattern Matching

- Exact path: `**/api/users`
- Wildcards: `**/api/*/details`
- File extensions: `**/*.{png,jpg,jpeg}`
- Query parameters: `**/search?q=*`

## Advanced Mocking with run-code

```bash
# Conditional response based on request
playwright-cli run-code "async page => {
  await page.route('**/api/data', async route => {
    const request = route.request();
    if (request.method() === 'POST') {
      await route.fulfill({ body: JSON.stringify({ created: true }) });
    } else {
      await route.continue();
    }
  });
}"

# Modify real response
playwright-cli run-code "async page => {
  await page.route('**/api/users', async route => {
    const response = await route.fetch();
    const json = await response.json();
    json.push({ id: 999, name: 'Injected User' });
    await route.fulfill({ body: JSON.stringify(json) });
  });
}"

# Simulate network failure
playwright-cli run-code "async page => {
  await page.route('**/api/flaky', route => route.abort('connectionrefused'));
}"

# Simulate slow network
playwright-cli run-code "async page => {
  await page.route('**/*', async route => {
    await new Promise(r => setTimeout(r, 3000));
    await route.continue();
  });
}"
```
