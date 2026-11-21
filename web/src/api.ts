export type AgentMode = 'requirements' | 'sdlc';

export type AgentResult = {
  text: string;
};

export type PipelineResult = {
  requirements: string;
  sdlc: string;
  document: string;
  requirementsPath?: string;
  sdlcPath?: string;
  markdownPath?: string;
  htmlPath?: string;
};

const extractText = (payload: unknown): string => {
  if (typeof payload === 'string') return payload;
  if (!payload || typeof payload !== 'object') return '';
  const value = payload as Record<string, unknown>;

  // Never surface reasoning chunks.
  if (typeof value.type === 'string' && value.type.startsWith('reasoning')) return '';

  if (typeof value.text === 'string') return value.text;
  if (typeof value.output === 'string') return value.output;
  if (typeof value.result === 'string') return value.result;
  if (typeof value.delta === 'string') return value.delta;
  if (typeof value.textDelta === 'string') return value.textDelta;
  if (typeof value.content === 'string') return value.content;
  if (value.result && typeof value.result === 'object') return extractText(value.result);
  // Newer Mastra stream chunks: {"type":"text-delta","payload":{"text":"..."}}
  if (value.payload && typeof value.payload === 'object') return extractText(value.payload);
  return '';
};

const extractStreamChunk = (line: string): string => {
  const trimmed = line.trim();
  if (!trimmed || trimmed === 'data: [DONE]') return '';

  // Server-sent event format: data: {"delta":"..."}
  const candidate = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
  if (!candidate) return '';

  // AI SDK data-stream format: 0:"text chunk"
  if (candidate.startsWith('0:')) {
    try {
      const value: unknown = JSON.parse(candidate.slice(2));
      return typeof value === 'string' ? value : extractText(value);
    } catch {
      return '';
    }
  }

  try {
    return extractText(JSON.parse(candidate));
  } catch {
    return candidate;
  }
};

const errorFromBody = (body: string, status: number) => {
  let message = body;
  try {
    message = extractText(JSON.parse(body)) || body;
  } catch {
    // Keep the plain response body.
  }
  return new Error(message || `Request failed with status ${status}`);
};

async function callAgent(agentId: string, prompt: string, signal?: AbortSignal): Promise<AgentResult> {
  const response = await fetch(`/api/agents/${agentId}/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
    signal,
  });

  if (!response.ok) throw errorFromBody(await response.text(), response.status);
  if (!response.body) throw new Error('SAI returned no response stream.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';

  const consume = (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    for (const line of lines) text += extractStreamChunk(line);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    consume(decoder.decode(value, { stream: true }));
  }
  consume(decoder.decode());
  if (buffer.trim()) text += extractStreamChunk(buffer);

  if (!text.trim()) throw new Error('The SAI agent returned an empty response.');
  return { text };
}

export function detectRequirements(prompt: string, signal?: AbortSignal) {
  return callAgent('education-requirements-agent', prompt, signal);
}

export function recommendSdlc(requirementsOrBrief: string, signal?: AbortSignal) {
  return callAgent(
    'education-sdlc-selection-agent',
    `Recommend an SDLC for this education software project. If this is a raw brief, first infer the relevant requirements and decision factors.\n\n${requirementsOrBrief}`,
    signal,
  );
}

// Runs the backend workflow: requirements agent -> requirements.md -> SDLC agent.
// Verify the route against your Mastra version (see /openapi.json on the server).
export async function runPipeline(prompt: string, signal?: AbortSignal): Promise<PipelineResult> {
  const response = await fetch('/api/workflows/education-requirements-then-sdlc/start-async', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputData: { prompt } }),
    signal,
  });

  const body = await response.text();
  if (!response.ok) throw errorFromBody(body, response.status);

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(body) as Record<string, unknown>;
  } catch {
    throw new Error('The workflow returned an unreadable response.');
  }

  if (typeof data.status === 'string' && data.status !== 'success') {
    const err = data.error as { message?: string } | undefined;
    throw new Error(err?.message ?? `Workflow ${data.status}`);
  }

  const out = (data.result ?? data) as Partial<PipelineResult>;
  if (!out.document) throw new Error('The workflow returned no document.');
  return out as PipelineResult;
}
