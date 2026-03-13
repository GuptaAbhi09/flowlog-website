import type { TaskPriority, ParsedTask } from "@/types";

/**
 * Parses a raw task input string and extracts structured metadata.
 *
 * Syntax:
 *   @ClientName  → client reference
 *   #ProjectName → project reference
 *   !high / !medium / !low → priority
 *
 * Multi-word names are supported:  @Acme Corp  #Website Redesign
 * The parser greedily captures words after @/# until it hits another
 * tag (@, #, !) or end of string, then trims.
 *
 * Returns the cleaned `content` (tags removed) alongside extracted values.
 */
export function parseTaskInput(raw: string): ParsedTask {
  let content = raw.trim();
  let clientName: string | null = null;
  let projectName: string | null = null;
  let priority: TaskPriority | null = null;

  // Extract priority: !high, !medium, !low (case-insensitive)
  const priorityMatch = content.match(/!(high|medium|low)\b/i);
  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase() as TaskPriority;
    content = content.replace(priorityMatch[0], "");
  }

  // Extract @ClientName — greedy until next tag or end
  const clientMatch = content.match(/@([^@#!]+)/);
  if (clientMatch) {
    clientName = clientMatch[1].trim();
    content = content.replace(clientMatch[0], "");
  }

  // Extract #ProjectName — greedy until next tag or end
  const projectMatch = content.match(/#([^@#!]+)/);
  if (projectMatch) {
    projectName = projectMatch[1].trim();
    content = content.replace(projectMatch[0], "");
  }

  // Collapse multiple spaces and trim
  content = content.replace(/\s{2,}/g, " ").trim();

  return { content, clientName, projectName, priority };
}
