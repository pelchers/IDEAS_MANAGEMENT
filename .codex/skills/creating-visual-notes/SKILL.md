---
name: creating-visual-notes
description: Converts text notes into visual formats including mind maps (Mermaid), concept maps, flowcharts for processes, timeline visualizations, comparison tables/matrices, and sketchnote patterns. Use when transforming lecture notes, creating study aids, visualizing relationships, or organizing complex information spatially.
---

# Creating Visual Notes

Transform text-based notes into visual formats that enhance understanding, retention, and recall through spatial organization and visual encoding.

## What This Skill Does

Converts notes into multiple visual formats:

- **Mind maps**: Hierarchical concept organization (Mermaid)
- **Concept maps**: Relationship networks with labeled connections
- **Flowcharts**: Process and decision flows
- **Timelines**: Chronological event visualization
- **Comparison tables**: Feature matrices and side-by-side analysis
- **Sketchnotes**: Visual note-taking patterns with icons and structure

## Quick Start

### Generate Mind Map

```bash
node scripts/generate-mindmap.js notes.txt mindmap.md
```

### Create Timeline

```bash
node scripts/create-timeline.js events.json timeline.md
```

### Build Comparison Table

```bash
node scripts/build-comparison-table.js items.json comparison.md
```

---

## Visual Note Creation Workflow

```mermaid
graph TD
    A[Text Notes] --> B[Identify Structure]
    B --> C{Note Type?}

    C -->|Hierarchical| D[Mind Map]
    C -->|Relationships| E[Concept Map]
    C -->|Sequential| F[Flowchart/Timeline]
    C -->|Comparative| G[Comparison Table]

    D --> H[Apply Visual Design]
    E --> H
    F --> H
    G --> H

    H --> I[Add Color Coding]
    I --> J[Review & Refine]
```

---

## Mind Maps

### Basic Mind Map Structure

```mermaid
mindmap
  root((Machine Learning))
    Supervised Learning
      Classification
        Logistic Regression
        Decision Trees
        Neural Networks
      Regression
        Linear Regression
        Polynomial Regression
    Unsupervised Learning
      Clustering
        K-Means
        DBSCAN
      Dimensionality Reduction
        PCA
        t-SNE
    Reinforcement Learning
      Q-Learning
      Deep Q-Networks
```

### Hierarchical Mind Map (Tree Style)

```mermaid
graph TD
    A[Data Science] --> B[Statistics]
    A --> C[Programming]
    A --> D[Domain Knowledge]

    B --> B1[Descriptive]
    B --> B2[Inferential]
    B --> B3[Predictive]

    C --> C1[Python]
    C --> C2[R]
    C --> C3[SQL]

    C1 --> C1a[NumPy]
    C1 --> C1b[Pandas]
    C1 --> C1c[Scikit-learn]

    D --> D1[Business]
    D --> D2[Healthcare]
    D --> D3[Finance]

    style A fill:#ff9999
    style B fill:#99ccff
    style C fill:#99ff99
    style D fill:#ffcc99
```

### Radial Mind Map Pattern

```
                    Classification
                          |
        Linear -------- ML Core -------- Neural Nets
                          |
                     Clustering
                          |
                    Dimensionality
                     Reduction
```

---

## Concept Maps (Relationship Maps)

### Labeled Relationships

```mermaid
graph LR
    A[Supervised Learning] -->|requires| B[Labeled Data]
    A -->|produces| C[Prediction Model]
    C -->|evaluated by| D[Test Data]

    E[Unsupervised Learning] -->|uses| F[Unlabeled Data]
    E -->|discovers| G[Patterns]

    A -.->|contrasts with| E

    B -->|split into| H[Training Set]
    B -->|split into| D

    style A fill:#e1f5ff
    style E fill:#ffe1e1
```

### Concept Network with Categories

```mermaid
graph TD
    subgraph Algorithms
        A[Linear Regression]
        B[Logistic Regression]
        C[Neural Networks]
    end

    subgraph Concepts
        D[Supervised Learning]
        E[Classification]
        F[Regression]
    end

    subgraph Data
        G[Training Set]
        H[Test Set]
        I[Features]
    end

    D --> E
    D --> F
    E --> B
    E --> C
    F --> A

    G --> A
    G --> B
    G --> C

    I --> A
    I --> B
    I --> C
```

---

## Flowcharts and Process Diagrams

### Decision Flowchart

```mermaid
flowchart TD
    A[Start: Data Problem] --> B{Labeled Data?}
    B -->|Yes| C[Supervised Learning]
    B -->|No| D[Unsupervised Learning]

    C --> E{Output Type?}
    E -->|Continuous| F[Regression]
    E -->|Categories| G[Classification]

    D --> H{Goal?}
    H -->|Group Similar| I[Clustering]
    H -->|Reduce Dimensions| J[PCA/t-SNE]

    F --> K[Linear Regression]
    G --> L[Logistic Regression]

    K --> M[Train Model]
    L --> M
    I --> M
    J --> M

    M --> N[Evaluate]
    N --> O{Good Performance?}
    O -->|No| P[Adjust Parameters]
    P --> M
    O -->|Yes| Q[Deploy]
```

### Linear Process Flow

```mermaid
graph LR
    A[Collect Data] --> B[Clean Data]
    B --> C[Explore Data]
    C --> D[Feature Engineering]
    D --> E[Train Model]
    E --> F[Evaluate]
    F --> G[Deploy]

    style A fill:#ff9999
    style G fill:#99ff99
```

### Swimlane Diagram (Multi-Actor Process)

```mermaid
graph TB
    subgraph Student
        A[Read Material]
        D[Take Notes]
        G[Create Summary]
    end

    subgraph Professor
        B[Assign Reading]
        E[Give Lecture]
    end

    subgraph System
        C[Provide Resources]
        F[Track Progress]
        H[Generate Quiz]
    end

    B --> A
    A --> C
    C --> D
    E --> D
    D --> F
    F --> G
    G --> H
```

---

## Timelines

### Historical Timeline

```mermaid
timeline
    title History of Machine Learning
    1950 : Turing Test
         : AI as a field emerges
    1956 : Dartmouth Conference
         : "Artificial Intelligence" term coined
    1997 : Deep Blue defeats Kasparov
    2011 : Watson wins Jeopardy
    2012 : AlexNet breakthrough in ImageNet
    2016 : AlphaGo defeats Lee Sedol
    2022 : ChatGPT released
```

### Project Timeline (Gantt-style)

```mermaid
gantt
    title Semester Project Timeline
    dateFormat  YYYY-MM-DD
    section Research
    Literature review       :done, 2024-01-15, 14d
    Data collection        :active, 2024-01-29, 7d
    section Analysis
    Data cleaning          :2024-02-05, 3d
    Statistical analysis   :2024-02-08, 7d
    section Writing
    First draft           :2024-02-15, 10d
    Revisions             :2024-02-25, 5d
    Final submission      :milestone, 2024-03-01, 0d
```

### Simple Text Timeline

```
1950s ─────► 1990s ─────► 2010s ─────► 2020s
  │             │            │            │
  │             │            │            │
Symbolic AI   Statistical  Deep         Generative
  Expert        ML          Learning     AI
  Systems       SVMs        CNNs         GPT/DALL-E
                            RNNs         Stable Diffusion
```

---

## Comparison Tables and Matrices

### Feature Comparison Matrix

| Algorithm | Type | Data Needs | Interpretability | Speed | Accuracy |
|-----------|------|------------|------------------|-------|----------|
| Linear Regression | Supervised | Low | ⭐⭐⭐ | ⚡⚡⚡ | ⭐⭐ |
| Decision Tree | Supervised | Medium | ⭐⭐⭐ | ⚡⚡ | ⭐⭐ |
| Neural Network | Supervised | High | ⭐ | ⚡ | ⭐⭐⭐ |
| K-Means | Unsupervised | Low | ⭐⭐ | ⚡⚡⚡ | ⭐⭐ |

### Two-Way Comparison Table

```markdown
| Aspect | Supervised Learning | Unsupervised Learning |
|--------|--------------------|-----------------------|
| **Data** | Labeled (inputs + outputs) | Unlabeled (inputs only) |
| **Goal** | Predict outputs for new inputs | Discover patterns/structure |
| **Examples** | Classification, Regression | Clustering, Dim. reduction |
| **Algorithms** | Linear Reg., Neural Nets | K-Means, PCA |
| **Evaluation** | Accuracy, precision, recall | Silhouette score, elbow method |
| **Use Cases** | Spam detection, price prediction | Customer segmentation, anomaly detection |
```

### Pros/Cons Matrix

```
┌─────────────────────┬────────────────────┬───────────────────┐
│     Algorithm       │   Advantages       │   Disadvantages   │
├─────────────────────┼────────────────────┼───────────────────┤
│ Linear Regression   │ • Fast             │ • Assumes linear  │
│                     │ • Interpretable    │   relationship    │
│                     │ • Low data needs   │ • Sensitive to    │
│                     │                    │   outliers        │
├─────────────────────┼────────────────────┼───────────────────┤
│ Neural Network      │ • High accuracy    │ • "Black box"     │
│                     │ • Handles complex  │ • Needs lots of   │
│                     │   patterns         │   data            │
│                     │ • Versatile        │ • Computationally │
│                     │                    │   expensive       │
└─────────────────────┴────────────────────┴───────────────────┘
```

---

## Sketchnote Patterns

### Cornell Note Visual Template

```
┌────────────────────────────────────────────────────┐
│ Topic: Machine Learning Fundamentals               │
│ Date: Jan 15, 2024                                 │
├──────────────┬─────────────────────────────────────┤
│              │                                      │
│ KEY CONCEPTS │         VISUAL NOTES                │
│              │                                      │
│ • Supervised │    [Diagram of labeled data]        │
│   Learning   │         ↓                            │
│              │    [Algorithm box]                   │
│              │         ↓                            │
│ • Features   │    [Prediction output]              │
│              │                                      │
│ • Training   │    Training = Learning patterns     │
│   vs Testing │    Testing = Checking accuracy      │
│              │                                      │
│              │    [Icon: Brain] → [Icon: Computer] │
│              │                                      │
│ • Models     │    Types of Models:                 │
│              │    🔹 Linear (simple)               │
│              │    🔹 Tree (decisions)              │
│              │    🔹 Neural (complex)              │
│              │                                      │
├──────────────┴─────────────────────────────────────┤
│ SUMMARY:                                           │
│ ML = Computers learning patterns from data         │
│ Supervised = Learn from labeled examples           │
│ Goal = Make accurate predictions on new data       │
└────────────────────────────────────────────────────┘
```

### Visual Vocabulary

**Common Icons for Concepts**:
```
📊 Data/Statistics      💡 Idea/Concept
🔄 Process/Cycle        ⚠️  Warning/Important
📈 Growth/Increase      ✓ Success/Correct
📉 Decline/Decrease     ✗ Error/Incorrect
🎯 Goal/Target          🔍 Analysis/Detail
⚡ Speed/Quick          🐌 Slow/Gradual
💰 Cost/Money           ⏰ Time/Deadline
👥 People/Users         🖥️  Computer/System
📚 Learning/Study       🧠 Intelligence/Thinking
```

**Visual Connectors**:
```
──► Leads to           ⟷  Bidirectional
┄┄► Weak connection    ⇉  Strong connection
─┬─ Branches           ═══► Important path
 │
 └─► Alternative
```

---

## Color Coding Systems

### Subject-Based Color Coding

- 🔴 **Red**: Important/Critical/Errors
- 🟠 **Orange**: Warnings/Cautions
- 🟡 **Yellow**: Examples/Illustrations
- 🟢 **Green**: Definitions/Terminology
- 🔵 **Blue**: Processes/Methods
- 🟣 **Purple**: Questions/To Research
- ⚫ **Black**: Main content/Body

### Bloom's Taxonomy Color Coding

- **Level 1 (Remember)**: Light Blue
- **Level 2 (Understand)**: Blue
- **Level 3 (Apply)**: Green
- **Level 4 (Analyze)**: Yellow
- **Level 5 (Evaluate)**: Orange
- **Level 6 (Create)**: Red

### Semantic Color Coding

```mermaid
graph LR
    A[Concepts] --> B[Examples]
    A --> C[Applications]
    B --> D[Practice Problems]

    style A fill:#e1f5ff
    style B fill:#fff5e1
    style C fill:#e1ffe1
    style D fill:#ffe1f5
```

---

## Layout Patterns

### Radial Layout (Central Focus)

```
           Topic 2
               |
Topic 1 ── MAIN IDEA ── Topic 3
               |
           Topic 4
```

### Hierarchical Layout (Top-Down)

```
         Main Topic
            |
    ┌───────┴───────┐
    |               |
SubTopic 1    SubTopic 2
    |               |
  ┌─┴─┐           ┌─┴─┐
Detail Detail  Detail Detail
```

### Sequential Layout (Left-Right)

```
Step 1 → Step 2 → Step 3 → Step 4 → Result
```

### Matrix Layout (Grid)

```
        Category A | Category B | Category C
Item 1      ✓     |     ✗      |     ✓
Item 2      ✗     |     ✓      |     ✓
Item 3      ✓     |     ✓      |     ✗
```

---

## Best Practices

### Visual Note Design Principles

1. **Hierarchy**: Use size/color/position to show importance
2. **Grouping**: Related items close together
3. **White Space**: Don't overcrowd - breathing room improves clarity
4. **Consistency**: Same symbols/colors mean same things
5. **Emphasis**: Highlight key information (bold, color, boxes)

### Mermaid Diagram Tips

```mermaid
graph TD
    A[Use short labels] --> B[Limit to 7-10 nodes]
    B --> C[Choose right diagram type]
    C --> D[Add descriptive title]

    style A fill:#e1f5ff
    style D fill:#ffe1e1
```

**Diagram Type Selection**:
- **Hierarchy**: Tree diagram, mind map
- **Process**: Flowchart, sequence diagram
- **Relationships**: Graph, network diagram
- **Time**: Timeline, Gantt chart
- **Comparison**: Table, matrix

### Memory Enhancement Through Visualization

**Dual Coding**: Combine text + visual for better retention
**Spatial Memory**: Use position to encode relationships
**Color Associations**: Consistent color use creates mental links
**Personal Icons**: Create your own symbol system

---

## Conversion Examples

### Text to Mind Map

**Text Notes**:
```
Machine Learning Types:
- Supervised Learning (uses labeled data)
  - Classification (categories)
  - Regression (continuous values)
- Unsupervised Learning (no labels)
  - Clustering (group similar items)
  - Dimensionality Reduction (simplify data)
```

**Mind Map**:
```mermaid
graph TD
    A[Machine Learning] --> B[Supervised]
    A --> C[Unsupervised]
    B --> D[Classification<br/>categories]
    B --> E[Regression<br/>continuous]
    C --> F[Clustering<br/>group similar]
    C --> G[Dim. Reduction<br/>simplify]
```

### Text to Comparison Table

**Text Notes**:
```
Python vs R for Data Science:
Python is general-purpose, easier to learn, better for production.
R is statistics-focused, great for visualization, academic preference.
Both have good ML libraries.
```

**Comparison Table**:

| Aspect | Python | R |
|--------|--------|---|
| **Purpose** | General-purpose | Statistics-focused |
| **Learning Curve** | Easier | Steeper |
| **Production Use** | ⭐⭐⭐ | ⭐ |
| **Visualization** | ⭐⭐ | ⭐⭐⭐ |
| **ML Libraries** | ⭐⭐⭐ | ⭐⭐⭐ |
| **Community** | Large, diverse | Academic |

---

## Advanced Features

For detailed information:
- **Visual Note Patterns**: `resources/visual-note-patterns.md`
- **Mermaid Examples Library**: `resources/mermaid-examples.md`
- **Color Coding Systems**: `resources/color-coding-systems.md`
- **Sketchnote Templates**: `resources/sketchnote-templates.md`

## References

- Visual Learning Theory (Paivio)
- Cognitive Load Theory
- Sketchnoting techniques (Mike Rohde)
- Mind mapping methodology (Tony Buzan)
- Information design principles (Edward Tufte)

