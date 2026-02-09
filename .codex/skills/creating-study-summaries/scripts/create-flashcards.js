#!/usr/bin/env node

/**
 * Flashcard Generation Script
 * Creates Anki/Quizlet-compatible flashcards from document
 *
 * Usage:
 *   node create-flashcards.js input.json flashcards.txt --format anki
 */

const fs = require('fs');

function createFlashcardsFromConcepts(concepts) {
  return concepts.map(concept => ({
    front: `What is ${concept.term}?`,
    back: concept.definition || `[Definition for ${concept.term}]`,
    tags: ['auto-generated']
  }));
}

function formatAnki(flashcards) {
  return flashcards.map(card =>
    `"${card.front}"\t"${card.back}"\t"${card.tags.join(' ')}"`
  ).join('\n');
}

function formatQuizlet(flashcards) {
  return flashcards.map(card =>
    `${card.front}\t${card.back}`
  ).join('\n');
}

function formatJSON(flashcards) {
  return JSON.stringify({ cards: flashcards }, null, 2);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node create-flashcards.js <input.json> <output> [--format anki|quizlet|json]');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'anki';

  const document = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const concepts = (document.keyConcepts || []).slice(0, 30).map(term => ({
    term: term,
    definition: `Definition of ${term}`
  }));

  console.log(`🃏 Creating ${concepts.length} flashcards in ${format} format...`);

  const flashcards = createFlashcardsFromConcepts(concepts);
  let output;

  switch (format) {
    case 'quizlet': output = formatQuizlet(flashcards); break;
    case 'json': output = formatJSON(flashcards); break;
    default: output = formatAnki(flashcards);
  }

  fs.writeFileSync(outputPath, output);
  console.log(`✅ Flashcards created: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createFlashcardsFromConcepts, formatAnki, formatQuizlet };

