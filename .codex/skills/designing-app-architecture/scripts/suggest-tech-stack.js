#!/usr/bin/env node
/**
 * Tech Stack Suggestion Tool
 * Analyzes requirements and suggests appropriate technology stack
 * Usage: node suggest-tech-stack.js requirements.json tech-stack.md
 */

const fs = require('fs');

const techStacks = {
  'rapid-mvp': {
    name: 'Rapid MVP Stack',
    description: 'Get to market fast with minimal setup',
    frontend: 'Next.js 14 (App Router)',
    backend: 'Convex (all-in-one)',
    database: 'Convex (built-in)',
    auth: 'Clerk',
    payments: 'Stripe',
    hosting: 'Vercel',
    pros: [
      'Fastest time to market',
      'Minimal configuration',
      'Type-safe end-to-end',
      'Real-time out of the box'
    ],
    cons: [
      'Platform lock-in',
      'Less control over infrastructure',
      'May need migration at scale'
    ],
    bestFor: ['MVPs', 'Startups', 'Prototypes', 'Real-time apps']
  },
  'traditional-fullstack': {
    name: 'Traditional Full-Stack',
    description: 'Battle-tested, maximum flexibility',
    frontend: 'React or Next.js',
    backend: 'Node.js + Express',
    database: 'PostgreSQL',
    orm: 'Prisma',
    auth: 'Passport.js or Clerk',
    payments: 'Stripe',
    hosting: 'AWS / DigitalOcean / Railway',
    pros: [
      'Full control',
      'Mature ecosystem',
      'Easy to hire for',
      'No vendor lock-in'
    ],
    cons: [
      'More setup required',
      'More code to maintain',
      'Manual real-time setup'
    ],
    bestFor: ['Enterprise', 'Long-term projects', 'Complex requirements']
  },
  'serverless': {
    name: 'Serverless Stack',
    description: 'Auto-scaling, pay-per-use',
    frontend: 'Next.js or React',
    backend: 'AWS Lambda or Vercel Functions',
    database: 'DynamoDB or PlanetScale',
    auth: 'Clerk or Auth0',
    payments: 'Stripe',
    hosting: 'Vercel or AWS',
    pros: [
      'Auto-scaling',
      'Pay only for usage',
      'No server management',
      'High availability'
    ],
    cons: [
      'Cold start latency',
      'Debugging complexity',
      'Vendor lock-in',
      'Cost unpredictability'
    ],
    bestFor: ['Variable traffic', 'Event-driven', 'Cost optimization']
  }
};

function analyzeRequirements(requirements) {
  const text = JSON.stringify(requirements).toLowerCase();

  const signals = {
    needsRealtime: text.includes('real-time') || text.includes('live') || text.includes('collaborative'),
    needsAuth: text.includes('auth') || text.includes('login') || text.includes('user'),
    needsPayments: text.includes('payment') || text.includes('subscription') || text.includes('billing'),
    isMVP: text.includes('mvp') || text.includes('prototype') || text.includes('quick'),
    needsScale: text.includes('scale') || text.includes('millions') || text.includes('enterprise'),
    isComplex: (requirements.functional?.length || 0) > 20,
    timeConstrained: text.includes('deadline') || text.includes('urgent') || text.includes('fast')
  };

  return signals;
}

function recommendStack(signals) {
  if (signals.isMVP || signals.timeConstrained) {
    return 'rapid-mvp';
  }

  if (signals.needsScale && signals.isComplex) {
    return 'traditional-fullstack';
  }

  if (signals.needsScale && !signals.isComplex) {
    return 'serverless';
  }

  return 'rapid-mvp'; // Default recommendation
}

function generateTechStackDocument(requirements) {
  const signals = analyzeRequirements(requirements);
  const recommendedKey = recommendStack(signals);
  const recommended = techStacks[recommendedKey];

  let doc = `# Technology Stack Recommendation\n\n`;
  doc += `Generated: ${new Date().toLocaleDateString()}\n\n`;

  doc += `## Analysis Summary\n\n`;
  doc += `Based on requirements analysis:\n\n`;
  doc += `- Real-time features: ${signals.needsRealtime ? '✅ Yes' : '❌ No'}\n`;
  doc += `- Authentication: ${signals.needsAuth ? '✅ Required' : '❌ Not mentioned'}\n`;
  doc += `- Payments: ${signals.needsPayments ? '✅ Required' : '❌ Not mentioned'}\n`;
  doc += `- Project type: ${signals.isMVP ? 'MVP/Prototype' : 'Full product'}\n`;
  doc += `- Scale requirements: ${signals.needsScale ? 'High scale' : 'Standard'}\n`;
  doc += `- Complexity: ${signals.isComplex ? 'High' : 'Medium'}\n`;
  doc += `- Timeline: ${signals.timeConstrained ? 'Tight deadline' : 'Standard'}\n\n`;

  doc += `---\n\n`;

  doc += `## Recommended Stack: ${recommended.name}\n\n`;
  doc += `${recommended.description}\n\n`;

  doc += `### Components\n\n`;
  doc += `- **Frontend**: ${recommended.frontend}\n`;
  doc += `- **Backend**: ${recommended.backend}\n`;
  doc += `- **Database**: ${recommended.database}\n`;
  if (recommended.orm) doc += `- **ORM**: ${recommended.orm}\n`;
  doc += `- **Authentication**: ${recommended.auth}\n`;
  if (signals.needsPayments) doc += `- **Payments**: ${recommended.payments}\n`;
  doc += `- **Hosting**: ${recommended.hosting}\n\n`;

  doc += `### Advantages\n\n`;
  recommended.pros.forEach(pro => {
    doc += `- ✅ ${pro}\n`;
  });

  doc += `\n### Considerations\n\n`;
  recommended.cons.forEach(con => {
    doc += `- ⚠️ ${con}\n`;
  });

  doc += `\n### Best Suited For\n\n`;
  recommended.bestFor.forEach(use => {
    doc += `- ${use}\n`;
  });

  doc += `\n---\n\n`;

  doc += `## Alternative Stacks\n\n`;

  Object.entries(techStacks).forEach(([key, stack]) => {
    if (key !== recommendedKey) {
      doc += `### ${stack.name}\n\n`;
      doc += `${stack.description}\n\n`;
      doc += `**Key difference**: `;

      if (key === 'traditional-fullstack') {
        doc += `More control and flexibility, but requires more setup\n\n`;
      } else if (key === 'serverless') {
        doc += `Auto-scaling and pay-per-use pricing\n\n`;
      } else {
        doc += `Alternative approach to architecture\n\n`;
      }
    }
  });

  doc += `---\n\n`;

  doc += `## Implementation Roadmap\n\n`;
  doc += `### Phase 1: Setup (Week 1)\n`;
  doc += `- [ ] Initialize ${recommended.frontend} project\n`;
  doc += `- [ ] Set up ${recommended.backend}\n`;
  doc += `- [ ] Configure ${recommended.auth}\n`;
  doc += `- [ ] Deploy to ${recommended.hosting}\n\n`;

  doc += `### Phase 2: Core Features (Weeks 2-4)\n`;
  doc += `- [ ] Implement authentication flow\n`;
  doc += `- [ ] Build database schema\n`;
  doc += `- [ ] Create API endpoints\n`;
  doc += `- [ ] Develop UI components\n\n`;

  if (signals.needsPayments) {
    doc += `### Phase 3: Payments (Week 5)\n`;
    doc += `- [ ] Integrate ${recommended.payments}\n`;
    doc += `- [ ] Set up webhooks\n`;
    doc += `- [ ] Test payment flows\n\n`;
  }

  doc += `### Phase 4: Polish & Launch\n`;
  doc += `- [ ] Performance optimization\n`;
  doc += `- [ ] Security audit\n`;
  doc += `- [ ] User testing\n`;
  doc += `- [ ] Production deployment\n\n`;

  doc += `---\n\n`;

  doc += `## Cost Estimate\n\n`;
  doc += `**Development Costs** (estimated):\n`;
  doc += `- Developer time: Based on team\n`;
  doc += `- Third-party services: ~$100-300/month initially\n\n`;

  doc += `**Monthly Hosting** (estimated):\n`;
  doc += `- Hosting: $0-50/month (starts free)\n`;
  doc += `- Database: Included in ${recommended.backend}\n`;
  doc += `- Auth: $0-25/month (starts free)\n`;
  if (signals.needsPayments) doc += `- Payments: 2.9% + $0.30 per transaction\n`;
  doc += `\n**Total**: ~$100-400/month for first 1000 users\n\n`;

  doc += `---\n\n`;

  doc += `## Next Steps\n\n`;
  doc += `1. Review this recommendation with team\n`;
  doc += `2. Create proof-of-concept with recommended stack\n`;
  doc += `3. Document decision in ADR\n`;
  doc += `4. Set up development environment\n`;
  doc += `5. Begin implementation\n\n`;

  doc += `## References\n\n`;
  doc += `- [Next.js Documentation](https://nextjs.org/docs)\n`;
  if (recommendedKey === 'rapid-mvp') {
    doc += `- [Convex Documentation](https://docs.convex.dev)\n`;
  }
  doc += `- [Clerk Documentation](https://clerk.com/docs)\n`;
  doc += `- [Stripe Documentation](https://stripe.com/docs)\n`;

  return doc;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node suggest-tech-stack.js <requirements.json> <output.md>');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  const requirements = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  console.log('🔍 Analyzing requirements...');
  console.log('💡 Generating tech stack recommendations...');

  const doc = generateTechStackDocument(requirements);

  fs.writeFileSync(outputPath, doc);

  console.log(`\n✅ Tech stack recommendation created: ${outputPath}`);
  console.log(`\n📋 Review the recommendation and validate with your team`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { analyzeRequirements, recommendStack, generateTechStackDocument };

