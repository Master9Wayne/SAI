import type { InputProcessorOrWorkflow, ProcessInputArgs, ProcessInputResult } from '@mastra/core/processors';
import { architectWorkspace } from './workspace';

const SKIP_IDS = /(?:clarify|specify|analyze)-command/i;
const MAX_HIT_CHARS = 1200;
const TOP_K = 5;
const SDLC_QUERY = 'software development lifecycle SDLC iterative release testing security privacy accessibility requirements';
const EDUCATION_QUERY = 'education software learning management system LMS online learning classroom accessibility privacy learner child data release testing requirements SDLC';

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

const queryFromMessages = (messages: Array<{ role?: string; content?: unknown }>) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== 'user') continue;
    const text = messageText(message).replace(/(^|\s)\/pdf\b/gi, ' ').trim();
    if (text && !text.startsWith('/')) return text;
  }
  return '';
};

export const retrieveEvidence = async (query: string) => {
  const trimmed = query.trim();
  if (trimmed.length < 8) return [];
  const results = await architectWorkspace.search(trimmed, { mode: 'bm25', topK: TOP_K });
  return results.filter((hit) => !SKIP_IDS.test(hit.id));
};

const uniqueHits = (...lists: Array<Array<{ id: string; content: string }>>) => {
  const seen = new Set<string>();
  const merged: Array<{ id: string; content: string }> = [];
  for (const list of lists) {
    for (const hit of list) {
      if (seen.has(hit.id)) continue;
      seen.add(hit.id);
      merged.push(hit);
    }
  }
  return merged.slice(0, 8);
};

export const formatEvidence = (hits: Array<{ id: string; content: string }>) => {
  if (hits.length === 0) {
    return [
      'Retrieved evidence: none.',
      'Mark every regulatory, security, and numeric claim NEEDS-VALIDATION.',
      'Do not invent thresholds or legal applicability.',
    ].join('\n');
  }

  const blocks = hits.map((hit, index) => {
    const excerpt = hit.content.replace(/\s+/g, ' ').trim().slice(0, MAX_HIT_CHARS);
    return `[${index + 1}] ${hit.id}\n${excerpt}`;
  });

  return [
    'Retrieved evidence from docs/ingested (already searched — do not call search tools).',
    'Treat retrieved spec-kit command files as irrelevant. Do not interview.',
    ...blocks,
  ].join('\n\n');
};

export const assertCorpusSearchable = async () => {
  const hits = await retrieveEvidence('education software learning management system accessibility privacy SDLC');
  if (hits.length === 0) {
    throw new Error('Workspace BM25 index returned no hits; docs/ingested was not indexed');
  }
};

export const ragContextProcessor = {
  id: 'rag-context-processor',
  name: 'RAG Context',
  async processInput({ messages, systemMessages }: ProcessInputArgs): Promise<ProcessInputResult> {
    const query = queryFromMessages(messages);
    if (!query) return { messages, systemMessages };

    const evidence = formatEvidence(uniqueHits(
      await retrieveEvidence(query),
      await retrieveEvidence(SDLC_QUERY),
      await retrieveEvidence(EDUCATION_QUERY),
    ));

    // Qwen 3.5 requires the system message to be the first message and does
    // not accept a second system message later in the conversation. Mastra
    // exposes systemMessages separately, so collapse all existing system
    // content plus RAG evidence into exactly one system message.
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
} as InputProcessorOrWorkflow;
