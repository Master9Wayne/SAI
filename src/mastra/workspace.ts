import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { LocalFilesystem, Workspace } from '@mastra/core/workspace';

export const workspaceRoot = [
  process.env.SAI_WORKSPACE_ROOT,
  process.env.INIT_CWD,
  process.cwd(),
  resolve(process.cwd(), '../../..'),
].find((path): path is string => Boolean(path && existsSync(join(path, 'docs/ingested'))))
  ?? process.cwd();

export const architectWorkspace = new Workspace({
  id: 'sai-workspace',
  filesystem: new LocalFilesystem({ basePath: workspaceRoot, readOnly: true }),
  bm25: true,
  autoIndexPaths: [
    'docs/ingested/**/*.txt',
    'docs/ingested/**/*.md',
    'docs/ingested/**/*.yaml',
  ],
  // RAG/search only. Do not attach skills to the runtime workspace because
  // skills can contribute additional system context to an agent.
  tools: { enabled: false },
});
