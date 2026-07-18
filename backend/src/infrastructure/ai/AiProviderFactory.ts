import type { IAiExtractor } from '../../domain/interfaces/IAiExtractor.js';
import { GeminiExtractor } from './GeminiExtractor.js';
import { NvidiaExtractor } from './OpenAiExtractor2.js';
import { OpenAiExtractor } from './OpenAiExtractor.js';

export type AiProvider = 'gemini' | 'openai' | 'nvidia';

export const createAiExtractor = (
  providerName = process.env.AI_PROVIDER ?? 'gemini',
): IAiExtractor => {
  switch (providerName.toLowerCase()) {
    case 'gemini':
      return new GeminiExtractor();
    case 'openai':
      return new OpenAiExtractor();
    case 'nvidia':
      console.log('Creating NvidiaExtractor with NVIDIA_API_KEY:', process.env.NVIDIA_API_KEY);
      return new NvidiaExtractor();
    default:
      throw new Error(
        `Unsupported AI_PROVIDER "${providerName}". Use gemini, openai, or nvidia.`,
      );
  }
};
