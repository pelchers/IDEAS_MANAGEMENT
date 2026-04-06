import type { SchemaEntity, SchemaRelation } from "./schema-types";

/**
 * Dagre-style layered auto-layout for schema entities.
 * Groups entities by relationship depth (root entities at top).
 */
export function autoLayout(
  entities: SchemaEntity[],
  relations: SchemaRelation[],
  cardWidth = 280,
  cardHeight = 200,
  gapX = 60,
  gapY = 80,
): SchemaEntity[] {
  if (entities.length === 0) return entities;

  // Build adjacency list (directed: from → to)
  const children = new Map<string, Set<string>>();
  const parents = new Map<string, Set<string>>();
  for (const e of entities) {
    children.set(e.id, new Set());
    parents.set(e.id, new Set());
  }
  for (const r of relations) {
    children.get(r.fromEntityId)?.add(r.toEntityId);
    parents.get(r.toEntityId)?.add(r.fromEntityId);
  }

  // Topological sort — BFS from root nodes (no parents)
  const roots = entities.filter((e) => (parents.get(e.id)?.size || 0) === 0);
  const layers: string[][] = [];
  const visited = new Set<string>();

  // If no roots (circular), pick first entity
  if (roots.length === 0) roots.push(entities[0]);

  let currentLayer = roots.map((r) => r.id);
  while (currentLayer.length > 0) {
    const layer: string[] = [];
    const nextLayer: string[] = [];
    for (const id of currentLayer) {
      if (visited.has(id)) continue;
      visited.add(id);
      layer.push(id);
      for (const childId of children.get(id) || []) {
        if (!visited.has(childId)) nextLayer.push(childId);
      }
    }
    if (layer.length > 0) layers.push(layer);
    currentLayer = nextLayer;
  }

  // Add any unvisited entities (disconnected) as a final layer
  const unvisited = entities.filter((e) => !visited.has(e.id));
  if (unvisited.length > 0) layers.push(unvisited.map((e) => e.id));

  // Assign positions
  const result = [...entities];
  let y = 40;
  for (const layer of layers) {
    const totalWidth = layer.length * (cardWidth + gapX) - gapX;
    let x = Math.max(40, (Math.max(800, totalWidth) - totalWidth) / 2);
    for (const id of layer) {
      const entity = result.find((e) => e.id === id);
      if (entity) {
        entity.x = x;
        entity.y = y;
        x += cardWidth + gapX;
      }
    }
    y += cardHeight + gapY;
  }

  return result;
}

/**
 * Calculate bezier path between two entity cards for relation lines.
 * Routes around cards with smooth curves.
 */
export function getRelationPath(
  from: { x: number; y: number; width: number; height: number },
  to: { x: number; y: number; width: number; height: number },
): { path: string; fromPoint: { x: number; y: number }; toPoint: { x: number; y: number }; midPoint: { x: number; y: number } } {
  const fromCx = from.x + from.width / 2;
  const fromCy = from.y + from.height / 2;
  const toCx = to.x + to.width / 2;
  const toCy = to.y + to.height / 2;

  const dx = toCx - fromCx;
  const dy = toCy - fromCy;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let fromX: number, fromY: number, toX: number, toY: number;

  if (absDx > absDy) {
    // Horizontal connection
    if (dx > 0) {
      fromX = from.x + from.width;
      fromY = fromCy;
      toX = to.x;
      toY = toCy;
    } else {
      fromX = from.x;
      fromY = fromCy;
      toX = to.x + to.width;
      toY = toCy;
    }
  } else {
    // Vertical connection
    if (dy > 0) {
      fromX = fromCx;
      fromY = from.y + from.height;
      toX = toCx;
      toY = to.y;
    } else {
      fromX = fromCx;
      fromY = from.y;
      toX = toCx;
      toY = to.y + to.height;
    }
  }

  // Bezier control points — curve away from straight line
  const cx1 = fromX + (toX - fromX) * 0.4;
  const cy1 = fromY;
  const cx2 = fromX + (toX - fromX) * 0.6;
  const cy2 = toY;

  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  return {
    path: `M ${fromX} ${fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toX} ${toY}`,
    fromPoint: { x: fromX, y: fromY },
    toPoint: { x: toX, y: toY },
    midPoint: { x: midX, y: midY },
  };
}
