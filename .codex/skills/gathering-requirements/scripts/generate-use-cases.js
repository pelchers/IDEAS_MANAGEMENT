#!/usr/bin/env node
/**
 * Use Case Generator
 * Creates detailed use case documentation from user stories
 * Usage: node generate-use-cases.js user-stories.md use-cases.md
 */

const fs = require('fs');

function parseUserStories(markdown) {
  const stories = [];
  const storyPattern = /###\s+(\w+-\d+):\s+([^-]+)-\s+(.+?)\n\n\*\*As a\*\*\s+(.+?)\n\*\*I want\*\*\s+(.+?)\n\*\*So that\*\*\s+(.+?)\n/g;

  let match;
  while ((match = storyPattern.exec(markdown)) !== null) {
    stories.push({
      id: match[1],
      actor: match[2].trim(),
      title: match[3].trim(),
      actorFull: match[4].trim(),
      goal: match[5].trim(),
      benefit: match[6].trim()
    });
  }

  return stories;
}

function generateUseCase(story, index) {
  const ucId = `UC-${String(index + 1).padStart(3, '0')}`;

  let md = `# Use Case: ${ucId} - ${story.title || story.goal}\n\n`;

  md += `## Overview\n\n`;
  md += `**Use Case ID**: ${ucId}\n`;
  md += `**Related Story**: ${story.id}\n`;
  md += `**Actor**: ${story.actorFull || story.actor}\n`;
  md += `**Goal**: ${story.goal}\n`;
  md += `**Business Value**: ${story.benefit}\n\n`;

  md += `**Preconditions**:\n`;
  md += `- User is authenticated (if applicable)\n`;
  md += `- User has necessary permissions\n`;
  md += `- _Add specific preconditions_\n\n`;

  md += `**Postconditions**:\n`;
  md += `- ${story.goal} is accomplished\n`;
  md += `- System state is updated\n`;
  md += `- _Add specific postconditions_\n\n`;

  md += `---\n\n`;

  md += `## Main Success Scenario\n\n`;
  md += `1. ${story.actorFull || story.actor} initiates ${story.goal}\n`;
  md += `2. System displays relevant interface\n`;
  md += `3. ${story.actorFull || story.actor} provides required information\n`;
  md += `4. System validates input\n`;
  md += `5. System processes request\n`;
  md += `6. System confirms success\n`;
  md += `7. ${story.actorFull || story.actor} sees confirmation\n`;
  md += `8. Use case ends in success\n\n`;

  md += `_Note: Customize these steps based on actual workflow_\n\n`;

  md += `---\n\n`;

  md += `## Alternative Flows\n\n`;

  md += `### 4a. Validation Fails\n`;
  md += `1. System identifies validation errors\n`;
  md += `2. System displays error messages\n`;
  md += `3. System highlights problematic fields\n`;
  md += `4. Return to step 3 of main flow\n\n`;

  md += `### 5a. Processing Error\n`;
  md += `1. System encounters error during processing\n`;
  md += `2. System rolls back changes\n`;
  md += `3. System displays error message\n`;
  md += `4. ${story.actorFull || story.actor} can retry or cancel\n`;
  md += `5. If retry, return to step 3 of main flow\n`;
  md += `6. If cancel, use case ends\n\n`;

  md += `---\n\n`;

  md += `## Exception Flows\n\n`;

  md += `### Network Timeout\n`;
  md += `**Trigger**: Network request exceeds timeout threshold\n`;
  md += `**Response**: System displays "Connection timeout, please try again"\n`;
  md += `**Resolution**: User can retry operation\n\n`;

  md += `### Server Error\n`;
  md += `**Trigger**: Server returns 500-level error\n`;
  md += `**Response**: System logs error and displays generic message\n`;
  md += `**Resolution**: Use case ends, support team notified\n\n`;

  md += `### Authorization Failure\n`;
  md += `**Trigger**: User lacks required permissions\n`;
  md += `**Response**: System displays "Access denied" message\n`;
  md += `**Resolution**: Use case ends, user redirected\n\n`;

  md += `---\n\n`;

  md += `## Business Rules\n\n`;
  md += `- _BR-001: Add relevant business rules_\n`;
  md += `- _BR-002: Constraints and policies_\n\n`;

  md += `---\n\n`;

  md += `## UI/UX Notes\n\n`;
  md += `- Screen/page: _Specify UI location_\n`;
  md += `- Key interactions: _Buttons, forms, etc._\n`;
  md += `- Responsive behavior: _Mobile/desktop considerations_\n`;
  md += `- Accessibility: _ARIA labels, keyboard nav_\n\n`;

  md += `---\n\n`;

  md += `## Technical Notes\n\n`;
  md += `- **API Endpoints**: _List relevant endpoints_\n`;
  md += `- **Database**: _Tables/collections affected_\n`;
  md += `- **Third-party Services**: _External integrations_\n`;
  md += `- **Performance**: _Response time requirements_\n`;
  md += `- **Security**: _Auth, validation, encryption_\n\n`;

  md += `---\n\n`;

  md += `## Test Scenarios\n\n`;
  md += `### Positive Tests\n`;
  md += `- [ ] Happy path completes successfully\n`;
  md += `- [ ] All fields accept valid input\n`;
  md += `- [ ] Confirmation is displayed\n\n`;

  md += `### Negative Tests\n`;
  md += `- [ ] Invalid input is rejected\n`;
  md += `- [ ] Unauthorized access is blocked\n`;
  md += `- [ ] Network errors are handled gracefully\n\n`;

  md += `### Edge Cases\n`;
  md += `- [ ] Concurrent operations handled correctly\n`;
  md += `- [ ] Maximum input length enforced\n`;
  md += `- [ ] Special characters handled\n\n`;

  md += `---\n\n`;

  md += `## Related Use Cases\n\n`;
  md += `- _UC-XXX: Related use case 1_\n`;
  md += `- _UC-XXX: Related use case 2_\n\n`;

  md += `---\n\n`;

  return md;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node generate-use-cases.js <user-stories.md> <use-cases.md>');
    console.error('Example: node generate-use-cases.js stories.md use-cases.md');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(inputPath, 'utf-8');
  const stories = parseUserStories(markdown);

  if (stories.length === 0) {
    console.error('No user stories found in input file');
    console.error('Make sure stories follow format: ### ID: Actor - Goal');
    process.exit(1);
  }

  console.log(`📝 Generating use cases from ${stories.length} user stories...`);

  let output = `# Use Case Documentation\n\n`;
  output += `Generated: ${new Date().toLocaleDateString()}\n`;
  output += `Source: ${inputPath}\n\n`;
  output += `## Table of Contents\n\n`;

  stories.forEach((story, index) => {
    const ucId = `UC-${String(index + 1).padStart(3, '0')}`;
    output += `- [${ucId}: ${story.title || story.goal}](#use-case-${ucId.toLowerCase()}-${(story.title || story.goal).toLowerCase().replace(/\s+/g, '-')})\n`;
  });

  output += `\n---\n\n`;

  stories.forEach((story, index) => {
    output += generateUseCase(story, index);
  });

  fs.writeFileSync(outputPath, output);

  console.log(`\n✅ Use cases created: ${outputPath}`);
  console.log(`\n📋 Generated ${stories.length} use cases`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review and refine main success scenarios`);
  console.log(`   2. Add specific alternative flows`);
  console.log(`   3. Document business rules`);
  console.log(`   4. Add technical implementation notes`);
  console.log(`   5. Create test scenarios`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseUserStories, generateUseCase };

