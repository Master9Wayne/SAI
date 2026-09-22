import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { educationRequirementsAgent, educationSdlcSelectionAgent } from './education-agents';
import { assertCorpusSearchable } from './rag';
import { educationRequirementsThenSdlc } from './education-workflow';
import { saiCoordinator } from './sai-coordinator';
import { architectWorkspace } from './workspace';

export const mastra = new Mastra({
  agents: {
    saiCoordinator,
    educationRequirementsAgent,
    educationSdlcSelectionAgent,
  },
  workflows: { educationRequirementsThenSdlc },
  storage: new LibSQLStore({
    id: 'sai-storage',
    url: process.env.MASTRA_DATABASE_URL ?? 'file:./sai.db',
  }),
});

// Keep the workspace for the RAG corpus/index, but do not attach it to the
// Mastra instance. Attaching it globally can inject workspace/skill context
// into agents as additional system messages, which Qwen 3.5 rejects.
await architectWorkspace.init();
await assertCorpusSearchable();
