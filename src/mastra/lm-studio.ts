import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { config } from './config';

export const lmStudio = createOpenAICompatible({
  name: 'lm-studio',
  baseURL: config.lmStudio.baseURL,
  apiKey: config.lmStudio.apiKey,
});

export const chatModel = lmStudio.chatModel(config.lmStudio.model);
