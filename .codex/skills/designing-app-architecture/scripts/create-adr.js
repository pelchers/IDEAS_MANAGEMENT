#!/usr/bin/env node
/**
 * ADR (Architecture Decision Record) Generator
 * Creates structured ADR documents
 * Usage: node create-adr.js "Decision title" output.md
 */

const fs = require('fs');
const path = require('path');

function generateADR(title, number = null) {
  const adrNumber = number || '001';

  return `# ADR-${adrNumber}: ${title}

**Date**: ${new Date().toISOString().split('T')[0]}
**Status**: Proposed
**Deciders**: [Add names]

## Context

[Describe the issue or problem requiring a decision]

**Background**:
- [Current situation]
- [Why change is needed]
- [Constraints we're working within]

**Goals**:
- [What we're trying to achieve]
- [Success criteria]

## Decision

[The change we're proposing or have agreed to implement]

**We will**: [Specific decision statement]

## Rationale

[Why this decision makes sense]

**Key factors**:
1. [Factor 1]
2. [Factor 2]
3. [Factor 3]

## Consequences

### Positive Consequences
- ✅ [Good consequence 1]
- ✅ [Good consequence 2]
- ✅ [Good consequence 3]

### Negative Consequences
- ❌ [Bad consequence 1]
  - **Mitigation**: [How we'll address this]
- ❌ [Bad consequence 2]
  - **Mitigation**: [How we'll address this]

### Neutral Consequences
- ℹ️ [Other effect 1]
- ℹ️ [Other effect 2]

## Alternatives Considered

### Alternative 1: [Name]

**Description**: [What this alternative involves]

**Pros**:
- [Benefit 1]
- [Benefit 2]

**Cons**:
- [Drawback 1]
- [Drawback 2]

**Why rejected**: [Specific reason this wasn't chosen]

---

### Alternative 2: [Name]

**Description**: [What this alternative involves]

**Pros**:
- [Benefit 1]
- [Benefit 2]

**Cons**:
- [Drawback 1]
- [Drawback 2]

**Why rejected**: [Specific reason this wasn't chosen]

---

## Implementation Plan

**Phase 1**: [Initial steps]
- [ ] Task 1
- [ ] Task 2

**Phase 2**: [Follow-up]
- [ ] Task 3
- [ ] Task 4

**Timeline**: [Estimated duration]

**Risks**: [Known risks and mitigation]

## Review & Approval

**Reviewers**:
- [ ] Technical Lead: [Name]
- [ ] Product Owner: [Name]
- [ ] Security Team: [Name] (if applicable)

**Approval Date**: [When decision was accepted]

## References

- [Link to related discussion]
- [Relevant documentation]
- [Technical specs]
- [Related ADRs]

## Changelog

| Date | Status | Notes |
|------|--------|-------|
| ${new Date().toISOString().split('T')[0]} | Proposed | Initial draft |

---

## Template Notes

**Status values**:
- **Proposed**: Under discussion
- **Accepted**: Agreed and being implemented
- **Deprecated**: No longer valid
- **Superseded by ADR-XXX**: Replaced by newer decision

**Tips**:
1. Be specific and concrete
2. Focus on "why" not just "what"
3. Document alternatives seriously considered
4. Update status as decision evolves
5. Link to related ADRs
`;
}

function getNextADRNumber(directory) {
  if (!fs.existsSync(directory)) {
    return '001';
  }

  const files = fs.readdirSync(directory);
  const adrFiles = files.filter(f => f.match(/^(\d+)-.+\.md$/));

  if (adrFiles.length === 0) {
    return '001';
  }

  const numbers = adrFiles.map(f => {
    const match = f.match(/^(\d+)-/);
    return match ? parseInt(match[1]) : 0;
  });

  const maxNumber = Math.max(...numbers);
  return String(maxNumber + 1).padStart(3, '0');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node create-adr.js "Decision title" <output.md>');
    console.error('Example: node create-adr.js "Use Convex for backend" adrs/001-convex.md');
    process.exit(1);
  }

  const [title, outputPath] = args;

  // Extract directory and create if needed
  const directory = path.dirname(outputPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`📁 Created directory: ${directory}`);
  }

  // Auto-number if not specified in filename
  const filename = path.basename(outputPath);
  let adrNumber = filename.match(/^(\d+)-/) ? filename.match(/^(\d+)-/)[1] : null;

  if (!adrNumber) {
    adrNumber = getNextADRNumber(directory);
    console.log(`📝 Auto-assigned ADR number: ${adrNumber}`);
  }

  const adr = generateADR(title, adrNumber);

  fs.writeFileSync(outputPath, adr);

  console.log(`\n✅ ADR created: ${outputPath}`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Fill in Context section (why this decision is needed)`);
  console.log(`   2. Document the Decision clearly`);
  console.log(`   3. List all Alternatives Considered`);
  console.log(`   4. Specify Consequences (positive and negative)`);
  console.log(`   5. Get approval from stakeholders`);
  console.log(`   6. Update status from Proposed to Accepted`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateADR, getNextADRNumber };

