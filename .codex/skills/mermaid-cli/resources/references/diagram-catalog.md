# Diagram Catalog

This catalog mirrors the current Mermaid diagram families surfaced in the official Mermaid docs navigation and pairs each one with a local starter template.

## Stable Or Commonly Used Families

- Flowchart: docs `https://mermaid.js.org/syntax/flowchart.html`, template `flowchart.mmd`
- Sequence Diagram: docs `https://mermaid.js.org/syntax/sequenceDiagram.html`, template `sequence.mmd`
- Class Diagram: docs `https://mermaid.js.org/syntax/classDiagram.html`, template `class.mmd`
- State Diagram: docs `https://mermaid.js.org/syntax/stateDiagram.html`, template `state.mmd`
- Entity Relationship Diagram: docs `https://mermaid.js.org/syntax/entityRelationshipDiagram.html`, template `er.mmd`
- User Journey: docs `https://mermaid.js.org/syntax/userJourney.html`, template `journey.mmd`
- Gantt: docs `https://mermaid.js.org/syntax/gantt.html`, template `gantt.mmd`
- Pie Chart: docs `https://mermaid.js.org/syntax/pie.html`, template `pie.mmd`
- GitGraph: docs `https://mermaid.js.org/syntax/gitgraph.html`, template `gitgraph.mmd`
- C4: docs `https://mermaid.js.org/syntax/c4.html`, template `c4.mmd`
- Mindmap: docs `https://mermaid.js.org/syntax/mindmap.html`, template `mindmap.mmd`
- Timeline: docs `https://mermaid.js.org/syntax/timeline.html`, template `timeline.mmd`

## Newer, Experimental, Or Beta-Labeled Families

- Quadrant Chart: docs `https://mermaid.js.org/syntax/quadrantChart.html`, template `quadrant.mmd`
- Requirement Diagram: docs `https://mermaid.js.org/syntax/requirementDiagram.html`, template `requirement.mmd`
- ZenUML: docs `https://mermaid.js.org/syntax/zenuml.html`, template `zenuml.mmd`
- Sankey: docs `https://mermaid.js.org/syntax/sankey.html`, template `sankey.mmd`
- XY Chart: docs `https://mermaid.js.org/syntax/xyChart.html`, template `xychart.mmd`
- Block Diagram: docs `https://mermaid.js.org/syntax/block.html`, template `block.mmd`
- Packet Diagram: docs `https://mermaid.js.org/syntax/packet.html`, template `packet.mmd`
- Kanban: docs `https://mermaid.js.org/syntax/kanban.html`, template `kanban.mmd`
- Architecture: docs `https://mermaid.js.org/syntax/architecture.html`, template `architecture.mmd`
- Radar: docs `https://mermaid.js.org/syntax/radar.html`, template `radar.mmd`
- Treemap: docs `https://mermaid.js.org/syntax/treemap.html`, template `treemap.mmd`
- Venn: docs `https://mermaid.js.org/syntax/venn.html`, template `venn.mmd`

## Usage Rule

When a diagram family is new or beta:

1. Start from the bundled template.
2. Render it locally with `mmdc`.
3. Only then adapt it to project content.

That prevents editor-host drift from being mistaken for Mermaid syntax failures.

## Validation Note

The bundled templates were rendered against the globally installed `mmdc` in this environment. Some experimental families can be chatty during render, but the template suite is meant to give you a known-good starting point for the local Mermaid version.
