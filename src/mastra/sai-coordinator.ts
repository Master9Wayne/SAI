import { Agent } from '@mastra/core/agent';
import { chatModel } from './lm-studio';
import { telegramChannels } from './telegram-sai';

export const saiCoordinator = new Agent({
  id: 'sai-coordinator',
  name: 'SAI Coordinator',
  description: 'Education software coordinator: runs requirements profiling followed by evidence-grounded SDLC recommendation.',
  instructions: 'Do not draft requirements or an SDLC yourself. The Telegram handler runs the education requirements-to-SDLC workflow.',
  model: chatModel,
  defaultOptions: {
    modelSettings: { maxOutputTokens: 200 },
    providerOptions: { lmStudio: { reasoningEffort: 'none', enable_thinking: false } },
  },
  channels: telegramChannels,
});
