#!/usr/bin/env node
/**
 * Competitor Analysis Script
 * Generates competitive analysis template and comparison framework
 * Usage: node analyze-competitors.js "task management app" competitors.json
 */

const fs = require('fs');

const competitorTemplate = {
  name: '',
  category: 'direct',  // direct, indirect, potential
  url: '',
  founded: null,
  funding: '',
  userBase: '',
  pricing: {
    model: '',  // freemium, subscription, one-time, usage
    tiers: []
  },
  strengths: [],
  weaknesses: [],
  features: {},
  userRating: {
    source: '',
    score: null,
    reviews: null
  },
  marketPosition: '',  // leader, challenger, niche, emerging
  threat: 'medium'  // low, medium, high
};

const commonFeatureCategories = {
  core: [
    'Task creation',
    'Organization/folders',
    'Search',
    'Mobile app',
    'Desktop app',
    'Web app'
  ],
  collaboration: [
    'Team workspaces',
    'Sharing/permissions',
    'Comments',
    'Real-time sync',
    'Activity feed'
  ],
  advanced: [
    'Automation',
    'AI features',
    'Custom fields',
    'Templates',
    'Integrations',
    'API access'
  ],
  platform: [
    'Offline mode',
    'Import/export',
    'Multi-language',
    'Dark mode',
    'Keyboard shortcuts'
  ]
};

function generateCompetitorAnalysisTemplate(appCategory) {
  const analysis = {
    category: appCategory,
    analyzedAt: new Date().toISOString(),
    competitors: [
      {
        ...competitorTemplate,
        name: 'Competitor 1',
        instructions: 'Fill in details from research'
      },
      {
        ...competitorTemplate,
        name: 'Competitor 2',
        instructions: 'Fill in details from research'
      },
      {
        ...competitorTemplate,
        name: 'Competitor 3',
        instructions: 'Fill in details from research'
      }
    ],
    featureMatrix: {
      categories: commonFeatureCategories,
      comparison: {
        'Your App': {},
        'Competitor 1': {},
        'Competitor 2': {},
        'Competitor 3': {}
      }
    },
    analysis: {
      marketGaps: [
        {
          gap: 'Example: No offline-first solutions',
          evidence: 'All competitors require internet',
          opportunity: 'Build offline-first with sync'
        }
      ],
      differentiators: [
        {
          feature: 'Your unique feature',
          competitorComparison: 'None have this',
          value: 'Why it matters to users'
        }
      ],
      threats: [
        {
          threat: 'Established brand loyalty',
          impact: 'high',
          mitigation: 'Focus on underserved niche'
        }
      ]
    },
    swot: {
      strengths: [
        'Your advantages vs. competitors'
      ],
      weaknesses: [
        'Your disadvantages vs. competitors'
      ],
      opportunities: [
        'Market opportunities you can exploit'
      ],
      threats: [
        'Competitive threats to your success'
      ]
    },
    recommendations: [
      'Focus on gap X that competitors ignore',
      'Compete on simplicity vs. feature bloat',
      'Target underserved segment Y'
    ]
  };

  return analysis;
}

function generateCompetitorResearchGuide(appCategory) {
  return `# Competitor Research Guide: ${appCategory}

## Research Checklist

### 1. Identify Competitors

**Sources**:
- [ ] Google: "${appCategory}" + "app", "software", "tool"
- [ ] Product Hunt: Search and filter by category
- [ ] AlternativeTo: Find similar products
- [ ] App Store / Google Play: Search relevant keywords
- [ ] Capterra / G2: Software comparison sites
- [ ] Crunchbase: Find funded startups in space
- [ ] Reddit: r/[relevant subreddit] for recommendations

**Categories to research**:
- [ ] Direct competitors (same solution, same audience)
- [ ] Indirect competitors (different solution, same problem)
- [ ] Adjacent products (could pivot to compete)
- [ ] Big tech (could build feature)

---

### 2. Gather Competitor Data

For each competitor, collect:

**Basic Info**:
- Company name
- Website URL
- Founded date
- Team size
- Funding (if public)
- User base size (if disclosed)

**Product**:
- Core features (list top 10)
- Unique features
- Platform availability (web/mobile/desktop)
- Tech stack (if visible)

**Pricing**:
- Pricing model (freemium/subscription/etc)
- Price points for each tier
- Free trial available?
- Money-back guarantee?

**Market Position**:
- User reviews (App Store, G2, Capterra)
  - Average rating
  - Number of reviews
  - Common complaints (read 1-2 star reviews)
  - Common praise (read 5-star reviews)
- Social proof
  - Twitter followers
  - Reddit mentions
  - Media coverage
- Market position (leader/challenger/niche)

**Strengths** (3-5):
- What they do exceptionally well
- Why users choose them
- Competitive advantages

**Weaknesses** (3-5):
- User complaints from reviews
- Missing features (from competitor comparisons)
- Areas where they underperform

---

### 3. Feature Comparison Matrix

Create spreadsheet with:

**Rows**: Features (from common categories below)
**Columns**: Your app + each competitor

**Mark each cell**:
- ✅ Has feature
- ⚠️ Basic/limited version
- ❌ Doesn't have
- 🎯 Your planned differentiator

**Common feature categories**:

Core Features:
- [List 5-10 must-have features for category]

Collaboration:
- [Team features if applicable]

Advanced:
- [Power user features]

Platform:
- [Technical features]

---

### 4. Pricing Comparison

| Competitor | Free Tier | Starter | Pro | Enterprise |
|------------|-----------|---------|-----|------------|
| Comp 1     | [Features] | $X/mo  | $Y/mo | Custom |
| Comp 2     | [Features] | $X/mo  | $Y/mo | Custom |
| Your App   | [Plan]    | [Plan] | [Plan] | [Plan] |

**Pricing insights**:
- Average price point: $[X]/mo
- Most common model: [Freemium/Subscription]
- Value metric: [Per user / Per project / Flat fee]

**Your pricing strategy**:
- Position: [Lower / Competitive / Premium]
- Justification: [Why this pricing makes sense]

---

### 5. User Sentiment Analysis

**Review Mining** (per competitor):

Analyze 20+ reviews from:
- App Store / Google Play (mobile apps)
- G2 / Capterra (B2B software)
- Reddit / Twitter (social mentions)

**Categorize feedback**:

Common Praise:
1. [Feature/aspect users love]
2. [Another positive theme]
3. [Third positive theme]

Common Complaints:
1. [Top user pain point]
2. [Second complaint theme]
3. [Third complaint theme]

**Opportunity Identification**:
- Pain points your app can solve: [List]
- Features to avoid (didn't work for competitors): [List]
- Proven features to include (users love): [List]

---

### 6. SWOT Analysis

Based on competitive research:

**Strengths** (vs. competitors):
- [ ] Unique feature X
- [ ] Better Y than anyone
- [ ] Advantage in Z

**Weaknesses** (vs. competitors):
- [ ] No brand recognition
- [ ] Smaller feature set
- [ ] Limited resources

**Opportunities**:
- [ ] Market gap identified
- [ ] Competitor weakness to exploit
- [ ] Growing market segment

**Threats**:
- [ ] Strong incumbents
- [ ] Low switching costs
- [ ] Big tech could enter

---

### 7. Competitive Positioning

**How will you differentiate?**

1. **By features**: [What you'll build that others don't have]
2. **By audience**: [Specific niche you'll serve better]
3. **By experience**: [Simpler/faster/better UX]
4. **By price**: [More affordable or premium positioning]
5. **By values**: [Privacy/open-source/sustainability]

**Positioning statement**:

"For [target audience] who [need/problem],
[Your App] is a [category] that [key benefit].
Unlike [competitors], we [unique differentiator]."

**Example**:
"For busy developers who need simple task tracking,
TaskFlow is a task manager that works offline-first.
Unlike Todoist and Asana, we prioritize speed and simplicity over features."

---

### 8. Competitive Threats & Moats

**Threat Assessment**:

| Competitor | Threat Level | Why | Mitigation |
|------------|--------------|-----|------------|
| Leader     | High         | Brand, resources | Focus on niche |
| Challenger | Medium       | Growing fast | Move faster |
| Big Tech   | High         | Could copy | Build moat |

**Your Moat** (defensibility):
- [ ] Network effects (value increases with users)
- [ ] Data advantage (unique dataset)
- [ ] Brand (strong positioning)
- [ ] Technology (hard to replicate)
- [ ] Community (engaged user base)
- [ ] Integrations (ecosystem lock-in)

---

## Next Steps

After completing research:

1. [ ] Compile findings in competitors.json
2. [ ] Create feature comparison matrix
3. [ ] Document market gaps
4. [ ] Define competitive positioning
5. [ ] Update business plan with competitive insights
6. [ ] Plan features that exploit competitor weaknesses

---

## Tools & Resources

**Research Tools**:
- SimilarWeb: Traffic estimates
- BuiltWith: Tech stack detection
- Wayback Machine: Product evolution
- App Annie: Mobile app analytics

**Review Sources**:
- G2.com (B2B software)
- Capterra (business apps)
- Trustpilot (general products)
- Reddit search (authentic opinions)

**Market Intelligence**:
- Crunchbase (funding data)
- LinkedIn (team size)
- Google Trends (interest over time)
`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node analyze-competitors.js "<app category>" <output.json>');
    console.error('Example: node analyze-competitors.js "task management app" competitors.json');
    process.exit(1);
  }

  const [appCategory, outputPath] = args;

  console.log(`🔍 Generating competitive analysis template for: "${appCategory}"`);

  const analysis = generateCompetitorAnalysisTemplate(appCategory);
  const guide = generateCompetitorResearchGuide(appCategory);

  // Save analysis template
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));

  // Save research guide
  const guidePath = outputPath.replace('.json', '-research-guide.md');
  fs.writeFileSync(guidePath, guide);

  console.log(`\n✅ Files created:`);
  console.log(`   📊 ${outputPath}`);
  console.log(`   📋 ${guidePath}`);

  console.log(`\n📋 Next steps:`);
  console.log(`   1. Research 5-10 competitors using the guide`);
  console.log(`   2. Fill in competitor details in ${outputPath}`);
  console.log(`   3. Create feature comparison matrix`);
  console.log(`   4. Identify market gaps and differentiators`);
  console.log(`   5. Complete SWOT analysis`);

  console.log(`\n🔍 Start researching:`);
  console.log(`   - Google: "${appCategory}"`);
  console.log(`   - Product Hunt: https://www.producthunt.com/search?q=${encodeURIComponent(appCategory)}`);
  console.log(`   - AlternativeTo: https://alternativeto.net/`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateCompetitorAnalysisTemplate, generateCompetitorResearchGuide };

