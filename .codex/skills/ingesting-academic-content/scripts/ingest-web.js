#!/usr/bin/env node

/**
 * Web Content Ingestion Script
 *
 * Extracts article content from web pages using readability algorithms
 * Handles blog posts, online tutorials, documentation, and articles
 *
 * Usage:
 *   node ingest-web.js https://example.com/article output.json
 *   node ingest-web.js urls.txt output-dir/ --batch
 *
 * Dependencies:
 *   npm install node-fetch jsdom @mozilla/readability
 */

const fs = require('fs');
const path = require('path');

// Mock fetch for demonstration
async function fetchWebContent(url) {
  console.log(`🌐 Fetching: ${url}`);

  // Simulated web content
  return {
    html: '<html><body><article><h1>Article Title</h1><p>Content...</p></article></body></html>',
    url: url,
    status: 200
  };
}

function extractArticleContent(html, url) {
  // Simulated Readability extraction
  return {
    title: "Article Title",
    byline: "By Author Name",
    content: "<p>Article content would be extracted here...</p>",
    textContent: "Article content would be extracted here...",
    length: 1500,
    excerpt: "Short excerpt of the article...",
    siteName: new URL(url).hostname,
    lang: "en"
  };
}

function extractMetadata(html, url) {
  // Extract Open Graph and meta tags
  const metadata = {
    url: url,
    title: "Article Title",
    description: "Article description",
    author: "Author Name",
    publishedDate: null,
    modifiedDate: null,
    keywords: [],
    image: null,
    type: "article"
  };

  // Simulated meta tag extraction
  // In real implementation, would parse HTML for:
  // - og:title, og:description, og:image
  // - article:published_time, article:author
  // - meta keywords, meta description

  return metadata;
}

function extractStructure(textContent) {
  const lines = textContent.split('\n').filter(line => line.trim());
  const structure = {
    headings: [],
    sections: [],
    codeBlocks: [],
    links: []
  };

  // Pattern matching for headings (markdown or HTML)
  const h1Pattern = /^#\s+(.+)$/;
  const h2Pattern = /^##\s+(.+)$/;
  const h3Pattern = /^###\s+(.+)$/;

  lines.forEach((line, index) => {
    const h1Match = line.match(h1Pattern);
    const h2Match = line.match(h2Pattern);
    const h3Match = line.match(h3Pattern);

    if (h1Match) {
      structure.headings.push({ level: 1, title: h1Match[1], line: index });
    } else if (h2Match) {
      structure.headings.push({ level: 2, title: h2Match[1], line: index });
    } else if (h3Match) {
      structure.headings.push({ level: 3, title: h3Match[1], line: index });
    }
  });

  return structure;
}

function classifyContent(article) {
  const text = article.textContent.toLowerCase();
  const title = article.title.toLowerCase();

  // Content classification heuristics
  if (text.includes('tutorial') || title.includes('how to')) {
    return 'tutorial';
  } else if (text.includes('documentation') || text.includes('api reference')) {
    return 'documentation';
  } else if (text.includes('research') || text.includes('study')) {
    return 'research_article';
  } else if (text.match(/\d{4}-\d{2}-\d{2}/)) {
    return 'blog_post';
  }

  return 'article';
}

function estimateReadingTime(wordCount) {
  const wordsPerMinute = 200; // Average reading speed
  return Math.ceil(wordCount / wordsPerMinute);
}

function extractCodeExamples(html) {
  // Extract code blocks from HTML
  const codeBlocks = [];

  // Simulated code extraction
  // In real implementation, would find <pre><code> or <code> tags
  // and extract language and content

  return codeBlocks;
}

function extractLinks(html, baseUrl) {
  const links = {
    internal: [],
    external: [],
    resources: []
  };

  // Simulated link extraction
  // In real implementation, would parse <a> tags
  // and classify as internal/external

  return links;
}

async function processUrl(url, outputPath) {
  console.log(`\n📄 Processing: ${url}`);

  try {
    // Fetch content
    const response = await fetchWebContent(url);

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Extract article content
    const article = extractArticleContent(response.html, url);
    console.log(`📰 Title: ${article.title}`);

    // Extract metadata
    const metadata = extractMetadata(response.html, url);

    // Extract structure
    const structure = extractStructure(article.textContent);
    console.log(`📋 Found ${structure.headings.length} headings`);

    // Classify content
    const contentType = classifyContent(article);
    console.log(`📚 Content type: ${contentType}`);

    // Extract code examples
    const codeExamples = extractCodeExamples(response.html);

    // Extract links
    const links = extractLinks(response.html, url);

    // Calculate reading time
    const wordCount = article.textContent.split(/\s+/).length;
    const readingTime = estimateReadingTime(wordCount);

    // Build output
    const output = {
      source: url,
      ingestedAt: new Date().toISOString(),
      contentType: contentType,
      metadata: {
        ...metadata,
        wordCount: wordCount,
        readingTime: `${readingTime} min`,
        language: article.lang
      },
      article: {
        title: article.title,
        author: article.byline,
        excerpt: article.excerpt,
        content: article.content,
        textContent: article.textContent
      },
      structure: structure,
      codeExamples: codeExamples,
      links: links,
      extractionMethod: 'readability'
    };

    // Write output
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✅ Saved: ${outputPath}`);

    return output;

  } catch (error) {
    console.error(`❌ Error processing ${url}:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node ingest-web.js <url|urls.txt> <output.json|output-dir/> [--batch]');
    process.exit(1);
  }

  const [input, output] = args;
  const batchMode = args.includes('--batch');

  try {
    console.log('🚀 Starting web content ingestion...');

    if (batchMode) {
      // Batch mode: process multiple URLs from file
      if (!fs.existsSync(input)) {
        console.error(`Error: File not found: ${input}`);
        process.exit(1);
      }

      const urls = fs.readFileSync(input, 'utf-8')
        .split('\n')
        .filter(line => line.trim().startsWith('http'));

      console.log(`📋 Processing ${urls.length} URLs...`);

      // Create output directory
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true });
      }

      for (const url of urls) {
        const filename = url.replace(/[^a-z0-9]/gi, '_').slice(0, 50) + '.json';
        const outputPath = path.join(output, filename);
        await processUrl(url, outputPath);
      }

      console.log(`\n✅ Batch ingestion complete: ${urls.length} URLs processed`);

    } else {
      // Single URL mode
      if (!input.startsWith('http')) {
        console.error('Error: Input must be a valid URL');
        process.exit(1);
      }

      await processUrl(input, output);
      console.log('\n✅ Ingestion complete');
    }

  } catch (error) {
    console.error('❌ Error during ingestion:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchWebContent, extractArticleContent, extractMetadata, extractStructure };

