import { supabase } from "@/lib/supabaseClient";
import Fuse from "fuse.js";
import { parseTaskInput as parseTags } from "./taskParser";
import type { Client, Project, IntelligentParsedResult } from "@/types";

/**
 * Normalizes text for matching by removing punctuation and extra whitespace.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Splits text into tokens (words).
 */
function getTokens(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter((t) => t.length > 1); // Ignore single characters
}

/**
 * Calculates a match score between a name and a set of input tokens.
 * Prioritizes: Exact > Partial > Fuzzy.
 */
function calculateTokenScore(name: string, inputTokens: string[]): number {
  const nameLower = name.toLowerCase();
  const nameTokens = nameLower.split(/\s+/).filter((t) => t.length > 1);

  // 1. Exact Name Match
  if (inputTokens.join(" ").includes(nameLower)) return 1.0;

  // 2. Exact Token Overlap (at least one token matches a word in the name exactly)
  let exactTokenMatches = 0;
  for (const token of inputTokens) {
    if (nameTokens.includes(token)) {
      exactTokenMatches++;
    }
  }

  if (exactTokenMatches > 0) {
    // If name is "ConnectHub App" and input has "app", that's a strong signal.
    // Score based on how much of the name is covered by tokens.
    const coverage = exactTokenMatches / nameTokens.length;
    return 0.8 + (coverage * 0.15); // max 0.95
  }

  // 3. Partial Token Match (token is a substring of a name word, or vice versa)
  let partialTokenMatches = 0;
  for (const token of inputTokens) {
    for (const nameToken of nameTokens) {
      if (nameToken.includes(token) || token.includes(nameToken)) {
        partialTokenMatches++;
        break;
      }
    }
  }

  if (partialTokenMatches > 0) {
    const coverage = partialTokenMatches / nameTokens.length;
    return 0.6 + (coverage * 0.15); // max 0.75
  }

  return 0;
}

/**
 * Pure logic for intelligent task parsing.
 */
export function parseTaskInputLogic(
  input: string,
  clients: Client[],
  projects: Project[]
): IntelligentParsedResult {
  const tagResult = parseTags(input);
  const normalizedInput = normalizeText(tagResult.content);
  const inputTokens = getTokens(normalizedInput);
  
  console.log(`[Parser] Input: "${normalizedInput}" | Tokens: ${JSON.stringify(inputTokens)}`);

  let clientId: string | null = null;
  let projectId: string | null = null;
  let clientConfidence = 0;
  let projectConfidence = 0;
  let matchedClientName: string | null = null;
  let matchedProjectName: string | null = null;

  const rejectedClients: { name: string; score: number; reason: string }[] = [];
  const rejectedProjects: { name: string; score: number; reason: string }[] = [];

  // --- Step 1: Explicit Client Tag (@client) ---
  if (tagResult.clientName) {
    const matched = clients.find(
      (c) => c.name.toLowerCase() === tagResult.clientName?.toLowerCase()
    );
    if (matched) {
      clientId = matched.id;
      matchedClientName = matched.name;
      clientConfidence = 1.0;
      console.log(`[Parser] Explicit Client Match: ${matched.name} (1.0)`);
    }
  }

  // --- Step 2: Explicit Project Tag (#project) ---
  if (tagResult.projectName) {
    const targetProjects = clientId
      ? projects.filter((p) => p.client_id === clientId)
      : projects;
    
    const matched = targetProjects.find(
      (p) => p.name.toLowerCase() === tagResult.projectName?.toLowerCase()
    );
    
    if (matched) {
      projectId = matched.id;
      matchedProjectName = matched.name;
      projectConfidence = 1.0;
      console.log(`[Parser] Explicit Project Match: ${matched.name} (1.0)`);
      
      if (!clientId && matched.client_id) {
        clientId = matched.client_id;
        matchedClientName = clients.find((c) => c.id === clientId)?.name || null;
        clientConfidence = 1.0;
      }
    }
  }

  // --- Step 3: Natural Language Matching for Client ---
  if (!clientId && clients.length > 0) {
    let bestClientScore = 0;
    
    for (const client of clients) {
      const tokenScore = calculateTokenScore(client.name, inputTokens);
      if (tokenScore > bestClientScore) {
        bestClientScore = tokenScore;
        clientId = client.id;
        matchedClientName = client.name;
      } else if (tokenScore > 0) {
        rejectedClients.push({ name: client.name, score: tokenScore, reason: "lower_than_best" });
      }
    }

    // Fallback to Fuse.js if token score is low
    if (bestClientScore < 0.6) {
      const fuse = new Fuse(clients, {
        keys: ["name"],
        includeScore: true,
        threshold: 0.4,
      });
      const results = fuse.search(normalizedInput);
      if (results.length > 0) {
        const fuseScore = 1 - (results[0].score || 0);
        if (fuseScore > bestClientScore) {
          bestClientScore = fuseScore;
          clientId = results[0].item.id;
          matchedClientName = results[0].item.name;
        }
      }
    }

    if (bestClientScore > 0.5) {
      clientConfidence = bestClientScore;
      console.log(`[Parser] NL Client Match: ${matchedClientName} (score: ${bestClientScore.toFixed(2)})`);
    } else {
      clientId = null;
      matchedClientName = null;
    }
  }

  // --- Step 4: Natural Language Matching for Project ---
  if (!projectId && projects.length > 0) {
    let bestProjectScore = 0;
    const targetProjects = clientId ? projects.filter(p => p.client_id === clientId) : projects;

    for (const project of targetProjects) {
      const tokenScore = calculateTokenScore(project.name, inputTokens);
      
      // Keyword bonus (e.g., if input has "app" and project has "App")
      let finalScore = tokenScore;
      if (normalizedInput.includes("app") && project.name.toLowerCase().includes("app")) {
        finalScore = Math.max(finalScore, 0.5); // Minimum base score for keyword match
      }

      if (finalScore > bestProjectScore) {
        bestProjectScore = finalScore;
        projectId = project.id;
        matchedProjectName = project.name;
      } else if (finalScore > 0) {
        rejectedProjects.push({ name: project.name, score: finalScore, reason: "lower_than_best" });
      }
    }

    // Fallback to Fuse.js
    if (bestProjectScore < 0.6) {
      const fuseOptions = { keys: ["name"], includeScore: true, threshold: 0.4 };
      const fuse = new Fuse(targetProjects, fuseOptions);
      const results = fuse.search(normalizedInput);
      if (results.length > 0) {
        const fuseScore = 1 - (results[0].score || 0);
        if (fuseScore > bestProjectScore) {
          bestProjectScore = fuseScore;
          projectId = results[0].item.id;
          matchedProjectName = results[0].item.name;
        }
      }
    }

    if (bestProjectScore > 0.4) { // Lower threshold for projects if client context exists
      projectConfidence = bestProjectScore;
      console.log(`[Parser] NL Project Match: ${matchedProjectName} (score: ${bestProjectScore.toFixed(2)})`);
      
      // Infer client if not already matched
      if (!clientId && matchedProjectName) {
        const project = projects.find(p => p.id === projectId);
        if (project?.client_id) {
          clientId = project.client_id;
          matchedClientName = clients.find(c => c.id === clientId)?.name || null;
          clientConfidence = bestProjectScore * 0.8;
          console.log(`[Parser] Inferred Client: ${matchedClientName} from Project: ${matchedProjectName}`);
        }
      }
    } else {
      projectId = null;
      matchedProjectName = null;
    }
  }

  if (rejectedClients.length > 0) console.log(`[Parser] Rejected Clients: ${JSON.stringify(rejectedClients)}`);
  if (rejectedProjects.length > 0) console.log(`[Parser] Rejected Projects: ${JSON.stringify(rejectedProjects)}`);

  const confidence = Number(((clientConfidence + projectConfidence) / (projectId ? 2 : 1)).toFixed(2));

  return {
    clientId,
    projectId,
    confidence,
    clientName: matchedClientName,
    projectName: matchedProjectName,
    content: tagResult.content,
    priority: tagResult.priority,
    matchDetails: {
      client: { id: clientId, name: matchedClientName, confidence: clientConfidence },
      project: { id: projectId, name: matchedProjectName, confidence: projectConfidence },
    },
  };
}

/**
 * Intelligent task parser that fetches data and then applies matching logic.
 */
export async function parseTaskInput(
  input: string,
): Promise<IntelligentParsedResult> {
  const [clientsRes, projectsRes] = await Promise.all([
    supabase.from("clients").select("*"),
    supabase.from("projects").select("*"),
  ]);

  return parseTaskInputLogic(input, (clientsRes.data || []) as Client[], (projectsRes.data || []) as Project[]);
}
