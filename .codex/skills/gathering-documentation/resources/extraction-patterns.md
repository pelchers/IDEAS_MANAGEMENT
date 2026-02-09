# Documentation Extraction Patterns

Advanced patterns for extracting and structuring documentation from various sources.

## Content Extraction Patterns

### Pattern 1: Hierarchical Documentation

**Use case**: Structured documentation with headings and subsections

**Implementation**:
```typescript
async function extractHierarchicalDocs(page) {
  return await page.evaluate(() => {
    const sections = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    let currentSection = null;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      const text = heading.textContent?.trim();
      const id = heading.id;

      // Collect content until next heading
      let content = '';
      let element = heading.nextElementSibling;

      while (element && !element.matches('h1, h2, h3, h4, h5, h6')) {
        content += element.textContent?.trim() + '\n';
        element = element.nextElementSibling;
      }

      const section = { level, heading: text, id, content: content.trim() };

      if (level === 1) {
        sections.push(section);
        currentSection = section;
        currentSection.subsections = [];
      } else if (currentSection) {
        currentSection.subsections.push(section);
      }
    });

    return sections;
  });
}
```

### Pattern 2: API Reference Extraction

**Use case**: API documentation with methods, parameters, returns

**Implementation**:
```typescript
async function extractAPIReference(page) {
  return await page.evaluate(() => {
    const methods = [];

    // Common API doc selectors
    const methodElements = document.querySelectorAll(
      '.api-method, .method, [data-method]'
    );

    methodElements.forEach(methodEl => {
      const method = {
        name: methodEl.querySelector('.method-name, .name')?.textContent?.trim(),
        signature: methodEl.querySelector('.signature, .syntax')?.textContent?.trim(),
        description: methodEl.querySelector('.description, .summary')?.textContent?.trim(),
        parameters: [],
        returns: null,
        examples: [],
      };

      // Extract parameters
      const paramElements = methodEl.querySelectorAll('.parameter, .param');
      paramElements.forEach(paramEl => {
        method.parameters.push({
          name: paramEl.querySelector('.param-name, .name')?.textContent?.trim(),
          type: paramEl.querySelector('.param-type, .type')?.textContent?.trim(),
          required: paramEl.classList.contains('required') ||
                     paramEl.querySelector('.required') !== null,
          description: paramEl.querySelector('.param-description, .description')?.textContent?.trim(),
        });
      });

      // Extract return value
      const returnEl = methodEl.querySelector('.return, .returns');
      if (returnEl) {
        method.returns = {
          type: returnEl.querySelector('.type')?.textContent?.trim(),
          description: returnEl.querySelector('.description')?.textContent?.trim(),
        };
      }

      // Extract code examples
      const exampleElements = methodEl.querySelectorAll('.example code, pre code');
      exampleElements.forEach(exampleEl => {
        method.examples.push(exampleEl.textContent?.trim());
      });

      methods.push(method);
    });

    return methods;
  });
}
```

### Pattern 3: Tutorial Step Extraction

**Use case**: Step-by-step tutorials with instructions and code

**Implementation**:
```typescript
async function extractTutorial(page) {
  return await page.evaluate(() => {
    const steps = [];

    // Find step containers
    const stepElements = document.querySelectorAll(
      '.step, [data-step], .tutorial-step'
    );

    stepElements.forEach((stepEl, index) => {
      const step = {
        number: index + 1,
        title: stepEl.querySelector('h2, h3, .step-title')?.textContent?.trim(),
        instructions: '',
        code: [],
        images: [],
      };

      // Extract instructions (paragraphs)
      const paragraphs = stepEl.querySelectorAll('p');
      step.instructions = Array.from(paragraphs)
        .map(p => p.textContent?.trim())
        .join('\n\n');

      // Extract code blocks
      const codeBlocks = stepEl.querySelectorAll('pre code, .code-block');
      codeBlocks.forEach(codeEl => {
        const language = codeEl.className.match(/language-(\w+)/)?.[1] || 'text';
        step.code.push({
          language,
          code: codeEl.textContent?.trim(),
        });
      });

      // Extract images
      const images = stepEl.querySelectorAll('img');
      images.forEach(img => {
        step.images.push({
          src: img.src,
          alt: img.alt,
          caption: img.parentElement?.querySelector('figcaption')?.textContent?.trim(),
        });
      });

      steps.push(step);
    });

    return steps;
  });
}
```

### Pattern 4: Table Data Extraction

**Use case**: Configuration tables, API endpoints, comparison tables

**Implementation**:
```typescript
async function extractTables(page) {
  return await page.evaluate(() => {
    const tables = [];

    document.querySelectorAll('table').forEach(table => {
      const headers = Array.from(table.querySelectorAll('thead th')).map(
        th => th.textContent?.trim()
      );

      const rows = [];
      table.querySelectorAll('tbody tr').forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(
          td => td.textContent?.trim()
        );

        const row = {};
        headers.forEach((header, index) => {
          row[header] = cells[index];
        });

        rows.push(row);
      });

      tables.push({
        caption: table.querySelector('caption')?.textContent?.trim(),
        headers,
        rows,
      });
    });

    return tables;
  });
}
```

## Navigation Patterns

### Pattern 5: Sidebar Navigation Extraction

**Use case**: Documentation sites with sidebar navigation

**Implementation**:
```typescript
async function extractNavigation(page) {
  return await page.evaluate(() => {
    const navigation = [];

    // Common sidebar selectors
    const navElement = document.querySelector(
      'nav, .sidebar, .toc, [role="navigation"]'
    );

    if (!navElement) return [];

    // Build navigation tree
    function buildNavTree(element, level = 0) {
      const items = [];

      const links = element.querySelectorAll(':scope > ul > li, :scope > li');

      links.forEach(li => {
        const link = li.querySelector('a');
        const item = {
          text: link?.textContent?.trim(),
          href: link?.href,
          level,
          children: [],
        };

        // Check for nested navigation
        const nested = li.querySelector('ul');
        if (nested) {
          item.children = buildNavTree(nested, level + 1);
        }

        items.push(item);
      });

      return items;
    }

    return buildNavTree(navElement);
  });
}
```

### Pattern 6: Pagination Discovery

**Use case**: Multi-page documentation

**Implementation**:
```typescript
async function findAllPages(page, baseUrl) {
  const allPages = new Set([baseUrl]);

  async function discoverPages(currentUrl) {
    await page.goto(currentUrl);

    // Find "next" link
    const nextLink = await page.evaluate(() => {
      const nextSelectors = [
        'a[rel="next"]',
        '.next-page',
        'a:has-text("Next")',
        '.pagination .next a',
      ];

      for (const selector of nextSelectors) {
        const link = document.querySelector(selector);
        if (link?.href) return link.href;
      }

      return null;
    });

    if (nextLink && !allPages.has(nextLink)) {
      allPages.add(nextLink);
      await discoverPages(nextLink);
    }
  }

  await discoverPages(baseUrl);
  return Array.from(allPages);
}
```

## Code Example Patterns

### Pattern 7: Code Block Extraction with Context

**Use case**: Extracting code examples with surrounding explanations

**Implementation**:
```typescript
async function extractCodeWithContext(page) {
  return await page.evaluate(() => {
    const examples = [];

    document.querySelectorAll('pre code, pre').forEach(codeEl => {
      const code = codeEl.textContent?.trim();
      const language = codeEl.className.match(/language-(\w+)/)?.[1] || 'text';

      // Get preceding paragraph (explanation)
      let explanation = '';
      let prevElement = codeEl.parentElement?.previousElementSibling;
      if (prevElement?.tagName === 'P') {
        explanation = prevElement.textContent?.trim();
      }

      // Get following paragraph (notes)
      let notes = '';
      let nextElement = codeEl.parentElement?.nextElementSibling;
      if (nextElement?.tagName === 'P') {
        notes = nextElement.textContent?.trim();
      }

      // Get section heading
      let section = '';
      let heading = codeEl.closest('section')?.querySelector('h2, h3');
      if (heading) {
        section = heading.textContent?.trim();
      }

      examples.push({
        code,
        language,
        section,
        explanation,
        notes,
      });
    });

    return examples;
  });
}
```

### Pattern 8: Interactive Example Detection

**Use case**: Identify live code examples or sandboxes

**Implementation**:
```typescript
async function findInteractiveExamples(page) {
  return await page.evaluate(() => {
    const interactive = [];

    // Common interactive example indicators
    const indicators = [
      'iframe[src*="codesandbox"]',
      'iframe[src*="stackblitz"]',
      'iframe[src*="codepen"]',
      '[data-playground]',
      '.interactive-example',
    ];

    indicators.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        interactive.push({
          type: selector.includes('iframe') ? 'embedded' : 'inline',
          url: el.src || el.dataset.url,
          title: el.title || el.dataset.title,
        });
      });
    });

    return interactive;
  });
}
```

## Metadata Extraction

### Pattern 9: Version and Date Information

**Use case**: Track documentation version and update date

**Implementation**:
```typescript
async function extractMetadata(page) {
  return await page.evaluate(() => {
    const metadata = {
      version: null,
      lastUpdated: null,
      author: null,
    };

    // Version detection
    const versionSelectors = [
      '.version',
      '[data-version]',
      '.docs-version',
      'meta[name="version"]',
    ];

    for (const selector of versionSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        metadata.version =
          el.textContent?.trim() ||
          el.getAttribute('content') ||
          el.dataset.version;
        break;
      }
    }

    // Last updated
    const dateSelectors = [
      'time[datetime]',
      '.last-updated',
      '[data-updated]',
      'meta[property="article:modified_time"]',
    ];

    for (const selector of dateSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        metadata.lastUpdated =
          el.getAttribute('datetime') ||
          el.getAttribute('content') ||
          el.textContent?.trim();
        break;
      }
    }

    // Author
    const authorSelectors = [
      'meta[name="author"]',
      '.author',
      '[rel="author"]',
    ];

    for (const selector of authorSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        metadata.author =
          el.getAttribute('content') ||
          el.textContent?.trim();
        break;
      }
    }

    return metadata;
  });
}
```

## Search and Filter Patterns

### Pattern 10: Documentation Search Index

**Use case**: Build searchable index of documentation

**Implementation**:
```typescript
function buildSearchIndex(docs) {
  const index = [];

  docs.forEach(doc => {
    // Index headings
    doc.headings?.forEach(heading => {
      index.push({
        type: 'heading',
        content: heading.text,
        url: `${doc.url}#${heading.id}`,
        page: doc.title,
        level: heading.level,
      });
    });

    // Index code examples
    doc.codeExamples?.forEach((example, i) => {
      const keywords = extractCodeKeywords(example.code);
      index.push({
        type: 'code',
        content: example.code.substring(0, 200), // Preview
        language: example.language,
        keywords,
        url: `${doc.url}#example-${i}`,
        page: doc.title,
      });
    });

    // Index paragraphs
    doc.paragraphs?.forEach(para => {
      if (para.length > 50) {
        // Meaningful paragraphs only
        index.push({
          type: 'text',
          content: para,
          url: doc.url,
          page: doc.title,
        });
      }
    });
  });

  return index;
}

function extractCodeKeywords(code) {
  // Extract function names, class names, important keywords
  const patterns = [
    /function\s+(\w+)/g,
    /class\s+(\w+)/g,
    /const\s+(\w+)/g,
    /import\s+.*from\s+['"](.+)['"]/g,
  ];

  const keywords = new Set();

  patterns.forEach(pattern => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      keywords.add(match[1]);
    }
  });

  return Array.from(keywords);
}
```

## Anti-Pattern Avoidance

### What NOT to Do

**❌ Don't extract entire DOM**:
```typescript
// Bad: Too much data, poor structure
const content = document.body.innerHTML;
```

**✅ Do extract structured data**:
```typescript
// Good: Structured, meaningful
const content = extractSections(document);
```

**❌ Don't ignore context**:
```typescript
// Bad: Code without explanation
const code = document.querySelector('code').textContent;
```

**✅ Do include context**:
```typescript
// Good: Code with surrounding context
const example = extractCodeWithContext(codeElement);
```

**❌ Don't use brittle selectors**:
```typescript
// Bad: CSS specific, breaks easily
const title = document.querySelector('div > div > h1').textContent;
```

**✅ Do use semantic selectors**:
```typescript
// Good: Semantic, resilient
const title = document.querySelector('h1, [role="heading"]').textContent;
```

---

Use these patterns as templates for extracting documentation from various sources. Adapt selectors and structure to match the specific documentation site you're working with.

