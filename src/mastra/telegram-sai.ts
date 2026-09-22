import { createTelegramAdapter } from '@chat-adapter/telegram';
import type { ChannelHandler, ChannelHandlers } from '@mastra/core/channels';
import { config } from './config';
import { isSessionCommand } from './telegram-utils';
import { runEducationRequirementsThenSdlc } from './education-workflow';

const skipLlm = async (thread: { id: string; post: (msg: { markdown: string }) => Promise<unknown> }) => {
  await thread.post({ markdown: 'Send an education software brief. SAI will profile requirements and recommend an evidence-grounded SDLC.' });
};

const saiTelegramHandler: ChannelHandler = async (thread, message) => {
  const text = message.text.trim();
  const command = text.split(/\s+/, 1)[0]?.toLowerCase() ?? '';

  if (isSessionCommand(text) && command !== '/compact') {
    await skipLlm(thread);
    return;
  }
  if (command === '/compact') {
    await thread.post({ markdown: 'No session to compact. Send the education software brief.' });
    return;
  }

  try {
    await thread.post({ markdown: 'SAI is profiling education requirements, then recommending an SDLC…' });
    const { document } = await runEducationRequirementsThenSdlc(text);
    if (!document.trim()) {
      await thread.post({ markdown: 'The workflow returned no document text. Check LM Studio and send the brief again.' });
      return;
    }

    await thread.post({ markdown: document });
  } catch (error) {
    console.error('[sai-telegram] request failed', error);
    await thread.post({ markdown: 'SAI request failed. Check the server log and try again.' });
  }
};

const slashHandler: NonNullable<ChannelHandlers['onSlashCommand']> = async (event, defaultHandler) => {
  const command = event.command?.toLowerCase() ?? '';
  if (command === '/start' || command === '/new' || command === '/help') return;
  if (command === '/compact') return;
  await defaultHandler();
};

export const telegramChannels = config.telegram.botToken
  ? {
      adapters: {
        telegram: {
          adapter: createTelegramAdapter({
            botToken: config.telegram.botToken,
            userName: config.telegram.botUsername,
            mode: config.telegram.mode,
            longPolling: {
              deleteWebhook: false,
              retryDelayMs: 5000,
            },
          }),
          streaming: false,
          toolDisplay: 'text' as const,
        },
      },
      handlers: {
        onDirectMessage: saiTelegramHandler,
        onMention: false as const,
        onSubscribedMessage: false as const,
        onSlashCommand: slashHandler,
      },
      resolveResourceId: ({ message }: { message: typeof import('chat').Message.prototype }) =>
        `telegram:${message.author.userId}`,
      resolveThreadId: ({ thread }: { thread: import('chat').Thread }) =>
        `telegram:${thread.id}`,
    }
  : undefined;
