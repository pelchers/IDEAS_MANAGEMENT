# Mermaid Markdown Template

Use this file when you want a Markdown document that can either render Mermaid live in a capable host or be transformed into static assets with `mmdc`.

## Flow Example

```mermaid
flowchart TD
    Start([Start]) --> Decide{Ready?}
    Decide -->|Yes| Work[Do work]
    Decide -->|No| Wait[Wait]
    Work --> End([End])
    Wait --> Decide
```

## Sequence Example

```mermaid
sequenceDiagram
    participant User
    participant App
    User->>App: Open page
    App-->>User: Render response
```

## Render This Markdown

```bash
mmdc -i mermaid-doc-template.md -o mermaid-doc-template.rendered.md
```
