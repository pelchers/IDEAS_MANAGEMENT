#!/usr/bin/env node
/**
 * User Story Generator
 * Converts requirements into user story format with acceptance criteria
 * Usage: node create-user-stories.js requirements.json user-stories.md
 */

const fs = require('fs');

function generateUserStories(requirements) {
  let markdown = `# User Stories\n\n`;
  markdown += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  markdown += `## Overview\n\n`;
  markdown += `Total Stories: ${requirements.userStories.length}\n`;
  markdown += `Functional Requirements: ${requirements.functional.length}\n\n`;
  markdown += `---\n\n`;

  // Group stories by epic (derived from actor)
  const epics = {};

  requirements.userStories.forEach(story => {
    const epic = story.actor || 'General';
    if (!epics[epic]) {
      epics[epic] = [];
    }
    epics[epic].push(story);
  });

  // Convert functional requirements to user stories if none exist
  if (requirements.userStories.length === 0 && requirements.functional.length > 0) {
    markdown += `## Generated from Functional Requirements\n\n`;
    markdown += `_Note: These are auto-generated. Review and refine with stakeholders._\n\n`;

    requirements.functional.forEach(fr => {
      markdown += generateStoryMarkdown({
        id: fr.id.replace('FR', 'US'),
        actor: 'User',
        goal: fr.description,
        benefit: 'accomplish task efficiently',
        acceptanceCriteria: [],
        priority: fr.priority,
        storyPoints: null
      });
    });
  }

  // Output organized stories
  Object.keys(epics).forEach(epic => {
    markdown += `## Epic: ${epic}\n\n`;

    epics[epic].forEach(story => {
      markdown += generateStoryMarkdown(story);
    });

    markdown += `---\n\n`;
  });

  return markdown;
}

function generateStoryMarkdown(story) {
  let md = `### ${story.id}: ${story.actor} - ${story.goal.substring(0, 50)}...\n\n`;

  md += `**As a** ${story.actor}\n`;
  md += `**I want** ${story.goal}\n`;
  md += `**So that** ${story.benefit}\n\n`;

  md += `**Priority**: ${story.priority || 'TBD'}\n`;
  md += `**Story Points**: ${story.storyPoints || 'TBD'}\n`;
  md += `**Status**: ${story.status || 'Draft'}\n\n`;

  md += `#### Acceptance Criteria\n\n`;
  if (story.acceptanceCriteria && story.acceptanceCriteria.length > 0) {
    story.acceptanceCriteria.forEach(criterion => {
      md += `- [ ] ${criterion}\n`;
    });
  } else {
    md += `- [ ] Given [precondition], when [action], then [result]\n`;
    md += `- [ ] _Add specific acceptance criteria_\n`;
  }

  md += `\n#### Definition of Done\n\n`;
  md += `- [ ] Code complete and reviewed\n`;
  md += `- [ ] Unit tests written and passing\n`;
  md += `- [ ] Integration tests passing\n`;
  md += `- [ ] Documentation updated\n`;
  md += `- [ ] QA approved\n`;
  md += `- [ ] Deployed to staging\n\n`;

  md += `#### Technical Notes\n\n`;
  md += `_Add implementation considerations, dependencies, or risks_\n\n`;

  md += `---\n\n`;

  return md;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node create-user-stories.js <requirements.json> <user-stories.md>');
    console.error('Example: node create-user-stories.js requirements.json stories.md');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  const requirements = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  console.log('📝 Generating user stories...');

  const markdown = generateUserStories(requirements);

  fs.writeFileSync(outputPath, markdown);

  console.log(`\n✅ User stories created: ${outputPath}`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Review stories with product owner`);
  console.log(`   2. Add specific acceptance criteria`);
  console.log(`   3. Estimate story points`);
  console.log(`   4. Prioritize stories (Must/Should/Could)`);
  console.log(`   5. Break large stories into smaller ones`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateUserStories, generateStoryMarkdown };

