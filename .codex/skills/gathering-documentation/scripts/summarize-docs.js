#!/usr/bin/env node

/**
 * Documentation Summarizer
 *
 * Analyzes and summarizes gathered documentation.
 *
 * Usage: node summarize-docs.js <documentation.json>
 */

const fs = require('fs/promises');

class DocumentationSummarizer {
  constructor(documentation) {
    this.docs = documentation;
  }

  async summarize() {
    const summary = {
      overview: this.generateOverview(),
      keyTopics: this.extractKeyTopics(),
      codePatterns: this.analyzeCodePatterns(),
      linkGraph: this.buildLinkGraph(),
      glossary: this.buildGlossary(),
    };

    return summary;
  }

  generateOverview() {
    const totalPages = this.docs.length;
    const totalHeadings = this.docs.reduce(
      (sum, doc) => sum + (doc.headings?.length || 0),
      0
    );
    const totalCodeBlocks = this.docs.reduce(
      (sum, doc) => sum + (doc.codeBlocks?.length || 0),
      0
    );

    const languages = new Set();
    this.docs.forEach(doc => {
      doc.codeBlocks?.forEach(block => {
        if (block.language) languages.add(block.language);
      });
    });

    return {
      totalPages,
      totalHeadings,
      totalCodeBlocks,
      languages: Array.from(languages),
      coverage: {
        pagesWithCode: this.docs.filter(d => d.codeBlocks?.length > 0).length,
        pagesWithHeadings: this.docs.filter(d => d.headings?.length > 0).length,
      },
    };
  }

  extractKeyTopics() {
    // Extract from headings
    const headingTexts = this.docs.flatMap(doc =>
      doc.headings?.map(h => h.text.toLowerCase()) || []
    );

    // Count frequency
    const frequency = new Map();
    headingTexts.forEach(text => {
      const words = text.split(/\s+/).filter(w => w.length > 3);
      words.forEach(word => {
        frequency.set(word, (frequency.get(word) || 0) + 1);
      });
    });

    // Sort by frequency
    const topics = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([topic, count]) => ({ topic, mentions: count }));

    return topics;
  }

  analyzeCodePatterns() {
    const patterns = {
      languages: new Map(),
      commonImports: new Map(),
      functionPatterns: new Map(),
    };

    this.docs.forEach(doc => {
      doc.codeBlocks?.forEach(block => {
        // Count language usage
        patterns.languages.set(
          block.language,
          (patterns.languages.get(block.language) || 0) + 1
        );

        // Extract import statements
        const imports = block.code?.match(/^import\s+.*$/gm) || [];
        imports.forEach(imp => {
          patterns.commonImports.set(
            imp,
            (patterns.commonImports.get(imp) || 0) + 1
          );
        });

        // Extract function definitions
        const functions =
          block.code?.match(/function\s+(\w+)|const\s+(\w+)\s*=/g) || [];
        functions.forEach(fn => {
          const name = fn.match(/(\w+)/)?.[1];
          if (name) {
            patterns.functionPatterns.set(
              name,
              (patterns.functionPatterns.get(name) || 0) + 1
            );
          }
        });
      });
    });

    return {
      languageDistribution: Array.from(patterns.languages.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([lang, count]) => ({ language: lang, occurrences: count })),
      topImports: Array.from(patterns.commonImports.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([imp, count]) => ({ import: imp, occurrences: count })),
      commonFunctions: Array.from(patterns.functionPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([fn, count]) => ({ function: fn, occurrences: count })),
    };
  }

  buildLinkGraph() {
    const graph = new Map();

    this.docs.forEach(doc => {
      const outgoingLinks = new Set(
        doc.links?.map(link => link.href).filter(Boolean) || []
      );

      graph.set(doc.url, {
        title: doc.title,
        outgoingLinks: Array.from(outgoingLinks),
        outgoingCount: outgoingLinks.size,
      });
    });

    // Find pages with most outgoing links (hub pages)
    const hubs = Array.from(graph.entries())
      .sort((a, b) => b[1].outgoingCount - a[1].outgoingCount)
      .slice(0, 5)
      .map(([url, data]) => ({
        url,
        title: data.title,
        linkCount: data.outgoingCount,
      }));

    return { graph: Array.from(graph.entries()), hubs };
  }

  buildGlossary() {
    const terms = new Map();

    // Extract technical terms (capitalized, camelCase, etc.)
    this.docs.forEach(doc => {
      doc.paragraphs?.forEach(para => {
        const technicalTerms =
          para.match(/\b[A-Z][a-z]+[A-Z]\w+|\b[A-Z]{2,}\b/g) || [];
        technicalTerms.forEach(term => {
          if (!terms.has(term)) {
            terms.set(term, { term, pages: [] });
          }
          terms.get(term).pages.push(doc.url);
        });
      });
    });

    return Array.from(terms.values())
      .map(entry => ({
        term: entry.term,
        occurrences: entry.pages.length,
        pages: [...new Set(entry.pages)],
      }))
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 30);
  }

  generateMarkdownSummary(summary) {
    let md = `# Documentation Summary\n\n`;

    // Overview
    md += `## Overview\n\n`;
    md += `- **Total Pages**: ${summary.overview.totalPages}\n`;
    md += `- **Total Headings**: ${summary.overview.totalHeadings}\n`;
    md += `- **Total Code Examples**: ${summary.overview.totalCodeBlocks}\n`;
    md += `- **Languages**: ${summary.overview.languages.join(', ')}\n`;
    md += `- **Pages with Code**: ${summary.overview.coverage.pagesWithCode}\n`;
    md += `- **Pages with Headings**: ${summary.overview.coverage.pagesWithHeadings}\n\n`;

    // Key Topics
    md += `## Key Topics\n\n`;
    summary.keyTopics.slice(0, 10).forEach(({ topic, mentions }) => {
      md += `- **${topic}**: ${mentions} mentions\n`;
    });
    md += `\n`;

    // Code Patterns
    md += `## Code Patterns\n\n`;
    md += `### Language Distribution\n\n`;
    summary.codePatterns.languageDistribution.forEach(({ language, occurrences }) => {
      md += `- **${language}**: ${occurrences} examples\n`;
    });
    md += `\n`;

    // Hub Pages
    md += `## Important Pages (Most Links)\n\n`;
    summary.linkGraph.hubs.forEach(({ title, url, linkCount }) => {
      md += `- [${title}](${url}): ${linkCount} links\n`;
    });
    md += `\n`;

    // Glossary
    md += `## Technical Terms\n\n`;
    summary.glossary.slice(0, 15).forEach(({ term, occurrences }) => {
      md += `- **${term}**: ${occurrences} occurrences\n`;
    });
    md += `\n`;

    return md;
  }
}

// Main execution
if (require.main === module) {
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.error('Usage: node summarize-docs.js <documentation.json>');
    process.exit(1);
  }

  fs.readFile(inputFile, 'utf-8')
    .then(content => JSON.parse(content))
    .then(async documentation => {
      console.log(`Analyzing ${documentation.length} documentation pages...\n`);

      const summarizer = new DocumentationSummarizer(documentation);
      const summary = await summarizer.summarize();

      // Save summary JSON
      const summaryFile = inputFile.replace('.json', '-summary.json');
      await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
      console.log(`✓ Summary saved to: ${summaryFile}`);

      // Save markdown report
      const markdown = summarizer.generateMarkdownSummary(summary);
      const markdownFile = inputFile.replace('.json', '-summary.md');
      await fs.writeFile(markdownFile, markdown);
      console.log(`✓ Markdown report saved to: ${markdownFile}`);

      // Print overview
      console.log(`\n${markdown}`);

      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

module.exports = { DocumentationSummarizer };

