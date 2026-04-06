"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { SchemaGraph, SchemaEntity, SchemaField, SchemaRelation } from "@/lib/schema-types";
import { uid } from "@/lib/schema-types";

const MAX_HISTORY = 50;

interface UseSchemaGraphOptions {
  projectId: string;
}

export function useSchemaGraph({ projectId }: UseSchemaGraphOptions) {
  const [graph, setGraph] = useState<SchemaGraph>({ entities: [], relations: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRef = useRef<SchemaGraph[]>([]);
  const historyIndexRef = useRef(-1);
  const skipHistoryRef = useRef(false);

  // ── Load ──
  useEffect(() => {
    setLoading(true);
    fetch(`/api/projects/${projectId}/artifacts/schema/schema.graph.json`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.artifact?.content) {
          const loaded = d.artifact.content as SchemaGraph;
          setGraph(loaded);
          historyRef.current = [JSON.parse(JSON.stringify(loaded))];
          historyIndexRef.current = 0;
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  // ── Auto-save (800ms debounce) ──
  const saveGraph = useCallback((g: SchemaGraph) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/projects/${projectId}/artifacts/schema/schema.graph.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: g }),
        });
      } catch { /* silent */ }
      setSaving(false);
    }, 800);
  }, [projectId]);

  // ── Update graph with history tracking ──
  const updateGraph = useCallback((updater: (prev: SchemaGraph) => SchemaGraph) => {
    setGraph((prev) => {
      const next = updater(prev);
      // Push to history (unless this is an undo/redo)
      if (!skipHistoryRef.current) {
        const history = historyRef.current;
        const idx = historyIndexRef.current;
        // Truncate forward history if we're not at the end
        historyRef.current = history.slice(0, idx + 1);
        historyRef.current.push(JSON.parse(JSON.stringify(next)));
        if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
        historyIndexRef.current = historyRef.current.length - 1;
      }
      skipHistoryRef.current = false;
      saveGraph(next);
      return next;
    });
  }, [saveGraph]);

  // ─��� Undo / Redo ──
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    skipHistoryRef.current = true;
    const snapshot = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
    setGraph(snapshot);
    saveGraph(snapshot);
  }, [saveGraph]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    skipHistoryRef.current = true;
    const snapshot = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
    setGraph(snapshot);
    saveGraph(snapshot);
  }, [saveGraph]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // ── Entity CRUD ─���
  const addEntity = useCallback((name: string, x?: number, y?: number) => {
    updateGraph((g) => {
      const count = g.entities.length;
      const newEntity: SchemaEntity = {
        id: uid(), name: name.toUpperCase(), fields: [{ id: uid(), name: "id", type: "uuid", required: true, unique: true, isPK: true, isFK: false }],
        x: x ?? 40 + (count % 3) * 340, y: y ?? 40 + Math.floor(count / 3) * 300,
      };
      return { ...g, entities: [...g.entities, newEntity] };
    });
  }, [updateGraph]);

  const deleteEntity = useCallback((id: string) => {
    updateGraph((g) => ({
      ...g,
      entities: g.entities.filter((e) => e.id !== id),
      relations: g.relations.filter((r) => r.fromEntityId !== id && r.toEntityId !== id),
    }));
  }, [updateGraph]);

  const updateEntity = useCallback((id: string, updates: Partial<SchemaEntity>) => {
    updateGraph((g) => ({
      ...g,
      entities: g.entities.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, [updateGraph]);

  // ── Move entity (no history push for drag — too frequent) ���─
  const moveEntity = useCallback((id: string, x: number, y: number) => {
    setGraph((prev) => ({
      ...prev,
      entities: prev.entities.map((e) => (e.id === id ? { ...e, x, y } : e)),
    }));
  }, []);

  const commitMoveEntity = useCallback(() => {
    // Push current state to history and save after drag ends
    setGraph((prev) => {
      historyRef.current.push(JSON.parse(JSON.stringify(prev)));
      if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
      historyIndexRef.current = historyRef.current.length - 1;
      saveGraph(prev);
      return prev;
    });
  }, [saveGraph]);

  // ── Field CRUD ──
  const addField = useCallback((entityId: string, field: SchemaField) => {
    updateGraph((g) => ({
      ...g,
      entities: g.entities.map((e) => (e.id === entityId ? { ...e, fields: [...e.fields, field] } : e)),
    }));
  }, [updateGraph]);

  const updateField = useCallback((entityId: string, fieldId: string, updates: Partial<SchemaField>) => {
    updateGraph((g) => ({
      ...g,
      entities: g.entities.map((e) =>
        e.id === entityId ? { ...e, fields: e.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)) } : e
      ),
    }));
  }, [updateGraph]);

  const deleteField = useCallback((entityId: string, fieldId: string) => {
    updateGraph((g) => ({
      ...g,
      entities: g.entities.map((e) =>
        e.id === entityId ? { ...e, fields: e.fields.filter((f) => f.id !== fieldId) } : e
      ),
    }));
  }, [updateGraph]);

  const reorderFields = useCallback((entityId: string, fields: SchemaField[]) => {
    updateGraph((g) => ({
      ...g,
      entities: g.entities.map((e) => (e.id === entityId ? { ...e, fields } : e)),
    }));
  }, [updateGraph]);

  // ── Relation CRUD ──
  const addRelation = useCallback((rel: SchemaRelation) => {
    updateGraph((g) => {
      const newGraph = { ...g, relations: [...g.relations, rel] };
      // Auto-create FK field for 1:N relations
      if (rel.type === "1:N" || rel.type === "1:1") {
        const fromEntity = g.entities.find((e) => e.id === rel.fromEntityId);
        if (fromEntity) {
          const fkName = rel.fkFieldName || `${fromEntity.name.toLowerCase()}Id`;
          const toEntity = newGraph.entities.find((e) => e.id === rel.toEntityId);
          if (toEntity && !toEntity.fields.some((f) => f.name === fkName)) {
            newGraph.entities = newGraph.entities.map((e) =>
              e.id === rel.toEntityId
                ? { ...e, fields: [...e.fields, { id: uid(), name: fkName, type: "uuid", required: true, unique: rel.type === "1:1", isPK: false, isFK: true, fkTarget: `${fromEntity.name}.id` }] }
                : e
            );
          }
        }
      }
      return newGraph;
    });
  }, [updateGraph]);

  const deleteRelation = useCallback((id: string) => {
    updateGraph((g) => ({ ...g, relations: g.relations.filter((r) => r.id !== id) }));
  }, [updateGraph]);

  const updateRelation = useCallback((id: string, updates: Partial<SchemaRelation>) => {
    updateGraph((g) => ({
      ...g,
      relations: g.relations.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  }, [updateGraph]);

  // ── Bulk graph setter (for import, auto-layout) ──
  const setFullGraph = useCallback((g: SchemaGraph) => {
    updateGraph(() => g);
  }, [updateGraph]);

  return {
    graph, loading, saving,
    updateGraph, setFullGraph,
    addEntity, deleteEntity, updateEntity, moveEntity, commitMoveEntity,
    addField, updateField, deleteField, reorderFields,
    addRelation, deleteRelation, updateRelation,
    undo, redo, canUndo, canRedo,
  };
}
