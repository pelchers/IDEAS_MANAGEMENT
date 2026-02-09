#!/usr/bin/env node

/**
 * Documentation Crawler
 *
 * Crawls documentation sites and extracts structured content.
 *
 * Usage: node doc-crawler.js <base-url> [max-pages]
 */

const { chromium } = require('playwright');
const fs = require('fs/promises');
const path = require('path');

class DocumentationCrawler {
  constructor(baseUrl, maxPages = 50) {
    this.baseUrl = baseUrl;
    this.maxPages = maxPages;
    this.visited = new Set();
    this.queue = [baseUrl];
    this.documentation = [];
  }

  async crawl() {
    console.log(`Starting crawl of ${this.baseUrl}\n`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    while (this.queue.length > 0 && this.visited.size < this.maxPages) {
      const url = this.queue.shift();

      if (this.visited.has(url)) continue;
      this.visited.add(url);

      try {
        console.log(`[${this.visited.size}/${this.maxPages}] Crawling: ${url}`);

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Extract page content
        const pageData = await this.extractPageContent(page, url);
        this.documentation.push(pageData);

        // Find links to crawl
        const links = await this.findDocumentationLinks(page);
        for (const link of links) {
          if (!this.visited.has(link) && !this.queue.includes(link)) {
            this.queue.push(link);
          }
        }

        // Be nice to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error crawling ${url}:`, error.message);
      }
    }

    await browser.close();

    console.log(`\nCrawl complete! Visited ${this.visited.size} pages`);
    return this.documentation;
  }

  async extractPageContent(page, url) {
    return await page.evaluate(url => {
      // Find main content area
      const mainSelectors = [
        'main',
        'article',
        '[role="main"]',
        '.documentation',
        '.content',
        '#content',
      ];

      let mainElement = null;
      for (const selector of mainSelectors) {
        mainElement = document.querySelector(selector);
        if (mainElement) break;
      }

      if (!mainElement) mainElement = document.body;

      // Extract structured content
      const headings = Array.from(
        mainElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
      ).map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim(),
        id: h.id,
      }));

      const codeBlocks = Array.from(
        mainElement.querySelectorAll('pre code, pre')
      ).map((code, index) => {
        const language =
          code.className.match(/language-(\w+)/)?.[1] ||
          code.parentElement?.className.match(/language-(\w+)/)?.[1] ||
          'text';

        return {
          index,
          language,
          code: code.textContent?.trim(),
        };
      });

      const links = Array.from(mainElement.querySelectorAll('a[href]'))
        .map(a => ({
          text: a.textContent?.trim(),
          href: a.href,
        }))
        .filter(link => link.href && link.text);

      const paragraphs = Array.from(mainElement.querySelectorAll('p'))
        .map(p => p.textContent?.trim())
        .filter(text => text && text.length > 0);

      return {
        url,
        title: document.title,
        headings,
        codeBlocks,
        links,
        paragraphs,
        extractedAt: new Date().toISOString(),
      };
    }, url);
  }

  async findDocumentationLinks(page) {
    const links = await page.evaluate(baseUrl => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(href => {
          try {
            const url = new URL(href);
            const base = new URL(baseUrl);

            // Same origin
            if (url.origin !== base.origin) return false;

            // Contains /docs/ or /documentation/
            if (!url.pathname.includes('/docs') &&
                !url.pathname.includes('/documentation') &&
                !url.pathname.includes('/guide') &&
                !url.pathname.includes('/reference')) {
              return false;
            }

            // Not a file download
            if (url.pathname.match(/\.(pdf|zip|tar|gz)$/)) return false;

            // Not an anchor link
            if (url.hash && url.pathname === base.pathname) return false;

            return true;
          } catch (error) {
            return false;
          }
        });
    }, this.baseUrl);

    return [...new Set(links)]; // Deduplicate
  }

  async save(outputFile) {
    // Save JSON
    await fs.writeFile(
      outputFile,
      JSON.stringify(this.documentation, null, 2)
    );
    console.log(`\n✓ Saved documentation to: ${outputFile}`);

    // Generate index
    const index = this.generateIndex();
    const indexFile = outputFile.replace('.json', '-index.md');
    await fs.writeFile(indexFile, index);
    console.log(`✓ Saved index to: ${indexFile}`);

    // Generate stats
    const stats = this.generateStats();
    console.log(`\n${stats}`);
  }

  generateIndex() {
    let md = `# Documentation Index\n\n`;
    md += `**Base URL**: ${this.baseUrl}\n`;
    md += `**Pages Crawled**: ${this.documentation.length}\n`;
    md += `**Crawled At**: ${new Date().toLocaleString()}\n\n`;

    md += `## Pages\n\n`;

    for (const doc of this.documentation) {
      md += `### [${doc.title}](${doc.url})\n\n`;

      if (doc.headings.length > 0) {
        md += `**Sections**:\n`;
        for (const heading of doc.headings.slice(0, 5)) {
          const indent = '  '.repeat(heading.level - 1);
          md += `${indent}- ${heading.text}\n`;
        }
        md += `\n`;
      }

      if (doc.codeBlocks.length > 0) {
        md += `**Code Examples**: ${doc.codeBlocks.length}\n\n`;
      }
    }

    return md;
  }

  generateStats() {
    const totalHeadings = this.documentation.reduce(
      (sum, doc) => sum + doc.headings.length,
      0
    );
    const totalCodeBlocks = this.documentation.reduce(
      (sum, doc) => sum + doc.codeBlocks.length,
      0
    );
    const totalLinks = this.documentation.reduce(
      (sum, doc) => sum + doc.links.length,
      0
    );

    return `Statistics:
  Pages: ${this.documentation.length}
  Headings: ${totalHeadings}
  Code Blocks: ${totalCodeBlocks}
  Links: ${totalLinks}`;
  }
}

// Main execution
if (require.main === module) {
  const baseUrl = process.argv[2];
  const maxPages = parseInt(process.argv[3]) || 50;

  if (!baseUrl) {
    console.error('Usage: node doc-crawler.js <base-url> [max-pages]');
    console.error('Example: node doc-crawler.js https://playwright.dev/docs 20');
    process.exit(1);
  }

  try {
    new URL(baseUrl);
  } catch (error) {
    console.error('Invalid URL:', baseUrl);
    process.exit(1);
  }

  const crawler = new DocumentationCrawler(baseUrl, maxPages);
  const outputFile = `docs-${Date.now()}.json`;

  crawler
    .crawl()
    .then(() => crawler.save(outputFile))
    .then(() => {
      console.log('\n✓ Documentation crawl completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n✗ Crawl failed:', error);
      process.exit(1);
    });
}

module.exports = { DocumentationCrawler };

