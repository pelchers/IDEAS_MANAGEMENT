# Convex Query & Mutation Architecture

Visual guide to understanding Convex data operations, optimization patterns, and real-time updates.

## Query vs Mutation Lifecycle

```mermaid
graph TB
    subgraph Query Lifecycle
        Q1[Client: useQuery] --> Q2[Subscribe to Query]
        Q2 --> Q3[Execute Query]
        Q3 --> Q4[Return Results]
        Q4 --> Q5[Listen for Changes]
        Q5 -->|Data changes| Q3
    end

    subgraph Mutation Lifecycle
        M1[Client: useMutation] --> M2[Call Mutation]
        M2 --> M3[Begin Transaction]
        M3 --> M4[Execute Operations]
        M4 --> M5{Success?}
        M5 -->|Yes| M6[Commit]
        M5 -->|No| M7[Rollback]
        M6 --> M8[Notify Subscribers]
        M8 --> Q5
    end

    style Q4 fill:#87CEEB
    style M6 fill:#90EE90
    style M7 fill:#FFB6C6
```

## Query Execution Path

```mermaid
graph LR
    A[Query Called] --> B{Has Index?}

    B -->|Yes| C[withIndex]
    B -->|No| D[Full Scan]

    C --> E[Index Lookup]
    D --> F[Scan All Docs]

    E --> G{Filter?}
    F --> G

    G -->|Yes| H[Apply Filter]
    G -->|No| I[All Results]

    H --> I
    I --> J{Order?}

    J -->|Yes| K[Sort Results]
    J -->|No| L[Natural Order]

    K --> M{Limit?}
    L --> M

    M -->|take n| N[First N]
    M -->|paginate| O[Page + Cursor]
    M -->|collect| P[All Results]

    N --> Q[Return]
    O --> Q
    P --> Q

    style E fill:#90EE90
    style F fill:#FFB6C6
    style Q fill:#87CEEB
```

## Mutation Transaction Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Mutation
    participant T as Transaction
    participant D as Database
    participant S as Subscribers

    C->>M: Execute mutation
    M->>T: Begin transaction
    Note over T: Isolated scope

    M->>D: Read operation
    D-->>M: Current data

    M->>D: Write operation 1
    M->>D: Write operation 2
    M->>D: Write operation 3

    alt All operations succeed
        T->>D: Commit all changes
        D->>S: Notify subscribers
        S-->>C: UI updates
        M-->>C: Success
    else Any operation fails
        T->>D: Rollback all changes
        M-->>C: Error
    end
```

## Index vs Filter Performance

```mermaid
graph TB
    subgraph withIndex Fast
        I1[Query with Index] --> I2[O log n lookup]
        I2 --> I3[Found: 10 / 1M docs]
        I3 --> I4[Time: ~1ms]
    end

    subgraph filter Slow
        F1[Query with Filter] --> F2[O n scan]
        F2 --> F3[Scanned: 1M docs]
        F3 --> F4[Found: 10]
        F4 --> F5[Time: ~500ms]
    end

    style I4 fill:#90EE90
    style F5 fill:#FFB6C6
```

## Real-Time Update Flow

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant U2 as User 2
    participant Q as Query
    participant M as Mutation
    participant DB as Database

    U1->>Q: useQuery(getProfile)
    Q->>DB: Subscribe to profile
    DB-->>Q: Current data
    Q-->>U1: Display profile

    U2->>Q: useQuery(getProfile)
    Q->>DB: Subscribe to profile
    DB-->>Q: Current data
    Q-->>U2: Display profile

    Note over U1,U2: Both watching same data

    U1->>M: useMutation(updateProfile)
    M->>DB: Patch profile
    DB->>DB: Data changed

    DB-->>Q: Notify change
    Q->>DB: Re-execute query
    DB-->>Q: Updated data
    Q-->>U1: Re-render ✓
    Q-->>U2: Re-render ✓
```

## Pagination Strategy

```mermaid
graph TB
    A[Large Dataset] --> B{How to load?}

    B -->|collect| C[Load All]
    B -->|take n| D[Load First N]
    B -->|paginate| E[Load Page]

    C --> F[Memory: High]
    C --> G[Speed: Slow]

    D --> H[Memory: Low]
    D --> I[Speed: Fast]
    D --> J[No Next Page]

    E --> K[Memory: Low]
    E --> L[Speed: Fast]
    E --> M[Has Cursor]

    M --> N[Load More]

    style C fill:#FFB6C6
    style D fill:#FFD700
    style E fill:#90EE90
```

## Query Optimization Workflow

```mermaid
graph TB
    A[Slow Query] --> B[Measure Performance]
    B --> C[Analyze Query Plan]

    C --> D{Using Index?}
    D -->|No| E[Add Index]
    D -->|Yes| F{Correct Index?}

    F -->|No| G[Switch to Better Index]
    F -->|Yes| H{Result Size?}

    H -->|Large| I[Add Pagination]
    H -->|Small| J{Complex Filter?}

    J -->|Yes| K[Optimize Filter Logic]
    J -->|No| L[Check Network]

    E --> M[Deploy & Test]
    G --> M
    I --> M
    K --> M

    M --> N{Faster?}
    N -->|Yes| O[Monitor]
    N -->|No| C

    style E fill:#90EE90
    style M fill:#87CEEB
    style O fill:#90EE90
```

## Authorization Pattern

```mermaid
graph TB
    A[Mutation Called] --> B[Check Auth]
    B --> C{Authenticated?}

    C -->|No| D[Throw: Unauthenticated]
    C -->|Yes| E[Get User Identity]

    E --> F{Has Permission?}
    F -->|No| G[Throw: Unauthorized]
    F -->|Yes| H[Load Resource]

    H --> I{Owns Resource?}
    I -->|No| G
    I -->|Yes| J[Execute Operation]

    J --> K[Return Success]

    style D fill:#FFB6C6
    style G fill:#FFB6C6
    style K fill:#90EE90
```

## Optimistic Update Pattern

```mermaid
sequenceDiagram
    participant UI
    participant State
    participant Mutation
    participant DB

    UI->>State: Update optimistically
    Note over State: Immediate UI change

    State-->>UI: Show updated UI

    UI->>Mutation: Call mutation
    Mutation->>DB: Apply changes

    alt Success
        DB-->>Mutation: Success
        Mutation-->>State: Confirm
        Note over State: Optimistic = Actual ✓
    else Error
        DB-->>Mutation: Error
        Mutation-->>State: Rollback
        State-->>UI: Revert to original
        UI->>UI: Show error
    end
```

## Compound Index Query Patterns

```mermaid
graph TB
    A[Index: userId, status, timestamp] --> B{Query Pattern}

    B -->|eq userId| C1[✓ Uses Index]
    B -->|eq userId, eq status| C2[✓ Uses Index]
    B -->|eq userId, eq status, gt timestamp| C3[✓ Uses Index]

    B -->|eq status| D1[✗ Skips userId]
    B -->|eq timestamp| D2[✗ Skips userId & status]
    B -->|eq userId, gt timestamp| D3[✗ Skips status in middle]

    C1 --> E[Efficient Query]
    C2 --> E
    C3 --> E

    D1 --> F[Full Table Scan]
    D2 --> F
    D3 --> F

    style C1 fill:#90EE90
    style C2 fill:#90EE90
    style C3 fill:#90EE90
    style D1 fill:#FFB6C6
    style D2 fill:#FFB6C6
    style D3 fill:#FFB6C6
```

## CRUD Operations Flow

```mermaid
graph LR
    subgraph Create
        C1[insert] --> C2[Validate]
        C2 --> C3[Generate _id]
        C3 --> C4[Set _creationTime]
        C4 --> C5[Write to DB]
    end

    subgraph Read
        R1[get/query] --> R2[Check Index]
        R2 --> R3[Fetch Data]
        R3 --> R4[Return Doc]
    end

    subgraph Update
        U1[patch] --> U2[Validate]
        U2 --> U3[Merge Fields]
        U3 --> U4[Write to DB]

        U5[replace] --> U6[Validate]
        U6 --> U7[Overwrite Doc]
        U7 --> U4
    end

    subgraph Delete
        D1[delete] --> D2[Remove Doc]
        D2 --> D3[Update Indexes]
    end

    style C5 fill:#90EE90
    style R4 fill:#87CEEB
    style U4 fill:#FFD700
    style D3 fill:#FFB6C6
```

## Search Index Query Flow

```mermaid
sequenceDiagram
    participant Client
    participant Query
    participant SearchIndex
    participant DB

    Client->>Query: withSearchIndex("search_name")
    Query->>SearchIndex: search("searchField", "term")

    SearchIndex->>SearchIndex: Tokenize search term
    SearchIndex->>SearchIndex: Match documents
    SearchIndex->>SearchIndex: Rank by relevance

    alt Has filters
        Query->>SearchIndex: eq("filterField", value)
        SearchIndex->>SearchIndex: Apply filters
    end

    SearchIndex->>DB: Get matching docs
    DB-->>SearchIndex: Documents
    SearchIndex-->>Query: Ranked results
    Query-->>Client: Display results
```

## Error Handling Strategy

```mermaid
graph TB
    A[Operation] --> B{Success?}

    B -->|Yes| C[Return Data]
    B -->|No| D{Error Type}

    D -->|Validation| E[User Friendly Message]
    D -->|Auth| F[Unauthorized Error]
    D -->|Not Found| G[Not Found Error]
    D -->|Conflict| H[Conflict Error]
    D -->|System| I[Log & Generic Error]

    E --> J[Return to Client]
    F --> J
    G --> J
    H --> J
    I --> K[Alert Dev Team]
    K --> J

    C --> L[Success Response]
    J --> M[Client Handles]

    style C fill:#90EE90
    style I fill:#FFB6C6
```

## Batch Operations Pattern

```mermaid
sequenceDiagram
    participant Client
    participant Mutation
    participant DB

    Client->>Mutation: batchCreate([item1, item2, item3])
    Note over Mutation: Begin transaction

    loop For each item
        Mutation->>DB: Validate item
        alt Valid
            Mutation->>DB: insert(item)
        else Invalid
            Mutation-->>Client: Error on item N
            Note over DB: Rollback all
        end
    end

    Note over DB: Commit all
    Mutation-->>Client: Success + IDs
```

## Query Result Methods Comparison

```mermaid
graph TB
    A[Query Results] --> B{Method?}

    B -->|collect| C[Return All]
    B -->|first| D[Return First or null]
    B -->|unique| E[Return One or throw]
    B -->|take n| F[Return First N]
    B -->|paginate| G[Return Page + Cursor]

    C --> H{0 results}
    D --> I{0 results}
    E --> J{0 or >1 results}
    F --> K{<N results}
    G --> L{Has more}

    H --> H1[Empty array]
    I --> I1[null]
    J --> J1[Throws error]
    K --> K1[Returns what exists]
    L --> L1[isDone: true/false]

    style C fill:#87CEEB
    style D fill:#87CEEB
    style E fill:#FFD700
    style F fill:#90EE90
    style G fill:#90EE90
```

## Data Consistency Model

```mermaid
graph LR
    A[Write Mutation] --> B[Transaction Start]
    B --> C[Acquire Locks]
    C --> D[Execute Changes]
    D --> E{All Success?}

    E -->|Yes| F[Commit]
    E -->|No| G[Rollback]

    F --> H[Release Locks]
    G --> H

    H --> I[Notify Subscribers]
    I --> J[Queries Re-run]
    J --> K[Consistent State ✓]

    style F fill:#90EE90
    style G fill:#FFB6C6
    style K fill:#90EE90
```

