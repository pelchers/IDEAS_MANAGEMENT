# Concept Map Patterns

Visual organization methods for study summaries using Mermaid diagrams.

## Hierarchical Maps

```mermaid
graph TD
    A[Main Topic] --> B[Subtopic 1]
    A --> C[Subtopic 2]
    A --> D[Subtopic 3]
    B --> E[Detail 1]
    B --> F[Detail 2]
    C --> G[Detail 3]
```

## Process Flow Maps

```mermaid
graph LR
    A[Start] --> B[Step 1]
    B --> C[Step 2]
    C --> D{Decision?}
    D -->|Yes| E[Step 3]
    D -->|No| B
    E --> F[End]
```

## Relationship Maps

```mermaid
graph LR
    A[Concept A] -->|causes| B[Concept B]
    B -->|leads to| C[Concept C]
    A -.->|related to| D[Concept D]
    C -->|requires| D
```

## Comparison Maps

```mermaid
graph TD
    A[Topic] --> B[Type 1]
    A --> C[Type 2]
    B --> D[Feature X: Value 1]
    B --> E[Feature Y: Value 1]
    C --> F[Feature X: Value 2]
    C --> G[Feature Y: Value 2]
```

## Best Practices

1. Use consistent color coding for related concepts
2. Limit to 7-10 nodes per diagram for clarity
3. Use different arrow types for relationship types
4. Add brief labels to connections
5. Organize spatially (top-down for hierarchy, left-right for process)

