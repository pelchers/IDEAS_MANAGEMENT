#!/usr/bin/env node
/**
 * Citation Formatter
 * Formats citations in APA, MLA, Chicago, or IEEE style
 * Usage: node format-citations.js sources.json --style APA
 */

const fs = require('fs');

function formatAPA(source) {
  const { authors, year, title, journal, volume, issue, pages, doi } = source;
  const authorStr = authors.join(', ');
  return `${authorStr} (${year}). ${title}. ${journal}, ${volume}(${issue}), ${pages}. https://doi.org/${doi}`;
}

function formatMLA(source) {
  const { authors, title, journal, volume, issue, year, pages } = source;
  const authorStr = authors[0];
  return `${authorStr}. "${title}." ${journal}, vol. ${volume}, no. ${issue}, ${year}, pp. ${pages}.`;
}

function formatChicago(source) {
  const { authors, title, journal, volume, issue, year, pages } = source;
  const authorStr = authors[0];
  return `${authorStr}. "${title}." ${journal} ${volume}, no. ${issue} (${year}): ${pages}.`;
}

function formatIEEE(source, index) {
  const { authors, title, journal, volume, issue, year, pages } = source;
  const authorStr = authors.map(a => a.split(',')[0].charAt(0) + '. ' + a.split(',')[0]).join(', ');
  return `[${index + 1}] ${authorStr}, "${title}," ${journal}, vol. ${volume}, no. ${issue}, pp. ${pages}, ${year}.`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node format-citations.js <sources.json> [--style APA|MLA|Chicago|IEEE]');
    process.exit(1);
  }

  const inputPath = args[0];
  const style = args.includes('--style') ? args[args.indexOf('--style') + 1] : 'APA';

  const sources = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`📚 Formatting ${sources.length} citations in ${style} style...\n`);

  sources.forEach((source, index) => {
    let formatted;
    switch (style.toUpperCase()) {
      case 'MLA': formatted = formatMLA(source); break;
      case 'CHICAGO': formatted = formatChicago(source); break;
      case 'IEEE': formatted = formatIEEE(source, index); break;
      default: formatted = formatAPA(source);
    }
    console.log(formatted + '\n');
  });
}

if (require.main === module) {
  main().catch(console.error);
}

