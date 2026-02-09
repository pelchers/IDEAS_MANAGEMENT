# Requirements Templates

Complete collection of templates for documenting software requirements across all stages of development.

## Functional Requirement Template

```markdown
## FR-[ID]: [Requirement Title]

**Category**: [Authentication / Data Management / Business Logic / etc.]
**Priority**: [Must Have / Should Have / Could Have / Won't Have]
**Source**: [Stakeholder / Interview / Workshop / Analysis]

### Description
[Clear, concise statement of what the system must do]

### Rationale
[Why this requirement exists, business justification]

### Acceptance Criteria
- [ ] Given [precondition], when [action], then [expected result]
- [ ] [Additional criterion]
- [ ] [Additional criterion]

### Dependencies
- Depends on: [FR-XXX, NFR-XXX]
- Required by: [FR-YYY]

### Assumptions
- [List any assumptions made]

### Constraints
- [Technical or business constraints]

### Related Requirements
- [FR-XXX]: [Relationship description]

**Status**: [Draft / In Review / Approved / Implemented / Tested]
**Assigned To**: [Team/Person]
**Target Release**: [Version/Sprint]
```

## Non-Functional Requirement Template

```markdown
## NFR-[ID]: [Requirement Title]

**Category**: [Performance / Security / Usability / Reliability / etc.]
**Priority**: [Must Have / Should Have / Could Have]

### Description
[What quality attribute must the system exhibit]

### Metric
[Measurable target]
- Measurement method: [How to measure]
- Target value: [Specific number/percentage]
- Acceptable range: [Min-Max]

### Test Criteria
- [ ] [How to verify this requirement is met]
- [ ] [Test scenario]

### Impact
[What happens if this requirement is not met]

### Related Functional Requirements
- [FR-XXX]: [How this NFR affects FR]

**Status**: [Draft / In Review / Approved / Verified]
**Test Plan**: [Link to test documentation]
```

## Use Case Template (Detailed)

```markdown
# UC-[ID]: [Use Case Title]

## Metadata
- **Version**: 1.0
- **Author**: [Name]
- **Date**: [YYYY-MM-DD]
- **Status**: [Draft / Review / Approved]

## Overview
- **Actor(s)**: [Primary actor, Secondary actors]
- **Goal**: [What the actor wants to achieve]
- **Level**: [User-goal / Subfunction / Summary]
- **Scope**: [System / Organization / Application]

## Stakeholders and Interests
- **[Stakeholder 1]**: [Their interest in this use case]
- **[Stakeholder 2]**: [Their interest]

## Preconditions
- [State that must be true before use case starts]
- [Another precondition]

## Minimal Guarantees (Postconditions - failure)
- [What is true even if use case fails]

## Success Guarantees (Postconditions - success)
- [What is true after successful completion]

## Trigger
[Event that initiates this use case]

## Main Success Scenario
1. [Actor] [action]
2. System [response]
3. [Actor] [next action]
4. System [next response]
   ...
N. Use case ends in success

## Extensions (Alternative Flows)
3a. [Condition]:
    1. [Actor/System action]
    2. [Response]
    3. Return to step 4 of main flow

4a. [Another condition]:
    1. [Handling steps]
    2. Use case ends in failure

*a. At any time, [Actor] cancels:
    1. System discards changes
    2. Use case ends

## Variations
- [Describe variations in how the use case might be performed]

## Related Information
- **Priority**: [High / Medium / Low]
- **Frequency**: [How often executed]
- **Business Rules**: [BR-001, BR-002]
- **Special Requirements**: [NFR-XXX]
- **Open Issues**: [Unresolved questions]

## User Interface
- **Screens**: [List screens involved]
- **Mockup**: [Link to wireframes/designs]

## Schedule
- **Planned**: [Sprint/Release]
- **Implemented**: [Date]
- **Tested**: [Date]
```

## User Story Card Template

```markdown
# [Story ID]: [Story Title]

## Story
**As a** [type of user]
**I want** [goal/desire]
**So that** [reason/benefit]

## Acceptance Criteria
**Given** [context/precondition]
**When** [action/event]
**Then** [expected outcome]

**Given** [another context]
**When** [another action]
**Then** [another outcome]

## Additional Information
- **Epic**: [Epic name/ID]
- **Priority**: [Must / Should / Could / Won't]
- **Story Points**: [1, 2, 3, 5, 8, 13, 21]
- **Business Value**: [1-10]
- **Technical Complexity**: [Low / Medium / High]

## Dependencies
- Blocked by: [Story ID]
- Blocks: [Story ID]
- Related to: [Story ID]

## Notes
[Additional context, clarifications, or considerations]

## Definition of Done
- [ ] Code complete
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Acceptance criteria verified
- [ ] Deployed to staging
- [ ] QA signed off
- [ ] Product owner accepted
- [ ] Released to production

## Attachments
- Wireframes: [Link]
- Design mockups: [Link]
- Technical specs: [Link]
```

## Business Rule Template

```markdown
## BR-[ID]: [Rule Name]

**Category**: [Validation / Calculation / Constraint / etc.]
**Source**: [Business policy / Regulation / Standard practice]
**Applies To**: [Features/modules this rule affects]

### Rule Statement
[Clear, declarative statement of the rule]

### Examples
**Example 1**:
- Input: [Scenario]
- Result: [What happens]

**Example 2**:
- Input: [Another scenario]
- Result: [What happens]

### Enforcement
- **When**: [At what point is rule enforced]
- **Where**: [Which components enforce it]
- **How**: [Validation method]

### Exceptions
- [Conditions under which rule doesn't apply]

### Error Handling
**If violated**:
- Error message: "[Specific message to user]"
- Action: [Block / Warn / Log]

### Related Requirements
- [FR-XXX]: [How requirement implements this rule]

**Status**: [Active / Deprecated / Under Review]
**Effective Date**: [YYYY-MM-DD]
```

## Acceptance Test Template (Gherkin)

```gherkin
Feature: [Feature Name]
  As a [user type]
  I want [capability]
  So that [business value]

  Background:
    Given [common precondition for all scenarios]
    And [another precondition]

  @tag @priority:high
  Scenario: [Test scenario name]
    Given [context/precondition]
    And [additional context]
    When [action/event]
    And [additional action]
    Then [expected outcome]
    And [additional outcome]
    But [something that should NOT happen]

  Scenario Outline: [Scenario with examples]
    Given [context with <parameter>]
    When [action with <parameter>]
    Then [outcome should be <result>]

    Examples:
      | parameter | result     |
      | value1    | outcome1   |
      | value2    | outcome2   |

  @tag @priority:low
  Scenario: [Another scenario]
    ...
```

## Requirement Specification Document Template

```markdown
# Requirements Specification: [Project Name]

## Document Information
- **Version**: 1.0
- **Date**: [YYYY-MM-DD]
- **Author(s)**: [Names]
- **Reviewers**: [Names]
- **Status**: [Draft / In Review / Approved]

## 1. Introduction

### 1.1 Purpose
[Why this document exists, who it's for]

### 1.2 Scope
[What the system will and won't do]

### 1.3 Definitions, Acronyms, Abbreviations
| Term | Definition |
|------|------------|
| [Term] | [Definition] |

### 1.4 References
- [Document 1]: [Description]
- [Document 2]: [Description]

### 1.5 Overview
[Document structure and organization]

## 2. Overall Description

### 2.1 Product Perspective
[How this fits into larger context]

### 2.2 Product Functions
- [High-level capability 1]
- [High-level capability 2]

### 2.3 User Characteristics
**User Type 1**: [Description, skills, frequency]
**User Type 2**: [Description]

### 2.4 Constraints
- [Technical constraint]
- [Business constraint]
- [Regulatory constraint]

### 2.5 Assumptions and Dependencies
- [Assumption 1]
- [Dependency 1]

## 3. Functional Requirements

### 3.1 [Feature Group 1]
[FR-001]: [Requirement]
[FR-002]: [Requirement]

### 3.2 [Feature Group 2]
[FR-101]: [Requirement]

## 4. Non-Functional Requirements

### 4.1 Performance
[NFR-001]: [Requirement]

### 4.2 Security
[NFR-101]: [Requirement]

### 4.3 Usability
[NFR-201]: [Requirement]

### 4.4 Reliability
[NFR-301]: [Requirement]

### 4.5 Compatibility
[NFR-401]: [Requirement]

## 5. User Stories

### 5.1 Epic: [Epic Name]
[US-001]: [Story]
[US-002]: [Story]

## 6. Use Cases

### 6.1 [Use Case Group]
[UC-001]: [Use case summary]

## 7. Business Rules
[BR-001]: [Rule]
[BR-002]: [Rule]

## 8. Data Requirements

### 8.1 Entities
[Entity 1]: [Description, attributes]

### 8.2 Relationships
[Entity 1] → [Entity 2]: [Relationship]

## 9. External Interface Requirements

### 9.1 User Interfaces
[Description of UI requirements]

### 9.2 Hardware Interfaces
[If applicable]

### 9.3 Software Interfaces
[Third-party integrations]

### 9.4 Communications Interfaces
[Network protocols, APIs]

## 10. Appendices

### Appendix A: Glossary
[Terms and definitions]

### Appendix B: Analysis Models
[Diagrams, flowcharts]

### Appendix C: Issues List
[Open questions, TBD items]
```

## Sprint Planning Template

```markdown
# Sprint [Number] Planning

**Sprint Goal**: [High-level objective]
**Duration**: [Start Date] to [End Date]
**Team Capacity**: [Total story points available]

## Committed Stories

| Story ID | Title | Points | Priority | Assignee |
|----------|-------|--------|----------|----------|
| US-001   | [Title] | 5    | Must    | [Name]   |
| US-002   | [Title] | 3    | Must    | [Name]   |
| US-003   | [Title] | 8    | Should  | [Name]   |

**Total Points**: [Sum]

## Acceptance Criteria Review
[Confirm all stories have clear, testable criteria]

## Dependencies
[External dependencies or blockers]

## Risks
[Known risks to sprint completion]

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged
- [ ] Tests passing
- [ ] Deployed to staging
- [ ] Stakeholder demo complete
```

## References
- IEEE 830-1998 (Software Requirements Specification)
- ISO/IEC/IEEE 29148 (Systems and software engineering - Requirements)
- Agile Alliance User Story standards

