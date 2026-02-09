#!/usr/bin/env node
/**
 * Idea Generator Script
 * Generates app ideas based on problem domains using brainstorming techniques
 * Usage: node idea-generator.js topic.txt ideas.json --count 10
 */

const fs = require('fs');

const scamperPrompts = {
  substitute: (topic) => `What if we replaced ${topic} with something else?`,
  combine: (topic) => `What if we combined ${topic} with another concept?`,
  adapt: (topic) => `How could we adapt successful patterns from other industries to ${topic}?`,
  modify: (topic) => `What if we made ${topic} faster/simpler/better?`,
  putToOtherUse: (topic) => `Could ${topic} solve a different problem?`,
  eliminate: (topic) => `What if we removed complexity from ${topic}?`,
  reverse: (topic) => `What if we reversed the typical approach to ${topic}?`
};

const trendTemplates = [
  (topic) => `AI-powered ${topic}`,
  (topic) => `Privacy-first ${topic}`,
  (topic) => `No-code ${topic} builder`,
  (topic) => `Decentralized ${topic}`,
  (topic) => `Offline-first ${topic}`,
  (topic) => `Mobile-native ${topic}`,
  (topic) => `Collaborative ${topic}`,
  (topic) => `Automated ${topic}`
];

function generateIdeas(topic, count = 10) {
  const ideas = [];
  const methods = Object.keys(scamperPrompts);

  // SCAMPER-based ideas
  for (let i = 0; i < Math.min(count, methods.length); i++) {
    const method = methods[i];
    ideas.push({
      id: i + 1,
      name: `${method.charAt(0).toUpperCase() + method.slice(1)} approach to ${topic}`,
      prompt: scamperPrompts[method](topic),
      method: 'SCAMPER',
      technique: method,
      description: `Apply ${method} thinking to ${topic}`
    });
  }

  // Trend-based ideas
  const remainingCount = count - ideas.length;
  for (let i = 0; i < Math.min(remainingCount, trendTemplates.length); i++) {
    ideas.push({
      id: ideas.length + 1,
      name: trendTemplates[i](topic),
      method: 'Trend Surfing',
      description: `Leverage current tech trends applied to ${topic}`
    });
  }

  return ideas;
}

function enrichIdeasWithScoring(ideas) {
  return ideas.map(idea => ({
    ...idea,
    scoring: {
      marketSize: null,
      competition: null,
      feasibility: null,
      passion: null,
      profitability: null,
      unfairAdvantage: null
    },
    validation: {
      completed: false,
      marketResearch: false,
      competitorAnalysis: false,
      userInterviews: 0
    },
    notes: ''
  }));
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node idea-generator.js <topic.txt> <ideas.json> [--count N]');
    console.error('Example: node idea-generator.js topic.txt ideas.json --count 10');
    process.exit(1);
  }

  const [topicPath, outputPath] = args;
  const countIndex = args.indexOf('--count');
  const count = countIndex !== -1 ? parseInt(args[countIndex + 1]) : 10;

  if (!fs.existsSync(topicPath)) {
    console.error(`Error: File not found: ${topicPath}`);
    process.exit(1);
  }

  const topic = fs.readFileSync(topicPath, 'utf-8').trim();

  console.log(`💡 Generating ${count} app ideas for: "${topic}"`);

  const ideas = generateIdeas(topic, count);
  const enrichedIdeas = enrichIdeasWithScoring(ideas);

  const output = {
    topic,
    generatedAt: new Date().toISOString(),
    totalIdeas: enrichedIdeas.length,
    ideas: enrichedIdeas
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✅ Generated ${enrichedIdeas.length} ideas:`);
  enrichedIdeas.forEach(idea => {
    console.log(`   ${idea.id}. ${idea.name}`);
    if (idea.prompt) console.log(`      → ${idea.prompt}`);
  });
  console.log(`\n📄 Saved to: ${outputPath}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review and expand on promising ideas`);
  console.log(`   2. Run market validation: node validate-market.js ${outputPath}`);
  console.log(`   3. Analyze competitors: node analyze-competitors.js "your idea"`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateIdeas, enrichIdeasWithScoring };

