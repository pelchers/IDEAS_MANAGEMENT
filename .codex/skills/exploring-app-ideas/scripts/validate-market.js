#!/usr/bin/env node
/**
 * Market Validation Script
 * Generates market research template and validation checklist
 * Usage: node validate-market.js idea.json market-report.md
 */

const fs = require('fs');

function generateMarketResearchTemplate(idea) {
  const template = `# Market Research: ${idea.name || idea.topic}

## Executive Summary

**Idea**: ${idea.name || idea.topic}
**Generated**: ${new Date().toLocaleDateString()}

---

## 1. Target Audience

### Primary Persona

**Demographics**:
- Age range: [e.g., 25-40]
- Occupation: [e.g., Software developers, designers]
- Income level: [e.g., $50k-$150k]
- Location: [e.g., Urban areas, US/EU/Global]

**Psychographics**:
- Tech adoption: [Early adopter / Mainstream / Late adopter]
- Values: [What matters to them]
- Frustrations: [Current pain points]
- Willingness to pay: [Budget expectations]

**Behaviors**:
- Current tools used: [List 3-5 tools]
- Pain points with existing solutions: [Top 3]
- Decision criteria: [What influences purchase]
- Information sources: [Where they discover new tools]

### Secondary Personas

[Add 1-2 additional personas if applicable]

---

## 2. Market Size Analysis

### TAM (Total Addressable Market)
- Definition: [Entire market opportunity]
- Size: [Number of potential users/businesses]
- Revenue: [Total market revenue annually]
- Source: [Where you got this data]

### SAM (Serviceable Addressable Market)
- Definition: [Segment you can realistically reach]
- Size: [Subset of TAM you can serve]
- Revenue: [Portion of market revenue]
- Geographic focus: [Regions you'll target]

### SOM (Serviceable Obtainable Market)
- Definition: [What you can capture in Year 1]
- Size: [Realistic customer acquisition target]
- Revenue: [Projected Year 1 revenue]
- Market share: [% of SAM]

**Market Size Validation**:
- [ ] TAM > $1B (large enough market)
- [ ] SAM > $100M (reachable segment)
- [ ] SOM achievable with budget and timeline
- [ ] Market is growing (not shrinking)

---

## 3. Market Trends

### Growth Indicators
- [ ] Industry growth rate: [X% YoY]
- [ ] Google Trends: [Rising / Stable / Declining]
- [ ] VC investment: [Increasing / Stable / Decreasing]
- [ ] Media coverage: [Growing / Stable / Declining]

### Supporting Trends
1. [Trend 1: e.g., Remote work increasing]
2. [Trend 2: e.g., Privacy concerns rising]
3. [Trend 3: e.g., Mobile-first consumption]

### Market Maturity
- **Stage**: [Emerging / Growth / Mature / Declining]
- **Opportunity**: [Why now is the right time]
- **Risks**: [What could change the market]

---

## 4. Competitive Landscape

### Direct Competitors

| Competitor | Users/Revenue | Strengths | Weaknesses | Pricing |
|------------|---------------|-----------|------------|---------|
| [Name 1]   | [Scale]       | [Top 3]   | [Top 3]    | [Model] |
| [Name 2]   | [Scale]       | [Top 3]   | [Top 3]    | [Model] |
| [Name 3]   | [Scale]       | [Top 3]   | [Top 3]    | [Model] |

### Indirect Competitors

[List tools that solve the same problem differently]

### Market Gaps Identified

1. **Gap 1**: [What competitors don't do well]
   - Evidence: [User complaints, reviews, forum discussions]
   - Opportunity: [How your app addresses this]

2. **Gap 2**: [Another underserved need]
   - Evidence: [Data supporting the gap]
   - Opportunity: [Your solution]

3. **Gap 3**: [Third gap if applicable]

---

## 5. Validation Research

### User Interviews (Target: 10-20)

**Interview Questions**:
1. How do you currently solve [problem]?
2. What frustrates you about existing solutions?
3. Would you pay for a better solution?
4. What features are must-haves vs. nice-to-haves?
5. How much would you pay monthly?

**Interview Results**:
- Interviews completed: [ ] / 10
- Problem validation: [% who confirmed problem exists]
- Willingness to pay: [% who would pay]
- Price sensitivity: [Acceptable price range]

### Survey Data (Target: 100+ responses)

**Survey Goals**:
- Validate problem importance
- Measure existing solution satisfaction
- Test pricing assumptions
- Identify must-have features

**Survey Results**:
- Responses: [ ] / 100
- Key findings: [Top 3 insights]
- Data link: [Google Forms / Typeform link]

### Landing Page Test

**Hypothesis**: [% of visitors will sign up for waitlist]
**Setup**:
- Landing page URL: [Link]
- Traffic source: [Reddit / Twitter / Ads]
- Traffic volume: [Visitors]
- Conversion rate: [% signup]

**Results**:
- [ ] Hit target conversion rate
- Email signups: [Count]
- Feedback collected: [Key quotes]

---

## 6. Business Model Validation

### Revenue Model
- **Pricing**: [Freemium / Subscription / One-time / Usage-based]
- **Price point**: $[X]/month or $[Y] one-time
- **Target ARPU**: $[Average revenue per user]

### Unit Economics
\`\`\`
Customer Acquisition Cost (CAC): $[X]
Lifetime Value (LTV): $[Y]
LTV:CAC Ratio: [Y/X] (target: > 3)
Payback period: [Months to recover CAC]
\`\`\`

### Go-to-Market Strategy
- **Primary channel**: [SEO / Content / Ads / Partnerships]
- **Expected CAC**: $[Cost per customer]
- **Launch strategy**: [Beta / Public launch / Phased rollout]

---

## 7. Risk Assessment

### Market Risks
- [ ] **Competition Risk**: [Big player could enter]
  - Mitigation: [Build fast, create moat]

- [ ] **Adoption Risk**: [Users won't switch]
  - Mitigation: [Make switching easy, offer migration]

- [ ] **Timing Risk**: [Market not ready]
  - Mitigation: [Educate market, start small]

### Go/No-Go Decision

**Critical Success Factors**:
- [ ] Market is growing (>5% YoY)
- [ ] Clear competitive differentiation
- [ ] 60%+ of interviewees validated problem
- [ ] 40%+ willing to pay
- [ ] Achievable CAC < $[threshold]

**Decision**: ⬜ GO ⬜ NO-GO ⬜ PIVOT

**Rationale**:
[Explain decision based on research findings]

---

## 8. Next Steps

If GO:
1. [ ] Define MVP scope
2. [ ] Create detailed requirements
3. [ ] Build landing page
4. [ ] Start development
5. [ ] Plan beta launch

If NO-GO:
1. [ ] Document learnings
2. [ ] Pivot to different idea
3. [ ] Archive research for future reference

If PIVOT:
1. [ ] Identify pivot direction
2. [ ] Re-validate with new approach
3. [ ] Update market research

---

## Resources

**Data Sources**:
- Statista: [Link]
- Google Trends: [Link]
- Competitor reviews: [Links]
- Industry reports: [Links]

**Interview Notes**: [Link to detailed notes]
**Survey Data**: [Link to raw data]
`;

  return template;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node validate-market.js <idea.json> <market-report.md>');
    console.error('Example: node validate-market.js ideas.json market-research.md');
    process.exit(1);
  }

  const [ideaPath, outputPath] = args;

  if (!fs.existsSync(ideaPath)) {
    console.error(`Error: File not found: ${ideaPath}`);
    process.exit(1);
  }

  const ideaData = JSON.parse(fs.readFileSync(ideaPath, 'utf-8'));
  const idea = ideaData.ideas ? ideaData.ideas[0] : ideaData;

  console.log('📊 Generating market validation template...');

  const template = generateMarketResearchTemplate(idea);
  fs.writeFileSync(outputPath, template);

  console.log(`\n✅ Market research template created: ${outputPath}`);
  console.log(`\n📋 Complete the following sections:`);
  console.log(`   1. Target Audience (define personas)`);
  console.log(`   2. Market Size (TAM/SAM/SOM)`);
  console.log(`   3. Competitive Analysis`);
  console.log(`   4. User Interviews (conduct 10+)`);
  console.log(`   5. Survey (get 100+ responses)`);
  console.log(`   6. Landing Page Test`);
  console.log(`\n💡 Validation checklist:`);
  console.log(`   [ ] 10+ user interviews completed`);
  console.log(`   [ ] 60%+ validated the problem exists`);
  console.log(`   [ ] 40%+ willing to pay`);
  console.log(`   [ ] Market is growing`);
  console.log(`   [ ] Clear competitive differentiation`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateMarketResearchTemplate };

