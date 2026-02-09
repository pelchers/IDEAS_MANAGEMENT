#!/usr/bin/env node
/**
 * Mind Map Generator
 * Creates Mermaid mind map from hierarchical notes
 * Usage: node generate-mindmap.js notes.txt mindmap.md
 */

const fs = require('fs');

function parseHierarchicalNotes(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const hierarchy = [];
  const stack = [];

  lines.forEach(line => {
    const indent = line.search(/\S/);
    const content = line.trim().replace(/^[-*•]\s*/, '');

    const node = { content, indent, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (stack.length === 0) {
      hierarchy.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  });

  return hierarchy;
}

function generateMermaidMindMap(hierarchy) {
  let mermaid = '```mermaid\ngraph TD\n';
  let nodeId = 0;

  function traverse(nodes, parentId = null) {
    nodes.forEach(node => {
      const currentId = `N${nodeId++}`;
      const label = node.content.replace(/["\[\]]/g, '');

      if (parentId === null) {
        mermaid += `    ${currentId}[${label}]\n`;
      } else {
        mermaid += `    ${parentId} --> ${currentId}[${label}]\n`;
      }

      if (node.children && node.children.length > 0) {
        traverse(node.children, currentId);
      }
    });
  }

  traverse(hierarchy);
  mermaid += '```\n';
  return mermaid;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node generate-mindmap.js <notes.txt> <mindmap.md>');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const text = fs.readFileSync(inputPath, 'utf-8');

  console.log('🗺️  Generating mind map...');
  const hierarchy = parseHierarchicalNotes(text);
  const mindmap = generateMermaidMindMap(hierarchy);

  const output = `# Mind Map\n\n${mindmap}`;
  fs.writeFileSync(outputPath, output);
  console.log(`✅ Mind map created: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

