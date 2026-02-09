# Convex Schema Architecture Diagrams

Comprehensive visual guide to understanding Convex database schemas, relationships, and query patterns.

## Full LinkWave Schema Architecture

```mermaid
erDiagram
    USERS ||--o{ PROFILES : owns
    PROFILES ||--o{ LINKS : contains
    PROFILES ||--o{ ANALYTICS : tracks
    LINKS ||--o{ CLICKS : generates
    LINKS ||--o{ ANALYTICS : aggregates
    BRAND_SPONSORS ||--o{ SPONSORSHIPS : creates
    PROFILES ||--o{ SPONSORSHIPS : receives

    USERS {
        string _id PK
        string clerkId UK
        string email
        string userType
        number _creationTime
    }

    PROFILES {
        string _id PK
        string userId FK
        string slug UK
        string displayName
        string bio
        boolean isActive
    }

    LINKS {
        string _id PK
        id profileId FK
        string type
        string title
        string url
        number clicks
        boolean isActive
        number order
    }

    CLICKS {
        string _id PK
        id linkId FK
        string country
        string device
        number timestamp
    }

    ANALYTICS {
        string _id PK
        id profileId FK
        id linkId FK
        string metric
        number value
        number timestamp
    }

    BRAND_SPONSORS {
        string _id PK
        string userId FK
        string companyName
        string category
        number costPerClick
    }

    SPONSORSHIPS {
        string _id PK
        id brandId FK
        id profileId FK
        string status
        number startDate
        number endDate
    }
```

## Index Strategy Flow

```mermaid
graph TB
    A[Define Table] --> B[Identify Query Patterns]
    B --> C{Query Type?}

    C -->|Single Field| D[Single Index]
    C -->|Multiple Fields| E[Compound Index]
    C -->|Text Search| F[Search Index]

    D --> G[.index by_field, field]
    E --> H[.index by_fields, field1, field2]
    F --> I[.searchIndex name, searchField]

    G --> J[Query Optimization]
    H --> J
    I --> J

    J --> K{Performance OK?}
    K -->|No| L[Add More Indexes]
    K -->|Yes| M[Monitor & Iterate]

    L --> B

    style D fill:#90EE90
    style E fill:#90EE90
    style F fill:#90EE90
    style K fill:#FFD700
```

## Compound Index Query Paths

```mermaid
graph LR
    A[Index: userId, timestamp] --> B{Query Pattern}

    B -->|eq userId| C[Uses Index ✓]
    B -->|eq userId + eq timestamp| D[Uses Index ✓]
    B -->|eq userId + gt timestamp| E[Uses Index ✓]
    B -->|eq timestamp only| F[Skips Index ✗]

    C --> G[Efficient]
    D --> G
    E --> G
    F --> H[Full Table Scan]

    style C fill:#90EE90
    style D fill:#90EE90
    style E fill:#90EE90
    style F fill:#FFB6C6
    style G fill:#90EE90
    style H fill:#FFB6C6
```

## Data Flow: Create Profile with Links

```mermaid
sequenceDiagram
    participant Client
    participant Mutation
    participant Schema
    participant DB
    participant Indexes

    Client->>Mutation: createProfile(data)
    Mutation->>Schema: Validate against schema
    Schema-->>Mutation: Valid ✓

    Mutation->>DB: insert("profiles", data)
    DB->>Indexes: Update by_user index
    DB->>Indexes: Update by_slug index
    DB-->>Mutation: Return profileId

    loop For each link
        Mutation->>DB: insert("links", linkData)
        DB->>Indexes: Update by_profile index
    end

    Mutation-->>Client: Success + profileId
```

## Polymorphic Links Pattern

```mermaid
graph TB
    A[Link Type] --> B{Discriminator}

    B -->|URL| C[URL Link]
    B -->|EMAIL| D[Email Link]
    B -->|TIMER| E[Timer Link]
    B -->|SOCIAL| F[Social Link]

    C --> G[Fields: url, title]
    D --> H[Fields: email, title]
    E --> I[Fields: startDate, endDate, title]
    F --> J[Fields: platform, handle, title]

    G --> K[Single Table]
    H --> K
    I --> K
    J --> K

    style K fill:#90EE90
```

## Schema Validation Pipeline

```mermaid
graph LR
    A[db.insert/patch] --> B[Schema Validator]
    B --> C{Matches Schema?}

    C -->|Yes| D[Type Inference]
    C -->|No| E[Throw Error]

    D --> F[Runtime Check]
    F --> G{Valid?}

    G -->|Yes| H[Write to DB]
    G -->|No| E

    H --> I[Update Indexes]
    I --> J[Broadcast Changes]

    style H fill:#90EE90
    style E fill:#FFB6C6
    style J fill:#87CEEB
```

## Index Performance Comparison

```mermaid
graph TB
    subgraph Without Index
        A1[Query] --> B1[Full Table Scan]
        B1 --> C1[Filter All Rows]
        C1 --> D1[Return Results]
        D1 --> E1[O n - Slow]
    end

    subgraph With Index
        A2[Query] --> B2[Index Lookup]
        B2 --> C2[Find Matching Keys]
        C2 --> D2[Return Results]
        D2 --> E2[O log n - Fast]
    end

    style B1 fill:#FFB6C6
    style E1 fill:#FFB6C6
    style B2 fill:#90EE90
    style E2 fill:#90EE90
```

## Schema Evolution Strategy

```mermaid
graph TB
    A[Initial Schema] --> B[Deploy to Prod]
    B --> C[Monitor Queries]
    C --> D{Need Changes?}

    D -->|Add Field| E[Add Optional Field]
    D -->|Add Index| F[Create New Index]
    D -->|Change Type| G[Migration Required]

    E --> H[Backward Compatible ✓]
    F --> H
    G --> I[Plan Migration]

    I --> J[Create Migration Script]
    J --> K[Test on Staging]
    K --> L[Deploy with Backfill]
    L --> M[Monitor Performance]

    H --> M
    M --> N{Issues?}
    N -->|Yes| O[Rollback Plan]
    N -->|No| P[Success]

    style H fill:#90EE90
    style G fill:#FFD700
    style P fill:#90EE90
```

## Type Safety Flow

```mermaid
graph LR
    A[Define Schema] --> B[Convex Generates Types]
    B --> C[_generated/dataModel]
    C --> D[Import Doc/Id Types]
    D --> E[Type-Safe Queries]
    E --> F[Type-Safe Frontend]

    G[Schema Change] --> A

    F --> H{Compile?}
    H -->|Error| I[Fix Type Issues]
    H -->|Success| J[Deploy]

    I --> D

    style B fill:#87CEEB
    style E fill:#90EE90
    style F fill:#90EE90
    style J fill:#90EE90
```

## Search Index Architecture

```mermaid
graph TB
    A[Define searchIndex] --> B[Specify searchField]
    B --> C[Add filterFields]

    D[User Query] --> E[Text Search]
    E --> F[Filter Results]

    F --> G{Has Filters?}
    G -->|Yes| H[Apply filterFields]
    G -->|No| I[Return All Matches]

    H --> I
    I --> J[Ranked Results]

    style B fill:#87CEEB
    style J fill:#90EE90
```

## Best Practices Decision Tree

```mermaid
graph TB
    A[Need to Query?] -->|Yes| B{How many fields?}
    A -->|No| C[No Index Needed]

    B -->|1| D[Single Field Index]
    B -->|2+| E{Query order matters?}

    E -->|Yes| F[Compound Index]
    E -->|No| G[Multiple Single Indexes]

    F --> H{First field used alone?}
    H -->|Yes| I[Order: most-used first]
    H -->|No| J[Order: by query pattern]

    I --> K[Implement Index]
    J --> K
    D --> K
    G --> K

    K --> L[Test Performance]
    L --> M{Fast enough?}
    M -->|No| N[Optimize Query]
    M -->|Yes| O[Monitor in Production]

    style K fill:#90EE90
    style O fill:#90EE90
```

## Real-World Example: Analytics System

```mermaid
erDiagram
    PROFILES ||--o{ LINKS : has
    LINKS ||--o{ CLICKS : receives
    CLICKS }o--|| ANALYTICS : aggregates
    PROFILES ||--o{ ANALYTICS : summarizes

    PROFILES {
        id _id PK
        string userId
        string slug UK
    }

    LINKS {
        id _id PK
        id profileId FK
        string type
        number order
    }

    CLICKS {
        id _id PK
        id linkId FK
        string country
        string referer
        number timestamp
    }

    ANALYTICS {
        id _id PK
        id profileId FK
        id linkId FK
        string timeframe
        object metrics
        number timestamp
    }
```

**Indexes Required:**
```typescript
clicks: defineTable({...})
  .index("by_link_time", ["linkId", "timestamp"])
  .index("by_country", ["country"])

analytics: defineTable({...})
  .index("by_profile_time", ["profileId", "timeframe", "timestamp"])
  .index("by_link_time", ["linkId", "timeframe", "timestamp"])
```

## Circular Reference Resolution

```mermaid
sequenceDiagram
    participant Client
    participant Mutation
    participant DB

    Note over Client,DB: Creating circular references

    Client->>Mutation: Create user and preferences
    Mutation->>DB: 1. Insert user (preferencesId: null)
    DB-->>Mutation: userId

    Mutation->>DB: 2. Insert preferences (userId: userId)
    DB-->>Mutation: preferencesId

    Mutation->>DB: 3. Update user (preferencesId: preferencesId)
    DB-->>Mutation: Success

    Mutation-->>Client: Both created with links ✓
```

## Query Optimization Workflow

```mermaid
graph TB
    A[Slow Query Detected] --> B[Analyze Query]
    B --> C{Has Index?}

    C -->|No| D[Add Appropriate Index]
    C -->|Yes| E{Using Index?}

    E -->|No| F[Fix Query to Use Index]
    E -->|Yes| G{Result Set Size}

    G -->|Large| H[Add Pagination]
    G -->|Small| I[Check Other Factors]

    D --> J[Deploy Index]
    F --> J
    H --> J

    J --> K[Test Performance]
    K --> L{Improved?}
    L -->|Yes| M[Monitor]
    L -->|No| N[Re-analyze]

    N --> B

    style D fill:#90EE90
    style J fill:#87CEEB
    style M fill:#90EE90
```

