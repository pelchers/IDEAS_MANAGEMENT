#!/usr/bin/env node

/**
 * Document Structure Parser
 *
 * Analyzes ingested document JSON and creates hierarchical outline
 * Identifies chapters, sections, subsections, and content blocks
 *
 * Usage:
 *   node parse-structure.js document.json structure.json
 *   node parse-structure.js document.json structure.json --format markdown
 */

const fs = require('fs');
const path = require('path');

function parseHierarchy(headings) {
  const hierarchy = [];
  const stack = [];

  headings.forEach(heading => {
    const level = heading.level || detectLevel(heading);
    const node = {
      ...heading,
      level: level,
      children: []
    };

    // Find parent at appropriate level
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      hierarchy.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  });

  return hierarchy;
}

function detectLevel(heading) {
  // Detect heading level from various indicators
  if (heading.type === 'chapter') return 1;
  if (heading.type === 'section') return 2;
  if (heading.type === 'subsection') return 3;

  // Try to detect from numbering pattern
  if (heading.number) {
    const dots = (heading.number.match(/\./g) || []).length;
    return Math.min(dots + 1, 6);
  }

  return 2; // Default
}

function buildTableOfContents(hierarchy, maxDepth = 3) {
  const toc = [];

  function traverse(nodes, depth = 1, prefix = '') {
    nodes.forEach((node, index) => {
      const number = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
      const entry = {
        number: number,
        title: node.title,
        level: depth,
        page: node.page || node.line
      };

      toc.push(entry);

      if (depth < maxDepth && node.children && node.children.length > 0) {
        traverse(node.children, depth + 1, number);
      }
    });
  }

  traverse(hierarchy);
  return toc;
}

function identifyContentBlocks(document) {
  const blocks = [];
  const text = document.content?.fullText || document.article?.textContent || '';

  // Identify different types of content blocks
  const patterns = {
    definition: /^([A-Z][a-z\s]+):\s+(.+)$/gm,
    example: /^(Example|E\.g\.|For example)[:\s]+(.+)$/gmi,
    theorem: /^(Theorem|Lemma|Corollary)\s+(\d+(?:\.\d+)*)[:\s]+(.+)$/gmi,
    proof: /^Proof[:\s]+(.+)$/gmi,
    note: /^(Note|Remark|Warning)[:\s]+(.+)$/gmi,
    question: /^(Question|Problem|Exercise)\s+(\d+)[:\s]+(.+)$/gmi
  };

  Object.entries(patterns).forEach(([type, pattern]) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      blocks.push({
        type: type,
        content: match[0],
        position: match.index
      });
    }
  });

  return blocks.sort((a, b) => a.position - b.position);
}

function extractLearningObjectives(document) {
  const objectives = [];
  const text = document.content?.fullText || document.article?.textContent || '';

  // Common patterns for learning objectives
  const patterns = [
    /(?:After|By)\s+(?:reading|completing)\s+this\s+(?:chapter|section),\s+you\s+will\s+(?:be able to|understand)[:\s]+(.+?)(?:\n\n|\.\s+[A-Z])/gis,
    /(?:Learning objectives|Objectives)[:\s]+(.+?)(?:\n\n|^[A-Z])/gis,
    /Students\s+will\s+(?:be able to|learn)[:\s]+(.+?)(?:\n\n|\.\s+[A-Z])/gis
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const objectiveText = match[1].trim();
      // Split by bullets or numbered lists
      const items = objectiveText.split(/[\n•\-\*]|\d+\./).filter(s => s.trim());
      items.forEach(item => {
        if (item.trim()) {
          objectives.push(item.trim());
        }
      });
    }
  });

  return [...new Set(objectives)]; // Remove duplicates
}

function analyzeComplexity(document) {
  const text = document.content?.fullText || document.article?.textContent || '';
  const words = text.split(/\s+/);
  const wordCount = words.length;

  // Calculate average word length
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;

  // Count complex words (3+ syllables, simplified)
  const complexWords = words.filter(word => word.length > 12).length;
  const complexWordRatio = complexWords / wordCount;

  // Estimate reading level (simplified Flesch-Kincaid)
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = wordCount / sentences;
  const readingLevel = 0.39 * avgWordsPerSentence + 11.8 * complexWordRatio - 15.59;

  return {
    wordCount: wordCount,
    sentenceCount: sentences,
    avgWordLength: avgWordLength.toFixed(2),
    avgWordsPerSentence: avgWordsPerSentence.toFixed(2),
    complexWordRatio: (complexWordRatio * 100).toFixed(2) + '%',
    estimatedGradeLevel: Math.max(1, Math.round(readingLevel)),
    difficulty: readingLevel < 6 ? 'Elementary' :
                readingLevel < 9 ? 'Middle School' :
                readingLevel < 13 ? 'High School' :
                readingLevel < 16 ? 'College' : 'Graduate'
  };
}

function formatAsMarkdown(structure, document) {
  let markdown = `# Document Structure Analysis\n\n`;
  markdown += `**Source**: ${document.source}\n`;
  markdown += `**Analyzed**: ${new Date().toISOString()}\n\n`;

  markdown += `## Table of Contents\n\n`;
  structure.tableOfContents.forEach(entry => {
    const indent = '  '.repeat(entry.level - 1);
    markdown += `${indent}- ${entry.number} ${entry.title}\n`;
  });

  markdown += `\n## Document Hierarchy\n\n`;
  function renderHierarchy(nodes, depth = 0) {
    nodes.forEach(node => {
      const indent = '  '.repeat(depth);
      markdown += `${indent}- **${node.title}**`;
      if (node.page) markdown += ` (page ${node.page})`;
      markdown += '\n';
      if (node.children && node.children.length > 0) {
        renderHierarchy(node.children, depth + 1);
      }
    });
  }
  renderHierarchy(structure.hierarchy);

  if (structure.contentBlocks && structure.contentBlocks.length > 0) {
    markdown += `\n## Content Blocks\n\n`;
    structure.contentBlocks.forEach(block => {
      markdown += `- **${block.type}**: ${block.content.slice(0, 100)}...\n`;
    });
  }

  if (structure.learningObjectives && structure.learningObjectives.length > 0) {
    markdown += `\n## Learning Objectives\n\n`;
    structure.learningObjectives.forEach((obj, i) => {
      markdown += `${i + 1}. ${obj}\n`;
    });
  }

  markdown += `\n## Complexity Analysis\n\n`;
  Object.entries(structure.complexity).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    markdown += `- **${label}**: ${value}\n`;
  });

  return markdown;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node parse-structure.js <document.json> <output.json> [--format markdown]');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const outputFormat = args.includes('--format') && args.includes('markdown') ? 'markdown' : 'json';

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  try {
    console.log('🔍 Analyzing document structure...');

    // Load document
    const document = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    console.log(`📄 Document: ${document.source || 'Unknown'}`);

    // Extract headings from various sources
    const headings = document.structure?.detectedHeadings ||
                     document.structure?.headings ||
                     [];

    console.log(`📋 Found ${headings.length} headings`);

    // Parse hierarchy
    const hierarchy = parseHierarchy(headings);
    console.log(`🌳 Built hierarchy with ${hierarchy.length} top-level sections`);

    // Build table of contents
    const toc = buildTableOfContents(hierarchy);
    console.log(`📑 Generated TOC with ${toc.length} entries`);

    // Identify content blocks
    const contentBlocks = identifyContentBlocks(document);
    console.log(`📦 Found ${contentBlocks.length} content blocks`);

    // Extract learning objectives
    const objectives = extractLearningObjectives(document);
    console.log(`🎯 Extracted ${objectives.length} learning objectives`);

    // Analyze complexity
    const complexity = analyzeComplexity(document);
    console.log(`📊 Complexity: ${complexity.difficulty} level`);

    // Build structure output
    const structure = {
      source: document.source,
      analyzedAt: new Date().toISOString(),
      hierarchy: hierarchy,
      tableOfContents: toc,
      contentBlocks: contentBlocks,
      learningObjectives: objectives,
      complexity: complexity,
      metadata: {
        totalHeadings: headings.length,
        maxDepth: Math.max(...headings.map(h => h.level || 1)),
        totalContentBlocks: contentBlocks.length
      }
    };

    // Write output
    if (outputFormat === 'markdown') {
      const markdown = formatAsMarkdown(structure, document);
      const mdPath = outputPath.replace(/\.json$/, '.md');
      fs.writeFileSync(mdPath, markdown);
      console.log(`✅ Structure analysis complete: ${mdPath}`);
    } else {
      fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2));
      console.log(`✅ Structure analysis complete: ${outputPath}`);
    }

  } catch (error) {
    console.error('❌ Error analyzing structure:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseHierarchy, buildTableOfContents, identifyContentBlocks, analyzeComplexity };

