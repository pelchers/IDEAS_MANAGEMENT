#!/usr/bin/env node

/**
 * PDF Content Ingestion Script
 *
 * Extracts text, structure, and metadata from PDF documents
 * Handles textbooks, research papers, and academic assignments
 *
 * Usage:
 *   node ingest-pdf.js input.pdf output.json
 *   node ingest-pdf.js input.pdf output.json --ocr (for scanned PDFs)
 *
 * Dependencies:
 *   npm install pdf-parse
 *
 * For OCR support:
 *   npm install pdf2pic tesseract.js
 */

const fs = require('fs');
const path = require('path');

// Mock implementation - replace with actual pdf-parse
async function extractPdfContent(pdfPath, options = {}) {
  console.log(`📄 Processing PDF: ${path.basename(pdfPath)}`);

  // Simulated extraction (replace with actual PDF parsing)
  const content = {
    metadata: {
      title: "Extracted Document Title",
      author: "Document Author",
      creator: "PDF Creator",
      producer: "PDF Producer",
      creationDate: new Date().toISOString(),
      pageCount: 150
    },
    structure: {
      chapters: [
        {
          number: 1,
          title: "Introduction",
          startPage: 1,
          sections: [
            { title: "Background", page: 2 },
            { title: "Motivation", page: 5 }
          ]
        }
      ],
      toc: []
    },
    content: {
      fullText: "Extracted text content would go here...",
      pages: []
    },
    citations: [],
    keyConcepts: []
  };

  return content;
}

async function detectDocumentType(content) {
  const text = content.content.fullText.toLowerCase();

  // Simple heuristics for document type detection
  if (text.includes('abstract') && text.includes('references')) {
    return 'research_paper';
  } else if (text.includes('chapter') && text.includes('exercises')) {
    return 'textbook';
  } else if (text.includes('problem') || text.includes('due date')) {
    return 'assignment';
  } else if (text.includes('lecture') || text.includes('notes')) {
    return 'lecture_notes';
  }

  return 'document';
}

function extractStructure(text) {
  const lines = text.split('\n');
  const structure = {
    headings: [],
    sections: []
  };

  // Pattern matching for common heading styles
  const chapterPattern = /^Chapter\s+(\d+):?\s+(.+)$/i;
  const sectionPattern = /^(\d+\.)+\s+(.+)$/;

  lines.forEach((line, index) => {
    const chapterMatch = line.match(chapterPattern);
    const sectionMatch = line.match(sectionPattern);

    if (chapterMatch) {
      structure.headings.push({
        type: 'chapter',
        number: chapterMatch[1],
        title: chapterMatch[2],
        line: index
      });
    } else if (sectionMatch) {
      structure.headings.push({
        type: 'section',
        number: sectionMatch[1],
        title: sectionMatch[2],
        line: index
      });
    }
  });

  return structure;
}

function extractCitations(text) {
  const citations = [];

  // Simple citation pattern matching (APA, MLA, etc.)
  const citationPatterns = [
    /\[(\d+)\]\s+([^.]+)\.\s+\((\d{4})\)/g, // [1] Author. (2023)
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+\((\d{4})\)/g, // Author (2023)
  ];

  citationPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      citations.push({
        reference: match[0],
        author: match[1] || match[2],
        year: match[2] || match[3]
      });
    }
  });

  return citations;
}

function extractKeyConcepts(text) {
  // Simple keyword extraction using frequency analysis
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4); // Filter short words

  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Get top 20 most frequent terms
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node ingest-pdf.js <input.pdf> <output.json> [--ocr]');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const useOcr = args.includes('--ocr');

  // Validate input file
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  if (path.extname(inputPath).toLowerCase() !== '.pdf') {
    console.error('Error: Input file must be a PDF');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting PDF ingestion...');

    // Extract content
    const content = await extractPdfContent(inputPath, { ocr: useOcr });

    // Detect document type
    const docType = await detectDocumentType(content);
    console.log(`📚 Document type: ${docType}`);

    // Extract structure
    const structure = extractStructure(content.content.fullText);
    console.log(`📋 Found ${structure.headings.length} headings`);

    // Extract citations
    const citations = extractCitations(content.content.fullText);
    console.log(`📖 Found ${citations.length} citations`);

    // Extract key concepts
    const concepts = extractKeyConcepts(content.content.fullText);
    console.log(`🔑 Extracted ${concepts.length} key concepts`);

    // Build final output
    const output = {
      source: path.basename(inputPath),
      ingestedAt: new Date().toISOString(),
      documentType: docType,
      metadata: content.metadata,
      structure: {
        ...content.structure,
        detectedHeadings: structure.headings
      },
      content: {
        summary: content.content.fullText.slice(0, 500) + '...',
        wordCount: content.content.fullText.split(/\s+/).length,
        pageCount: content.metadata.pageCount
      },
      citations: citations,
      keyConcepts: concepts,
      extractionMethod: useOcr ? 'OCR' : 'text_extraction'
    };

    // Write output
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✅ Ingestion complete: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error during ingestion:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { extractPdfContent, extractStructure, extractCitations, extractKeyConcepts };

