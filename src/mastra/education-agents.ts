import { Agent } from '@mastra/core/agent';
import { chatModel } from './lm-studio';
import { requirementsRag, sdlcRag } from './rag';
import { EDUCATION_REQUIREMENTS_PROMPT, EDUCATION_SDLC_PROMPT } from './education-prompts';

// Same setting the coordinator uses: stops Qwen spending output tokens on hidden reasoning.
const noThinking = {
  lmStudio: { reasoningEffort: 'none', enable_thinking: false },
} as const;

export const educationRequirementsAgent = new Agent({
  id: 'education-requirements-agent',
  name: 'Education Requirements Agent',
  description: 'Builds an evidence-grounded requirements profile for education software.',
  instructions: EDUCATION_REQUIREMENTS_PROMPT,
  model: chatModel,
  defaultOptions: {
    modelSettings: { maxOutputTokens: 1500 },
    providerOptions: noThinking,
  },
  inputProcessors: [requirementsRag],
});

export const educationSdlcSelectionAgent = new Agent({
  id: 'education-sdlc-selection-agent',
  name: 'Education SDLC Recommendation Agent',
  description: 'Ranks and justifies an SDLC for an education software project.',
  instructions: EDUCATION_SDLC_PROMPT,
  model: chatModel,
  defaultOptions: {
    modelSettings: { maxOutputTokens: 1800 },
    providerOptions: noThinking,
  },
  inputProcessors: [sdlcRag],
});
