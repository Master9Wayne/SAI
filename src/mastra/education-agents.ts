import { Agent } from '@mastra/core/agent';
import { chatModel } from './lm-studio';
import { ragContextProcessor } from './rag';
import { EDUCATION_REQUIREMENTS_PROMPT, EDUCATION_SDLC_PROMPT } from './education-prompts';

const options = {
  modelSettings: { maxOutputTokens: 4200 },
} as const;

export const educationRequirementsAgent = new Agent({
  id: 'education-requirements-agent',
  name: 'Education Requirements Agent',
  description: 'Builds an evidence-grounded requirements profile for education software.',
  instructions: EDUCATION_REQUIREMENTS_PROMPT,
  model: chatModel,
  defaultOptions: options,
  inputProcessors: [ragContextProcessor],
});

export const educationSdlcSelectionAgent = new Agent({
  id: 'education-sdlc-selection-agent',
  name: 'Education SDLC Recommendation Agent',
  description: 'Ranks and justifies an SDLC for an education software project.',
  instructions: EDUCATION_SDLC_PROMPT,
  model: chatModel,
  defaultOptions: {
    ...options,
    modelSettings: { maxOutputTokens: 4300 },
  },
  inputProcessors: [ragContextProcessor],
});
