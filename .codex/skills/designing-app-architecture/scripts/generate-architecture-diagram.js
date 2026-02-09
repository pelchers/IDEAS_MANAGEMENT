#!/usr/bin/env node
/**
 * Architecture Diagram Generator
 * Creates Mermaid diagrams from requirements
 * Usage: node generate-architecture-diagram.js requirements.json architecture.mmd
 */

const fs = require('fs');

function generateArchitectureDiagram(requirements) {
  const hasFunctional = requirements.functional && requirements.functional.length > 0;
  const hasNonFunctional = requirements.nonFunctional && requirements.nonFunctional.length > 0;

  // Analyze requirements to suggest architecture
  const needsRealtime = JSON.stringify(requirements).toLowerCase().includes('real-time');
  const needsAuth = JSON.stringify(requirements).toLowerCase().includes('auth');
  const needsPayments = JSON.stringify(requirements).toLowerCase().includes('payment');

  let diagram = `# System Architecture\n\n`;
  diagram += `Generated: ${new Date().toLocaleDateString()}\n\n`;

  // C4 Container Diagram
  diagram += `## Container Diagram\n\n`;
  diagram += `\`\`\`mermaid\ngraph TB\n`;
  diagram += `    User[User/Browser]\n`;
  diagram += `    Frontend[Frontend Application<br/>Next.js]\n`;
  diagram += `    Backend[Backend Services<br/>Convex/API]\n`;
  diagram += `    DB[(Database)]\n\n`;

  diagram += `    User -->|HTTPS| Frontend\n`;
  diagram += `    Frontend -->|API Calls| Backend\n`;
  diagram += `    Backend -->|Queries| DB\n\n`;

  if (needsAuth) {
    diagram += `    Auth[Auth Service<br/>Clerk]\n`;
    diagram += `    Frontend -->|Login/Signup| Auth\n`;
    diagram += `    Backend -->|Verify| Auth\n\n`;
  }

  if (needsPayments) {
    diagram += `    Payment[Payment Service<br/>Stripe]\n`;
    diagram += `    Backend -->|Process| Payment\n\n`;
  }

  diagram += `    style Frontend fill:#9cf\n`;
  diagram += `    style Backend fill:#fc9\n`;
  diagram += `    style DB fill:#f99\n`;
  diagram += `\`\`\`\n\n`;

  // Component breakdown
  diagram += `## Component Architecture\n\n`;
  diagram += `\`\`\`mermaid\ngraph LR\n`;
  diagram += `    subgraph Frontend\n`;
  diagram += `        UI[UI Components]\n`;
  diagram += `        State[State Management]\n`;
  diagram += `        Routing[Routing]\n`;
  diagram += `    end\n\n`;

  diagram += `    subgraph Backend\n`;
  diagram += `        API[API Layer]\n`;
  diagram += `        Logic[Business Logic]\n`;
  diagram += `        Data[Data Access]\n`;
  diagram += `    end\n\n`;

  diagram += `    UI --> State\n`;
  diagram += `    State --> API\n`;
  diagram += `    API --> Logic\n`;
  diagram += `    Logic --> Data\n`;
  diagram += `\`\`\`\n\n`;

  return diagram;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node generate-architecture-diagram.js <requirements.json> <output.mmd>');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  const requirements = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  console.log('📐 Generating architecture diagrams...');

  const diagram = generateArchitectureDiagram(requirements);

  fs.writeFileSync(outputPath, diagram);

  console.log(`\n✅ Architecture diagram created: ${outputPath}`);
  console.log(`\n💡 View with Mermaid Live Editor: https://mermaid.live`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateArchitectureDiagram };

