#!/usr/bin/env node
/**
 * Requirements Extraction Script
 * Parses product specification and extracts structured requirements
 * Usage: node extract-requirements.js product-spec.txt requirements.json
 */

const fs = require('fs');

function extractRequirements(text) {
  const requirements = {
    functional: [],
    nonFunctional: [],
    businessRules: [],
    userStories: [],
    metadata: {
      extractedAt: new Date().toISOString(),
      sourceLength: text.length
    }
  };

  // Extract functional requirements (look for "must", "shall", "will")
  const functionalPatterns = [
    /(?:system|app|user)\s+(?:must|shall|will|should)\s+([^.!?]+)/gi,
    /(?:allow|enable|provide)\s+(?:users?\s+to\s+)?([^.!?]+)/gi
  ];

  functionalPatterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      requirements.functional.push({
        id: `FR-${String(requirements.functional.length + 1).padStart(3, '0')}`,
        description: match[1].trim(),
        source: match[0],
        priority: 'TBD',
        status: 'draft'
      });
    });
  });

  // Extract non-functional requirements (performance, security, etc.)
  const nfrKeywords = ['performance', 'security', 'scalability', 'usability', 'reliability'];
  nfrKeywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword}[^.!?]+)`, 'gi');
    const matches = [...text.matchAll(regex)];
    matches.forEach(match => {
      requirements.nonFunctional.push({
        id: `NFR-${String(requirements.nonFunctional.length + 1).padStart(3, '0')}`,
        category: keyword,
        description: match[1].trim(),
        measurable: false,
        status: 'draft'
      });
    });
  });

  // Extract user stories (look for "As a ... I want ... so that" pattern)
  const userStoryPattern = /As\s+a\s+([^,]+),?\s+I\s+want\s+([^,]+),?\s+so\s+that\s+([^.!?]+)/gi;
  const storyMatches = [...text.matchAll(userStoryPattern)];
  storyMatches.forEach(match => {
    requirements.userStories.push({
      id: `US-${String(requirements.userStories.length + 1).padStart(3, '0')}`,
      actor: match[1].trim(),
      goal: match[2].trim(),
      benefit: match[3].trim(),
      acceptanceCriteria: [],
      priority: 'TBD',
      storyPoints: null,
      status: 'draft'
    });
  });

  // Extract business rules (look for "rule:", "policy:", "constraint:")
  const businessRulePattern = /(?:rule|policy|constraint):\s*([^.!?]+)/gi;
  const ruleMatches = [...text.matchAll(businessRulePattern)];
  ruleMatches.forEach(match => {
    requirements.businessRules.push({
      id: `BR-${String(requirements.businessRules.length + 1).padStart(3, '0')}`,
      description: match[1].trim(),
      enforcementLevel: 'TBD',
      status: 'draft'
    });
  });

  return requirements;
}

function generateRequirementsSummary(requirements) {
  return `
Requirements Extraction Summary
================================

Functional Requirements: ${requirements.functional.length}
Non-Functional Requirements: ${requirements.nonFunctional.length}
User Stories: ${requirements.userStories.length}
Business Rules: ${requirements.businessRules.length}

Next Steps:
1. Review extracted requirements for accuracy
2. Add priorities (Must/Should/Could/Won't)
3. Define acceptance criteria for user stories
4. Validate with stakeholders
5. Create detailed use cases from user stories
`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node extract-requirements.js <product-spec.txt> <requirements.json>');
    console.error('Example: node extract-requirements.js spec.txt requirements.json');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  const text = fs.readFileSync(inputPath, 'utf-8');

  console.log('📋 Extracting requirements from specification...');

  const requirements = extractRequirements(text);

  fs.writeFileSync(outputPath, JSON.stringify(requirements, null, 2));

  console.log(generateRequirementsSummary(requirements));
  console.log(`✅ Requirements saved to: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { extractRequirements, generateRequirementsSummary };

