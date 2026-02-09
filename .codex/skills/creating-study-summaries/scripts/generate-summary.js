#!/usr/bin/env node

/**
 * Summary Generation Script
 * Creates study summaries from ingested academic content
 *
 * Usage:
 *   node generate-summary.js input.json output.md
 *   node generate-summary.js input.json output.md --depth detailed --format markdown
 */

const fs = require('fs');

function extractKeyConcepts(document, maxConcepts = 20) {
  const concepts = document.keyConcepts || [];
  return concepts.slice(0, maxConcepts).map((term, index) => ({
    term: term,
    importance: 1 - (index / maxConcepts),
    category: 'primary'
  }));
}

function generateBriefSummary(document) {
  const title = document.metadata?.title || 'Document';
  const concepts = extractKeyConcepts(document, 5);
  const conceptList = concepts.map(c => c.term).join(', ');

  return `${title} covers ${conceptList} and related topics.`;
}

function generateStandardSummary(document) {
  const brief = generateBriefSummary(document);
  const structure = document.structure?.chapters || [];

  let summary = `# ${document.metadata?.title || 'Summary'}\n\n`;
  summary += `## Overview\n${brief}\n\n`;
  summary += `## Main Topics\n`;

  structure.slice(0, 5).forEach(chapter => {
    summary += `- **${chapter.title}**: Key concepts and applications\n`;
  });

  return summary;
}

function generateDetailedSummary(document) {
  let summary = generateStandardSummary(document);

  summary += `\n## Key Concepts\n`;
  const concepts = extractKeyConcepts(document, 10);
  concepts.forEach(concept => {
    summary += `### ${concept.term}\n`;
    summary += `[Definition and explanation would be extracted from document]\n\n`;
  });

  return summary;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node generate-summary.js <input.json> <output.md> [--depth brief|standard|detailed]');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const depth = args.includes('--depth') ? args[args.indexOf('--depth') + 1] : 'standard';

  const document = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`📄 Generating ${depth} summary...`);

  let summary;
  switch (depth) {
    case 'brief': summary = generateBriefSummary(document); break;
    case 'detailed': summary = generateDetailedSummary(document); break;
    default: summary = generateStandardSummary(document);
  }

  fs.writeFileSync(outputPath, summary);
  console.log(`✅ Summary created: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { extractKeyConcepts, generateBriefSummary, generateStandardSummary };

