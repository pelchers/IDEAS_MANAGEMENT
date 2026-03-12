"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import rough from "roughjs";

/* ── Entity definitions (matching pass-1 schema view) ── */
interface FieldDef {
  name: string;
  type: string;
  badge?: "pk" | "fk" | "unique";
}

interface EntityDef {
  name: string;
  fields: FieldDef[];
}

const ENTITIES: EntityDef[] = [
  {
    name: "USERS",
    fields: [
      { name: "id", type: "string", badge: "pk" },
      { name: "name", type: "string" },
      { name: "email", type: "string", badge: "unique" },
      { name: "role", type: "enum" },
      { name: "createdAt", type: "datetime" },
    ],
  },
  {
    name: "PROJECTS",
    fields: [
      { name: "id", type: "string", badge: "pk" },
      { name: "title", type: "string" },
      { name: "description", type: "text" },
      { name: "ownerId", type: "string", badge: "fk" },
      { name: "status", type: "enum" },
      { name: "dueDate", type: "date" },
    ],
  },
  {
    name: "IDEAS",
    fields: [
      { name: "id", type: "string", badge: "pk" },
      { name: "title", type: "string" },
      { name: "body", type: "text" },
      { name: "projectId", type: "string", badge: "fk" },
      { name: "tags", type: "array" },
      { name: "priority", type: "enum" },
    ],
  },
  {
    name: "TASKS",
    fields: [
      { name: "id", type: "string", badge: "pk" },
      { name: "title", type: "string" },
      { name: "status", type: "enum" },
      { name: "ideaId", type: "string", badge: "fk" },
      { name: "assigneeId", type: "string", badge: "fk" },
    ],
  },
];

/* ── Badge styling helper ── */
function badgeClasses(badge: "pk" | "fk" | "unique"): string {
  switch (badge) {
    case "pk":
      return "bg-watermelon text-white";
    case "fk":
      return "bg-malachite";
    case "unique":
      return "bg-creamy-milk";
  }
}

function badgeLabel(badge: "pk" | "fk" | "unique"): string {
  switch (badge) {
    case "pk":
      return "PK";
    case "fk":
      return "FK";
    case "unique":
      return "UQ";
  }
}

/* ── Component ── */
export default function SchemaPage() {
  const params = useParams();
  const projectId = String(params.id);
  const svgRef = useRef<SVGSVGElement>(null);
  const [entities, setEntities] = useState<EntityDef[]>(ENTITIES);

  // Load schema from artifact API
  useEffect(() => {
    if (projectId.startsWith("mock-")) return;
    fetch(`/api/projects/${projectId}/artifacts/schema/schema.graph.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.content && Array.isArray(data.content.entities) && data.content.entities.length > 0) {
          setEntities(data.content.entities);
        }
      })
      .catch(() => {});
  }, [projectId]);

  // Draw Rough.js relation lines
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous drawings
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const rc = rough.svg(svg);

    // Horizontal line from USERS to PROJECTS
    svg.appendChild(
      rc.line(130, 10, 400, 10, {
        roughness: 2,
        stroke: "#FF5E54",
        strokeWidth: 3,
      })
    );

    // Vertical line down to TASKS
    svg.appendChild(
      rc.line(400, 10, 400, 40, {
        roughness: 2,
        stroke: "#FF5E54",
        strokeWidth: 3,
      })
    );

    // Vertical line from USERS
    svg.appendChild(
      rc.line(130, 10, 130, 40, {
        roughness: 2,
        stroke: "#2BBF5D",
        strokeWidth: 3,
      })
    );

    // Circle endpoints
    svg.appendChild(
      rc.circle(130, 10, 12, {
        roughness: 1.5,
        stroke: "#282828",
        strokeWidth: 2,
        fill: "#FF5E54",
        fillStyle: "solid",
      })
    );
    svg.appendChild(
      rc.circle(400, 10, 12, {
        roughness: 1.5,
        stroke: "#282828",
        strokeWidth: 2,
        fill: "#2BBF5D",
        fillStyle: "solid",
      })
    );
  }, []);

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="nb-view-title">SCHEMA PLANNER</h1>
        <button className="nb-btn nb-btn--primary">+ ADD ENTITY</button>
      </div>

      {/* Entity cards grid */}
      <div
        className="grid gap-6 mb-6"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}
      >
        {entities.map((entity) => (
          <div
            key={entity.name}
            className="border-4 border-signal-black shadow-nb bg-white overflow-hidden transition-transform duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px]"
          >
            {/* Entity header */}
            <div className="bg-signal-black text-creamy-milk px-4 py-4 font-bold text-base uppercase tracking-[0.1em]">
              {entity.name}
            </div>

            {/* Fields list */}
            <ul className="list-none p-2">
              {entity.fields.map((field, idx) => (
                <li
                  key={field.name}
                  className={`flex items-center gap-2 px-2 py-2 font-mono text-[0.85rem] ${
                    idx < entity.fields.length - 1
                      ? "border-b border-dashed border-black/15"
                      : ""
                  }`}
                >
                  <code className="font-semibold">{field.name}</code>
                  <span className="text-[0.7rem] text-gray-mid uppercase ml-auto">
                    {field.type}
                  </span>
                  {field.badge && (
                    <span
                      className={`text-[0.6rem] font-bold px-[5px] py-[1px] border-2 border-signal-black uppercase ${badgeClasses(field.badge)}`}
                    >
                      {badgeLabel(field.badge)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Rough.js relation SVG */}
      <div className="min-h-[80px]">
        <svg
          ref={svgRef}
          className="w-full h-[80px]"
          data-testid="schema-relations-svg"
        />
      </div>
    </div>
  );
}
