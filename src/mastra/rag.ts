import type { InputProcessorOrWorkflow, ProcessInputArgs, ProcessInputResult } from '@mastra/core/processors';
import { architectWorkspace } from './workspace';

const SKIP_IDS = /(?:clarify|specify|analyze)-command/i;
const MAX_HIT_CHARS = 500;
const TOP_K = 4;
const MAX_QUERY_CHARS = 300;
const SDLC_QUERY = 'software development lifecycle SDLC iterative release testing security privacy accessibility requirements';
const EDUCATION_QUERY = 'education software learning management system LMS online learning classroom accessibility privacy learner child data release testing requirements SDLC';

type Hit = { id: string; content: string };

// Cache for repeated queries (fixed queries mostly). Cleared on process restart.
const cache = new Map<string, Hit[]>();

const partText = (part: unknown): string => {
  if (typeof part === 'string') return part;
  if (!part || typeof part !== 'object') return '';
  const record = part as Record<string, unknown>;
  if (typeof record.text === 'string') return record.text;
  if (typeof record.content === 'string') return record.content;
  return '';
};

const messageText = (message: { content?: unknown }): string => {
  const content = message.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map(partText).join('\n');
  if (content && typeof content === 'object') {
    const record = content as Record<string, unknown>;
    if (typeof record.content === 'string') return record.content;
    if (Array.isArray(record.parts)) return record.parts.map(partText).join('\n');
  }
  return '';
};

// Short query from the last user message, so long inputs don't produce noisy BM25 matches.
const queryFromMessages = (messages: Array<{ role?: string; content?: unknown }>) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== 'user') continue;
    const text = messageText(message).replace(/(^|\s)\/pdf\b/gi, ' ').trim();
    if (text && !text.startsWith('/')) return text.slice(0, MAX_QUERY_CHARS);
  }
  return '';
};

export const retrieveEvidence = async (query: string): Promise<Hit[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 8) return [];
  const cached = cache.get(trimmed);
  if (cached) return cached;
  const results = await architectWorkspace.search(trimmed, { mode: 'bm25', topK: TOP_K });
  const filtered = results.filter((hit) => !SKIP_IDS.test(hit.id));
  if (cache.size < 50) cache.set(trimmed, filtered);
  return filtered;
};

const uniqueHits = (maxHits: number, ...lists: Hit[][]) => {
  const seen = new Set<string>();
  const merged: Hit[] = [];
  for (const list of lists) {
    for (const hit of list) {
      if (seen.has(hit.id)) continue;
      seen.add(hit.id);
      merged.push(hit);
    }
  }
  return merged.slice(0, maxHits);
};

export const formatEvidence = (hits: Hit[]) => {
  if (hits.length === 0) {
    return 'Retrieved evidence: none. Mark regulatory, security and numeric claims NEEDS-VALIDATION; invent no thresholds or legal applicability.';
  }

  const blocks = hits.map((hit, index) => {
    const excerpt = hit.content.replace(/\s+/g, ' ').trim().slice(0, MAX_HIT_CHARS);
    return `[${index + 1}] ${hit.id}\n${excerpt}`;
  });

  return [
    'Evidence from docs/ingested (already searched; do not call search tools; ignore spec-kit command files; do not interview):',
    ...blocks,
  ].join('\n\n');
};

export const assertCorpusSearchable = async () => {
  const hits = await retrieveEvidence('education software learning management system accessibility privacy SDLC');
  if (hits.length === 0) {
    throw new Error('Workspace BM25 index returned no hits; docs/ingested was not indexed');
  }
};

type RagOptions = {
  maxHits: number;
  extraQueries: string[];
  useMessageQuery: boolean;
};

export const createRagContextProcessor = ({ maxHits, extraQueries, useMessageQuery }: RagOptions) =>
  ({
    id: 'rag-context-processor',
    name: 'RAG Context',
    async processInput({ messages, systemMessages }: ProcessInputArgs): Promise<ProcessInputResult> {
      const query = useMessageQuery ? queryFromMessages(messages) : '';
      if (!query && extraQueries.length === 0) return { messages, systemMessages };

      const lists: Hit[][] = [];
      if (query) lists.push(await retrieveEvidence(query));
      for (const extra of extraQueries) lists.push(await retrieveEvidence(extra));
      const evidence = formatEvidence(uniqueHits(maxHits, ...lists));

      // Qwen 3.5 requires the system message to be the first message and does
      // not accept a second system message later in the conversation. Collapse
      // all existing system content plus RAG evidence into exactly one message.
      const systemContent = systemMessages
        .map((message) => messageText(message))
        .filter(Boolean)
        .join('\n\n');

      return {
        messages,
        systemMessages: [{
          role: 'system',
          content: [systemContent, evidence].filter(Boolean).join('\n\n'),
        }],
      };
    },
  }) as InputProcessorOrWorkflow;

// Requirements agent: short user-brief query + one education query.
export const requirementsRag = createRagContextProcessor({
  maxHits: 5,
  extraQueries: [EDUCATION_QUERY],
  useMessageQuery: true,
});

// SDLC agent: fixed SDLC + education queries only (not the long requirements text).
export const sdlcRag = createRagContextProcessor({
  maxHits: 4,
  extraQueries: [SDLC_QUERY, EDUCATION_QUERY],
  useMessageQuery: false,
});

// Backwards-compatible export for any other agent still using the old processor.
export const ragContextProcessor = createRagContextProcessor({
  maxHits: 6,
  extraQueries: [SDLC_QUERY, EDUCATION_QUERY],
  useMessageQuery: true,
});
