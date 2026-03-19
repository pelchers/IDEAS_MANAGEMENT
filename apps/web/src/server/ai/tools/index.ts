export { addIdeaSchema, executeAddIdea, type AddIdeaInput, type AddIdeaResult } from "./add-idea";
export { updateKanbanSchema, executeUpdateKanban, type UpdateKanbanInput, type UpdateKanbanResult } from "./update-kanban";
export { generateTreeSchema, executeGenerateTree, type GenerateTreeInput, type GenerateTreeResult } from "./generate-tree";
export { createProjectStructureSchema, executeCreateProjectStructure, type CreateProjectStructureInput, type CreateProjectStructureResult } from "./create-project-structure";

// New artifact-based tools (Phase 5)
export {
  readArtifactSchema, executeReadArtifact,
  listProjectsSchema, executeListProjects,
  manageProjectSchema, executeManageProject,
  updateIdeasSchema, executeUpdateIdeas,
  updateKanbanArtifactSchema, executeUpdateKanbanArtifact,
  updateSchemaSchema, executeUpdateSchema,
  updateWhiteboardSchema, executeUpdateWhiteboard,
  updateDirectoryTreeSchema, executeUpdateDirectoryTree,
} from "./artifact-tools";
