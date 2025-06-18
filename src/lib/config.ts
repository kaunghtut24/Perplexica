import toml from '@iarna/toml';
import { env } from './utils/env';

// Use dynamic imports for Node.js modules to prevent client-side errors
let fs: any;
let path: any;
if (typeof window === 'undefined') {
  // We're on the server
  fs = require('fs');
  path = require('path');
}

const configFileName = 'config.toml';

interface Config {
  GENERAL: {
    SIMILARITY_MEASURE: string;
    KEEP_ALIVE: string;
  };
  MODELS: {
    OPENAI: {
      API_KEY: string;
    };
    GROQ: {
      API_KEY: string;
    };
    ANTHROPIC: {
      API_KEY: string;
    };
    GEMINI: {
      API_KEY: string;
    };
    OLLAMA: {
      API_URL: string;
    };
    DEEPSEEK: {
      API_KEY: string;
    };
    LM_STUDIO: {
      API_URL: string;
    };
    CUSTOM_OPENAI: {
      API_URL: string;
      API_KEY: string;
      MODEL_NAME: string;
    };
  };
  API_ENDPOINTS: {
    SEARXNG: string;
  };
}

const loadConfig = () => {
  try {
    // Server-side only
    if (typeof window === 'undefined') {
      try {
        const parsedConfig = toml.parse(
          fs.readFileSync(path.join(process.cwd(), configFileName), 'utf-8'),
        );
        return parsedConfig as unknown as Config;
      } catch (error) {
        console.warn(`Warning: Could not load ${configFileName}. Using environment variables only.`);
        // Return a default config that will be overridden by environment variables
        return {
          GENERAL: {
            SIMILARITY_MEASURE: 'cosine',
            KEEP_ALIVE: '5m',
          },
          MODELS: {
            OPENAI: { API_KEY: '' },
            GROQ: { API_KEY: '' },
            ANTHROPIC: { API_KEY: '' },
            GEMINI: { API_KEY: '' },
            OLLAMA: { API_URL: '' },
            DEEPSEEK: { API_KEY: '' },
            LM_STUDIO: { API_URL: '' },
            CUSTOM_OPENAI: { API_URL: '', API_KEY: '', MODEL_NAME: '' },
          },
          API_ENDPOINTS: {
            SEARXNG: '',
          },
        };
      }
    }

    // Client-side fallback - settings will be loaded via API
    return {} as Config;
  } catch (error) {
    console.error('Error loading config:', error);
    throw new Error('Failed to load configuration');
  }
};

// Get config values with environment variable fallbacks
export const getSimilarityMeasure = () => loadConfig().GENERAL.SIMILARITY_MEASURE;
export const getKeepAlive = () => loadConfig().GENERAL.KEEP_ALIVE;

export const getOpenaiApiKey = () => env.OPENAI_API_KEY || loadConfig().MODELS.OPENAI.API_KEY;
export const getGroqApiKey = () => loadConfig().MODELS.GROQ.API_KEY;
export const getAnthropicApiKey = () => loadConfig().MODELS.ANTHROPIC.API_KEY;
export const getGeminiApiKey = () => env.GOOGLE_API_KEY || loadConfig().MODELS.GEMINI.API_KEY;
export const getOllamaApiEndpoint = () => loadConfig().MODELS.OLLAMA.API_URL;
export const getDeepseekApiKey = () => loadConfig().MODELS.DEEPSEEK.API_KEY;
export const getLMStudioApiEndpoint = () => loadConfig().MODELS.LM_STUDIO.API_URL;

export const getCustomOpenaiApiKey = () => loadConfig().MODELS.CUSTOM_OPENAI.API_KEY;
export const getCustomOpenaiApiUrl = () => loadConfig().MODELS.CUSTOM_OPENAI.API_URL;
export const getCustomOpenaiModelName = () => loadConfig().MODELS.CUSTOM_OPENAI.MODEL_NAME;

export const getSearxngApiEndpoint = () => 
  env.SEARXNG_API_URL || loadConfig().API_ENDPOINTS.SEARXNG;

export const updateConfig = (config: Partial<Config>) => {
  // Server-side only
  if (typeof window === 'undefined') {
    try {
      const currentConfig = loadConfig();
      const mergedConfig = mergeConfigs(currentConfig, config);
      fs.writeFileSync(
        path.join(process.cwd(), configFileName),
        toml.stringify(mergedConfig),
      );
    } catch (error) {
      console.error('Error updating config:', error);
      throw new Error('Failed to update configuration');
    }
  }
};

const mergeConfigs = (current: any, update: any): any => {
  if (update === null || update === undefined) {
    return current;
  }

  if (typeof current !== 'object' || current === null) {
    return update;
  }

  const result = { ...current };

  for (const key in update) {
    if (Object.prototype.hasOwnProperty.call(update, key)) {
      const updateValue = update[key];

      if (
        typeof updateValue === 'object' &&
        updateValue !== null &&
        typeof result[key] === 'object' &&
        result[key] !== null
      ) {
        result[key] = mergeConfigs(result[key], updateValue);
      } else if (updateValue !== undefined) {
        result[key] = updateValue;
      }
    }
  }

  return result;
};
