#!/usr/bin/env node
/**
 * Quiz Generation Script
 * Creates practice quizzes from document content
 * Usage: node generate-quiz.js input.json quiz.md --questions 20
 */

const fs = require('fs');

function generateMultipleChoice(concept, index) {
  return `**Question ${index + 1}**: What is ${concept.term}?\n\nA) Incorrect option\nB) Incorrect option\nC) [Correct definition] ✓\nD) Incorrect option\n\n`;
}

function generateTrueFalse(concept, index) {
  return `**Question ${index + 1}**: ${concept.term} is related to the main topic. **True/False**\n\n**Answer**: True\n\n`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node generate-quiz.js <input.json> <output.md> [--questions N]');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const questionCount = args.includes('--questions') ? parseInt(args[args.indexOf('--questions') + 1]) : 10;

  const document = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const concepts = (document.keyConcepts || []).slice(0, questionCount).map(term => ({ term }));

  let quiz = `# Practice Quiz\n\n`;
  quiz += `**Questions**: ${questionCount} | **Time**: ${questionCount * 2} minutes\n\n`;

  concepts.forEach((concept, index) => {
    quiz += index % 2 === 0 ? generateMultipleChoice(concept, index) : generateTrueFalse(concept, index);
  });

  fs.writeFileSync(outputPath, quiz);
  console.log(`✅ Quiz created: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

