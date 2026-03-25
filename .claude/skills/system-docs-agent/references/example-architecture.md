# [System Name] — Technical Architecture

## System Flow

```mermaid
flowchart TD
    A[User Action] --> B[Component 1]
    B --> C{Decision}
    C -->|Yes| D[Process A]
    C -->|No| E[Process B]
    D --> F[Output]
    E --> F
```

## State Machine

```mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Running : start
    Running --> Completed : all done
    Running --> Stopped : user stop
    Stopped --> Running : resume
    Completed --> [*]
```

## Sequence Diagram (for multi-agent systems)

```mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestrator
    participant S as Subagent
    U->>O: /command
    O->>S: spawn with scope
    S->>S: execute work
    S-->>O: return result
    O->>O: validate
    alt validation passes
        O-->>U: report success
    else validation fails
        O->>S: send feedback
        S->>S: fix issues
        S-->>O: return updated
    end
```

## Component Relationships

```
┌─────────────────────────────────────────┐
│              System Name                 │
├──────────┬──────────┬───────────────────┤
│  Agent   │  Skill   │  Hook             │
│          │          │                   │
│  (who)   │  (how)   │  (when/enforce)   │
└──────────┴──────────┴───────────────────┘
        │          │           │
        ▼          ▼           ▼
   Spawned by   Loaded by   Fires on
   hook/agent   agent/user  tool events
```

## Hook Execution Order

```mermaid
flowchart LR
    A[SessionStart hooks] --> B[Agent work]
    B --> C[PreToolUse hooks]
    C --> D[Tool executes]
    D --> E[PostToolUse hooks]
    E --> B
    B --> F[Agent exits]
    F --> G[Stop hooks]
```

## Key Algorithms

### [Algorithm Name]
```
function algorithmName(input):
    1. [step 1]
    2. [step 2]
    3. if [condition]:
         [action A]
       else:
         [action B]
    4. return [output]
```

## Error Handling

| Error | Detection | Recovery |
|---|---|---|
| [Error type 1] | [How detected] | [How to recover] |
| [Error type 2] | [How detected] | [How to recover] |
